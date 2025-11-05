package io.github.ragecoo.whisp_socialmedia.security.jwt;


import io.github.ragecoo.whisp_socialmedia.dto.userdto.AuthUser;
import io.github.ragecoo.whisp_socialmedia.entity.Role;
import io.github.ragecoo.whisp_socialmedia.security.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import lombok.NonNull;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;


/** Класс отвечающий за перехватывание http запросов и подтверждение авторизации пользователя  */
@Component
@AllArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private JwtService jwtService;
    private CustomUserDetailsService service;


    /** Метод отвечает за фильтрацию, сохранение данных пользователя в контексте безопасности и дальнейше передачи запроса в цепочку фильтров
     * @param request Принимает HTTP запрос
     * @param response Принимает HTTP ответ
     * @param filterChain Принимает цепочку фильтров
     * @see #getTokenFromRequest(HttpServletRequest)
     * @see JwtService#validateJwtToken(String) */
    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {


        String token= getTokenFromRequest(request);
        if(token != null && jwtService.validateJwtToken(token)){
            setCustomUserDetailsToSecurityContextHolder(request,token);
        }

        filterChain.doFilter(request,response);


    }

    /** Метод отвечающий за создание объекта аутентификации и достает из токена информацию о пользователе
     * @param request Принимает HTTP запрос
     * @param token Принимает токен
     * @see JwtService#validateJwtToken(String)
     * @see JwtService#getUsernameFromToken(String)
     * @see JwtService#getUserIdFromToken(String)
     * @see JwtService#getRoleFromToken(String)
     */
    private void setCustomUserDetailsToSecurityContextHolder(HttpServletRequest request,String token) {

        Long userId= jwtService.getUserIdFromToken(token);
        String username= jwtService.getUsernameFromToken(token);
        Role role= jwtService.getRoleFromToken(token);

        var authorities= List.of(new SimpleGrantedAuthority("ROLE_"+role.name()));
        var principal= new AuthUser(userId,username,authorities);

        var auth= new UsernamePasswordAuthenticationToken(principal,null,authorities);
        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

        SecurityContextHolder.getContext().setAuthentication(auth);

    }

    /** Метод отвечающий за получения токена из HTTP запроса
     * @param request Принимает HttpServletRequest request
     * @return Возвращает строку с токеном из запроса*/
    private String getTokenFromRequest(HttpServletRequest request){
        String bearerToken= request.getHeader(HttpHeaders.AUTHORIZATION);
        if(bearerToken!=null && bearerToken.startsWith("Bearer ")){
            return bearerToken.substring(7);
        }
        return null;
    }
}