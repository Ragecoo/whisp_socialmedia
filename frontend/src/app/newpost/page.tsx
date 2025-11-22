'use client'

import styles from '@styles/Newpost.module.css'
import { Slide } from '@components/Slide'
import { StarsBackground } from '@components/StarsBackground'
import { useAuth } from '@/hooks/useAuth'
import { AnimateIcon } from '@/components/animate-ui/icons/icon'
import { useRouter } from 'next/navigation'
import { LoaderCircle } from '@/components/animate-ui/icons/loader-circle'
import { useEffect, useState, useRef, useCallback } from 'react'
import { Formik } from 'formik'
import { createPost, uploadMedia, CreatePostRequest } from '@/api/apiPosts'
import { RippleButton, RippleButtonRipples } from '@/components/RippleButton'
import { X, Upload, Image as ImageIcon, Video, Play, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { WithContext as ReactTags, SEPARATORS } from 'react-tag-input'
import type { Tag } from 'react-tag-input'
import ImageZoom from 'react-image-zooom'
import { CursorFollow, CursorProvider } from '@/components/Cursor'

interface FormValues {
	content: string
	privacyLevel: 'public' | 'friends' | 'private'
}

interface MediaFile {
	url: string
	type: 'image' | 'video'
	file?: File
	preview?: string
}

const ITEM_TYPE = 'MEDIA_ITEM'

// компонент для draggable медиа элемента
function DraggableMediaItem({
	media,
	index,
	moveMedia,
	removeMedia,
	onVideoPlay,
	onImageClick,
}: {
	media: MediaFile
	index: number
	moveMedia: (dragIndex: number, hoverIndex: number) => void
	removeMedia: (index: number) => void
	onVideoPlay?: (media: MediaFile) => void
	onImageClick?: (media: MediaFile) => void
}) {
	const indexRef = useRef(index)
	
	// обновляем ref при изменении индекса
	useEffect(() => {
		indexRef.current = index
	}, [index])

	const [{ isDragging }, drag] = useDrag({
		type: ITEM_TYPE,
		item: () => {
			return { index: indexRef.current }
		},
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
		canDrag: true,
	})

	// предотвращаем drag при клике на кнопку удаления
	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		const target = e.target as HTMLElement
		if (target.closest('button')) {
			e.stopPropagation()
		}
	}, [])

	const [, drop] = useDrop({
		accept: ITEM_TYPE,
		hover: (draggedItem: { index: number }) => {
			const dragIndex = draggedItem.index
			const hoverIndex = indexRef.current

			if (dragIndex === hoverIndex) {
				return
			}

			moveMedia(dragIndex, hoverIndex)
			draggedItem.index = hoverIndex
		},
	})

	const opacity = isDragging ? 0.5 : 1

	const ref = useCallback(
		(node: HTMLDivElement | null) => {
			drag(drop(node))
		},
		[drag, drop]
	)

	return (
		<div
			ref={ref}
			onMouseDown={handleMouseDown}
			className={`${styles.mediaItemContainer} ${isDragging ? styles.mediaItemDragging : styles.mediaItemContainerNotDragging}`}
			style={{ opacity }}
		>
			{media.type === 'image' && media.preview ? (
				<img
					src={media.preview}
					alt={`Preview ${index}`}
					draggable={false}
					onDragStart={(e) => {
						e.preventDefault()
						e.stopPropagation()
					}}
					onContextMenu={(e) => e.preventDefault()}
					onClick={(e) => {
						e.stopPropagation()
						if (onImageClick) {
							onImageClick(media)
						}
					}}
					className={`${styles.mediaImage} ${onImageClick ? styles.mediaImageClickable : styles.mediaImageDefault}`}
				/>
			) : media.type === 'video' ? (
				<div className={styles.mediaVideoContainer}>
					{media.preview ? (
						<img
							src={media.preview}
							alt={`Video preview ${index}`}
							draggable={false}
							onDragStart={(e) => {
								e.preventDefault()
								e.stopPropagation()
							}}
							onContextMenu={(e) => e.preventDefault()}
							className={styles.mediaVideoPreview}
						/>
					) : (
						<div className={styles.mediaVideoPlaceholder}>
							<Video size={32} />
						</div>
					)}
					{onVideoPlay && (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation()
								onVideoPlay(media)
							}}
							className={styles.mediaPlayButton}
						>
							<Play size={24} fill="white" />
						</button>
					)}
				</div>
			) : (
				<div className={styles.mediaVideoPlaceholder}>
					<Video size={32} />
				</div>
			)}
			<button
				type="button"
				onClick={(e) => {
					e.stopPropagation()
					removeMedia(index)
				}}
				className={styles.mediaRemoveButton}
			>
				<X size={16} />
			</button>
		</div>
	)
}

