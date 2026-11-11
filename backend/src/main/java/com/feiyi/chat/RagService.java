package com.feiyi.chat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.feiyi.config.AppProperties;
import com.feiyi.exhibit.Exhibit;
import com.feiyi.exhibit.ExhibitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RagService {
    private final KnowledgeDocumentRepository documentRepository;
    private final KnowledgeChunkRepository chunkRepository;
    private final ExhibitRepository exhibitRepository;
    private final EmbeddingService embeddingService;
    private final VectorStore vectorStore;
    private final LlmClient llmClient;
    private final AppProperties properties;
    private final ObjectMapper objectMapper;

    public record Source(Long exhibitId, String title) {}
    public record Answer(String content, boolean needHuman, double confidence, List<Source> sources, String engine) {}

    private static final List<String> DOMAIN_KEYWORDS = List.of(
            "非遗", "陶瓷", "瓷", "青花", "釉", "窑", "苏绣", "绣", "丝线", "针法",
            "昆曲", "唱腔", "牡丹亭", "戏曲", "剪纸", "窗花", "纹样", "茶", "龙井",
            "炒青", "青瓷", "开片", "工艺", "技艺", "传承", "历史", "产地", "制作",
            "展品", "讲解", "参观", "体验", "颜色", "保存", "保养", "预约", "门票"
    );

    private boolean inDomain(String question) {
        if (question == null) return false;
        for (String keyword : DOMAIN_KEYWORDS) if (question.contains(keyword)) return true;
        return false;
    }

    @Transactional
    public void reindex() {
        chunkRepository.deleteAll();
        for (KnowledgeDocument doc : documentRepository.findAllByOrderByIdAsc()) {
            for (String piece : split(doc.getContent())) {
                KnowledgeChunk chunk = new KnowledgeChunk();
                chunk.setDocumentId(doc.getId());
                chunk.setExhibitId(doc.getExhibitId());
                chunk.setDocumentTitle(doc.getTitle());
                chunk.setContent(piece);
                try {
                    chunk.setEmbedding(objectMapper.writeValueAsString(embeddingService.embed(piece)));
                } catch (Exception e) {
                    throw new IllegalStateException("知识库向量化失败", e);
                }
                chunkRepository.save(chunk);
            }
        }
        vectorStore.load(chunkRepository.findAll());
    }

    public void reload() {
        vectorStore.load(chunkRepository.findAll());
    }

    public Answer answer(String question, Long exhibitId) {
        if (!inDomain(question)) {
            return new Answer("这个问题不在非遗讲解的范围里。你可以问我某件展品的历史、工艺、纹样、产地，或者怎么参观体验。",
                    false, 0, List.of(), "local");
        }
        if (exhibitId == null) {
            exhibitId = detectExhibit(question);
        }
        int topK = Math.max(1, properties.getRag().getTopK());
        List<VectorStore.SearchResult> results = vectorStore.search(embeddingService.embed(question), question, topK, exhibitId);
        double best = results.isEmpty() ? 0 : results.get(0).score();
        if (results.isEmpty() || best < properties.getRag().getMinScore()) {
            return new Answer("这个问题我暂时没有从知识库里找到足够准确的答案。你可以换一种问法，或者到展厅现场咨询讲解员。",
                    true, best, List.of(), "local");
        }
        Set<Source> sources = new LinkedHashSet<>();
        for (VectorStore.SearchResult r : results) {
            sources.add(new Source(r.entry().exhibitId(), r.entry().title()));
        }
        String context = results.stream()
                .map(r -> "【" + r.entry().title() + "】" + r.entry().content())
                .reduce("", (a, b) -> a + "\n" + b);
        String system = "你是一名温和、专业的非遗讲解员。只根据资料回答，不要编造。"
                + "回答要像面对面的讲解：先给一句总述，再讲两三个细节，最后给一个参观/体验建议。"
                + "如果资料不足，明确说无法准确回答，并建议现场咨询。";
        String prompt = "观众问题：" + question + "\n\n讲解资料：" + context;
        String generated = llmClient.chat(system, prompt).orElse(null);
        boolean usedLlm = generated != null && !generated.isBlank();
        String answer = usedLlm ? generated : extractive(results);
        boolean needHuman = best < properties.getRag().getMinScore() * 1.35;
        String model = properties.getLlm().getModel();
        String engine = usedLlm ? (model != null && model.contains("deepseek") ? "deepseek" : "llm") : "local";
        return new Answer(answer, needHuman, best, new ArrayList<>(sources), engine);
    }

    private Long detectExhibit(String question) {
        List<Exhibit> exhibits = exhibitRepository.findAllByOrderBySortAscIdAsc();
        String[][] aliases = {
                {"景德镇", "青花", "制瓷", "瓷器", "窑"},
                {"苏绣", "双面绣", "劈丝", "乱针绣"},
                {"昆曲", "牡丹亭", "水磨腔", "水袖"},
                {"剪纸", "窗花", "喜花", "锯齿纹"},
                {"龙井", "炒青", "狮峰", "虎跑"},
                {"青瓷", "龙泉", "梅子青", "粉青", "开片"}
        };
        for (int i = 0; i < exhibits.size() && i < aliases.length; i++) {
            for (String alias : aliases[i]) {
                if (question.contains(alias)) return exhibits.get(i).getId();
            }
        }
        return null;
    }

    private String extractive(List<VectorStore.SearchResult> results) {
        VectorStore.SearchResult top = results.get(0);
        String text = top.entry().content().replaceAll("\\s+", " ").trim();
        if (text.length() > 220) text = text.substring(0, 220) + "……";
        return "可以这样理解：" + text + " 如果你愿意，我可以再从工艺细节或参观体验的角度继续讲。";
    }

    private List<String> split(String content) {
        List<String> out = new ArrayList<>();
        if (content == null) return out;
        for (String paragraph : content.split("\\n+")) {
            String p = paragraph.trim();
            if (p.isEmpty()) continue;
            while (p.length() > 320) {
                out.add(p.substring(0, 320));
                p = p.substring(320);
            }
            if (!p.isEmpty()) out.add(p);
        }
        return out;
    }
}