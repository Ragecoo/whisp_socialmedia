package io.github.ragecoo.whisp_socialmedia.service;

import io.github.ragecoo.whisp_socialmedia.dto.postdto.CreatePostRequest;
import io.github.ragecoo.whisp_socialmedia.dto.postdto.PostPageResponse;
import io.github.ragecoo.whisp_socialmedia.dto.postdto.PostResponse;
import io.github.ragecoo.whisp_socialmedia.entity.User;

import java.util.List;

public interface PostService {
    PostResponse createPost(CreatePostRequest request, User author);
    List<PostResponse> getAllPosts(User currentUser);
    PostPageResponse getAllPostsPaginated(User currentUser, int page, int size);
    PostResponse getPostById(Long id, User currentUser);
    List<PostResponse> getPostsByUserId(Long userId, User currentUser);
    PostResponse updatePost(Long id, CreatePostRequest request, User currentUser);
    void deletePost(Long id, User currentUser);
}

