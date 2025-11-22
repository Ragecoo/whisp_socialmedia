package io.github.ragecoo.whisp_socialmedia.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;

@Getter
@Setter
@Entity
@Table(name = "posts")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "content", length = Integer.MAX_VALUE)
    private String content;

    @ColumnDefault("'[]'")
    @Column(name = "media")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> media;

    @Size(max = 20)
    @ColumnDefault("'public'")
    @Column(name = "privacy_level", length = 20)
    private String privacyLevel;

    @ColumnDefault("'[]'")
    @Column(name = "hashtags")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> hashtags;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "author_id")
    private io.github.ragecoo.whisp_socialmedia.entity.User author;

    @ColumnDefault("true")
    @Column(name = "is_published")
    private Boolean isPublished;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "published_at")
    private Instant publishedAt;

}