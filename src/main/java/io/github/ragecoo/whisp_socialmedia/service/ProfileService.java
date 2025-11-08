package io.github.ragecoo.whisp_socialmedia.service;

import io.github.ragecoo.whisp_socialmedia.dto.profiledto.ProfileResponse;
import io.github.ragecoo.whisp_socialmedia.dto.profiledto.ProfileStatsResponse;
import io.github.ragecoo.whisp_socialmedia.dto.profiledto.UpdateProfileRequest;
import io.github.ragecoo.whisp_socialmedia.entity.User;

public interface ProfileService {
    ProfileResponse getProfile(Long userId, User currentUser);
    ProfileResponse getMyProfile(User currentUser);
    ProfileResponse updateProfile(UpdateProfileRequest request, User currentUser);
    ProfileStatsResponse getProfileStats(Long userId);
    void followUser(Long targetUserId, User currentUser);
    void unfollowUser(Long targetUserId, User currentUser);
    boolean isFollowing(Long followerId, Long followingId);
}