import { Slide } from '@/components/Slide'
import {
	Tabs,
	TabsContent,
	TabsContents,
	TabsList,
	TabsTrigger,
} from '@/components/Tabs'
import styles from '@styles/User.module.css'
import Cookies from 'js-cookie'
import LoginForm from '@/components/LoginForm'
import RegisterForm from './../../components/RegisterForm'

function User() {
	const accessToken = Cookies.get('access')

	if (accessToken) {
		return (
			<div className={(styles.page, styles.userPage)}>
				<Slide offset={80} className={styles.userSectionProfile}>
					уку
				</Slide>
			</div>
		)
	} else {
		return (
			<div className={(styles.page, styles.userPage)}>
				<Slide offset={80} className={styles.userSectionForm}>
					<Tabs className={styles.formTabsContainer} defaultValue='account'>
						<TabsList className={styles.formTabsList}>
							<TabsTrigger value='login'>Войти</TabsTrigger>
							<TabsTrigger value='register'>Создать аккаунт</TabsTrigger>
						</TabsList>
						<TabsContents>
							<TabsContent value='login' className={styles.formTabsBody}>
								<LoginForm></LoginForm>
							</TabsContent>
							<TabsContent value='register' className={styles.formTabsBody}>
								<RegisterForm></RegisterForm>
							</TabsContent>
						</TabsContents>
					</Tabs>
				</Slide>
			</div>
		)
	}
}

export default User
