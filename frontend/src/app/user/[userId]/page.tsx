'use client'

import { Slide } from '@/components/Slide'
import styles from '@styles/User.module.css'
import { useAuth } from '@/hooks/useAuth'
import { LoaderCircle } from '@/components/animate-ui/icons/loader-circle'
import { AnimateIcon } from '@/components/animate-ui/icons/icon'
import { useEffect, useState } from 'react'
import { getProfile, followUser, unfollowUser, checkIsFollowing, getFollowers, getFollowing, UserRef } from '@/api/apiProfile'
import { Profile } from '@/types/Profile'
import { getPostsByUserId } from '@/api/apiPosts'
import { Post } from '@/types/Post'
import { useParams, useRouter } from 'next/navigation'
import { RippleButton, RippleButtonRipples } from '@/components/RippleButton'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/Dialog'
import Link from 'next/link'
import ImageZoom from 'react-image-zooom'
import { X, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react'
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuLabel,
	DropdownMenuGroup,
	DropdownMenuShortcut,
} from '@/components/DropdownMenu'
import { useRef } from 'react'

function UserProfile() {
	const { user, loading, error, isAuth } = useAuth()
	const params = useParams()
	const router = useRouter()
	const userId = params?.userId ? parseInt(params.userId as string) : null
	const [profile, setProfile] = useState<Profile | null>(null)
	const [profileLoading, setProfileLoading] = useState(false)
	const [profileError, setProfileError] = useState<string | null>(null)
	const [userPosts, setUserPosts] = useState<Post[]>([])
	const [postsLoading, setPostsLoading] = useState(false)
	const [isFollowing, setIsFollowing] = useState(false)
	const [isFollowingLoading, setIsFollowingLoading] = useState(false)
	const [followButtonLoading, setFollowButtonLoading] = useState(false)
	const [isRedirecting, setIsRedirecting] = useState(false)
	const [followers, setFollowers] = useState<UserRef[]>([])
	const [following, setFollowing] = useState<UserRef[]>([])
	const [followersLoading, setFollowersLoading] = useState(false)
	const [followingLoading, setFollowingLoading] = useState(false)
	const [followersDialogOpen, setFollowersDialogOpen] = useState(false)
	const [followingDialogOpen, setFollowingDialogOpen] = useState(false)
	const [selectedMedia, setSelectedMedia] = useState<{ postId: number; mediaIndex: number } | null>(null)
	const imageRef = useRef<HTMLImageElement | null>(null)
	const [imageScale, setImageScale] = useState<number>(1.1)
	const [imageZoom, setImageZoom] = useState<string>('300')
	const [mediaErrors, setMediaErrors] = useState<Set<string>>(new Set())

	const isOwnProfile = user && userId && user.id === userId

	useEffect(() => {
		if (!loading && !isAuth) {
			console.log('редирект на логин')
			setIsRedirecting(true)
			router.push('/user')
		}
	}, [loading, isAuth, router])

	useEffect(() => {
		if (user && userId && user.id === userId) {
			router.push('/user')
		}
	}, [user, userId, router])

	useEffect(() => {
		if (followersDialogOpen && userId && followers.length === 0 && !followersLoading) {
			setFollowersLoading(true)
			getFollowers(userId)
				.then((data) => {
					console.log('Followers loaded:', data)
					setFollowers(data)
				})
				.catch((error) => {
					console.error('Error loading followers:', error)
				})
				.finally(() => setFollowersLoading(false))
		}
	}, [followersDialogOpen, userId])

	useEffect(() => {
		if (followingDialogOpen && userId && following.length === 0 && !followingLoading) {
			setFollowingLoading(true)
			getFollowing(userId)
				.then((data) => {
					console.log('Following loaded:', data)
					setFollowing(data)
				})
				.catch((error) => {
					console.error('Error loading following:', error)
				})
				.finally(() => setFollowingLoading(false))
		}
	}, [followingDialogOpen, userId])

	const getMediaArray = (post: Post) => {
		if (!post.media) return []
		return Object.keys(post.media)
			.sort((a, b) => parseInt(a) - parseInt(b))
			.map(key => ({
				url: post.media![key].url,
				type: post.media![key].type
			}))
	}

	const goToPrevious = () => {
		if (!selectedMedia) return
		const post = userPosts.find(p => p.id === selectedMedia.postId)
		if (!post) return
		const mediaArray = getMediaArray(post)
		if (selectedMedia.mediaIndex > 0) {
			setSelectedMedia({ postId: selectedMedia.postId, mediaIndex: selectedMedia.mediaIndex - 1 })
		}
	}

	const goToNext = () => {
		if (!selectedMedia) return
		const post = userPosts.find(p => p.id === selectedMedia.postId)
		if (!post) return
		const mediaArray = getMediaArray(post)
		if (selectedMedia.mediaIndex < mediaArray.length - 1) {
			setSelectedMedia({ postId: selectedMedia.postId, mediaIndex: selectedMedia.mediaIndex + 1 })
		}
	}

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && selectedMedia) {
				setSelectedMedia(null)
			}
			if (e.key === 'ArrowLeft' && selectedMedia) {
				goToPrevious()
			}
			if (e.key === 'ArrowRight' && selectedMedia) {
				goToNext()
			}
		}
		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [selectedMedia])

	useEffect(() => {
		if (selectedMedia && imageRef.current) {
			const img = imageRef.current
			const handleLoad = () => {
				const naturalWidth = img.naturalWidth
				if (naturalWidth < 1000) {
					setImageScale(1.5)
					setImageZoom('200')
				} else {
					setImageScale(1.1)
					setImageZoom('300')
				}
			}
			img.addEventListener('load', handleLoad)
			if (img.complete) handleLoad()
			return () => img.removeEventListener('load', handleLoad)
		}
	}, [selectedMedia])

	useEffect(() => {
		if (userId && isAuth) {
			const currentUserId = userId // TypeScript теперь знает, что это number
			setProfileLoading(true)
			setProfileError(null)
			const isOwn = user && currentUserId && user.id === currentUserId
			async function loadProfile() {
				try {
					const profileData = await getProfile(currentUserId)
					setProfile(profileData)
					
					// загрузить посты пользователя
					setPostsLoading(true)
					const posts = await getPostsByUserId(currentUserId)
					setUserPosts(posts)
					setPostsLoading(false)

					// проверить подписку если это не свой профиль
					if (!isOwn && user) {
						setIsFollowingLoading(true)
						const following = await checkIsFollowing(currentUserId)
						setIsFollowing(following)
						setIsFollowingLoading(false)
					}
				} catch (error) {
					console.error('Failed to fetch profile:', error)
					setProfileError(
						error instanceof Error ? error.message : 'Failed to load profile'
					)
				} finally {
					setProfileLoading(false)
				}
			}
			loadProfile()
		}
	}, [userId, isAuth, user])

	const handleFollow = async () => {
		if (!userId || !isAuth) return
		setFollowButtonLoading(true)
		try {
			if (isFollowing) {
				await unfollowUser(userId)
				setIsFollowing(false)
				if (profile) {
					setProfile({
						...profile,
						followersCount: Math.max(0, profile.followersCount - 1)
					})
				}
			} else {
				await followUser(userId)
				setIsFollowing(true)
				if (profile) {
					setProfile({
						...profile,
						followersCount: profile.followersCount + 1
					})
				}
			}
		} catch (error) {
			console.error('Failed to follow/unfollow:', error)
		} finally {
			setFollowButtonLoading(false)
		}
	}

	const showLoading = loading || isRedirecting || (isAuth && profileLoading)

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


	if (!profile) {
		return null
	}

	return (
		<div className={`${styles.page} ${styles.userPage}`}>
			<Slide offset={80} className={styles.userSectionProfile}>
				<div className={styles.profile}>
					<div className={styles.profilePfpBlock}>
						{profile.avatarUrl ? (
							<img
								src={`http://localhost:1010${profile.avatarUrl}`}
								alt={profile.username}
								className={styles.profileAvatar}
							/>
						) : (
							<img
								src="/standart_avatar.png"
								alt={profile.username}
								className={styles.profileAvatar}
							/>
						)}
						{!isOwnProfile && (
							<RippleButton
								onClick={handleFollow}
								disabled={followButtonLoading || isFollowingLoading}
								className={styles.followButton}
								hoverScale={1.01}
							>
								{followButtonLoading || isFollowingLoading ? (
									<>
										<LoaderCircle size={20} />
										<span>{isFollowing ? 'Отписаться' : 'Подписаться'}</span>
									</>
								) : (
									<span>{isFollowing ? 'Отписаться' : 'Подписаться'}</span>
								)}
								<RippleButtonRipples
									style={{ backgroundColor: 'var(--color-white-10)' }}
								/>
							</RippleButton>
						)}
					</div>
					<div className={styles.profileInfoBlock}>
						<div className={styles.profileInfoTopBlock}>
							<div className={styles.profileInfoUser}>
								<span className={styles.profileInfoNickname}>
									{profile.nickname || profile.username}
								</span>
								<span className={styles.profileInfoUsername}>
									@{profile.username}
								</span>
								{profile.gender && (
									<span className={styles.profileInfoGender}>
										Пол: {profile.gender.toLowerCase()}
									</span>
								)}
							</div>
							<div className={styles.profileInfoFollow}>
								<Dialog open={followersDialogOpen} onOpenChange={setFollowersDialogOpen}>
									<DialogTrigger asChild>
										<RippleButton className={styles.followCountButton} hoverScale={1.01}>
											{profile.followersCount}{' '}
											{pluralize(
												profile.followersCount || 0,
												'подписчик',
												'подписчика',
												'подписчиков'
											)}
											<RippleButtonRipples
												style={{ backgroundColor: 'var(--color-white-10)' }}
											/>
										</RippleButton>
									</DialogTrigger>
									<DialogContent className={styles.dialogWrapper}>
										<DialogHeader>
											<DialogTitle>Подписчики</DialogTitle>
											<DialogDescription>
												Список пользователей, которые подписаны на {profile.nickname || profile.username}
											</DialogDescription>
										</DialogHeader>
										<div className={styles.dialogContent}>
											{followersLoading ? (
												<div className={styles.dialogLoading}>
													<LoaderCircle />
												</div>
											) : followers.length > 0 ? (
												<ul className={styles.userList}>
													{followers.map((user) => (
														<li key={user.id} className={styles.userListItem}>
															<Link href={`/user/${user.id}`} className={styles.userListLink}>
																<img
																	src={user.avatarUrl ? `http://localhost:1010${user.avatarUrl}` : '/standart_avatar.png'}
																	alt={user.username}
																	className={styles.userListAvatar}
																/>
																<span className={styles.userListUsername}>{user.username}</span>
															</Link>
														</li>
													))}
												</ul>
											) : (
												<div className={styles.dialogEmpty}>Нет подписчиков</div>
											)}
										</div>
									</DialogContent>
								</Dialog>
								<Dialog open={followingDialogOpen} onOpenChange={setFollowingDialogOpen}>
									<DialogTrigger asChild>
										<RippleButton className={styles.followCountButton} hoverScale={1.01}>
											{profile.followingCount}{' '}
											{pluralize(
												profile.followingCount || 0,
												'подписка',
												'подписки',
												'подписок'
											)}
											<RippleButtonRipples
												style={{ backgroundColor: 'var(--color-white-10)' }}
											/>
										</RippleButton>
									</DialogTrigger>
									<DialogContent className={styles.dialogWrapper}>
										<DialogHeader>
											<DialogTitle>Подписки</DialogTitle>
											<DialogDescription>
												Список пользователей, на которых подписан {profile.nickname || profile.username}
											</DialogDescription>
										</DialogHeader>
										<div className={styles.dialogContent}>
											{followingLoading ? (
												<div className={styles.dialogLoading}>
													<LoaderCircle />
												</div>
											) : following.length > 0 ? (
												<ul className={styles.userList}>
													{following.map((user) => (
														<li key={user.id} className={styles.userListItem}>
															<Link href={`/user/${user.id}`} className={styles.userListLink}>
																<img
																	src={user.avatarUrl ? `http://localhost:1010${user.avatarUrl}` : '/standart_avatar.png'}
																	alt={user.username}
																	className={styles.userListAvatar}
																/>
																<span className={styles.userListUsername}>{user.username}</span>
															</Link>
														</li>
													))}
												</ul>
											) : (
												<div className={styles.dialogEmpty}>Нет подписок</div>
											)}
										</div>
									</DialogContent>
								</Dialog>
							</div>
						</div>
						<div className={styles.profileInfoBottomBlock}>
							<div className={styles.profileInfoBio}>
								{profile.bio || 'no bio'}
							</div>
						</div>
					</div>
					<div className={styles.profileMainBlock}>
						{postsLoading ? (
							<div className={styles.postsLoading}>
								<AnimateIcon animateOnView>
									<LoaderCircle />
								</AnimateIcon>
							</div>
						) : userPosts.length > 0 ? (
							<div className={styles.userPostsList}>
								{userPosts.map(post => (
									<article key={post.id} className={styles.userPostCard}>
										<div className={styles.userPostHeader}>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<button className={styles.userPostMenuButton} aria-label="Post options">
														<MoreVertical size={20} />
													</button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end" className="w-56">
													<DropdownMenuLabel>Действия с постом</DropdownMenuLabel>
													<DropdownMenuSeparator />
													<DropdownMenuGroup>
														<DropdownMenuItem>
															<span>Скопировать ссылку</span>
															<DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
														</DropdownMenuItem>
														<DropdownMenuItem>
															<span>Поделиться</span>
														</DropdownMenuItem>
													</DropdownMenuGroup>
													<DropdownMenuSeparator />
													<DropdownMenuItem variant="destructive">
														<span>Пожаловаться</span>
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>
										{post.content && (
											<p className={styles.userPostContent}>
												{post.content}
											</p>
										)}
										{post.media && Object.keys(post.media).length > 0 && (
											<div className={styles.userPostMediaContainer}>
												{Object.keys(post.media)
													.sort((a, b) => parseInt(a) - parseInt(b))
													.map((key, index) => {
														const media = post.media![key]
														const mediaKey = `${post.id}-${index}`
														const hasError = mediaErrors.has(mediaKey)
														return (
															<div key={index} className={styles.userPostMediaItem}>
																{media.type === 'image' ? (
																	<img
																		src={hasError ? '/media_not_found.png' : `http://localhost:1010${media.url}`}
																		alt={`Media ${index}`}
																		className={styles.userPostMediaImage}
																		onClick={() => !hasError && setSelectedMedia({ postId: post.id, mediaIndex: index })}
																		onError={() => {
																			setMediaErrors(prev => new Set(prev).add(mediaKey))
																		}}
																		onLoad={(e) => {
																			// Проверяем, что загрузился не standart_avatar.png вместо медиафайла
																			const img = e.currentTarget
																			// Если это медиафайл (содержит media_), но загрузился standart_avatar - это ошибка
																			const isMediaFile = media.url.includes('/media_') || media.url.includes('media_')
																			if (isMediaFile && (img.src.includes('standart_avatar') || img.src.includes('avatar_'))) {
																				setMediaErrors(prev => new Set(prev).add(mediaKey))
																			}
																		}}
																	/>
																) : (
																	<div className={styles.userPostMediaVideoContainer}>
																		{hasError ? (
																			<img
																				src="/media_not_found.png"
																				alt="Media not found"
																				className={styles.userPostMediaImage}
																			/>
																		) : (
																		<video
																			src={`http://localhost:1010${media.url}`}
																			className={styles.userPostMediaVideo}
																			controls
																				onError={() => {
																					setMediaErrors(prev => new Set(prev).add(mediaKey))
																				}}
																		/>
																		)}
																	</div>
																)}
															</div>
														)
													})}
											</div>
										)}
										{post.hashtags && Object.keys(post.hashtags).length > 0 && (
											<div className={styles.userPostHashtags}>
												{Object.keys(post.hashtags)
													.sort((a, b) => parseInt(a) - parseInt(b))
													.map((key, index) => (
														<span key={index} className={styles.userPostHashtag}>
															#{post.hashtags![key]}
														</span>
													))}
											</div>
										)}
										{post.createdAt && (
											<div className={styles.userPostDate}>
												{new Date(post.createdAt).toLocaleString('ru-RU', {
													day: '2-digit',
													month: '2-digit',
													year: 'numeric',
													hour: '2-digit',
													minute: '2-digit'
												})}
											</div>
										)}
									</article>
								))}
							</div>
						) : (
							<div className={styles.noPosts}>
								Пока нет постов
							</div>
						)}
					</div>
				</div>
			</Slide>
			{selectedMedia && (() => {
				const post = userPosts.find(p => p.id === selectedMedia.postId)
				if (!post) return null
				const mediaArray = getMediaArray(post)
				const currentMedia = mediaArray[selectedMedia.mediaIndex]
				if (!currentMedia) return null
				const isImage = currentMedia.type === 'image'
				const isVideo = currentMedia.type === 'video'
				const modalMediaKey = `modal-${selectedMedia.postId}-${selectedMedia.mediaIndex}`
				const hasModalError = mediaErrors.has(modalMediaKey)
				
				return (
					<div className={styles.modal}>
						<button
							type="button"
							onClick={() => setSelectedMedia(null)}
							className={styles.modalCloseButton}
						>
							<X size={24} />
						</button>
						{selectedMedia.mediaIndex > 0 && (
							<button
								type="button"
								onClick={goToPrevious}
								className={`${styles.modalNavButton} ${styles.modalNavButtonLeft}`}
							>
								<ChevronLeft size={32} />
							</button>
						)}
						{selectedMedia.mediaIndex < mediaArray.length - 1 && (
							<button
								type="button"
								onClick={goToNext}
								className={`${styles.modalNavButton} ${styles.modalNavButtonRight}`}
							>
								<ChevronRight size={32} />
							</button>
						)}
						{hasModalError ? (
							<img
								src="/media_not_found.png"
								alt="Media not found"
								className={styles.modalImageWrapper}
								style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain' }}
							/>
						) : isImage ? (
							<div
								className={`${styles.imageZoomContainer} ${styles.imageZoomContainerWrapper}`}
								style={{
									'--image-scale': imageScale,
								} as React.CSSProperties}
							>
								<img
									ref={imageRef}
									src={`http://localhost:1010${currentMedia.url}`}
									alt="Preview"
									className={styles.hiddenImage}
									onError={() => {
										setMediaErrors(prev => new Set(prev).add(modalMediaKey))
									}}
								/>
								<div className={styles.modalImageWrapper}>
									<ImageZoom
										src={`http://localhost:1010${currentMedia.url}`}
										alt="Preview"
										zoom={imageZoom}
										fullWidth={true}
										width="100%"
										height="auto"
									/>
								</div>
							</div>
						) : isVideo ? (
							<video
								src={`http://localhost:1010${currentMedia.url}`}
								controls
								autoPlay
								className={styles.modalVideo}
								onClick={(e) => e.stopPropagation()}
								onError={() => {
									setMediaErrors(prev => new Set(prev).add(modalMediaKey))
								}}
							/>
						) : null}
					</div>
				)
			})()}
		</div>
	)
}

export default UserProfile

