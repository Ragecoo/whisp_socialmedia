import { apiClient } from './apiClient'

export const apiLogin = (data: { usernameOrEmail: string; password: string }) =>
	apiClient('/api/auth/login', {
		method: 'POST',
		body: JSON.stringify(data),
	})

export const apiLogout = () => {
	return apiClient('/api/auth/logout', { method: 'POST' })
}

export async function refreshAccessToken(url: string) {
	try {
		const res = await fetch(url, {
			method: 'POST',
			credentials: 'include',
		})
		if (!res.ok) {
			console.warn('Не удалось обновить токен, статус:', res.status)
			return false
		}
		return true
	} catch (err) {
		console.error('Ошибка при обновлении токена:', err)
		return false
	}
}

export default async function checkServerConnection() {
	try {
		console.log('checking')
		const res = await apiClient('/api/check')
		console.log('К бекэнду подключен')
		return true
	} catch {
		return false
	}
}
