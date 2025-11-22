package io.github.ragecoo.whisp_socialmedia.security;


import io.github.ragecoo.whisp_socialmedia.entity.User;
import io.github.ragecoo.whisp_socialmedia.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

// класс сервис реализующий кастомный userdetailsservice
@Service
public class CustomUserDetailsService  implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    // загрузить пользователя из базы данных во время аутентификации и построить пользователя по customuserdetails
    @Override
    public CustomUserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        Optional<User> user= userRepository.findByUsername(username);

        return user.map(CustomUserDetails::new)
                .orElseThrow(()-> new UsernameNotFoundException("User with username "+username+" not found"));
    }
}