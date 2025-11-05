package io.github.ragecoo.whisp_socialmedia.controller;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.github.ragecoo.whisp_socialmedia.dto.authdto.*;
import io.github.ragecoo.whisp_socialmedia.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestParam String username,
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam String confirmPassword,
            HttpServletResponse response) {
        RegisterRequest request = new RegisterRequest(username, email, password, confirmPassword);
        JwtAuthDto tokens = authService.register(request);
        ResponseCookie accessCookie = ResponseCookie.from("access", tokens.getAccessToken())
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(15 * 60)
                .build();
        response.addHeader("Set-Cookie", accessCookie.toString());
        return ResponseEntity.ok(tokens);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestParam String usernameOrEmail,
            @RequestParam String password) {

        LoginRequest request = new LoginRequest(usernameOrEmail, password);
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestParam String oldPassword,
                                            @RequestParam String newPassword) {
        JwtAuthDto tokens = authService.changePassword(oldPassword, newPassword);
        return ResponseEntity.ok(tokens);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestParam String refreshToken) {
        RefreshTokenDto dto = new RefreshTokenDto(refreshToken);
        return ResponseEntity.ok(authService.refresh(dto));
    }

}
