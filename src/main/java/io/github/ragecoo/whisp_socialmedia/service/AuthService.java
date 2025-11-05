package io.github.ragecoo.whisp_socialmedia.service;

import io.github.ragecoo.whisp_socialmedia.dto.authdto.JwtAuthDto;
import io.github.ragecoo.whisp_socialmedia.dto.authdto.LoginRequest;
import io.github.ragecoo.whisp_socialmedia.dto.authdto.RefreshTokenDto;
import io.github.ragecoo.whisp_socialmedia.dto.authdto.RegisterRequest;

public interface AuthService {

    JwtAuthDto register(RegisterRequest request);
    JwtAuthDto login(LoginRequest request);
    JwtAuthDto refresh(RefreshTokenDto request);
    JwtAuthDto changePassword(String oldPassword, String newPassword);

}
