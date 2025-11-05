package io.github.ragecoo.whisp_socialmedia;

import io.github.ragecoo.whisp_socialmedia.exceptions.TakenException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(TakenException.class)
    public ResponseEntity<?> handleUserExists(TakenException e) {
        e.printStackTrace();
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(errorResponse("User already exists", HttpStatus.CONFLICT));
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

    private Map<String, Object> errorResponse(String message, HttpStatus status) {
        return Map.of(
                "timestamp", LocalDateTime.now(),
                "status", status.value(),
                "error", message
        );
    }
}
