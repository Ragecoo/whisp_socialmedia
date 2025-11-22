package io.github.ragecoo.whisp_socialmedia.controller;

import io.github.ragecoo.whisp_socialmedia.dto.profiledto.ProfileResponse;
import io.github.ragecoo.whisp_socialmedia.dto.profiledto.ProfileStatsResponse;
import io.github.ragecoo.whisp_socialmedia.dto.profiledto.UpdateProfileRequest;
import io.github.ragecoo.whisp_socialmedia.dto.userdto.UserRef;
import io.github.ragecoo.whisp_socialmedia.entity.User;
import io.github.ragecoo.whisp_socialmedia.service.AuthService;
import io.github.ragecoo.whisp_socialmedia.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final AuthService authService;

    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> getMyProfile(
            @CookieValue(name = "accessToken", required = false) String accessToken) {

        User currentUser = authService.getUserByToken(accessToken);
        ProfileResponse profile = profileService.getMyProfile(currentUser);
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ProfileResponse> getProfile(
            @PathVariable Long userId,
            @CookieValue(name = "accessToken", required = false) String accessToken) {

        User currentUser = accessToken != null && !accessToken.isBlank() ?
                authService.getUserByToken(accessToken) : null;
        ProfileResponse profile = profileService.getProfile(userId, currentUser);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    public ResponseEntity<ProfileResponse> updateProfile(
            @RequestBody UpdateProfileRequest request,
            @CookieValue(name = "accessToken", required = false) String accessToken) {

        User currentUser = authService.getUserByToken(accessToken);
        ProfileResponse updatedProfile = profileService.updateProfile(request, currentUser);
        return ResponseEntity.ok(updatedProfile);
    }

    @GetMapping("/{userId}/stats")
    public ResponseEntity<ProfileStatsResponse> getProfileStats(@PathVariable Long userId) {
        ProfileStatsResponse stats = profileService.getProfileStats(userId);
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/{userId}/follow")
    public ResponseEntity<?> followUser(
            @PathVariable Long userId,
            @CookieValue(name = "accessToken", required = false) String accessToken) {

        User currentUser = authService.getUserByToken(accessToken);
        profileService.followUser(userId, currentUser);
        return ResponseEntity.ok(Map.of("message", "Successfully followed user"));
    }

    @PostMapping("/{userId}/unfollow")
    public ResponseEntity<?> unfollowUser(
            @PathVariable Long userId,
            @CookieValue(name = "accessToken", required = false) String accessToken) {

        User currentUser = authService.getUserByToken(accessToken);
        profileService.unfollowUser(userId, currentUser);
        return ResponseEntity.ok(Map.of("message", "Successfully unfollowed user"));
    }

    @GetMapping("/{userId}/is-following")
    public ResponseEntity<?> isFollowing(
            @PathVariable Long userId,
            @CookieValue(name = "accessToken", required = false) String accessToken) {

        User currentUser = authService.getUserByToken(accessToken);
        boolean isFollowing = profileService.isFollowing(currentUser.getId(), userId);
        return ResponseEntity.ok(Map.of("isFollowing", isFollowing));
    }

    @GetMapping("/{userId}/followers")
    public ResponseEntity<List<UserRef>> getFollowers(@PathVariable Long userId) {
        List<UserRef> followers = profileService.getFollowers(userId);
        return ResponseEntity.ok(followers);
    }

    @GetMapping("/{userId}/following")
    public ResponseEntity<List<UserRef>> getFollowing(@PathVariable Long userId) {
        List<UserRef> following = profileService.getFollowing(userId);
        return ResponseEntity.ok(following);
    }
}