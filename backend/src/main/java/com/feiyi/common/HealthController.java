package com.feiyi.common;

import com.feiyi.chat.KnowledgeDocumentRepository;
import com.feiyi.chat.VectorStore;
import com.feiyi.exhibit.ExhibitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class HealthController {
    private final ExhibitRepository exhibitRepository;
    private final KnowledgeDocumentRepository documentRepository;
    private final VectorStore vectorStore;

    @GetMapping("/api/health")
    public ApiResponse<Map<String, Object>> health() {
        return ApiResponse.ok(Map.of(
                "status", "UP",
                "service", "feiyi-guide",
                "exhibits", exhibitRepository.count(),
                "documents", documentRepository.count(),
                "chunks", vectorStore.size()
        ));
    }
}