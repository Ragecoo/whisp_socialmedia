package io.github.ragecoo.whisp_socialmedia.security.jwt;



import io.github.ragecoo.whisp_socialmedia.dto.authdto.JwtAuthDto;
import io.github.ragecoo.whisp_socialmedia.exceptions.NotFoundException;
import io.github.ragecoo.whisp_socialmedia.entity.User;
import io.github.ragecoo.whisp_socialmedia.entity.Role;

import io.github.ragecoo.whisp_socialmedia.repository.UserRepository;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.DisabledException;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

/** Класс отвечающий за основную логику работу JWT, генерацию, рефреш и т.д */
@Component
public class JwtService {

    @Autowired
    private UserRepository repository;

    private static final Logger LOGGER= LogManager.getLogger(JwtService.class);

    /** секретный ключ для токена, значение получается из переменных окружения */
    @Value("${JWT_SECRET_TOKEN}")
    private String jwtSecret;


    /** Метод отвечающий за генерацию токена авторизации(Содержит JWT и Refresh токены)
     * @param username Принимает имя пользователя
     * @exception NotFoundException если пользователь не найден
     * @exception DisabledException если пользователь выключен
     * @return Возвращает JwtAuthDto содержающую JWT и Refresh токены
     * @see #generateJwtToken(User)
     * @see #generateRefreshToken(User) */
    public JwtAuthDto generateAuthToken(String username){


        User user= repository.findByUsername(username)
                .orElseThrow(()-> new NotFoundException("User not found"));

        JwtAuthDto jwtDto= new JwtAuthDto();

        jwtDto.setAccessToken(generateJwtToken(user));
        jwtDto.setRefreshToken(generateRefreshToken(user));

        return jwtDto;


    }

    /** Метод для обновления текущего токена
     * @param username Принимает имя пользователя
     * @param refreshToken Принимает строку с рефреш токеном
     * @throws NotFoundException если пользователь не найден
     * @throws DisabledException если пользователь выключен
     * @return Возвращает JwtAuthDto с данными об обновленном токене
     * @see #generateJwtToken(User) */
    public JwtAuthDto refreshBaseToken(String username, String refreshToken){
        User user= repository.findByUsername(username)
                .orElseThrow(()-> new NotFoundException("User not found"));


        JwtAuthDto jwtDto= new JwtAuthDto();
        jwtDto.setAccessToken(generateJwtToken(user));
        jwtDto.setRefreshToken(refreshToken);

        return jwtDto;


    }

    /** Получить имя пользователя из токена
     * @param  token  Принимает строку с токеном
     * @return Возвращает строку с именем пользователя*/
    public String getUsernameFromToken(String token){
        Claims claims= Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    /** Получить id пользователя из токена
     * @param  token  Принимает строку с токеном
     * @return Возвращает userId пользователя*/
    public Long getUserIdFromToken(String token){
        Number num= Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("uid", Number.class);

        if(num==null) return null;

        return num.longValue();
    }

    /** Получить роль из токена
     * @param  token  Принимает строку с токеном
     * @return Возвращает роль Role*/
    public Role getRoleFromToken(String token){
        Claims claims = Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        String roleStr= claims.get("role", String.class);

        return Role.valueOf(roleStr);


    }

    /** Метод реализует проверку токена на корректность
     * @param token Принимает строку с токеном
     * @throws ExpiredJwtException если срок действия токена истек
     * @throws UnsupportedJwtException если токен не поддерживается
     * @throws MalformedJwtException если токен поврежден
     * @throws SecurityException если произошла ошибка со стороны Security

     * @return Возвращает true или false в зависимости от корректности токена*/
    public boolean validateJwtToken(String token){
        try{
            Jwts.parser()
                    .verifyWith(getSignInKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            return true;
        }
        catch (ExpiredJwtException e){
            LOGGER.error("Expired jwt exception ", e);
        }
        catch (UnsupportedJwtException e){
            LOGGER.error("Unsupported jwt exception ",e );
        }
        catch (MalformedJwtException e){
            LOGGER.error("malformed jwt exception ",e);
        }
        catch (SecurityException e){
            LOGGER.error("Security exception ", e);
        }
        catch (Exception e){
            LOGGER.error("Invalid token ", e);
        }
        return false;
    }

    /** Метод отвечающий за генерацию JWT токена
     * @param user Принимает пользователя User
     * @return Возвращает строку состоящую из сгенерированного токена*/
    private String generateJwtToken(User user){
        Date date= Date.from(LocalDateTime.now().plusDays(30).atZone(ZoneId.systemDefault()).toInstant());

        return Jwts.builder()
                .subject(user.getUsername())
                .claim("uid", user.getId())
                .claim("role", user.getRole().name())
                .expiration(date)
                .signWith(getSignInKey())
                .compact();

    }

    /** Метод реализует ключ для входа, дешифруя базовый JWT SECRET KEY
     * @return Возвращает секретный ключ SecretKey */
    private SecretKey getSignInKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }


    /** Метод генерирует рефреш токен для обновления текущего токена
     * @param user Принимает пользователя User
     * @return Возвращаеь строку с рефреш токеном*/
    private String generateRefreshToken(User user){
        Date date= Date.from(LocalDateTime.now().plusDays(1).atZone(ZoneId.systemDefault()).toInstant());

        return Jwts.builder()
                .subject(user.getUsername())
                .claim("uid", user.getId())
                .claim("role", user.getRole().name()) // Исправьте на "role" и .name()
                .expiration(date)
                .signWith(getSignInKey())
                .compact();
    }
}