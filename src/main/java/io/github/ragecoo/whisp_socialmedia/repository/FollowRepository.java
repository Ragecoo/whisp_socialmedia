package io.github.ragecoo.whisp_socialmedia.repository;

import io.github.ragecoo.whisp_socialmedia.entity.Follow;
import io.github.ragecoo.whisp_socialmedia.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {
    // найти конкретную подписку по id подписчика и id того на кого подписываются
    @Query("SELECT f FROM Follow f WHERE f.follower.id = :followerId AND f.following.id = :followingId")
    Optional<Follow> findByFollowerIdAndFollowingId(@Param("followerId") Long followerId,
                                                    @Param("followingId") Long followingId);
    // проверить существование подписки
    @Query("SELECT CASE WHEN COUNT(f) > 0 THEN true ELSE false END FROM Follow f WHERE f.follower.id = :followerId AND f.following.id = :followingId")
    boolean existsByFollowerIdAndFollowingId(@Param("followerId") Long followerId,
                                             @Param("followingId") Long followingId);
    // найти все подписки пользователя на кого он подписан
    @Query("SELECT f FROM Follow f WHERE f.follower.id = :followerId")
    List<Follow> findByFollowerId(@Param("followerId") Long followerId);
    // найти всех подписчиков пользователя
    @Query("SELECT f FROM Follow f WHERE f.following.id = :followingId")
    List<Follow> findByFollowingId(@Param("followingId") Long followingId);
    // посчитать количество подписчиков
    @Query("SELECT COUNT(f) FROM Follow f WHERE f.following.id = :userId")
    Long countFollowers(@Param("userId") Long userId);
    @Query("SELECT COUNT(f) FROM Follow f WHERE f.follower.id = :userId")
    Long countFollowing(@Param("userId") Long userId);
    List<Follow> findByFollower(User follower);
    List<Follow> findByFollowing(User following);
    @Query("DELETE FROM Follow f WHERE f.follower.id = :userId OR f.following.id = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);
    default boolean isFollowing(Long followerId, Long followingId) {
        return existsByFollowerIdAndFollowingId(followerId, followingId);
    }
    
    // проверить взаимную подписку оба подписаны друг на друга
    @Query("SELECT CASE WHEN " +
           "(EXISTS (SELECT 1 FROM Follow f1 WHERE f1.follower.id = :userId1 AND f1.following.id = :userId2) " +
           "AND EXISTS (SELECT 1 FROM Follow f2 WHERE f2.follower.id = :userId2 AND f2.following.id = :userId1)) " +
           "THEN true ELSE false END")
    boolean areMutualFriends(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
}