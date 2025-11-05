package io.github.ragecoo.whisp_socialmedia.entity;

import jakarta.persistence.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.proxy.HibernateProxy;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.Objects;

@Getter
@Setter
@Entity
@ToString
@Valid
@RequiredArgsConstructor
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Size(max = 50)
    @NotNull
    @Column(name = "username", nullable = false, length = 50)
    String username;

    @Size(max = 100)
    @Column(name = "nickname", length = 100)
    String nickname;

    @Size(max = 255)
    @NotNull
    @Column(name = "email", nullable = false)
    String email;

    @Size(max = 255)
    @NotNull
    @Column(name = "password_hash", nullable = false)
    String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    Role role;

    @Size(max = 50)
    @ColumnDefault("'active'")
    @Column(name = "status", length = 50)
    String status;

    @Column(name = "last_login_at")
    OffsetDateTime lastLoginAt;

    @NotNull
    @Column(name = "created_at", nullable = false)
    Instant createdAt;

    @Column(name = "updated_at")
    Instant updatedAt;

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (o == null) return false;
        Class<?> oEffectiveClass = o instanceof HibernateProxy ? ((HibernateProxy) o).getHibernateLazyInitializer().getPersistentClass() : o.getClass();
        Class<?> thisEffectiveClass = this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass() : this.getClass();
        if (thisEffectiveClass != oEffectiveClass) return false;
        User user = (User) o;
        return getId() != null && Objects.equals(getId(), user.getId());
    }

    @Override
    public final int hashCode() {
        return this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass().hashCode() : getClass().hashCode();
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}