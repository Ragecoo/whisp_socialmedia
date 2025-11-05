package io.github.ragecoo.whisp_socialmedia.dto.authdto;


import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

@Schema(description = "Запрос на вход (логин)")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LoginRequest {

    @NotNull
    @Schema(description = "username или email", example = "ragecoo")
    private String usernameOrEmail;

    @NotNull
    @Schema(example = "StrongP@ssw0rd")
    private String password;
}