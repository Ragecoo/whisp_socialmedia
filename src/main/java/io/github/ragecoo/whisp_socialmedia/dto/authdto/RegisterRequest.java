package io.github.ragecoo.whisp_socialmedia.dto.authdto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

@Schema(description = "Запрос на регистрацию")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RegisterRequest {

    @NotNull @Size(min = 3, max = 50)
    @Schema(example = "Burn221")
    private String username;

    @NotNull  @Email @Size(max = 100)
    @Schema(example = "user@example.com")
    private String email;

    @NotNull @Size(min = 8, max = 64)
    @Schema(example = "StrongP@ssw0rd")
    private String password;

    @NotNull  @Size(min = 8, max = 64)
    @Schema(example = "StrongP@ssw0rd")
    private String confirmPassword;
}
