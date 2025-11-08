package io.github.ragecoo.whisp_socialmedia.service.impl;

import io.github.ragecoo.whisp_socialmedia.dto.authdto.*;
import io.github.ragecoo.whisp_socialmedia.entity.*;
import io.github.ragecoo.whisp_socialmedia.exceptions.*;
import io.github.ragecoo.whisp_socialmedia.repository.*;
import io.github.ragecoo.whisp_socialmedia.security.jwt.JwtService;
import io.jsonwebtoken.JwtException;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;

@Service
@AllArgsConstructor
public class AuthServiceImpl implements io.github.ragecoo.whisp_socialmedia.service.AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    private static final int REFRESH_TOKEN_DAYS = 7;

    private Instant expirationInstant() {
        return LocalDateTime.now()
                .plusDays(REFRESH_TOKEN_DAYS)
                .atZone(ZoneId.systemDefault())
                .toInstant();
    }

    @Override
    @Transactional
    public JwtAuthDto register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new TakenException("This Email is already taken");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new TakenException("This username is already taken");
        }
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords mismatch");
        }
        User u = new User();
        u.setEmail(request.getEmail().trim());
        u.setUsername(request.getUsername().trim());
        u.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        u.setRole(Role.USER);
        u = userRepository.save(u);
        JwtAuthDto jwt = jwtService.generateAuthToken(u.getUsername());
        refreshTokenRepository.deleteAllByUserId(u.getId());
        RefreshToken rt = new RefreshToken();
        rt.setUser(u);
        rt.setToken(jwt.getRefreshToken());
        rt.setExpiresAt(expirationInstant());
        refreshTokenRepository.save(rt);
        return jwt;
    }

    @Override
    @Transactional
    public JwtAuthDto login(LoginRequest request) {
        String id = request.getUsernameOrEmail().trim();
        User u = userRepository.findByEmailIgnoreCase(id)
                .orElseGet(() -> userRepository.findByUsername(id)
                        .orElseThrow(() -> new BadCredentialsException("Invalid credentials")));
        JwtAuthDto jwt = jwtService.generateAuthToken(u.getUsername());
        refreshTokenRepository.deleteAllByUserId(u.getId());
        RefreshToken rt = new RefreshToken();
        rt.setUser(u);
        rt.setToken(jwt.getRefreshToken());
        rt.setExpiresAt(expirationInstant());
        refreshTokenRepository.save(rt);

        return jwt;
    }

    @Override
    @Transactional
    public JwtAuthDto refresh(RefreshTokenDto request) {
        String refresh = request.getRefreshToken();

        System.out.println(refresh);
        System.out.println(refreshTokenRepository.findByToken(refresh));

        if (refresh == null || refresh.isBlank()) {
            throw new BadCredentialsException("Refresh token is missing");
        }
        RefreshToken stored = refreshTokenRepository.findByToken(refresh)
                .orElseThrow(() -> new BadCredentialsException("Refresh token not found"));
        if (stored.getExpiresAt().isBefore(Instant.now())) {
            refreshTokenRepository.deleteById(stored.getId());
            throw new BadCredentialsException("Refresh token expired");
        }
        if (!jwtService.validateJwtToken(refresh)) {
            throw new BadCredentialsException("Invalid refresh token");
        }
        User u = userRepository.findById(jwtService.getUserIdFromToken(refresh))
                .orElseThrow(() -> new NotFoundException("User not found"));
        JwtAuthDto jwt = jwtService.generateAuthToken(u.getUsername());
        refreshTokenRepository.deleteAllByUserId(u.getId());
        RefreshToken rt = new RefreshToken();
        rt.setUser(u);
        rt.setToken(jwt.getRefreshToken());
        rt.setExpiresAt(expirationInstant());
        refreshTokenRepository.save(rt);
        return jwt;
    }

    @Override
    public JwtAuthDto changePassword(String oldPassword, String newPassword) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username = principal instanceof UserDetails
                ? ((UserDetails) principal).getUsername()
                : principal.toString();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new BadCredentialsException("Old password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
        refreshTokenRepository.deleteAllByUserId(user.getId());
        JwtAuthDto jwt = jwtService.generateAuthToken(user.getUsername());
        RefreshToken rt = new RefreshToken();
        rt.setUser(user);
        rt.setToken(jwt.getRefreshToken());
        rt.setExpiresAt(expirationInstant());
        refreshTokenRepository.save(rt);
        return jwt;
    }

    @Override
    public User getUserByToken(String token) {
        Long userId = jwtService.getUserIdFromToken(token);
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }
}
