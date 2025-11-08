'use client'

import { Slide } from '@/components/Slide'
import {
	Tabs,
	TabsContent,
	TabsContents,
	TabsList,
	TabsTrigger,
} from '@/components/Tabs'
import styles from '@styles/User.module.css'
import LoginForm from '@/components/LoginForm'
import RegisterForm from './../../components/RegisterForm'
import { useAuth } from '@/hooks/useAuth'
import { LoaderCircle } from '@/components/animate-ui/icons/loader-circle'
import { AnimateIcon } from '@/components/animate-ui/icons/icon'
import { useEffect, useState } from 'react'
import { apiClient } from '@/api/apiClient'
import { Profile } from '@/types/Profile'
import AvatarUploader from '@/components/AvatarUploader'

function User() {
	const { user, loading, error, isAuth } = useAuth()
	const [profile, setProfile] = useState<Profile | null>(null)
	const [profileLoading, setProfileLoading] = useState(false)
	const [profileError, setProfileError] = useState<string | null>(null)

	useEffect(() => {
		if (user && isAuth) {
			setProfileLoading(true)
			setProfileError(null)
			async function getProfile() {
				try {
					console.log('Fetching profile...')
					// Убедитесь, что endpoint правильный
					const profileData = await apiClient('/api/profile/me')
					console.log('Profile data:', profileData)
					setProfile(profileData)
				} catch (error) {
					console.error('Failed to fetch profile:', error)
					setProfileError(
						error instanceof Error ? error.message : 'Failed to load profile'
					)
				} finally {
					setProfileLoading(false)
				}
			}
			getProfile()
		}
	}, [user, isAuth])

	const showLoading = loading || (isAuth && profileLoading)

	function pluralize(count: number, one: string, few: string, many: string) {
		const mod10 = count % 10
		const mod100 = count % 100

		if (mod10 === 1 && mod100 !== 11) return one
		if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
		return many
	}

	if (showLoading) {
		return (
			<div className={`${styles.page} ${styles.userPage}`}>
				<div className={styles.userSectionLoading}>
					<AnimateIcon animateOnView style={{ transform: 'scale(2)' }}>
						<LoaderCircle />
					</AnimateIcon>
				</div>
			</div>
		)
	}

	if (profileError) {
		return (
			<div className={`${styles.page} ${styles.userPage}`}>
				<div className={styles.errorSection}>
					<h2>Ошибка загрузки профиля</h2>
					<p>{profileError}</p>
					<button onClick={() => window.location.reload()}>
						Попробовать снова
					</button>
				</div>
			</div>
		)
	}

	if (!isAuth) {
		return (
			<div className={`${styles.page} ${styles.userPage}`}>
				<Slide offset={80} className={styles.userSectionForm}>
					<Tabs className={styles.formTabsContainer} defaultValue='login'>
						<TabsList className={styles.formTabsList}>
							<TabsTrigger value='login'>Войти</TabsTrigger>
							<TabsTrigger value='register'>Создать аккаунт</TabsTrigger>
						</TabsList>
						<TabsContents>
							<TabsContent value='login' className={styles.formTabsBody}>
								<LoginForm />
							</TabsContent>
							<TabsContent value='register' className={styles.formTabsBody}>
								<RegisterForm />
							</TabsContent>
						</TabsContents>
					</Tabs>
				</Slide>
			</div>
		)
	}

	return (
		<div className={`${styles.page} ${styles.userPage}`}>
			<Slide offset={80} className={styles.userSectionProfile}>
				<div className={styles.profile}>
					<div className={styles.profilePfpBlock}>
						<AvatarUploader profile={profile} setProfile={setProfile} />
					</div>
					<div className={styles.profileInfoBlock}>
						<div className={styles.profileInfoTopBlock}>
							<div className={styles.profileInfoUser}>
								{profile?.nickname ? (
									<span className={styles.profileInfoNickname}>
										{profile?.nickname ? profile.nickname : profile?.username}
									</span>
								) : (
									<>
										<span className={styles.profileInfoNickname}>
											{profile?.nickname ? profile.nickname : profile?.username}
										</span>
										<span className={styles.profileInfoUsername}>
											{profile?.nickname ? profile.nickname : profile?.username}
										</span>
									</>
								)}
								<span className={styles.profileInfoGender}>
									{profile?.gender
										? 'Пол: ' + profile.gender.toLowerCase()
										: 'Пол: не указан'}
								</span>
							</div>
							<div className={styles.profileInfoFollow}>
								<div>
									{profile?.followersCount}{' '}
									{pluralize(
										profile?.followersCount || 0,
										'подписчик',
										'подписчика',
										'подписчиков'
									)}
								</div>

								<div>
									{profile?.followingCount}{' '}
									{pluralize(
										profile?.followingCount || 0,
										'подписка',
										'подписки',
										'подписок'
									)}
								</div>
							</div>
						</div>
						<div className={styles.profileInfoBottomBlock}>
							<div className={styles.profileInfoBio}>
								{profile?.bio ? profile?.bio : 'no bio'}
							</div>
							<div className={styles.profileInfoButton}></div>
						</div>
					</div>
					<div className={styles.profileMainBlock}>1</div>
				</div>
			</Slide>
		</div>
	)
}

export default User
