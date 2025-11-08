'use client'

import { MouseEventHandler, ReactNode } from 'react'
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
} from './AlertDialog'
import { Button } from './animate-ui/components/buttons/button'

interface ButtonAlertDialogProps {
	children?: ReactNode
	title: string
	description?: string
	notext: string
	yestext: string
	onno?: MouseEventHandler<HTMLButtonElement>
	onyes?: MouseEventHandler<HTMLButtonElement>
}

function ButtonAlertDialog({
	children,
	title,
	description,
	notext,
	yestext,
	onno,
	onyes,
}: ButtonAlertDialogProps) {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant='ghost'>{children}</Button>
			</AlertDialogTrigger>
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
					<AlertDialogTitle>{title}</AlertDialogTitle>
					{description ? (
						<AlertDialogDescription>{description}</AlertDialogDescription>
					) : null}
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={onno}>{notext}</AlertDialogCancel>
					<AlertDialogAction onClick={onyes}>{yestext}</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}

export default ButtonAlertDialog
