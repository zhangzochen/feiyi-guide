package com.feiyi.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    private Llm llm = new Llm();
    private Rag rag = new Rag();

    @Data
    public static class Llm {
        private String baseUrl;
        private String apiKey;
        private String model;
        private String embeddingModel;
        private boolean embeddingEnabled = false;
    }

    @Data
    public static class Rag {
        private int topK = 4;
        private double minScore = 0.15;
    }
}