package io.github.ragecoo.whisp_socialmedia.dto.postdto;

import lombok.Data;
import java.time.Instant;
import java.util.Map;

@Data
public class PostResponse {
    private Long id;
    private String content;
    private Map<String, Object> media;
    private String privacyLevel;
    private Map<String, Object> hashtags;
    private Long authorId;
    private String authorUsername;
    private String authorNickname;
    private String authorAvatarUrl;
    private Long authorFollowersCount;
    private Long authorFollowingCount;
    private Boolean isPublished;
    private Instant createdAt;
    private Instant publishedAt;
}

