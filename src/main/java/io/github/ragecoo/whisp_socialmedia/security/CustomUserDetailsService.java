package io.github.ragecoo.whisp_socialmedia.security;


import io.github.ragecoo.whisp_socialmedia.entity.User;
import io.github.ragecoo.whisp_socialmedia.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

/** Класс сервис реализующий кастомный UserDetailsService */
@Service
public class CustomUserDetailsService  implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    /** Метод отвечающий за загрузку пользователя из базы данных во время аутентификации и построения пользователя по CustomUserDetails
     * @param username Принимает имя пользователя
     * @return Возвращает преобразованй объект CustomUserDetails
     * @see UserRepository#findByUsername(String) */
    @Override
    public CustomUserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        Optional<User> user= userRepository.findByUsername(username);

        return user.map(CustomUserDetails::new)
                .orElseThrow(()-> new UsernameNotFoundException("User with username "+username+" not found"));
    }
}