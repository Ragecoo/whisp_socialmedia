'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LoaderCircle } from '@/components/animate-ui/icons/loader-circle'
import { AnimateIcon } from '@/components/animate-ui/icons/icon'
import styles from '@styles/Newpost.module.css'

function Favorites() {
	const { user, loading, error, isAuth } = useAuth()
	const [isRedirecting, setIsRedirecting] = useState(false)
	const router = useRouter()

	useEffect(() => {
		if (!loading && !isAuth) {
			console.log('редирект на логин')
			setIsRedirecting(true)
			router.push('/user')
		}
	}, [loading, isAuth, router])

	// показывать спиннер пока идет проверка авторизации или пока идет редирект
	const showLoading = loading || isRedirecting || !isAuth
	if (showLoading) {
		return (
			<div className={`${styles.page} ${styles.newpostPage}`}>
				<div className={styles.newpostSectionLoading}>
					<AnimateIcon animateOnView style={{ transform: 'scale(2)' }}>
						<LoaderCircle />
					</AnimateIcon>
				</div>
			</div>
		)
	}

	return <div>favorites</div>
}

export default Favorites
