'use client'
import { Formik } from 'formik'
import React from 'react'
import styles from '@styles/LoginForm.module.css'
import { RippleButton, RippleButtonRipples } from './RippleButton'
import { Cursor, CursorFollow, CursorProvider } from './Cursor'

interface FormValues {
	email: string
	password: string
}

export default function LoginForm() {
	return (
		<>
			<div className={styles.loginFormTitle}>Войти в аккаунт</div>
			<Formik<FormValues>
				initialValues={{ email: '', password: '' }}
				validate={values => {
					const errors: Partial<FormValues> = {}
					if (!values.email) {
						errors.email = 'Required'
					} else if (
						!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
					) {
						errors.email = 'Invalid email address'
					}
					if (!values.password) {
						errors.password = 'Required'
					}
					return errors
				}}
				onSubmit={async (values, { setSubmitting }) => {
					try {
						const res = await fetch('http://localhost:1010/api/auth/login', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								usernameOrEmail: values.email,
								password: values.password,
							}),
							credentials: 'include',
						})

						if (!res.ok) {
							const error = await res.json().catch(() => ({}))
							console.error('Ошибка входа:', error)
							alert(error.error || 'Ошибка авторизации')
							return
						}

						const data = await res.json()
						console.log('✅ Успешный вход:', data)

						alert('Вы успешно вошли!')

						window.location.href = '/user'
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
					<form onSubmit={handleSubmit} className='loginFormForm'>
						<div>
							<input
								type='email'
								name='email'
								onChange={handleChange}
								onBlur={handleBlur}
								value={values.email}
								className={`${styles.loginFormInput} ${styles.loginFormEmail}`}
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
						</div>

						{errors.email && touched.email && (
							<div className='loginFormError'>{errors.email}</div>
						)}

						<div>
							<input
								type='password'
								name='password'
								onChange={handleChange}
								onBlur={handleBlur}
								value={values.password}
								className={`${styles.loginFormInput} ${styles.loginFormPassword}`}
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
						</div>

						{errors.password && touched.password && (
							<div className='loginFormError'>{errors.password}</div>
						)}

						<RippleButton
							type='submit'
							disabled={isSubmitting}
							className={styles.loginFormSubmit}
							hoverScale={1.01}
						>
							Войти
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