// функция для генерации превью видео из первого кадра
function generateVideoThumbnail(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const video = document.createElement('video')
		const canvas = document.createElement('canvas')
		const ctx = canvas.getContext('2d')

		video.preload = 'metadata'
		video.muted = true
		video.playsInline = true
		const objectUrl = URL.createObjectURL(file)
		video.src = objectUrl
		video.currentTime = 0.1 // берем кадр через 0.1 секунды

		video.onloadedmetadata = () => {
			canvas.width = video.videoWidth
			canvas.height = video.videoHeight
		}

		video.onseeked = () => {
			if (ctx) {
				ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
				const thumbnail = canvas.toDataURL('image/jpeg')
				URL.revokeObjectURL(objectUrl)
				resolve(thumbnail)
			} else {
				URL.revokeObjectURL(objectUrl)
				reject(new Error('Не удалось создать canvas context'))
			}
		}

		video.onerror = () => {
			URL.revokeObjectURL(objectUrl)
			reject(new Error('Не удалось загрузить видео'))
		}

		video.load()
	})
}

function Newpost() {
	const { user, loading, error, isAuth } = useAuth()
	const [isRedirecting, setIsRedirecting] = useState(false)
	const router = useRouter()
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
	const [uploadingMedia, setUploadingMedia] = useState(false)
	const [mediaError, setMediaError] = useState<string | null>(null)
	const [tags, setTags] = useState<Tag[]>([])
	const [tagError, setTagError] = useState<string | null>(null)
	const tagsInputRef = useRef<HTMLInputElement | null>(null)
	const [isComboboxOpen, setIsComboboxOpen] = useState(false)
	const comboboxRef = useRef<HTMLDivElement>(null)
	const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null)
	const [imageScale, setImageScale] = useState<number>(1.1)
	const [imageZoom, setImageZoom] = useState<string>('300')
	const videoUrlRef = useRef<string | null>(null)
	const imageRef = useRef<HTMLImageElement | null>(null)

	// получаем выбранный медиафайл по индексу
	const selectedMedia = selectedMediaIndex !== null ? mediaFiles[selectedMediaIndex] : null
	const isImage = selectedMedia?.type === 'image'
	const isVideo = selectedMedia?.type === 'video'

	// освобождаем URL при закрытии модального окна или переключении видео
	useEffect(() => {
		if (selectedMediaIndex === null) {
			if (videoUrlRef.current) {
				URL.revokeObjectURL(videoUrlRef.current)
				videoUrlRef.current = null
			}
		} else if (isVideo && selectedMedia?.file) {
			// создаем новый URL для нового видео
			if (videoUrlRef.current) {
				URL.revokeObjectURL(videoUrlRef.current)
			}
			videoUrlRef.current = URL.createObjectURL(selectedMedia.file)
		}
	}, [selectedMediaIndex, isVideo, selectedMedia])

	// закрытие по ESC и навигация стрелками
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (selectedMediaIndex === null) return

			if (e.key === 'Escape') {
				setSelectedMediaIndex(null)
			} else if (e.key === 'ArrowLeft') {
				if (selectedMediaIndex > 0) {
					setSelectedMediaIndex(selectedMediaIndex - 1)
				}
			} else if (e.key === 'ArrowRight') {
				if (selectedMediaIndex < mediaFiles.length - 1) {
					setSelectedMediaIndex(selectedMediaIndex + 1)
				}
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [selectedMediaIndex, mediaFiles.length])

	// функции для навигации по медиафайлам
	const goToPrevious = () => {
		if (selectedMediaIndex !== null && selectedMediaIndex > 0) {
			setSelectedMediaIndex(selectedMediaIndex - 1)
		}
	}

	const goToNext = () => {
		if (selectedMediaIndex !== null && selectedMediaIndex < mediaFiles.length - 1) {
			setSelectedMediaIndex(selectedMediaIndex + 1)
		}
	}

	// вычисляем scale на основе размера изображения
	useEffect(() => {
		if (isImage && imageRef.current) {
			const img = imageRef.current
			const checkSize = () => {
				if (img.complete) {
					const width = img.naturalWidth || img.width
					const height = img.naturalHeight || img.height
					const maxDimension = Math.max(width, height)
					
					// чем меньше изображение, тем больше scale и меньше zoom
					// большие изображения (1000px и больше) не увеличиваются
					let scale: number
					let zoom: string
					if (maxDimension < 500) {
						scale = 2.5 // очень маленькие изображения - очень большой scale
						zoom = '200' // маленький zoom
					} else if (maxDimension < 1000) {
						scale = 2.2 // маленькие изображения
						zoom = '250' // средний zoom
					} else {
						scale = 1.0 // большие изображения (1000px и больше) - не увеличиваются
						zoom = '300' // большой zoom
					}
					
					setImageScale(scale)
					setImageZoom(zoom)
				}
			}
			
			img.onload = checkSize
			checkSize()
		}
	}, [isImage, selectedMedia])

	useEffect(() => {
		if (!loading && !isAuth) {
			console.log('редирект на логин')
			setIsRedirecting(true)
			router.push('/user')
		}
	}, [loading, isAuth, router])

	// закрытие combobox при клике вне его
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

	// обработка вставки из буфера обмена
	useEffect(() => {
		const handlePaste = (e: ClipboardEvent) => {
			const pastedText = e.clipboardData?.getData('text')
			if (!pastedText) return

			// парсим текст по пробелам и запятым
			const parts = pastedText.split(/[\s,]+/).filter(part => part.trim().length > 0)
			
			if (parts.length > 1) {
				e.preventDefault()
				
				parts.forEach(part => {
					const trimmedPart = part.trim()
					if (trimmedPart.length > 0) {
						// создаем тег и добавляем его
						const maxLength = 30
						let tagText = trimmedPart
						
						// убираем # из начала если пользователь его ввел
						if (tagText.startsWith('#')) {
							tagText = tagText.substring(1).trim()
						}
						
						if (tagText.length > maxLength) {
							setTagError(`Хэштег не может быть длиннее ${maxLength} символов`)
							return
						}
						
						if (tagText.length === 0) {
							return
						}
						
						setTagError(null)
						setTags(prevTags => [...prevTags, { id: tagText, text: tagText, className: '' }])
					}
				})
			}
		}

		// находим input поле ReactTags и добавляем обработчик
		const findAndAttachPasteHandler = () => {
			const container = document.querySelector(`.${styles.reactTagsTags}`)
			if (container) {
				const input = container.querySelector('input') as HTMLInputElement
				if (input) {
					input.addEventListener('paste', handlePaste)
				}
			}
		}

		// небольшая задержка чтобы ReactTags успел отрендериться
		const timeoutId = setTimeout(findAndAttachPasteHandler, 100)
		
		return () => {
			clearTimeout(timeoutId)
			const container = document.querySelector(`.${styles.reactTagsTags}`)
			if (container) {
				const input = container.querySelector('input') as HTMLInputElement
				if (input) {
					input.removeEventListener('paste', handlePaste)
				}
			}
		}
	}, [])

	const moveMedia = useCallback((dragIndex: number, hoverIndex: number) => {
		setMediaFiles((prevFiles) => {
			if (dragIndex === hoverIndex) {
				return prevFiles
			}
			
			const draggedItem = prevFiles[dragIndex]
			const targetItem = prevFiles[hoverIndex]
			
			// видео всегда должно быть первым
			if (draggedItem.type === 'video') {
				// если перетаскиваем видео, оно должно быть на позиции 0
				if (hoverIndex !== 0) {
					return prevFiles
				}
			} else if (draggedItem.type === 'image') {
				// изображения можно перемещать только между собой (не перед видео)
				const videoIndex = prevFiles.findIndex(f => f.type === 'video')
				if (videoIndex !== -1 && hoverIndex <= videoIndex) {
					return prevFiles
				}
			}
			
			const newFiles = [...prevFiles]
			const draggedMedia = newFiles[dragIndex]
			newFiles.splice(dragIndex, 1)
			newFiles.splice(hoverIndex, 0, draggedMedia)
			
			return newFiles
		})
	}, [])

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

	const handleMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || [])
		if (files.length === 0) return

		setMediaError(null)

		// проверить количество файлов
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
				} else if (file.type.startsWith('video/')) {
					// генерируем превью для видео
					try {
						preview = await generateVideoThumbnail(file)
					} catch (err) {
						console.error('Ошибка генерации превью видео:', err)
					}
				}
				
				return {
					...uploaded,
					file,
					preview,
				}
			})

			const uploadedFiles = await Promise.all(uploadPromises)
			
			// сортируем чтобы видео всегда были первыми
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
		
		// убираем # из начала если пользователь его ввел
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

	return (
		<DndProvider backend={HTML5Backend}>
			{selectedMedia && (
				<div className={styles.modal}>
					{/* кнопка закрытия */}
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation()
							setSelectedMediaIndex(null)
						}}
						className={styles.modalCloseButton}
					>
						<X size={24} />
					</button>

					{/* кнопка назад */}
					{selectedMediaIndex !== null && selectedMediaIndex > 0 && (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation()
								goToPrevious()
							}}
							className={`${styles.modalNavButton} ${styles.modalNavButtonLeft}`}
						>
							<ChevronLeft size={32} />
						</button>
					)}

					{/* кнопка вперед */}
					{selectedMediaIndex !== null && selectedMediaIndex < mediaFiles.length - 1 && (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation()
								goToNext()
							}}
							className={`${styles.modalNavButton} ${styles.modalNavButtonRight}`}
						>
							<ChevronRight size={32} />
						</button>
					)}

					{/* контент - изображение или видео */}
					{isImage ? (
						<div
							className={`${styles.imageZoomContainer} ${styles.imageZoomContainerWrapper}`}
							style={{
								'--image-scale': imageScale,
							} as React.CSSProperties}
						>
							<img
								ref={imageRef}
								src={selectedMedia.preview || `http://localhost:1010${selectedMedia.url}`}
								alt="Preview"
								className={styles.hiddenImage}
							/>
							<div className={styles.modalImageWrapper}>
								<ImageZoom
									src={selectedMedia.preview || `http://localhost:1010${selectedMedia.url}`}
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
							src={
								selectedMedia.file 
									? (videoUrlRef.current || (videoUrlRef.current = URL.createObjectURL(selectedMedia.file)))
									: `http://localhost:1010${selectedMedia.url}`
							}
							controls
							autoPlay
							className={styles.modalVideo}
							onClick={(e) => e.stopPropagation()}
						/>
					) : null}
				</div>
			)}
		<div className={(styles.page, styles.newpostPage)}>
			<Slide offset={25} className={styles.newpostSection}>
				<StarsBackground className={styles.newpostBackground} factor={0.05} />
				<div className={styles.newpostContainer}>
						<Formik<FormValues>
							initialValues={{
								content: '',
								privacyLevel: 'public',
							}}
							validate={values => {
								const errors: Partial<FormValues> = {}
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

									await createPost(request)
									router.push('/')
								} catch (err) {
									console.error('Ошибка создания поста:', err)
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
								<form onSubmit={handleSubmit} className={styles.form}>
									<div className={styles.formPadding}>
										<h2 className={styles.formTitle}>
											Создать пост
										</h2>

										<div className={styles.formField}>
											<label className={styles.formLabel}>
												Текст поста
											</label>
											<textarea
												name="content"
												value={values.content}
												onChange={handleChange}
												onBlur={handleBlur}
												placeholder="Что у вас нового?"
												className={styles.formTextarea}
											/>
											{errors.content && touched.content && (
												<div className={styles.formError}>
													{errors.content}
												</div>
											)}
										</div>

										<div className={styles.formField}>
											<label className={styles.formLabel}>
												Медиа
											</label>
											<input
												ref={fileInputRef}
												type="file"
												accept="image/*,video/*"
												multiple
												onChange={handleMediaSelect}
												onClick={(e) => {
													e.stopPropagation()
												}}
												className={styles.hiddenInput}
												disabled={uploadingMedia}
											/>
											{mediaError && (
												<div className={styles.formErrorWithMargin}>
													{mediaError}
												</div>
											)}
											<div className={styles.mediaGrid}>
												{mediaFiles.map((media, index) => (
													<DraggableMediaItem
														key={media.url}
														media={media}
														index={index}
														moveMedia={moveMedia}
														removeMedia={removeMedia}
														onVideoPlay={(media) => {
															const index = mediaFiles.findIndex(m => m.url === media.url)
															if (index !== -1) {
																setSelectedMediaIndex(index)
															}
														}}
														onImageClick={(media) => {
															const index = mediaFiles.findIndex(m => m.url === media.url)
															if (index !== -1) {
																setSelectedMediaIndex(index)
															}
														}}
													/>
												))}
												{(() => {
													const videoCount = mediaFiles.filter(m => m.type === 'video').length
													const imageCount = mediaFiles.filter(m => m.type === 'image').length
													const canAddMore = (videoCount === 0 && imageCount < 3) || (videoCount === 1 && imageCount < 2)
													
													if (!canAddMore) return null
													
													return (
														<div
															onClick={(e) => {
																e.stopPropagation()
																if (!uploadingMedia && fileInputRef.current) {
																	fileInputRef.current.click()
																}
															}}
															onMouseDown={(e) => {
																e.stopPropagation()
															}}
															data-no-dnd="true"
															className={`${styles.mediaUploadArea} ${uploadingMedia ? styles.mediaUploadAreaDisabled : styles.mediaUploadAreaEnabled}`}
														>
															{uploadingMedia ? (
																<LoaderCircle />
															) : (
																<Upload size={32} />
															)}
														</div>
													)
												})()}
											</div>
										</div>

										<div className={styles.formField}>
											<label className={styles.formLabel}>
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
													tags: styles.reactTagsTags,
													tagInput: styles.reactTagsTagInput,
													tagInputField: styles.reactTagsTagInputField,
													selected: styles.reactTagsSelected,
													tag: styles.reactTagsTag,
													remove: styles.reactTagsRemove,
													suggestions: styles.reactTagsSuggestions,
													activeSuggestion: styles.reactTagsActiveSuggestion,
												}}
											/>
											{tagError && (
												<div className={styles.formError}>
													{tagError}
												</div>
											)}
										</div>

										<div className={styles.formField}>
											<label className={styles.formLabel}>
												Приватность
											</label>
											<div ref={comboboxRef} className={`${styles.comboboxWrapper} ${isComboboxOpen ? styles.comboboxOpen : ''}`}>
												<button
													type="button"
													onClick={() => setIsComboboxOpen(!isComboboxOpen)}
													className={styles.comboboxButton}
												>
													<span>
														{values.privacyLevel === 'public' && 'Публичный'}
														{values.privacyLevel === 'friends' && 'Друзья'}
														{values.privacyLevel === 'private' && 'Приватный'}
													</span>
													<ChevronDown size={16} className={styles.comboboxIcon} />
												</button>
												<div className={styles.comboboxDropdown}>
													<button
														type="button"
														onClick={() => {
															handleChange({ target: { name: 'privacyLevel', value: 'public' } } as any)
															setIsComboboxOpen(false)
														}}
														className={`${styles.comboboxOption} ${values.privacyLevel === 'public' ? styles.comboboxOptionActive : ''}`}
													>
														Публичный
													</button>
													<button
														type="button"
														onClick={() => {
															handleChange({ target: { name: 'privacyLevel', value: 'friends' } } as any)
															setIsComboboxOpen(false)
														}}
														className={`${styles.comboboxOption} ${values.privacyLevel === 'friends' ? styles.comboboxOptionActive : ''}`}
													>
														Друзья
													</button>
													<button
														type="button"
														onClick={() => {
															handleChange({ target: { name: 'privacyLevel', value: 'private' } } as any)
															setIsComboboxOpen(false)
														}}
														className={`${styles.comboboxOption} ${values.privacyLevel === 'private' ? styles.comboboxOptionActive : ''}`}
													>
														Приватный
													</button>
												</div>
											</div>
										</div>

										<RippleButton
											type="submit"
											disabled={isSubmitting || uploadingMedia}
											className={styles.formSubmitButton}
										>
											{isSubmitting ? 'Создание...' : 'Опубликовать'}
											<RippleButtonRipples />
										</RippleButton>
									</div>
								</form>
							)}
						</Formik>
				</div>
			</Slide>
		</div>
		</DndProvider>
	)
}

export default Newpost
