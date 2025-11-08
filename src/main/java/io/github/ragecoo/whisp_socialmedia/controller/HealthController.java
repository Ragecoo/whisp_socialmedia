package io.github.ragecoo.whisp_socialmedia.controller;

import io.github.ragecoo.whisp_socialmedia.dto.authdto.JwtAuthDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/check")
@RequiredArgsConstructor
public class HealthController {
    @GetMapping
    public ResponseEntity<?> check() {
        System.out.println("checked");
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}
