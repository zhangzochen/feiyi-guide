package com.feiyi.chat;

import com.feiyi.config.AppProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmbeddingService {
    private final AppProperties properties;
    private final LlmClient llmClient;

    public float[] embed(String text) {
        if (properties.getLlm().isEmbeddingEnabled()
                && properties.getLlm().getApiKey() != null && !properties.getLlm().getApiKey().isBlank()) {
            var remote = llmClient.embed(text);
            if (remote.isPresent()) return remote.get();
        }
        return localEmbed(text);
    }

    private float[] localEmbed(String text) {
        int dim = 256;
        float[] v = new float[dim];
        String s = text == null ? "" : text.replaceAll("\s+", "");
        for (int i = 0; i < s.length(); i++) {
            add(v, String.valueOf(s.charAt(i)), 1.0f);
            if (i + 1 < s.length()) add(v, s.substring(i, i + 2), 1.4f);
        }
        double norm = 0;
        for (float x : v) norm += x * x;
        norm = Math.sqrt(norm);
        if (norm > 0) for (int i = 0; i < v.length; i++) v[i] /= (float) norm;
        return v;
    }

    private void add(float[] v, String token, float weight) {
        int idx = Math.floorMod(token.hashCode(), v.length);
        v[idx] += weight;
    }
}