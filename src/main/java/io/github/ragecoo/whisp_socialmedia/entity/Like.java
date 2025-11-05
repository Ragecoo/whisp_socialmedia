package io.github.ragecoo.whisp_socialmedia.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "likes")
public class Like {
    @EmbeddedId
    private LikeId id;

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "user_id", nullable = false)
    private io.github.ragecoo.whisp_socialmedia.entity.User user;

    @NotNull
    @Column(name = "id", nullable = false)
    private Long id1;

    @Column(name = "created_at")
    private Instant createdAt;

}