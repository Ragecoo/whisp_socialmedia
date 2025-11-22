import { apiClient } from './apiClient'
import { Post } from '@/types/Post'

export interface PostPageResponse {
	content: Post[]
	page: number
	size: number
	totalElements: number
	totalPages: number
	hasNext: boolean
	hasPrevious: boolean
}

export interface CreatePostRequest {
	content: string
	privacyLevel: 'public' | 'friends' | 'private'
	hashtags?: string[]
	media?: Array<{ url: string; type: 'image' | 'video' }>
}

export async function getAllPosts(page: number = 0, size: number = 10): Promise<PostPageResponse> {
	try {
		const result = await apiClient(`/api/posts?page=${page}&size=${size}`)
		return result
	} catch (error) {
		console.error('Failed to fetch posts:', error)
		return {
			content: [],
			page: 0,
			size: size,
			totalElements: 0,
			totalPages: 0,
			hasNext: false,
			hasPrevious: false,
		}
	}
}

export async function createPost(request: CreatePostRequest): Promise<Post> {
	try {
		const result = await apiClient('/api/posts', {
			method: 'POST',
			body: JSON.stringify({
				content: request.content,
				privacyLevel: request.privacyLevel,
				hashtags: request.hashtags || [],
				media: request.media || [],
				isPublished: true,
			}),
		})
		return result
	} catch (error) {
		console.error('Failed to create post:', error)
		throw error
	}
}

export async function uploadMedia(file: File): Promise<{ url: string; type: 'image' | 'video' }> {
	try {
		const formData = new FormData()
		formData.append('file', file)

		const result = await fetch('http://localhost:1010/api/upload/media', {
			method: 'POST',
			body: formData,
			credentials: 'include',
		})

		if (!result.ok) {
			throw new Error(`Upload failed: ${result.status}`)
		}

		return await result.json()
	} catch (error) {
		console.error('Failed to upload media:', error)
		throw error
	}
}

export async function getPostById(id: number): Promise<Post | null> {
	try {
		const result = await apiClient(`/api/posts/${id}`)
		return result
	} catch (error) {
		console.error('Failed to fetch post:', error)
		return null
	}
}

export async function getPostsByUserId(userId: number): Promise<Post[]> {
	try {
		const result = await apiClient(`/api/posts/user/${userId}`)
		return result
	} catch (error) {
		console.error('Failed to fetch user posts:', error)
		return []
	}
}

export async function deletePost(postId: number): Promise<void> {
	try {
		await apiClient(`/api/posts/${postId}`, {
			method: 'DELETE',
		})
	} catch (error) {
		console.error('Failed to delete post:', error)
		throw error
	}
}

export async function updatePost(postId: number, request: CreatePostRequest): Promise<Post> {
	try {
		const result = await apiClient(`/api/posts/${postId}`, {
			method: 'PUT',
			body: JSON.stringify({
				content: request.content,
				privacyLevel: request.privacyLevel,
				hashtags: request.hashtags || [],
				media: request.media || [],
				isPublished: true,
			}),
		})
		return result
	} catch (error) {
		console.error('Failed to update post:', error)
		throw error
	}
}
