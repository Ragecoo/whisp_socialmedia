export interface Post {
	id: number
	content?: string
	media?: Record<string, any>
	privacyLevel?: string
	hashtags?: Record<string, any>
	authorId: number
	authorUsername: string
	authorNickname?: string
	authorAvatarUrl?: string
	authorFollowersCount?: number
	authorFollowingCount?: number
	isPublished: boolean
	createdAt?: string
	publishedAt?: string
}
