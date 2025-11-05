'use client'
import { Formik } from 'formik'
import React from 'react'
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
					if (!values.username) errors.username = 'Введите имя пользователя'
					if (!values.email) errors.email = 'Введите email'
					else if (
						!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
					)
						errors.email = 'Некорректный email'
					if (!values.password) errors.password = 'Введите пароль'
					if (values.password !== values.confirmPassword)
						errors.confirmPassword = 'Пароли не совпадают'
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
						console.log('✅ Успешная регистрация:', data)
						alert('Вы успешно зарегистрированы!')
					} catch (err) {
						console.error('Ошибка при запросе:', err)
						alert('Не удалось подключиться к серверу')
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
						{/* Username */}
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
							{errors.username && touched.username && (
								<div className={styles.registerFormError}>
									{errors.username}
								</div>
							)}
						</div>

						{/* Email */}
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
						</div>

						{/* Password */}
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
						</div>

						{/* Confirm Password */}
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

						<RippleButton
							type='submit'
							disabled={isSubmitting}
							className={styles.registerFormSubmit}
							hoverScale={1.01}
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
