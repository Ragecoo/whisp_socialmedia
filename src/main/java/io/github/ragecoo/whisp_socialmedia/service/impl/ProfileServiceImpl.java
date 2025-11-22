package io.github.ragecoo.whisp_socialmedia.service.impl;

import io.github.ragecoo.whisp_socialmedia.dto.profiledto.ProfileResponse;
import io.github.ragecoo.whisp_socialmedia.dto.profiledto.ProfileStatsResponse;
import io.github.ragecoo.whisp_socialmedia.dto.profiledto.UpdateProfileRequest;
import io.github.ragecoo.whisp_socialmedia.entity.Follow;
import io.github.ragecoo.whisp_socialmedia.entity.Profile;
import io.github.ragecoo.whisp_socialmedia.entity.User;
import io.github.ragecoo.whisp_socialmedia.exceptions.NotFoundException;
import io.github.ragecoo.whisp_socialmedia.exceptions.UnauthorizedException;
import io.github.ragecoo.whisp_socialmedia.repository.FollowRepository;
import io.github.ragecoo.whisp_socialmedia.repository.ProfileRepository;
import io.github.ragecoo.whisp_socialmedia.repository.UserRepository;
import io.github.ragecoo.whisp_socialmedia.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import io.github.ragecoo.whisp_socialmedia.dto.userdto.UserRef;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final FollowRepository followRepository;

    @Override
    public ProfileResponse getProfile(Long userId, User currentUser) {
        User profileUser = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Profile profile = profileRepository.findByUserIdWithUser(userId)
                .orElseGet(() -> createDefaultProfile(profileUser));

        if (Boolean.FALSE.equals(profile.getIsPublic()) && !isOwnerOrFollowing(profileUser, currentUser)) {
            throw new UnauthorizedException("This profile is private");
        }

        return buildProfileResponse(profile, currentUser);
    }

    @Override
    public ProfileResponse getMyProfile(User currentUser) {
        Profile profile = profileRepository.findByUserIdWithUser(currentUser.getId())
                .orElseGet(() -> createDefaultProfile(currentUser));

        return buildProfileResponse(profile, currentUser);
    }

    @Override
    @Transactional
    public ProfileResponse updateProfile(UpdateProfileRequest request, User currentUser) {
        Profile profile = profileRepository.findByUsers_Id(currentUser.getId())
                .orElseGet(() -> {
                    Profile newProfile = new Profile();
                    newProfile.setUsers(currentUser);
                    newProfile.setIsPublic(true);
                    return profileRepository.save(newProfile);
                });

        // обновить профиль важно обрабатывать все случаи
        if (request.getNickname() != null) {
            currentUser.setNickname(request.getNickname());
            userRepository.save(currentUser);
        }

        if (request.getIsPublic() != null) {
            profile.setIsPublic(request.getIsPublic());
        }

        // обработать avatarUrl правильно если приходит значение даже пустая строка обновляем его
        if (request.getAvatarUrl() != null) {
            profile.setAvatarUrl(request.getAvatarUrl().trim().isEmpty() ? null : request.getAvatarUrl());
        }

        if (request.getBio() != null) {
            profile.setBio(request.getBio().trim().isEmpty() ? null : request.getBio());
        }

        if (request.getLocation() != null) {
            profile.setLocation(request.getLocation().trim().isEmpty() ? null : request.getLocation());
        }

        if (request.getGender() != null) {
            profile.setGender(request.getGender().trim().isEmpty() ? null : request.getGender());
        }

        if (request.getDateOfBirth() != null) {
            profile.setDateOfBirth(request.getDateOfBirth());
        }

        profile.setUpdatedAt(Instant.now());

        // сохранить и вернуть результат
        Profile savedProfile = profileRepository.save(profile);
        System.out.println("Saved profile - Avatar URL: " + savedProfile.getAvatarUrl()); // Для отладки

        return buildProfileResponse(savedProfile, currentUser);
    }

    @Override
    public ProfileStatsResponse getProfileStats(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new NotFoundException("User not found");
        }

        Long followersCount = followRepository.countFollowers(userId);
        Long followingCount = followRepository.countFollowing(userId);
        Long postsCount = 0L;

        User user = userRepository.findById(userId).orElseThrow();

        ProfileStatsResponse stats = new ProfileStatsResponse();
        stats.setUserId(userId);
        stats.setUsername(user.getUsername());
        stats.setPostsCount(postsCount);
        stats.setFollowersCount(followersCount);
        stats.setFollowingCount(followingCount);

        return stats;
    }

    @Override
    @Transactional
    public void followUser(Long targetUserId, User currentUser) {
        if (currentUser.getId().equals(targetUserId)) {
            throw new IllegalArgumentException("Cannot follow yourself");
        }

        if (!userRepository.existsById(targetUserId)) {
            throw new NotFoundException("User not found");
        }

        if (followRepository.existsByFollowerIdAndFollowingId(currentUser.getId(), targetUserId)) {
            throw new IllegalArgumentException("Already following this user");
        }

        User targetUser = userRepository.findById(targetUserId).orElseThrow();

        Follow follow = new Follow();
        follow.setFollower(currentUser);
        follow.setFollowing(targetUser);

        followRepository.save(follow);
    }

    @Override
    @Transactional
    public void unfollowUser(Long targetUserId, User currentUser) {
        Follow follow = followRepository.findByFollowerIdAndFollowingId(currentUser.getId(), targetUserId)
                .orElseThrow(() -> new NotFoundException("Not following this user"));

        followRepository.delete(follow);
    }

    @Override
    public boolean isFollowing(Long followerId, Long followingId) {
        return followRepository.findByFollowerIdAndFollowingId(followerId, followingId).isPresent();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserRef> getFollowers(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new NotFoundException("User not found");
        }
        
        List<Follow> follows = followRepository.findByFollowingId(userId);
        return follows.stream()
                .map(follow -> {
                    User follower = follow.getFollower();
                    Profile profile = profileRepository.findByUsers_Id(follower.getId()).orElse(null);
                    String avatarUrl = profile != null ? profile.getAvatarUrl() : null;
                    return new UserRef(follower.getId(), follower.getUsername(), avatarUrl);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserRef> getFollowing(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new NotFoundException("User not found");
        }
        
        List<Follow> follows = followRepository.findByFollowerId(userId);
        return follows.stream()
                .map(follow -> {
                    User following = follow.getFollowing();
                    Profile profile = profileRepository.findByUsers_Id(following.getId()).orElse(null);
                    String avatarUrl = profile != null ? profile.getAvatarUrl() : null;
                    return new UserRef(following.getId(), following.getUsername(), avatarUrl);
                })
                .collect(Collectors.toList());
    }

    private Profile createDefaultProfile(User user) {
        Profile profile = new Profile();
        profile.setUsers(user);
        profile.setIsPublic(true);
        return profileRepository.save(profile);
    }

    private boolean isOwnerOrFollowing(User profileUser, User currentUser) {
        if (currentUser == null) return false;
        if (profileUser.getId().equals(currentUser.getId())) return true;
        return isFollowing(currentUser.getId(), profileUser.getId());
    }

    private ProfileResponse buildProfileResponse(Profile profile, User currentUser) {
        User user = profile.getUsers();

        ProfileResponse response = new ProfileResponse();
        response.setUserId(user.getId());
        response.setUsername(user.getUsername());
        response.setNickname(user.getNickname());
        response.setEmail(user.getEmail());
        response.setIsPublic(profile.getIsPublic());
        response.setAvatarUrl(profile.getAvatarUrl());
        response.setBio(profile.getBio());
        response.setLocation(profile.getLocation());
        response.setGender(profile.getGender());
        response.setDateOfBirth(profile.getDateOfBirth());
        response.setUpdatedAt(profile.getUpdatedAt());

        response.setFollowersCount(followRepository.countFollowers(user.getId()));
        response.setFollowingCount(followRepository.countFollowing(user.getId()));

        if (currentUser != null && !currentUser.getId().equals(user.getId())) {
            response.setIsFollowing(isFollowing(currentUser.getId(), user.getId()));
        }

        return response;
    }
}