package io.github.ragecoo.whisp_socialmedia.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {
    @Id
    @Column(name = "id", nullable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "user_id", nullable = false)
    private io.github.ragecoo.whisp_socialmedia.entity.User user;

    @Size(max = 2048)
    @NotNull
    @Column(name = "token", nullable = false, length = 2048)
    private String token;

    @NotNull
    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

}