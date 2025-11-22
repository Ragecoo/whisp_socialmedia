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
import newpostStyles from '@styles/Newpost.module.css'
import LoginForm from '@/components/LoginForm'
import RegisterForm from './../../components/RegisterForm'
import { useAuth } from '@/hooks/useAuth'
import { LoaderCircle } from '@/components/animate-ui/icons/loader-circle'
import { AnimateIcon } from '@/components/animate-ui/icons/icon'
import { useEffect, useState, useRef } from 'react'
import { apiClient } from '@/api/apiClient'
import { Profile } from '@/types/Profile'
import AvatarUploader from '@/components/AvatarUploader'
import { getPostsByUserId, deletePost, updatePost, CreatePostRequest } from '@/api/apiPosts'
import { Post } from '@/types/Post'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/Dialog'
import { RippleButton, RippleButtonRipples } from '@/components/RippleButton'
import { getFollowers, getFollowing, UserRef } from '@/api/apiProfile'
import Link from 'next/link'
import ImageZoom from 'react-image-zooom'
import { X, ChevronLeft, ChevronRight, MoreVertical, Upload, ChevronDown } from 'lucide-react'
import { Formik } from 'formik'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { WithContext as ReactTags, SEPARATORS } from 'react-tag-input'
import type { Tag } from 'react-tag-input'
import { uploadMedia } from '@/api/apiPosts'
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
import {
	AlertDialog,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogCancel,
	AlertDialogAction,
} from '@/components/AlertDialog'

