package io.github.ragecoo.whisp_socialmedia.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.util.Objects;
import java.util.UUID;

@Getter
@Setter
@Embeddable
public class LikeId implements java.io.Serializable {
    private static final long serialVersionUID = 6548593453844925176L;
    @NotNull
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Size(max = 20)
    @NotNull
    @Column(name = "target_type", nullable = false, length = 20)
    private String targetType;

    @NotNull
    @Column(name = "target_id", nullable = false)
    private UUID targetId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        LikeId entity = (LikeId) o;
        return Objects.equals(this.targetId, entity.targetId) &&
                Objects.equals(this.targetType, entity.targetType) &&
                Objects.equals(this.userId, entity.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(targetId, targetType, userId);
    }

}