package com.feiyi.chat;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "kb_documents")
public class KnowledgeDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long exhibitId;
    private String title;
    private String source;
    @Column(columnDefinition = "TEXT")
    private String content;
}
