package io.github.ragecoo.whisp_socialmedia.dto.profiledto;

import lombok.Data;
import java.time.Instant;
import java.time.LocalDate;

@Data
public class ProfileResponse {
    private Long userId;
    private String username;
    private String nickname;
    private String email;
    private Boolean isPublic;
    private String avatarUrl;
    private String bio;
    private String location;
    private String gender;
    private LocalDate dateOfBirth;
    private Instant updatedAt;
    private Long followersCount;
    private Long followingCount;
    private Boolean isFollowing;
}