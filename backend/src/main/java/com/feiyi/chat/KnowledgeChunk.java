package com.feiyi.chat;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "kb_chunks")
public class KnowledgeChunk {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long documentId;
    private Long exhibitId;
    private String documentTitle;
    @Column(columnDefinition = "TEXT")
    private String content;
    @Column(columnDefinition = "LONGTEXT")
    private String embedding;
}
