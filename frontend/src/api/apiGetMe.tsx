'use client'

import { apiClient } from './apiClient'

export const apiGetMe = () => {
	return apiClient('/api/auth/me')
}
