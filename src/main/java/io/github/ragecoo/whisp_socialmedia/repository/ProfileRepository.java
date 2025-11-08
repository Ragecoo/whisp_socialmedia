package io.github.ragecoo.whisp_socialmedia.repository;

import io.github.ragecoo.whisp_socialmedia.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, Long> {
    // Поиск по связи с пользователем
    Optional<Profile> findByUsers_Id(Long userId);

    // Поиск с загрузкой пользователя по ID профиля (который равен userId)
    @Query("SELECT p FROM Profile p JOIN FETCH p.users WHERE p.id = :userId")
    Optional<Profile> findByIdWithUser(@Param("userId") Long userId);

    // Поиск с загрузкой пользователя по ID пользователя
    @Query("SELECT p FROM Profile p JOIN FETCH p.users WHERE p.users.id = :userId")
    Optional<Profile> findByUserIdWithUser(@Param("userId") Long userId);
}