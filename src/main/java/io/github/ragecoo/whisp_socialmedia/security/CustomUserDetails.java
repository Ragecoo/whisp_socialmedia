package io.github.ragecoo.whisp_socialmedia.security;

import io.github.ragecoo.whisp_socialmedia.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.List;

/** Record отвечающий за кастомную реализацию авторизации пароля, ролей и тд  для пользователя */
public record CustomUserDetails(User user) implements UserDetails {

    /** Метод отвечающий за получение ролей пользователя
     * @return Возвращает коллекцию ролей пользователя*/
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_"+user.getRole().name()));
    }

    /** Метод отвечающий за пароль пользователя
     * @return Вовращает пароль пользователя*/
    @Override
    public String getPassword() {
        return user.getPasswordHash();
    }

    /** Метод отвечающий за имя пользователя
     * @return Возвращает юзернейм пользователя */
    @Override
    public String getUsername() {
        return user.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}