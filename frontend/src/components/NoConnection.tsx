'use client'

import React from 'react'
import styles from '@styles/NoConnection.module.css'
import { AnimateIcon } from './animate-ui/icons/icon'
import { LoaderCircle } from './animate-ui/icons/loader-circle'

export default function NoConnection() {
	return (
		<div className={styles.noConnection}>
			<AnimateIcon animateOnView style={{ transform: 'scale(2)' }}>
				<LoaderCircle />
			</AnimateIcon>
			<br />
			<span>Проблема с соединением.</span>
			<span> Мы пытаемся восстановить связь...</span>
			<button
				onClick={() => {
					window.location.reload()
				}}
			>
				Повторить попытку
			</button>
		</div>
	)
}
