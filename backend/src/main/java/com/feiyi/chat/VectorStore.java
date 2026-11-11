package com.feiyi.chat;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class VectorStore {
    private final ObjectMapper objectMapper;
    private volatile List<Entry> entries = List.of();

    public record Entry(Long chunkId, Long exhibitId, String title, String content, float[] vector) {}
    public record SearchResult(Entry entry, double score) {}

    public void load(List<KnowledgeChunk> chunks) {
        List<Entry> list = new ArrayList<>();
        for (KnowledgeChunk chunk : chunks) {
            try {
                float[] vector = objectMapper.readValue(chunk.getEmbedding(), float[].class);
                list.add(new Entry(chunk.getId(), chunk.getExhibitId(), chunk.getDocumentTitle(), chunk.getContent(), vector));
            } catch (Exception ignored) {
            }
        }
        this.entries = List.copyOf(list);
    }

    public List<SearchResult> search(float[] query, String queryText, int topK, Long exhibitId) {
        List<SearchResult> results = new ArrayList<>();
        Set<String> grams = grams(queryText);
        for (Entry entry : entries) {
            if (exhibitId != null && !exhibitId.equals(entry.exhibitId())) {
                continue;
            }
            double cosine = cosine(query, entry.vector());
            double lexical = lexical(grams, entry.content());
            // 纯哈希向量只抓“字面相似”，叠加关键词重合度后，专有名词和工艺细节更稳。
            double score = 0.55 * cosine + 0.45 * lexical;
            results.add(new SearchResult(entry, score));
        }
        results.sort(Comparator.comparingDouble(SearchResult::score).reversed());
        return results.stream().limit(Math.max(1, topK)).toList();
    }

    private Set<String> grams(String text) {
        Set<String> out = new HashSet<>();
        if (text == null) return out;
        String s = text.replaceAll("[^\\u4e00-\\u9fa5A-Za-z0-9]", "");
        for (int i = 0; i + 2 <= s.length(); i++) out.add(s.substring(i, i + 2));
        return out;
    }

    private double lexical(Set<String> grams, String content) {
        if (grams.isEmpty() || content == null) return 0;
        int hit = 0;
        for (String g : grams) if (content.contains(g)) hit++;
        return (double) hit / grams.size();
    }

    public int size() {
        return entries.size();
    }

    private double cosine(float[] a, float[] b) {
        if (a == null || b == null || a.length != b.length) return 0;
        double dot = 0, na = 0, nb = 0;
        for (int i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            na += a[i] * a[i];
            nb += b[i] * b[i];
        }
        if (na == 0 || nb == 0) return 0;
        return dot / (Math.sqrt(na) * Math.sqrt(nb));
    }
}