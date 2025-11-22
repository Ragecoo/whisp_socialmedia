import { refreshAccessToken } from './auth'

export async function apiClient(path: string, options: RequestInit = {}) {
	const API_URL = 'http://localhost:1010'
	console.log('apiclient')

	const isFormData = options.body instanceof FormData

	let headers: HeadersInit = isFormData
		? options.headers || {}
		: {
				'Content-Type': 'application/json',
				...(options.headers || {}),
		  }

	let result = await fetch(`${API_URL}${path}`, {
		credentials: 'include',
		headers,
		...options,
	})

	console.log('fetch')

	if (result.status === 401 || result.status === 403) {
		console.log('форбидден ' + result.status)
		const refreshed = await refreshAccessToken(`${API_URL}/api/auth/refresh`)
		if (refreshed) {
			console.log('Токен обновлён, повтор запроса...')
			return apiClient(path, options)
		}
	}

	if (!result.ok) {
		throw new Error(`Ошибка ${result.status}`)
	}

	// Если статус 204 No Content, возвращаем undefined (нет тела ответа)
	if (result.status === 204) {
		return undefined
	}
	
	// Парсим JSON для остальных успешных ответов
	return result.json()
}
