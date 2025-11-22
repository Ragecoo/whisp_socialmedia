package io.github.ragecoo.whisp_socialmedia.dto.postdto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class CreatePostRequest {
    private String content;
    
    @JsonProperty("media")
    private Object media; // может быть List или Map
    
    private String privacyLevel;
    
    @JsonProperty("hashtags")
    private Object hashtags; // может быть List или Map
    
    private Boolean isPublished;
    
    // геттеры для преобразования в Map
    @SuppressWarnings("unchecked")
    public Map<String, Object> getMediaAsMap() {
        if (media == null) {
            return Map.of();
        }
        if (media instanceof Map) {
            return (Map<String, Object>) media;
        }
        if (media instanceof List) {
            List<?> list = (List<?>) media;
            Map<String, Object> map = new java.util.HashMap<>();
            for (int i = 0; i < list.size(); i++) {
                map.put(String.valueOf(i), list.get(i));
            }
            return map;
        }
        return Map.of();
    }
    
    @SuppressWarnings("unchecked")
    public Map<String, Object> getHashtagsAsMap() {
        if (hashtags == null) {
            return Map.of();
        }
        if (hashtags instanceof Map) {
            return (Map<String, Object>) hashtags;
        }
        if (hashtags instanceof List) {
            List<?> list = (List<?>) hashtags;
            Map<String, Object> map = new java.util.HashMap<>();
            for (int i = 0; i < list.size(); i++) {
                map.put(String.valueOf(i), list.get(i));
            }
            return map;
        }
        return Map.of();
    }
}

