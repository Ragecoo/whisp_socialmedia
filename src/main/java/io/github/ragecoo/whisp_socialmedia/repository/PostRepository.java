package io.github.ragecoo.whisp_socialmedia.repository;

import io.github.ragecoo.whisp_socialmedia.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    // получить все публичные посты с автором через пагинацию
    @Query("SELECT p FROM Post p JOIN FETCH p.author WHERE p.isPublished = true AND p.privacyLevel = 'public' ORDER BY p.createdAt DESC")
    Page<Post> findAllPublicPosts(Pageable pageable);
    
    // получить пост с автором по id
    @Query("SELECT p FROM Post p JOIN FETCH p.author WHERE p.id = :id")
    Optional<Post> findByIdWithAuthor(@Param("id") Long id);
    
    // получить все посты пользователя через пагинацию
    @Query("SELECT p FROM Post p JOIN FETCH p.author WHERE p.author.id = :userId AND p.isPublished = true ORDER BY p.createdAt DESC")
    Page<Post> findByAuthorId(@Param("userId") Long userId, Pageable pageable);
    
    // получить публичные посты и посты друзей для текущего пользователя через пагинацию
    // friends посты видны только если есть взаимная подписка оба подписаны друг на друга
    @Query("SELECT DISTINCT p FROM Post p JOIN FETCH p.author WHERE p.isPublished = true " +
           "AND (p.privacyLevel = 'public' " +
           "OR (p.privacyLevel = 'friends' AND EXISTS " +
           "(SELECT 1 FROM Follow f1 WHERE f1.follower.id = :currentUserId AND f1.following.id = p.author.id) " +
           "AND EXISTS (SELECT 1 FROM Follow f2 WHERE f2.follower.id = p.author.id AND f2.following.id = :currentUserId)) " +
           "OR p.author.id = :currentUserId) " +
           "ORDER BY p.createdAt DESC")
    Page<Post> findFeedPosts(@Param("currentUserId") Long currentUserId, Pageable pageable);
    
    // методы без пагинации для обратной совместимости
    @Query("SELECT p FROM Post p JOIN FETCH p.author WHERE p.isPublished = true AND p.privacyLevel = 'public' ORDER BY p.createdAt DESC")
    List<Post> findAllPublicPosts();
    
    @Query("SELECT p FROM Post p JOIN FETCH p.author WHERE p.author.id = :userId AND p.isPublished = true ORDER BY p.createdAt DESC")
    List<Post> findByAuthorId(@Param("userId") Long userId);
    
    @Query("SELECT DISTINCT p FROM Post p JOIN FETCH p.author WHERE p.isPublished = true " +
           "AND (p.privacyLevel = 'public' " +
           "OR (p.privacyLevel = 'friends' AND EXISTS " +
           "(SELECT 1 FROM Follow f1 WHERE f1.follower.id = :currentUserId AND f1.following.id = p.author.id) " +
           "AND EXISTS (SELECT 1 FROM Follow f2 WHERE f2.follower.id = p.author.id AND f2.following.id = :currentUserId)) " +
           "OR p.author.id = :currentUserId) " +
           "ORDER BY p.createdAt DESC")
    List<Post> findFeedPosts(@Param("currentUserId") Long currentUserId);
}