function User() {
	const { user, loading, error, isAuth } = useAuth()
	const [profile, setProfile] = useState<Profile | null>(null)
	const [profileLoading, setProfileLoading] = useState(false)
	const [profileError, setProfileError] = useState<string | null>(null)
	const [userPosts, setUserPosts] = useState<Post[]>([])
	const [postsLoading, setPostsLoading] = useState(false)
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
	const [editPostDialogOpen, setEditPostDialogOpen] = useState(false)
	const [editingPost, setEditingPost] = useState<Post | null>(null)
	const [deletePostDialogOpen, setDeletePostDialogOpen] = useState(false)
	const [postToDelete, setPostToDelete] = useState<number | null>(null)

	const handleEditPost = (post: Post) => {
		setEditingPost(post)
		setEditPostDialogOpen(true)
	}

	const handleDeletePost = async () => {
		if (postToDelete) {
			try {
				await deletePost(postToDelete)
				setUserPosts(prev => prev.filter(p => p.id !== postToDelete))
				setDeletePostDialogOpen(false)
				setPostToDelete(null)
			} catch (error) {
				console.error('Failed to delete post:', error)
			}
		}
	}

	const handleUpdatePost = async (postId: number, request: CreatePostRequest) => {
		try {
			await updatePost(postId, request)
			// Обновляем список постов
			if (profile?.userId) {
				const posts = await getPostsByUserId(profile.userId)
				setUserPosts(posts)
			}
			setEditPostDialogOpen(false)
			setEditingPost(null)
		} catch (error) {
			console.error('Failed to update post:', error)
		}
	}

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
					
					// загрузить посты пользователя
					if (profileData?.userId) {
						setPostsLoading(true)
						const posts = await getPostsByUserId(profileData.userId)
						setUserPosts(posts)
						setPostsLoading(false)
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
			getProfile()
		}
	}, [user, isAuth])

	useEffect(() => {
		if (followersDialogOpen && profile?.userId && followers.length === 0 && !followersLoading) {
			setFollowersLoading(true)
			getFollowers(profile.userId)
				.then((data) => {
					console.log('Followers loaded:', data)
					setFollowers(data)
				})
				.catch((error) => {
					console.error('Error loading followers:', error)
				})
				.finally(() => setFollowersLoading(false))
		}
	}, [followersDialogOpen, profile?.userId])

	useEffect(() => {
		if (followingDialogOpen && profile?.userId && following.length === 0 && !followingLoading) {
			setFollowingLoading(true)
			getFollowing(profile.userId)
				.then((data) => {
					console.log('Following loaded:', data)
					setFollowing(data)
				})
				.catch((error) => {
					console.error('Error loading following:', error)
				})
				.finally(() => setFollowingLoading(false))
		}
	}, [followingDialogOpen, profile?.userId])

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
								<Dialog open={followersDialogOpen} onOpenChange={setFollowersDialogOpen}>
									<DialogTrigger asChild>
										<RippleButton className={styles.followCountButton} hoverScale={1.01}>
											{profile?.followersCount}{' '}
											{pluralize(
												profile?.followersCount || 0,
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
											<DialogTitle>На вас подписаны</DialogTitle>
											<DialogDescription>
												Список пользователей, которые подписаны на вас
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
												<div className={styles.dialogEmpty}>На вас никто не подписан</div>
											)}
										</div>
									</DialogContent>
								</Dialog>
								<Dialog open={followingDialogOpen} onOpenChange={setFollowingDialogOpen}>
									<DialogTrigger asChild>
										<RippleButton className={styles.followCountButton} hoverScale={1.01}>
											{profile?.followingCount}{' '}
											{pluralize(
												profile?.followingCount || 0,
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
											<DialogTitle>Вы подписаны на</DialogTitle>
											<DialogDescription>
												Список пользователей, на которых вы подписаны
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
												<div className={styles.dialogEmpty}>Вы ни на кого не подписаны</div>
											)}
										</div>
									</DialogContent>
								</Dialog>
							</div>
						</div>
						<div className={styles.profileInfoBottomBlock}>
							<div className={styles.profileInfoBio}>
								{profile?.bio ? profile?.bio : 'no bio'}
							</div>
							<div className={styles.profileInfoButton}></div>
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
													<DropdownMenuLabel style={{ color: 'var(--color-darkgray-04)' }}>Действия с постом</DropdownMenuLabel>
													<DropdownMenuSeparator />
													<DropdownMenuGroup>
														<DropdownMenuItem onClick={() => handleEditPost(post)}>
															<span>Редактировать</span>
														</DropdownMenuItem>
														<DropdownMenuItem>
															<span>Скопировать ссылку</span>
														</DropdownMenuItem>
														<DropdownMenuItem>
															<span>Поделиться</span>
														</DropdownMenuItem>
													</DropdownMenuGroup>
													<DropdownMenuSeparator />
													<DropdownMenuItem 
														variant="destructive"
														onClick={() => {
															setPostToDelete(post.id)
															setDeletePostDialogOpen(true)
														}}
													>
														<span>Удалить</span>
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
			<AlertDialog open={deletePostDialogOpen} onOpenChange={setDeletePostDialogOpen}>
				<AlertDialogContent
					from='bottom'
					transition={{
						ease: [0, 0.71, 0.2, 1.01],
						type: 'spring',
						stiffness: 1000,
						damping: 25,
					}}
					className='sm:max-w-[425px]'
				>
					<AlertDialogHeader>
						<AlertDialogTitle>Удалить пост?</AlertDialogTitle>
						<AlertDialogDescription>
							Это действие нельзя отменить. Пост будет удален навсегда.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => {
							setDeletePostDialogOpen(false)
							setPostToDelete(null)
						}}>
							Отмена
						</AlertDialogCancel>
						<AlertDialogAction onClick={handleDeletePost}>
							Удалить
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			<Dialog open={editPostDialogOpen} onOpenChange={setEditPostDialogOpen}>
				<DialogContent 
					className={styles.editPostDialog} 
					showCloseButton={true}
					transition={{ duration: 0.2, ease: 'easeInOut' }}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
				>
					{editingPost && (
						<EditPostDialogContent
							post={editingPost}
							onSave={handleUpdatePost}
							onClose={() => {
								setEditPostDialogOpen(false)
								setEditingPost(null)
							}}
						/>
					)}
				</DialogContent>
			</Dialog>
		</div>
	)
}

interface EditPostDialogContentProps {
	post: Post
	onSave: (postId: number, request: CreatePostRequest) => Promise<void>
	onClose: () => void
}

