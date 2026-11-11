package com.feiyi.exhibit;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "exhibits")
public class Exhibit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String category;
    private String region;
    private String era;
    private String summary;
    @Column(columnDefinition = "TEXT")
    private String description;
    @Column(columnDefinition = "TEXT")
    private String highlights;
    private String image;
    private Integer sort = 0;
}
