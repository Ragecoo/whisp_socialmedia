import { apiClient } from './apiClient'

export default async function getMyProfile() {
	try {
		const result = await apiClient('/api/profile/me')
		return result
	} catch {
		return null
	}
}