function EditPostDialogContent({ post, onSave, onClose }: EditPostDialogContentProps) {
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [mediaFiles, setMediaFiles] = useState<Array<{ url: string; type: 'image' | 'video'; file?: File; preview?: string }>>([])
	const [uploadingMedia, setUploadingMedia] = useState(false)
	const [mediaError, setMediaError] = useState<string | null>(null)
	const [tags, setTags] = useState<Tag[]>([])
	const [tagError, setTagError] = useState<string | null>(null)
	const [isComboboxOpen, setIsComboboxOpen] = useState(false)
	const comboboxRef = useRef<HTMLDivElement>(null)

	// Инициализация данных поста
	useEffect(() => {
		if (post) {
			// Загружаем медиафайлы
			if (post.media && Object.keys(post.media).length > 0) {
				const mediaArray = Object.keys(post.media)
					.sort((a, b) => parseInt(a) - parseInt(b))
					.map(key => ({
						url: post.media![key].url,
						type: post.media![key].type as 'image' | 'video'
					}))
				setMediaFiles(mediaArray)
			}

			// Загружаем хэштеги
			if (post.hashtags && Object.keys(post.hashtags).length > 0) {
				const hashtagsArray = Object.keys(post.hashtags)
					.sort((a, b) => parseInt(a) - parseInt(b))
					.map(key => ({
						id: post.hashtags![key] as string,
						text: post.hashtags![key] as string,
						className: ''
					}))
				setTags(hashtagsArray)
			}
		}
	}, [post])

	const handleMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || [])
		if (files.length === 0) return

		setMediaError(null)

		const videoCount = mediaFiles.filter(m => m.type === 'video').length
		const imageCount = mediaFiles.filter(m => m.type === 'image').length
		const newVideos = files.filter(f => f.type.startsWith('video/'))
		const newImages = files.filter(f => f.type.startsWith('image/'))

		if (newVideos.length > 0 && videoCount > 0) {
			setMediaError('Можно загрузить только одно видео')
			return
		}

		if (newVideos.length > 0 && imageCount + newImages.length > 2) {
			setMediaError('С видео можно загрузить максимум 2 фото')
			return
		}

		if (newVideos.length === 0 && imageCount + newImages.length > 3) {
			setMediaError('Можно загрузить максимум 3 фото')
			return
		}

		setUploadingMedia(true)

		try {
			const uploadPromises = files.map(async (file) => {
				const uploaded = await uploadMedia(file)
				let preview: string | undefined
				
				if (file.type.startsWith('image/')) {
					preview = URL.createObjectURL(file)
				}
				
				return {
					...uploaded,
					file,
					preview,
				}
			})

			const uploadedFiles = await Promise.all(uploadPromises)
			const allFiles = [...mediaFiles, ...uploadedFiles]
			const videos = allFiles.filter(f => f.type === 'video')
			const images = allFiles.filter(f => f.type === 'image')
			const sorted = [...videos, ...images]
			
			setMediaFiles(sorted)
		} catch (err) {
			setMediaError('Ошибка загрузки файлов')
			console.error(err)
		} finally {
			setUploadingMedia(false)
			if (fileInputRef.current) {
				fileInputRef.current.value = ''
			}
		}
	}

	const removeMedia = (index: number) => {
		const file = mediaFiles[index]
		if (file.preview) {
			URL.revokeObjectURL(file.preview)
		}
		setMediaFiles(mediaFiles.filter((_, i) => i !== index))
	}

	const handleTagDelete = (index: number) => {
		setTags(tags.filter((_, i) => i !== index))
		setTagError(null)
	}

	const handleTagAddition = (tag: Tag) => {
		const maxLength = 30
		let tagText = tag.text.trim()
		
		if (tagText.startsWith('#')) {
			tagText = tagText.substring(1).trim()
		}
		
		if (tagText.length > maxLength) {
			setTagError(`Хэштег не может быть длиннее ${maxLength} символов`)
			return
		}
		
		if (tagText.length === 0) {
			setTagError('Хэштег не может быть пустым')
			return
		}
		
		setTagError(null)
		setTags([...tags, { id: tag.id || tagText, text: tagText, className: tag.className || '' }])
	}

	const handleTagDrag = (tag: Tag, currPos: number, newPos: number) => {
		const newTags = tags.slice()
		newTags.splice(currPos, 1)
		newTags.splice(newPos, 0, tag)
		setTags(newTags)
	}

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
				setIsComboboxOpen(false)
			}
		}

		if (isComboboxOpen) {
			document.addEventListener('mousedown', handleClickOutside)
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [isComboboxOpen])

	return (
		<DndProvider backend={HTML5Backend}>
			<Formik<{ content: string; privacyLevel: 'public' | 'friends' | 'private' }>
				initialValues={{
					content: post.content || '',
					privacyLevel: (post.privacyLevel as 'public' | 'friends' | 'private') || 'public',
				}}
				validate={values => {
					const errors: Partial<{ content: string }> = {}
					if (!values.content.trim()) {
						errors.content = 'Нельзя создать пост без текста'
					}
					return errors
				}}
				onSubmit={async (values, { setSubmitting }) => {
					try {
						const hashtagsArray = tags.map(tag => tag.text)
						const request: CreatePostRequest = {
							content: values.content,
							privacyLevel: values.privacyLevel,
							hashtags: hashtagsArray,
							media: mediaFiles.map(m => ({ url: m.url, type: m.type })),
						}
						await onSave(post.id, request)
					} catch (err) {
						console.error('Ошибка обновления поста:', err)
					} finally {
						setSubmitting(false)
					}
				}}
			>
				{({
					values,
					errors,
					touched,
					handleChange,
					handleBlur,
					handleSubmit,
					isSubmitting,
				}) => (
					<form onSubmit={handleSubmit} className={newpostStyles.form}>
						<div className={newpostStyles.formPadding}>
							<DialogHeader>
								<DialogTitle className={newpostStyles.formTitle}>
									Редактировать пост
								</DialogTitle>
							</DialogHeader>

							<div className={newpostStyles.formField}>
								<label className={newpostStyles.formLabel}>
									Текст поста
								</label>
								<textarea
									name="content"
									value={values.content}
									onChange={handleChange}
									onBlur={handleBlur}
									placeholder="Что у вас нового?"
									className={newpostStyles.formTextarea}
								/>
								{errors.content && touched.content && (
									<div className={newpostStyles.formError}>
										{errors.content}
									</div>
								)}
							</div>

							<div className={newpostStyles.formField}>
								<label className={newpostStyles.formLabel}>
									Медиа
								</label>
								<input
									ref={fileInputRef}
									type="file"
									accept="image/*,video/*"
									multiple
									onChange={handleMediaSelect}
									className={newpostStyles.hiddenInput}
									disabled={uploadingMedia}
								/>
								{mediaError && (
									<div className={newpostStyles.formErrorWithMargin}>
										{mediaError}
									</div>
								)}
								<div className={newpostStyles.mediaGrid}>
									{mediaFiles.map((media, index) => (
										<div key={index} className={newpostStyles.mediaItemContainer}>
											{media.type === 'image' ? (
												<img
													src={media.preview || `http://localhost:1010${media.url}`}
													alt={`Media ${index}`}
													className={newpostStyles.mediaImage}
												/>
											) : (
												<div className={newpostStyles.mediaVideoContainer}>
													<video
														src={`http://localhost:1010${media.url}`}
														className={newpostStyles.mediaVideo}
														controls
													/>
												</div>
											)}
											<button
												type="button"
												onClick={() => removeMedia(index)}
												className={newpostStyles.mediaRemoveButton}
											>
												<X size={16} />
											</button>
										</div>
									))}
									{mediaFiles.length < 3 && (
										<div
											onClick={() => {
												if (!uploadingMedia && fileInputRef.current) {
													fileInputRef.current.click()
												}
											}}
											className={`${newpostStyles.mediaUploadArea} ${uploadingMedia ? newpostStyles.mediaUploadAreaDisabled : newpostStyles.mediaUploadAreaEnabled}`}
										>
											{uploadingMedia ? (
												<LoaderCircle />
											) : (
												<Upload size={32} />
											)}
										</div>
									)}
								</div>
							</div>

							<div className={newpostStyles.formField}>
								<label className={newpostStyles.formLabel}>
									Хэштеги
								</label>
								<ReactTags
									tags={tags}
									suggestions={[]}
									separators={[SEPARATORS.ENTER, SEPARATORS.TAB, SEPARATORS.COMMA, ' ', SEPARATORS.SPACE]}
									handleDelete={handleTagDelete}
									handleAddition={handleTagAddition}
									handleDrag={handleTagDrag}
									inputFieldPosition="inline"
									placeholder="Добавить хэштег"
									allowDragDrop={true}
									autofocus={false}
									classNames={{
										tags: newpostStyles.reactTagsTags,
										tagInput: newpostStyles.reactTagsTagInput,
										tagInputField: newpostStyles.reactTagsTagInputField,
										selected: newpostStyles.reactTagsSelected,
										tag: newpostStyles.reactTagsTag,
										remove: newpostStyles.reactTagsRemove,
										suggestions: newpostStyles.reactTagsSuggestions,
										activeSuggestion: newpostStyles.reactTagsActiveSuggestion,
									}}
								/>
								{tagError && (
									<div className={newpostStyles.formError}>
										{tagError}
									</div>
								)}
							</div>

							<div className={newpostStyles.formField}>
								<label className={newpostStyles.formLabel}>
									Приватность
								</label>
								<div ref={comboboxRef} className={`${newpostStyles.comboboxWrapper} ${isComboboxOpen ? newpostStyles.comboboxOpen : ''}`}>
									<button
										type="button"
										onClick={() => setIsComboboxOpen(!isComboboxOpen)}
										className={newpostStyles.comboboxButton}
									>
										<span>
											{values.privacyLevel === 'public' && 'Публичный'}
											{values.privacyLevel === 'friends' && 'Друзья'}
											{values.privacyLevel === 'private' && 'Приватный'}
										</span>
										<ChevronDown size={16} className={newpostStyles.comboboxIcon} />
									</button>
									<div className={newpostStyles.comboboxDropdown}>
										<button
											type="button"
											onClick={() => {
												handleChange({ target: { name: 'privacyLevel', value: 'public' } } as any)
												setIsComboboxOpen(false)
											}}
											className={`${newpostStyles.comboboxOption} ${values.privacyLevel === 'public' ? newpostStyles.comboboxOptionActive : ''}`}
										>
											Публичный
										</button>
										<button
											type="button"
											onClick={() => {
												handleChange({ target: { name: 'privacyLevel', value: 'friends' } } as any)
												setIsComboboxOpen(false)
											}}
											className={`${newpostStyles.comboboxOption} ${values.privacyLevel === 'friends' ? newpostStyles.comboboxOptionActive : ''}`}
										>
											Друзья
										</button>
										<button
											type="button"
											onClick={() => {
												handleChange({ target: { name: 'privacyLevel', value: 'private' } } as any)
												setIsComboboxOpen(false)
											}}
											className={`${newpostStyles.comboboxOption} ${values.privacyLevel === 'private' ? newpostStyles.comboboxOptionActive : ''}`}
										>
											Приватный
										</button>
									</div>
								</div>
							</div>

							<div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
								<RippleButton
									type="button"
									onClick={onClose}
									className={newpostStyles.formSubmitButton}
									style={{ flex: 1 }}
								>
									Отмена
									<RippleButtonRipples />
								</RippleButton>
								<RippleButton
									type="submit"
									disabled={isSubmitting || uploadingMedia}
									className={newpostStyles.formSubmitButton}
									style={{ flex: 1 }}
								>
									{isSubmitting ? 'Сохранение...' : 'Сохранить'}
									<RippleButtonRipples />
								</RippleButton>
							</div>
						</div>
					</form>
				)}
			</Formik>
		</DndProvider>
	)
}

export default User
