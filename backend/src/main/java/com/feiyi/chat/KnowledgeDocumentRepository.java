package com.feiyi.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface KnowledgeDocumentRepository extends JpaRepository<KnowledgeDocument, Long> {
    List<KnowledgeDocument> findAllByOrderByIdAsc();
}
