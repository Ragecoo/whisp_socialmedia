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
@Table(name = "follows")
public class Follow {
    @EmbeddedId
    private FollowId id;

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "user_id", nullable = false)
    private io.github.ragecoo.whisp_socialmedia.entity.User user;

    @MapsId("targetId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "target_id", nullable = false)
    private io.github.ragecoo.whisp_socialmedia.entity.User target;

    @NotNull
    @Column(name = "id", nullable = false)
    private Long id1;

    @Column(name = "created_at")
    private Instant createdAt;

}