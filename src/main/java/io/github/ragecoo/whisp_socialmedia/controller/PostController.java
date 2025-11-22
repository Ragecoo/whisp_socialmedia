package io.github.ragecoo.whisp_socialmedia.controller;

import io.github.ragecoo.whisp_socialmedia.dto.postdto.CreatePostRequest;
import io.github.ragecoo.whisp_socialmedia.dto.postdto.PostPageResponse;
import io.github.ragecoo.whisp_socialmedia.dto.postdto.PostResponse;
import io.github.ragecoo.whisp_socialmedia.entity.User;
import io.github.ragecoo.whisp_socialmedia.service.AuthService;
import io.github.ragecoo.whisp_socialmedia.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final AuthService authService;

    @PostMapping
    public ResponseEntity<PostResponse> createPost(
            @RequestBody CreatePostRequest request,
            @CookieValue(name = "accessToken", required = false) String accessToken) {

        User currentUser = authService.getUserByToken(accessToken);
        PostResponse post = postService.createPost(request, currentUser);
        return ResponseEntity.ok(post);
    }

    @GetMapping
    public ResponseEntity<PostPageResponse> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @CookieValue(name = "accessToken", required = false) String accessToken) {

        User currentUser = null;
        try {
            if (accessToken != null && !accessToken.isBlank()) {
                currentUser = authService.getUserByToken(accessToken);
            }
        } catch (Exception e) {
            // игнорируем ошибки токена пользователь будет null
        }

        PostPageResponse posts = postService.getAllPostsPaginated(currentUser, page, size);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPostById(
            @PathVariable Long id,
            @CookieValue(name = "accessToken", required = false) String accessToken) {

        User currentUser = null;
        try {
            if (accessToken != null && !accessToken.isBlank()) {
                currentUser = authService.getUserByToken(accessToken);
            }
        } catch (Exception e) {
            // игнорируем ошибки токена пользователь будет null
        }

        PostResponse post = postService.getPostById(id, currentUser);
        return ResponseEntity.ok(post);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PostResponse>> getPostsByUserId(
            @PathVariable Long userId,
            @CookieValue(name = "accessToken", required = false) String accessToken) {

        User currentUser = null;
        try {
            if (accessToken != null && !accessToken.isBlank()) {
                currentUser = authService.getUserByToken(accessToken);
            }
        } catch (Exception e) {
            // игнорируем ошибки токена пользователь будет null
        }

        List<PostResponse> posts = postService.getPostsByUserId(userId, currentUser);
        return ResponseEntity.ok(posts);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostResponse> updatePost(
            @PathVariable Long id,
            @RequestBody CreatePostRequest request,
            @CookieValue(name = "accessToken", required = false) String accessToken) {

        User currentUser = authService.getUserByToken(accessToken);
        PostResponse post = postService.updatePost(id, request, currentUser);
        return ResponseEntity.ok(post);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long id,
            @CookieValue(name = "accessToken", required = false) String accessToken) {

        User currentUser = authService.getUserByToken(accessToken);
        postService.deletePost(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}

