'use client'
import { Formik } from 'formik'
import React from 'react'
import styles from '@styles/LoginForm.module.css'
import { RippleButton, RippleButtonRipples } from './RippleButton'
import { Cursor, CursorFollow, CursorProvider } from './Cursor'
import { apiLogin } from '@/api/auth'

interface FormValues {
	usernameOrEmail: string
	password: string
}

export default function LoginForm() {
	return (
		<>
			<div className={styles.loginFormTitle}>Войти в аккаунт</div>
			<Formik<FormValues>
				initialValues={{ usernameOrEmail: '', password: '' }}
				validate={values => {
					const errors: Partial<FormValues> = {}
					if (!values.usernameOrEmail) {
						errors.usernameOrEmail = 'Поле не заполнено'
					} else {
						const isEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
							values.usernameOrEmail
						)
						const isUsername = /^[a-zA-Z0-9._-]{6,}$/i.test(
							values.usernameOrEmail
						)
						if (!isEmail && !isUsername) {
							errors.usernameOrEmail =
								'Введите корректный email или имя пользователя'
						}
					}
					if (!values.password) {
						errors.password = 'Поле не заполнено'
					}
					return errors
				}}
				onSubmit={async (values, { setSubmitting }) => {
					try {
						const user = await apiLogin({
							usernameOrEmail: values.usernameOrEmail,
							password: values.password,
						})
						console.log('Успешный вход:', user)
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
					<form
						onSubmit={handleSubmit}
						className='loginFormForm'
						autoComplete='off'
						spellCheck='false'
						autoCorrect='off'
						autoCapitalize='off'
					>
						<div>
							<input
								type='usernameOrEmail'
								name='usernameOrEmail'
								onChange={handleChange}
								onBlur={handleBlur}
								value={values.usernameOrEmail}
								className={`${styles.loginFormInput} ${styles.loginFormusernameOrEmail}`}
								placeholder='Имя пользователя или e-mail'
							/>
						</div>
						{errors.usernameOrEmail && touched.usernameOrEmail && (
							<div className={styles.loginFormError}>
								{errors.usernameOrEmail}
							</div>
						)}
						<br />
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
						</div>
						{errors.password && touched.password && (
							<div className={styles.loginFormError}>{errors.password}</div>
						)}
						<br />
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
