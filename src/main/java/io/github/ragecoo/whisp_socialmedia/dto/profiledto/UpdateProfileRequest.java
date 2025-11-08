package io.github.ragecoo.whisp_socialmedia.dto.profiledto;

import lombok.Data;
import java.time.Instant;
import java.time.LocalDate;

@Data
public class UpdateProfileRequest {
    private String nickname;
    private Boolean isPublic;
    private String avatarUrl;
    private String bio;
    private String location;
    private String gender;
    private LocalDate dateOfBirth;
}