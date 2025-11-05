package io.github.ragecoo.whisp_socialmedia.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "profiles")
public class Profile {
    @Id
    @Column(name = "user_id", nullable = false)
    private Long id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "user_id", nullable = false)
    private io.github.ragecoo.whisp_socialmedia.entity.User users;

    @ColumnDefault("true")
    @Column(name = "is_public")
    private Boolean isPublic;

    @Size(max = 500)
    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "bio", length = Integer.MAX_VALUE)
    private String bio;

    @Column(name = "location", length = Integer.MAX_VALUE)
    private String location;

    @Size(max = 20)
    @Column(name = "gender", length = 20)
    private String gender;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "updated_at")
    private Instant updatedAt;

}