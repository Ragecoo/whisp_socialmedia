'use client'

import { Slide } from '@components/Slide'
import styles from '@styles/Home.module.css'
import { Search as SearchIcon } from 'lucide-react'
import { getAllPosts, PostPageResponse } from '@/api/apiPosts'
import { Post } from '@/types/Post'
import { useEffect, useState, useCallback, useRef } from 'react'
import { shuffleArray } from '@/lib/utils'
import { PreviewCard, PreviewCardTrigger, PreviewCardPanel } from '@components/PreviewCard'
import Link from 'next/link'
import { SpaceBackground } from '@/components/SpaceBackground'
import { X, Play, ChevronLeft, ChevronRight } from 'lucide-react'
import ImageZoom from 'react-image-zooom'

export default function Home() {
	const [posts, setPosts] = useState<Post[]>([])
	const [loading, setLoading] = useState(true)
	const [hasMore, setHasMore] = useState(true)
	const [currentPage, setCurrentPage] = useState(0)
	const [shuffledPosts, setShuffledPosts] = useState<Post[]>([])
	const observerRef = useRef<IntersectionObserver | null>(null)
	const loadingRef = useRef<HTMLDivElement | null>(null)
	const pageSize = 10
	const [selectedMedia, setSelectedMedia] = useState<{ postId: number; mediaIndex: number } | null>(null)
	const imageRef = useRef<HTMLImageElement | null>(null)
	const [imageScale, setImageScale] = useState<number>(1.1)
	const [imageZoom, setImageZoom] = useState<string>('300')
	const [mediaErrors, setMediaErrors] = useState<Set<string>>(new Set())

	const loadPosts = useCallback(async (page: number) => {
		try {
			setLoading(true)
			const response: PostPageResponse = await getAllPosts(page, pageSize)
			console.log('Posts loaded:', response.content.length, 'posts')
			
			if (page === 0) {
				// первая загрузка перемешать все посты
				const allPosts = response.content
				const shuffled = shuffleArray(allPosts)
				setPosts(shuffled)
				setShuffledPosts(shuffled)
			} else {
				// последующие загрузки добавить новые посты и перемешать весь список
				setShuffledPosts((prev) => {
					const newShuffled = shuffleArray([...prev, ...response.content])
					setPosts(newShuffled)
					return newShuffled
				})
			}
			
			setHasMore(response.hasNext)
			setCurrentPage(page)
		} catch (error) {
			console.error('Error loading posts:', error)
			// при ошибке устанавливаем пустой массив чтобы показать сообщение
			if (page === 0) {
				setPosts([])
				setShuffledPosts([])
			}
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		loadPosts(0)
	}, [])

	// настроить intersection observer для бесконечной прокрутки
	useEffect(() => {
		if (observerRef.current) {
			observerRef.current.disconnect()
		}

		observerRef.current = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasMore && !loading) {
					loadPosts(currentPage + 1)
				}
			},
			{ threshold: 0.1 }
		)

		if (loadingRef.current) {
			observerRef.current.observe(loadingRef.current)
		}

		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect()
			}
		}
	}, [hasMore, loading, currentPage, loadPosts])

	// функция для получения медиа файлов из поста
	const getMediaArray = (post: Post) => {
		if (!post.media) return []
		return Object.keys(post.media)
			.sort((a, b) => parseInt(a) - parseInt(b))
			.map(key => ({
				url: post.media![key].url,
				type: post.media![key].type
			}))
	}

	const getHashtagsArray = (post: Post) => {
		if (!post.hashtags) return []
		return Object.keys(post.hashtags)
			.sort((a, b) => parseInt(a) - parseInt(b))
			.map(key => post.hashtags![key] as string)
	}

	const goToPrevious = () => {
		if (!selectedMedia) return
		const post = posts.find(p => p.id === selectedMedia.postId)
		if (!post) return
		const mediaArray = getMediaArray(post)
		if (selectedMedia.mediaIndex > 0) {
			setSelectedMedia({ postId: selectedMedia.postId, mediaIndex: selectedMedia.mediaIndex - 1 })
		}
	}

	const goToNext = () => {
		if (!selectedMedia) return
		const post = posts.find(p => p.id === selectedMedia.postId)
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
	}, [selectedMedia, goToPrevious, goToNext])

	// вычисление масштаба для изображений
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

	return (
		<div className={(styles.page, styles.homePage)}>
			<Slide offset={25} className={styles.feedSection}>
				{/* <SpaceBackground className={styles.feedBackground}/> */}
				{posts.length > 0 ? (
					<div className={styles.feedList}>
						<ul className={styles.postsList}>
							{posts.map(post => (
								<li key={post.id} className={styles.postItem}>
									<article className={styles.postCard}>
										<div className={styles.postHeader}>
											<PreviewCard followCursor={true}>
												<PreviewCardTrigger
													render={
														<Link href={`/user/${post.authorId}`} className={styles.postAuthorAvatar}>
															<img
																src={
																	post.authorAvatarUrl
																		? `http://localhost:1010${post.authorAvatarUrl}`
																		: '/standart_avatar.png'
																}
																alt={post.authorUsername}
															/>
														</Link>
													}
												/>
												<PreviewCardPanel
													side="right"
													sideOffset={8}
													align="start"
													className={styles.previewCardPanel}
												>
													<div className={styles.previewCardContent}>
														<img
															className={styles.previewCardAvatar}
															src={
																post.authorAvatarUrl
																	? `http://localhost:1010${post.authorAvatarUrl}`
																	: '/standart_avatar.png'
															}
															alt={post.authorUsername}
														/>
														<div className={styles.previewCardInfo}>
															<div className={styles.previewCardName}>
																<div className={styles.previewCardDisplayName}>
																	{post.authorNickname || post.authorUsername}
																</div>
																<div className={styles.previewCardUsername}>
																	@{post.authorUsername}
																</div>
															</div>
															<div className={styles.previewCardStats}>
																<div className={styles.previewCardStat}>
																	<div className={styles.previewCardStatValue}>
																		{post.authorFollowingCount ?? 0}
																	</div>
																	<div className={styles.previewCardStatLabel}>Following</div>
																</div>
																<div className={styles.previewCardStat}>
																	<div className={styles.previewCardStatValue}>
																		{post.authorFollowersCount ?? 0}
																	</div>
																	<div className={styles.previewCardStatLabel}>Followers</div>
																</div>
															</div>
														</div>
													</div>
												</PreviewCardPanel>
											</PreviewCard>
											<div className={styles.postAuthorInfo}>
												<Link href={`/user/${post.authorId}`} className={styles.postAuthorName}>
													{post.authorNickname || post.authorUsername}
												</Link>
												<Link href={`/user/${post.authorId}`} className={styles.postAuthorUsername}>
													@{post.authorUsername}
												</Link>
												{post.createdAt && (
													<span className={styles.postDate}>
														{new Date(post.createdAt).toLocaleString('ru-RU', {
															day: '2-digit',
															month: '2-digit',
															year: 'numeric',
															hour: '2-digit',
															minute: '2-digit'
														})}
													</span>
												)}
											</div>
										</div>
										{post.content && (
											<p className={styles.postContent}>
												{post.content}
											</p>
										)}
										{post.media && Object.keys(post.media).length > 0 && (
											<div className={styles.postMediaContainer}>
												{getMediaArray(post).map((media, index) => {
													const mediaKey = `${post.id}-${index}`
													const hasError = mediaErrors.has(mediaKey)
													return (
													<div key={index} className={styles.postMediaItem}>
														{media.type === 'image' ? (
															<img
																	src={hasError ? '/media_not_found.png' : `http://localhost:1010${media.url}`}
																alt={`Media ${index}`}
																className={styles.postMediaImage}
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
															<div className={styles.postMediaVideoContainer}>
																	{hasError ? (
																		<img
																			src="/media_not_found.png"
																			alt="Media not found"
																			className={styles.postMediaImage}
																		/>
																	) : (
																<video
																	src={`http://localhost:1010${media.url}`}
																	className={styles.postMediaVideo}
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
											<div className={styles.postHashtags}>
												{getHashtagsArray(post).map((hashtag, index) => (
													<span key={index} className={styles.postHashtag}>
														#{hashtag}
													</span>
												))}
											</div>
										)}
									</article>
								</li>
							))}
						</ul>
						<div ref={loadingRef} className={styles.loadingContainer}>
							{loading && (
								<div className={styles.loadingText}>Загрузка постов...</div>
							)}
							{!hasMore && posts.length > 0 && (
								<div className={styles.noMorePosts}>
									Больше постов нет...
								</div>
							)}
						</div>
					</div>
				) : (
					<div className={styles.emptyState}>
						{loading ? 'Загрузка постов...' : 'Нет доступных постов'}
					</div>
				)}
			</Slide>
			<Slide offset={80} className={styles.searchSection}>
				<div className={styles.searchBar}>
					<input className={styles.searchBarInput} type='text' />
					<button className={styles.searchBarSubmit}>
						<SearchIcon />
					</button>
				</div>
				<div className={styles.searchResultsAndFriendsPosts}>results and friends posts</div>
			</Slide>x
			{selectedMedia && (() => {
				const post = posts.find(p => p.id === selectedMedia.postId)
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
