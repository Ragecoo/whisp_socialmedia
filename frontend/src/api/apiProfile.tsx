import { apiClient } from './apiClient'
import { Profile } from '@/types/Profile'

export default async function getMyProfile(): Promise<Profile> {
	return await apiClient('/api/profile/me')
}

export async function getProfile(userId: number): Promise<Profile> {
	return await apiClient(`/api/profile/${userId}`)
}

export async function followUser(userId: number): Promise<void> {
	await apiClient(`/api/profile/${userId}/follow`, {
		method: 'POST',
	})
}

export async function unfollowUser(userId: number): Promise<void> {
	await apiClient(`/api/profile/${userId}/unfollow`, {
		method: 'POST',
	})
}

export async function checkIsFollowing(userId: number): Promise<boolean> {
	const result = await apiClient(`/api/profile/${userId}/is-following`)
	return result.isFollowing || false
}

export interface UserRef {
	id: number
	username: string
	avatarUrl?: string
}

export async function getFollowers(userId: number): Promise<UserRef[]> {
	return await apiClient(`/api/profile/${userId}/followers`)
}

export async function getFollowing(userId: number): Promise<UserRef[]> {
	return await apiClient(`/api/profile/${userId}/following`)
}
