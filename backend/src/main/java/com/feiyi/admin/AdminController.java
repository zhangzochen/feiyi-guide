package com.feiyi.admin;

import com.feiyi.chat.KnowledgeDocument;
import com.feiyi.chat.KnowledgeDocumentRepository;
import com.feiyi.chat.RagService;
import com.feiyi.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final KnowledgeDocumentRepository documentRepository;
    private final RagService ragService;

    public record DocumentRequest(Long exhibitId, String title, String source, String content) {}

    @GetMapping("/documents")
    public ApiResponse<List<KnowledgeDocument>> documents() {
        return ApiResponse.ok(documentRepository.findAllByOrderByIdAsc());
    }

    @PostMapping("/documents")
    public ApiResponse<KnowledgeDocument> add(@RequestBody DocumentRequest request) {
        KnowledgeDocument doc = new KnowledgeDocument();
        doc.setExhibitId(request.exhibitId());
        doc.setTitle(request.title());
        doc.setSource(request.source());
        doc.setContent(request.content());
        documentRepository.save(doc);
        ragService.reindex();
        return ApiResponse.ok(doc);
    }

    @PostMapping("/reindex")
    public ApiResponse<Void> reindex() {
        ragService.reindex();
        return ApiResponse.ok(null);
    }
}
