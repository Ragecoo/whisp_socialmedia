'use client'
import { Formik } from 'formik'
import React, { useState } from 'react'
import styles from '@styles/RegisterForm.module.css'
import { RippleButton, RippleButtonRipples } from './RippleButton'
import { CursorFollow, CursorProvider } from './Cursor'

interface FormValues {
	username: string
	email: string
	password: string
	confirmPassword: string
}

export default function RegisterForm() {
	const [isLoading, setIsLoading] = useState(false)

	function handleSubmitClick(e: React.MouseEvent<HTMLButtonElement>) {
		setIsLoading(true)
		console.log(isLoading)
	}

	return (
		<>
			<div className={styles.registerFormTitle}>Создать аккаунт</div>
			<Formik<FormValues>
				initialValues={{
					username: '',
					email: '',
					password: '',
					confirmPassword: '',
				}}
				validate={values => {
					const errors: Partial<FormValues> = {}
					if (!values.username) {
						errors.username = 'Введите имя пользователя'
					} else if (values.username.length < 6) {
						errors.username = 'Имя пользователя должно быть длиннее 6 символов'
					} else if (!/^[A-Za-z0-9]+$/.test(values.username)) {
						errors.username =
							'Имя пользователя может содержать только латинские буквы и цифры'
					}
					if (!values.email) {
						errors.email = 'Введите email'
					} else if (
						!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
					) {
						errors.email = 'Некорректный email'
					}
					if (!values.password) {
						errors.password = 'Введите пароль'
					} else if (values.password.length < 6) {
						errors.password = 'Пароль должен быть длиннее 6 символов'
					} else if (!/^[A-Za-z0-9]+$/.test(values.password)) {
						errors.password =
							'Пароль может содержать только латинские буквы и цифры'
					}
					if (values.password !== values.confirmPassword) {
						errors.confirmPassword = 'Пароли не совпадают'
					}
					return errors
				}}
				onSubmit={async (values, { setSubmitting }) => {
					try {
						// формируем строку параметров
						const params = new URLSearchParams()
						params.append('username', values.username)
						params.append('email', values.email)
						params.append('password', values.password)
						params.append('confirmPassword', values.confirmPassword)

						const res = await fetch(
							`http://localhost:1010/api/auth/register?${params.toString()}`,
							{
								method: 'POST',
								credentials: 'include',
							}
						)

						if (!res.ok) {
							const error = await res.json().catch(() => ({}))
							console.error('Ошибка регистрации:', error)
							alert(error.error || 'Ошибка регистрации')
							return
						}

						const data = await res.json()
						console.log('Успешная регистрация:', data)
						setTimeout(() => {
							window.location.reload()
						}, 500)
					} catch (err) {
						console.error('Ошибка при запросе:', err)
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
					<form onSubmit={handleSubmit} className={styles.registerFormForm}>
						<div>
							<input
								type='text'
								name='username'
								onChange={handleChange}
								onBlur={handleBlur}
								value={values.username}
								className={`${styles.registerFormInput} ${styles.registerFormUsername}`}
								placeholder='Имя пользователя'
							/>
							<CursorProvider>
								<CursorFollow
									style={{
										borderRadius: 'var(--radius-sm)',
										backgroundColor: 'var(--color-gray-10)',
										color: 'var(--color-light-10)',
									}}
								>
									Минимум 6 символов
								</CursorFollow>
							</CursorProvider>
						</div>
						{errors.username && touched.username && (
							<div className={styles.registerFormError}>{errors.username}</div>
						)}
						<br />
						<div>
							<input
								type='email'
								name='email'
								onChange={handleChange}
								onBlur={handleBlur}
								value={values.email}
								className={`${styles.registerFormInput} ${styles.registerFormEmail}`}
								placeholder='Email'
							/>
							<CursorProvider>
								<CursorFollow
									style={{
										borderRadius: 'var(--radius-sm)',
										backgroundColor: 'var(--color-gray-10)',
										color: 'var(--color-light-10)',
									}}
								>
									example@mail.com
								</CursorFollow>
							</CursorProvider>
							{errors.email && touched.email && (
								<div className={styles.registerFormError}>{errors.email}</div>
							)}
							<br />
						</div>
						<div>
							<input
								type='password'
								name='password'
								onChange={handleChange}
								onBlur={handleBlur}
								value={values.password}
								className={`${styles.registerFormInput} ${styles.registerFormPassword}`}
								placeholder='Пароль'
							/>
							<CursorProvider>
								<CursorFollow
									style={{
										borderRadius: 'var(--radius-sm)',
										backgroundColor: 'var(--color-gray-10)',
										color: 'var(--color-light-10)',
									}}
								>
									Минимум 6 символов
								</CursorFollow>
							</CursorProvider>
							{errors.password && touched.password && (
								<div className={styles.registerFormError}>
									{errors.password}
								</div>
							)}
							<br />
						</div>
						<div>
							<input
								type='password'
								name='confirmPassword'
								onChange={handleChange}
								onBlur={handleBlur}
								value={values.confirmPassword}
								className={`${styles.registerFormInput} ${styles.registerFormConfirm}`}
								placeholder='Подтвердите пароль'
							/>
							{errors.confirmPassword && touched.confirmPassword && (
								<div className={styles.registerFormError}>
									{errors.confirmPassword}
								</div>
							)}
						</div>
						<br />
						<RippleButton
							type='submit'
							disabled={isSubmitting}
							className={`${styles.registerFormSubmit} ${
								isLoading ? styles.active : ''
							}`}
							hoverScale={1.01}
							onClick={handleSubmitClick}
						>
							Зарегистрироваться
							<RippleButtonRipples
								style={{ backgroundColor: 'var(--color-white-10)' }}
							/>
						</RippleButton>
					</form>
				)}
			</Formik>
		</>
	)
}
