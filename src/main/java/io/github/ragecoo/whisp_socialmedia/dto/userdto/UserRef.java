package io.github.ragecoo.whisp_socialmedia.dto.userdto;


import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Мини-ссылка на пользователя (для вложенных DTO)")

public record UserRef (
     Long id,
     String username,
     String avatarUrl
){
}
