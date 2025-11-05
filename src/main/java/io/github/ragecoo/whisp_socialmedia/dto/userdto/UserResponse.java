package io.github.ragecoo.whisp_socialmedia.dto.userdto;

import io.github.ragecoo.whisp_socialmedia.entity.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

public record UserResponse(
        @Schema(example = "42")
        Long id,

        @Schema(example = "ragecoo")
        String username,

        @Schema(example = "user@example.com")
        String email,

        @Schema(example = "https://cdn.app/avatar.png")
        String avatarUrl,

        @Schema(description = "Статус подписки (например, доступ к скачиваниям)")
        boolean subscriptionActive,

        Role role,

        @Schema(description = "Дата регистрации (UTC)", example = "2025-10-10T09:15:30Z")
        LocalDateTime createdAt
) {
}