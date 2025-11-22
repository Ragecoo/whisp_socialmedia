package io.github.ragecoo.whisp_socialmedia.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/uploads")
public class MediaController {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @GetMapping("/**")
    public ResponseEntity<Resource> getMediaFile(HttpServletRequest request) {
        try {
            // Получаем полный путь из запроса
            String requestUri = request.getRequestURI();
            // Убираем /uploads из начала пути
            String requestPath = "";
            if (requestUri.startsWith("/uploads/")) {
                requestPath = requestUri.substring("/uploads/".length());
            } else if (requestUri.equals("/uploads")) {
                requestPath = "";
            }
            
            if (requestPath.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            
            Path filePath = Paths.get(uploadDir).resolve(requestPath).normalize();
            
            // Проверяем безопасность пути
            Path uploadDirPath = Paths.get(uploadDir).normalize();
            if (!filePath.startsWith(uploadDirPath)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                // Файл существует, возвращаем его
                String contentType = determineContentType(filePath);
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filePath.getFileName() + "\"")
                        .body(resource);
            } else {
                // Файл не найден
                return handleFileNotFound(requestPath);
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private ResponseEntity<Resource> handleFileNotFound(String requestPath) {
        try {
            // Если это медиафайл (начинается с media_), возвращаем media_not_found.png
            if (requestPath != null && (requestPath.contains("media_") || requestPath.startsWith("media_"))) {
                Path mediaNotFoundPath = Paths.get(uploadDir).resolve("media_not_found.png");
                Resource mediaNotFoundResource = new UrlResource(mediaNotFoundPath.toUri());
                
                if (mediaNotFoundResource.exists() && mediaNotFoundResource.isReadable()) {
                    return ResponseEntity.ok()
                            .contentType(MediaType.IMAGE_PNG)
                            .body(mediaNotFoundResource);
                }
            }
            
            // Для аватарок возвращаем standart_avatar.png
            Path fallbackPath = Paths.get(uploadDir).resolve("standart_avatar.png");
            Resource fallbackResource = new UrlResource(fallbackPath.toUri());
            
            if (fallbackResource.exists() && fallbackResource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_PNG)
                        .body(fallbackResource);
            }
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (MalformedURLException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    private String determineContentType(Path filePath) {
        try {
            String contentType = Files.probeContentType(filePath);
            if (contentType != null) {
                return contentType;
            }
        } catch (Exception e) {
            // Игнорируем ошибку
        }
        
        // Fallback на основе расширения файла
        String fileName = filePath.getFileName().toString().toLowerCase();
        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (fileName.endsWith(".png")) {
            return "image/png";
        } else if (fileName.endsWith(".gif")) {
            return "image/gif";
        } else if (fileName.endsWith(".mp4")) {
            return "video/mp4";
        } else if (fileName.endsWith(".webm")) {
            return "video/webm";
        }
        
        return "application/octet-stream";
    }
}

