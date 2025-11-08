package io.github.ragecoo.whisp_socialmedia.dto.profiledto;

import lombok.Data;

@Data
public class ProfileStatsResponse {
    private Long userId;
    private String username;
    private Long postsCount;
    private Long followersCount;
    private Long followingCount;
}