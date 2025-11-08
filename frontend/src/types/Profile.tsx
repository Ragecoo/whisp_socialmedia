// types/profile.ts
export interface Profile {
	userId: number
	username: string
	nickname?: string
	email: string
	isPublic: boolean
	avatarUrl?: string
	bio?: string
	location?: string
	gender?: string
	dateOfBirth?: string
	updatedAt: string
	followersCount: number
	followingCount: number
	isFollowing?: boolean
}

// Вспомогательные функции для работы с профилем
export const ProfileUtils = {
	getDisplayName(profile: Profile): string {
		return profile.nickname || profile.username
	},

	hasAvatar(profile: Profile): boolean {
		return !!profile.avatarUrl
	},

	getAvatarUrl(profile: Profile, defaultAvatar?: string): string {
		return profile.avatarUrl || defaultAvatar || '/default-avatar.png'
	},

	getAge(profile: Profile): number | null {
		if (!profile.dateOfBirth) return null
		const birthDate = new Date(profile.dateOfBirth)
		const today = new Date()
		let age = today.getFullYear() - birthDate.getFullYear()
		const monthDiff = today.getMonth() - birthDate.getMonth()
		if (
			monthDiff < 0 ||
			(monthDiff === 0 && today.getDate() < birthDate.getDate())
		) {
			age--
		}
		return age
	},

	isOwnProfile(profile: Profile, currentUserId?: number): boolean {
		return currentUserId ? profile.userId === currentUserId : false
	},

	formatStats(profile: Profile): { followers: string; following: string } {
		const formatCount = (count: number): string => {
			if (count >= 1000000) {
				return (count / 1000000).toFixed(1) + 'M'
			}
			if (count >= 1000) {
				return (count / 1000).toFixed(1) + 'K'
			}
			return count.toString()
		}

		return {
			followers: formatCount(profile.followersCount),
			following: formatCount(profile.followingCount),
		}
	},
}
