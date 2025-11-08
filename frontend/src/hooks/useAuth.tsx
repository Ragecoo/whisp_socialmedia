'use client'

import { apiGetMe } from '@/api/apiGetMe'
import { use, useEffect, useState } from 'react'

import React from 'react'

export function useAuth() {
	const [user, setUser] = useState<any | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	useEffect(() => {
		let ignore = false
		async function checkAuth() {
			setLoading(true)
			try {
				const data = await apiGetMe()
				if (!ignore) setUser(data)
			} catch {
				if (!ignore) setUser(null)
			} finally {
				if (!ignore) setLoading(false)
			}
		}
		checkAuth()
		return () => {
			ignore = true
		}
	}, [])

	return {
		user,
		loading,
		error,
		isAuth: !!user,
	}
}
