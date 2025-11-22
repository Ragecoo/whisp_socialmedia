package io.github.ragecoo.whisp_socialmedia;

import io.github.ragecoo.whisp_socialmedia.exceptions.TakenException;
import io.github.ragecoo.whisp_socialmedia.exceptions.NotFoundException;
import io.github.ragecoo.whisp_socialmedia.exceptions.UnauthorizedException;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;


import java.time.LocalDateTime;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(TakenException.class)
    public ResponseEntity<?> handleUserExists(TakenException e) {
        e.printStackTrace();
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(errorResponse(e.getMessage(), HttpStatus.CONFLICT));
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<?> handleNotFound(NotFoundException e) {
        e.printStackTrace();
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(errorResponse(e.getMessage(), HttpStatus.NOT_FOUND));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<?> handleBadCredentials(BadCredentialsException e) {
        e.printStackTrace();
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(errorResponse(e.getMessage(), HttpStatus.UNAUTHORIZED));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgument(IllegalArgumentException e) {
        e.printStackTrace();
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(errorResponse(e.getMessage(), HttpStatus.BAD_REQUEST));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneral(Exception e) {
        e.printStackTrace();
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorResponse("Unexpected error occurred", HttpStatus.INTERNAL_SERVER_ERROR));
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<?> handleUnauthorized(UnauthorizedException e) {
        e.printStackTrace();
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(errorResponse(e.getMessage(), HttpStatus.FORBIDDEN));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Resource> handleNoResourceFound(NoResourceFoundException ex) {
        try {
            String requestPath = ex.getResourcePath();
            
            // Если это запрос к медиафайлу (начинается с media_), возвращаем media_not_found.png
            // Медиафайлы имеют префикс "media_", аватары - "avatar_"
            if (requestPath != null && requestPath.startsWith("/uploads/") && 
                requestPath.contains("/media_") && !requestPath.contains("media_not_found")) {
                // Проверяем, есть ли media_not_found.png
                Path mediaNotFoundPath = Paths.get("uploads/media_not_found.png");
                try {
                    Resource mediaNotFoundResource = new UrlResource(mediaNotFoundPath.toUri());
                    
                    if (mediaNotFoundResource.exists() && mediaNotFoundResource.isReadable()) {
                        return ResponseEntity.ok()
                                .header(HttpHeaders.CONTENT_TYPE, "image/png")
                                .body(mediaNotFoundResource);
                    } else {
                        // Если media_not_found.png нет, возвращаем 404
                        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
                    }
                } catch (MalformedURLException e) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
                }
            }
            
            // Для аватарок возвращаем standart_avatar.png
            Path fallbackPath = Paths.get("uploads/standart_avatar.png");
            Resource resource = new UrlResource(fallbackPath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_TYPE, "image/png")
                        .body(resource);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    private Map<String, Object> errorResponse(String message, HttpStatus status) {
        return Map.of(
                "timestamp", LocalDateTime.now(),
                "status", status.value(),
                "error", status.getReasonPhrase(),
                "message", message
        );
    }
}