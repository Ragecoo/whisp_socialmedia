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

// класс для работы с jwt генерация refresh и тд
@Component
public class JwtService {

    @Autowired
    private UserRepository repository;

    private static final Logger LOGGER= LogManager.getLogger(JwtService.class);

    // секретный ключ для токена значение получается из переменных окружения
    @Value("${JWT_SECRET_TOKEN}")
    private String jwtSecret;


    // сгенерировать токен авторизации содержит jwt и refresh токены
    public JwtAuthDto generateAuthToken(String username){


        User user= repository.findByUsername(username)
                .orElseThrow(()-> new NotFoundException("User not found"));

        JwtAuthDto jwtDto= new JwtAuthDto();

        jwtDto.setAccessToken(generateJwtToken(user));
        jwtDto.setRefreshToken(generateRefreshToken(user));

        return jwtDto;


    }

    // обновить текущий токен
    public JwtAuthDto refreshBaseToken(String username, String refreshToken){
        User user= repository.findByUsername(username)
                .orElseThrow(()-> new NotFoundException("User not found"));


        JwtAuthDto jwtDto= new JwtAuthDto();
        jwtDto.setAccessToken(generateJwtToken(user));
        jwtDto.setRefreshToken(refreshToken);

        return jwtDto;


    }

    // получить имя пользователя из токена
    public String getUsernameFromToken(String token){
        Claims claims= Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    // получить id пользователя из токена
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

    // получить роль из токена
    public Role getRoleFromToken(String token){
        Claims claims = Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        String roleStr= claims.get("role", String.class);

        return Role.valueOf(roleStr);


    }

    // проверить токен на корректность
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

    // сгенерировать jwt токен
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

    // получить ключ для входа дешифруя базовый jwt secret key
    private SecretKey getSignInKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }


    // сгенерировать refresh токен для обновления текущего токена
    private String generateRefreshToken(User user){
        Date date= Date.from(LocalDateTime.now().plusDays(1).atZone(ZoneId.systemDefault()).toInstant());

        return Jwts.builder()
                .subject(user.getUsername())
                .claim("uid", user.getId())
                .claim("role", user.getRole().name())
                .expiration(date)
                .signWith(getSignInKey())
                .compact();
    }
}