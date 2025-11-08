'use client'
import React, { useRef, useState } from 'react'
import { apiClient } from '@/api/apiClient'
import type { Profile } from '@/types/Profile'
import styles from '@styles/AvatarUploader.module.css'
import { AnimateIcon } from './animate-ui/icons/icon'
import { LoaderCircle } from './animate-ui/icons/loader-circle'
import { Upload as Icon_Upload } from 'lucide-react'

interface AvatarUploaderProps {
	profile: Profile | null
	setProfile: React.Dispatch<React.SetStateAction<Profile | null>>
}

function AvatarUploader({ profile, setProfile }: AvatarUploaderProps) {
	const fileInputRef = useRef<HTMLInputElement | null>(null)
	const [uploading, setUploading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleClick = () => {
		if (!uploading) {
			fileInputRef.current?.click()
		}
	}

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		// Валидация файла
		if (!file.type.startsWith('image/')) {
			setError('Пожалуйста, выберите файл изображения')
			return
		}

		if (file.size > 5 * 1024 * 1024) {
			setError('Файл слишком большой. Максимальный размер: 5MB')
			return
		}

		setUploading(true)
		setError(null)

		try {
			const formData = new FormData()
			formData.append('file', file)

			const res = await fetch('http://localhost:1010/api/upload/avatar', {
				method: 'POST',
				body: formData,
				credentials: 'include',
			})

			if (!res.ok) {
				throw new Error(`Upload failed: ${res.status} ${res.statusText}`)
			}

			const data = await res.json()
			setProfile((prev: Profile | null) =>
				prev
					? {
							...prev,
							avatarUrl: data.url,
					  }
					: null
			)
			if (profile) {
				await apiClient('/api/profile/me', {
					method: 'PUT',
					body: JSON.stringify({
						...profile,
						avatarUrl: data.url,
					}),
					headers: {
						'Content-Type': 'application/json',
					},
				})
			}
		} catch (err) {
			console.error('Error uploading avatar:', err)
			setError(err instanceof Error ? err.message : 'Ошибка загрузки')
		} finally {
			setUploading(false)
			if (fileInputRef.current) {
				fileInputRef.current.value = ''
			}
		}
	}

	const avatarSrc = profile?.avatarUrl
		? `http://localhost:1010${profile.avatarUrl}?v=${Date.now()}`
		: '/standart_avatar.png'

	return (
		<>
			<div
				onClick={handleClick}
				className={`${styles.avatarWrapper} ${
					uploading ? styles.uploading : ''
				}`}
			>
				{uploading ? (
					<AnimateIcon animateOnView>
						<LoaderCircle scale={4} />
					</AnimateIcon>
				) : (
					<img src={avatarSrc} alt='avatar' className={styles.avatarImage} />
				)}
				<div className={styles.avatarWrapperEdit}>
					{uploading ? (
						<AnimateIcon animateOnView>
							<LoaderCircle scale={4} />
						</AnimateIcon>
					) : (
						<Icon_Upload width={32} height={32}></Icon_Upload>
					)}
				</div>
			</div>

			<input
				type='file'
				accept='image/*'
				ref={fileInputRef}
				className={styles.hiddenInput}
				onChange={handleFileChange}
				disabled={uploading}
			/>
			{error && <span className={styles.errorText}>{error}</span>}
		</>
	)
}

export default AvatarUploader
