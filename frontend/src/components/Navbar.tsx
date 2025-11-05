'use client'

import styles from '@styles/Navbar.module.css'

import Link from 'next/link'

import {
	House as HouseIcon,
	Star as StarIcon,
	Plus as PlusIcon,
	User as UserIcon,
	LogOut as LogOutIcon,
} from 'lucide-react'

import {
	TooltipProvider,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from './Tooltip'
import ButtonAlertDialog from './ButtonAlertDialog'
import { usePathname } from 'next/navigation'
import { Highlight, HighlightItem } from './Highlight'

function Navbar() {
	const path = usePathname()
	console.log(path)
	return (
		<div className={styles.navbar}>
			<div className={styles.navbarLogo}>
				<img src='https://placehold.co/96x96' />
			</div>
			<div className={styles.navbarNavigation}>
				<TooltipProvider
					transition={{
						type: 'spring',
						stiffness: 1500,
						damping: 135,
					}}
					openDelay={200}
					closeDelay={200}
				>
					<Tooltip side='right'>
						<TooltipTrigger>
							<div
								className={`${styles.navbarNavigationItem} ${
									path === '/' ? styles.active : ''
								}`}
							>
								<Link href='/'>
									<div>
										<HouseIcon />
									</div>
								</Link>
							</div>
						</TooltipTrigger>
						<TooltipContent>
							<p className={styles.navbarNavigationTooltip}>Лента</p>
						</TooltipContent>
					</Tooltip>
					<Tooltip side='right'>
						<TooltipTrigger>
							<div
								className={`${styles.navbarNavigationItem} ${
									path === '/favorites' ? styles.active : ''
								}`}
							>
								<Link href={'/favorites'}>
									<div>
										<StarIcon />
									</div>
								</Link>
							</div>
						</TooltipTrigger>
						<TooltipContent>
							<p className={styles.navbarNavigationTooltip}>Избранное</p>
						</TooltipContent>
					</Tooltip>
					<Tooltip side='right'>
						<TooltipTrigger>
							<div
								className={`${styles.navbarNavigationItem} ${
									path === '/newpost' ? styles.active : ''
								}`}
							>
								<Link href='/newpost'>
									<div>
										<PlusIcon />
									</div>
								</Link>
							</div>
						</TooltipTrigger>
						<TooltipContent>
							<p className={styles.navbarNavigationTooltip}>Создать пост</p>
						</TooltipContent>
					</Tooltip>
					<Tooltip side='right'>
						<TooltipTrigger>
							<div
								className={`${styles.navbarNavigationItem} ${
									path === '/user' ? styles.active : ''
								}`}
							>
								<Link href='/user'>
									<div>
										<UserIcon />
									</div>
								</Link>
							</div>
						</TooltipTrigger>
						<TooltipContent>
							<p className={styles.navbarNavigationTooltip}>Личная страница</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>
			<div className={styles.navbarLogout}>
				<ButtonAlertDialog
					title={'Выйти из аккаунта?'}
					description={'Вы сможете войти снова в любое время.'}
					notext={'Отмена'}
					yestext={'Выйти'}
				>
					<LogOutIcon />
				</ButtonAlertDialog>
			</div>
		</div>
	)
}

export default Navbar
