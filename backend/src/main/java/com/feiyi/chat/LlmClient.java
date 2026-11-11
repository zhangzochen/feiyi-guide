package com.feiyi.chat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.feiyi.config.AppProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class LlmClient {
    private final AppProperties properties;
    private final ObjectMapper objectMapper;

    private boolean enabled() {
        return properties.getLlm().getApiKey() != null && !properties.getLlm().getApiKey().isBlank();
    }

    private String baseUrl() {
        String url = properties.getLlm().getBaseUrl();
        if (url == null || url.isBlank()) return "https://api.openai.com/v1";
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }

    public Optional<String> chat(String system, String user) {
        if (!enabled()) return Optional.empty();
        try {
            Map<String, Object> body = Map.of(
                    "model", properties.getLlm().getModel(),
                    "temperature", 0.2,
                    "messages", List.of(
                            Map.of("role", "system", "content", system),
                            Map.of("role", "user", "content", user)
                    )
            );
            HttpRequest request = HttpRequest.newBuilder(URI.create(baseUrl() + "/chat/completions"))
                    .timeout(Duration.ofSeconds(25))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + properties.getLlm().getApiKey())
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                    .build();
            HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() / 100 != 2) return Optional.empty();
            JsonNode node = objectMapper.readTree(response.body());
            String content = node.path("choices").path(0).path("message").path("content").asText("");
            return content.isBlank() ? Optional.empty() : Optional.of(content.trim());
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public Optional<float[]> embed(String text) {
        if (!enabled()) return Optional.empty();
        try {
            Map<String, Object> body = Map.of(
                    "model", properties.getLlm().getEmbeddingModel(),
                    "input", text
            );
            HttpRequest request = HttpRequest.newBuilder(URI.create(baseUrl() + "/embeddings"))
                    .timeout(Duration.ofSeconds(20))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + properties.getLlm().getApiKey())
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                    .build();
            HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() / 100 != 2) return Optional.empty();
            JsonNode arr = objectMapper.readTree(response.body()).path("data").path(0).path("embedding");
            if (!arr.isArray()) return Optional.empty();
            float[] vector = new float[arr.size()];
            for (int i = 0; i < arr.size(); i++) vector[i] = (float) arr.get(i).asDouble();
            return Optional.of(vector);
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
