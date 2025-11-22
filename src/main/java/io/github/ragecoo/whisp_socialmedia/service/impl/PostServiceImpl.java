package io.github.ragecoo.whisp_socialmedia.service.impl;

import io.github.ragecoo.whisp_socialmedia.dto.postdto.CreatePostRequest;
import io.github.ragecoo.whisp_socialmedia.dto.postdto.PostPageResponse;
import io.github.ragecoo.whisp_socialmedia.dto.postdto.PostResponse;
import io.github.ragecoo.whisp_socialmedia.entity.Post;
import io.github.ragecoo.whisp_socialmedia.entity.User;
import io.github.ragecoo.whisp_socialmedia.exceptions.NotFoundException;
import io.github.ragecoo.whisp_socialmedia.exceptions.UnauthorizedException;
import io.github.ragecoo.whisp_socialmedia.repository.FollowRepository;
import io.github.ragecoo.whisp_socialmedia.repository.PostRepository;
import io.github.ragecoo.whisp_socialmedia.repository.ProfileRepository;
import io.github.ragecoo.whisp_socialmedia.service.PostService;
import io.github.ragecoo.whisp_socialmedia.entity.Profile;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final FollowRepository followRepository;
    private final ProfileRepository profileRepository;

    @Override
    @Transactional
    public PostResponse createPost(CreatePostRequest request, User author) {
        Post post = new Post();
        post.setContent(request.getContent());
        
        // преобразовать медиа в map
        Map<String, Object> mediaMap = request.getMediaAsMap();
        post.setMedia(mediaMap.isEmpty() ? new HashMap<>() : mediaMap);
        
        post.setPrivacyLevel(request.getPrivacyLevel() != null ? request.getPrivacyLevel() : "public");
        
        // преобразовать хэштеги в map
        Map<String, Object> hashtagsMap = request.getHashtagsAsMap();
        post.setHashtags(hashtagsMap.isEmpty() ? new HashMap<>() : hashtagsMap);
        
        post.setIsPublished(request.getIsPublished() != null ? request.getIsPublished() : true);
        post.setAuthor(author);
        
        Instant now = Instant.now();
        post.setCreatedAt(now);
        if (post.getIsPublished()) {
            post.setPublishedAt(now);
        }

        Post savedPost = postRepository.save(post);

        return convertToResponse(savedPost);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponse> getAllPosts(User currentUser) {
        List<Post> posts;
        if (currentUser != null) {
            posts = postRepository.findFeedPosts(currentUser.getId());
        } else {
            posts = postRepository.findAllPublicPosts();
        }
        return posts.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PostPageResponse getAllPostsPaginated(User currentUser, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> postPage;
        
        if (currentUser != null) {
            postPage = postRepository.findFeedPosts(currentUser.getId(), pageable);
        } else {
            postPage = postRepository.findAllPublicPosts(pageable);
        }
        
        List<PostResponse> content = postPage.getContent().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        
        PostPageResponse response = new PostPageResponse();
        response.setContent(content);
        response.setPage(postPage.getNumber());
        response.setSize(postPage.getSize());
        response.setTotalElements(postPage.getTotalElements());
        response.setTotalPages(postPage.getTotalPages());
        response.setHasNext(postPage.hasNext());
        response.setHasPrevious(postPage.hasPrevious());
        
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public PostResponse getPostById(Long id, User currentUser) {
        Post post = postRepository.findByIdWithAuthor(id)
                .orElseThrow(() -> new NotFoundException("Post not found"));

        if (!post.getIsPublished()) {
            throw new NotFoundException("Post not found");
        }

        // проверить доступ в зависимости от уровня приватности
        if (!canAccessPost(post, currentUser)) {
            throw new UnauthorizedException("You don't have access to this post");
        }

        return convertToResponse(post);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponse> getPostsByUserId(Long userId, User currentUser) {
        List<Post> posts = postRepository.findByAuthorId(userId);
        
        // фильтровать посты в зависимости от доступа текущего пользователя
        List<Post> accessiblePosts = posts.stream()
                .filter(post -> canAccessPost(post, currentUser))
                .collect(Collectors.toList());

        return accessiblePosts.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private boolean canAccessPost(Post post, User currentUser) {
        // public посты видны всем
        if (post.getPrivacyLevel().equals("public")) {
            return true;
        }
        
        // для private и friends постов нужна авторизация
        if (currentUser == null) {
            return false;
        }

        // автор всегда видит свои посты
        if (post.getAuthor().getId().equals(currentUser.getId())) {
            return true;
        }

        // friends посты видны только взаимным друзьям оба подписаны друг на друга
        if (post.getPrivacyLevel().equals("friends")) {
            return followRepository.areMutualFriends(
                    currentUser.getId(), post.getAuthor().getId());
        }

        // private посты не видны никому кроме автора
        if (post.getPrivacyLevel().equals("private")) {
            return false;
        }

        return false;
    }

    @Override
    @Transactional
    public PostResponse updatePost(Long id, CreatePostRequest request, User currentUser) {
        Post post = postRepository.findByIdWithAuthor(id)
                .orElseThrow(() -> new NotFoundException("Post not found"));

        // проверяем, что текущий пользователь является автором поста
        if (!post.getAuthor().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You can only update your own posts");
        }

        // обновляем поля поста
        post.setContent(request.getContent());
        
        // преобразовать медиа в map
        Map<String, Object> mediaMap = request.getMediaAsMap();
        post.setMedia(mediaMap.isEmpty() ? new HashMap<>() : mediaMap);
        
        post.setPrivacyLevel(request.getPrivacyLevel() != null ? request.getPrivacyLevel() : "public");
        
        // преобразовать хэштеги в map
        Map<String, Object> hashtagsMap = request.getHashtagsAsMap();
        post.setHashtags(hashtagsMap.isEmpty() ? new HashMap<>() : hashtagsMap);
        
        post.setIsPublished(request.getIsPublished() != null ? request.getIsPublished() : true);
        
        // обновляем publishedAt если пост был опубликован
        if (post.getIsPublished() && post.getPublishedAt() == null) {
            post.setPublishedAt(Instant.now());
        }

        Post savedPost = postRepository.save(post);
        return convertToResponse(savedPost);
    }

    @Override
    @Transactional
    public void deletePost(Long id, User currentUser) {
        Post post = postRepository.findByIdWithAuthor(id)
                .orElseThrow(() -> new NotFoundException("Post not found"));

        // проверяем, что текущий пользователь является автором поста
        if (!post.getAuthor().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You can only delete your own posts");
        }

        postRepository.delete(post);
    }

    private PostResponse convertToResponse(Post post) {
        PostResponse response = new PostResponse();
        response.setId(post.getId());
        response.setContent(post.getContent());
        response.setMedia(post.getMedia());
        response.setPrivacyLevel(post.getPrivacyLevel());
        response.setHashtags(post.getHashtags());
        response.setAuthorId(post.getAuthor().getId());
        response.setAuthorUsername(post.getAuthor().getUsername());
        response.setAuthorNickname(post.getAuthor().getNickname());
        
        // получить аватарку автора из профиля
        String avatarUrl = profileRepository.findByUsers_Id(post.getAuthor().getId())
                .map(Profile::getAvatarUrl)
                .orElse(null);
        response.setAuthorAvatarUrl(avatarUrl);
        
        // получить количество подписчиков и подписок автора
        Long followersCount = followRepository.countFollowers(post.getAuthor().getId());
        Long followingCount = followRepository.countFollowing(post.getAuthor().getId());
        response.setAuthorFollowersCount(followersCount);
        response.setAuthorFollowingCount(followingCount);
        
        response.setIsPublished(post.getIsPublished());
        response.setCreatedAt(post.getCreatedAt());
        response.setPublishedAt(post.getPublishedAt());
        return response;
    }
}

