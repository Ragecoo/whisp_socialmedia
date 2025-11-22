import * as React from 'react'

import {
	Dialog as DialogPrimitive,
	DialogTrigger as DialogTriggerPrimitive,
	DialogOverlay as DialogOverlayPrimitive,
	DialogClose as DialogClosePrimitive,
	DialogPortal as DialogPortalPrimitive,
	DialogContent as DialogContentPrimitive,
	DialogHeader as DialogHeaderPrimitive,
	DialogFooter as DialogFooterPrimitive,
	DialogTitle as DialogTitlePrimitive,
	DialogDescription as DialogDescriptionPrimitive,
	type DialogProps as DialogPrimitiveProps,
	type DialogTriggerProps as DialogTriggerPrimitiveProps,
	type DialogOverlayProps as DialogOverlayPrimitiveProps,
	type DialogCloseProps as DialogClosePrimitiveProps,
	type DialogContentProps as DialogContentPrimitiveProps,
	type DialogHeaderProps as DialogHeaderPrimitiveProps,
	type DialogFooterProps as DialogFooterPrimitiveProps,
	type DialogTitleProps as DialogTitlePrimitiveProps,
	type DialogDescriptionProps as DialogDescriptionPrimitiveProps,
} from '@/components/animate-ui/primitives/radix/dialog'
import { cn } from '@components/lib/utils'
import { XIcon } from 'lucide-react'

type DialogProps = DialogPrimitiveProps

function Dialog(props: DialogProps) {
	return <DialogPrimitive {...props} />
}

type DialogTriggerProps = DialogTriggerPrimitiveProps

function DialogTrigger(props: DialogTriggerProps) {
	return <DialogTriggerPrimitive {...props} />
}

type DialogOverlayProps = DialogOverlayPrimitiveProps

function DialogOverlay({ className, ...props }: DialogOverlayProps) {
	return (
		<DialogOverlayPrimitive
			className={cn('fixed inset-0 z-50 bg-[var(--color-black-05)]', className)}
			{...props}
		/>
	)
}

type DialogCloseProps = DialogClosePrimitiveProps

function DialogClose(props: DialogCloseProps) {
	return <DialogClosePrimitive {...props} />
}

type DialogContentProps = DialogContentPrimitiveProps & {
	showCloseButton?: boolean
}

function DialogContent({
	className,
	children,
	from = 'top',
	showCloseButton = true,
	...props
}: DialogContentProps) {
	return (
		<DialogPortalPrimitive>
			<DialogOverlay />
			<DialogContentPrimitive
				from={from}
				className={cn(
					'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 sm:rounded-lg',
					'bg-[var(--color-white-10)] border-[var(--color-darkgray-10)]',
					className,
				)}
				{...props}
			>
				{children}
				{showCloseButton && (
					<DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none text-[var(--color-darkgray-10)] hover:bg-[var(--color-light-05)]">
						<XIcon className="h-4 w-4" />
						<span className="sr-only">Close</span>
					</DialogClose>
				)}
			</DialogContentPrimitive>
		</DialogPortalPrimitive>
	)
}

type DialogHeaderProps = DialogHeaderPrimitiveProps

function DialogHeader({ className, ...props }: DialogHeaderProps) {
	return (
		<DialogHeaderPrimitive
			className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
			{...props}
		/>
	)
}

type DialogFooterProps = DialogFooterPrimitiveProps

function DialogFooter({ className, ...props }: DialogFooterProps) {
	return (
		<DialogFooterPrimitive
			className={cn(
				'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
				className,
			)}
			{...props}
		/>
	)
}

type DialogTitleProps = DialogTitlePrimitiveProps

function DialogTitle({ className, ...props }: DialogTitleProps) {
	return (
		<DialogTitlePrimitive
			className={cn('text-lg font-semibold leading-none tracking-tight text-[var(--color-darkgray-10)]', className)}
			{...props}
		/>
	)
}

type DialogDescriptionProps = DialogDescriptionPrimitiveProps

function DialogDescription({ className, ...props }: DialogDescriptionProps) {
	return (
		<DialogDescriptionPrimitive
			className={cn('text-sm text-[var(--color-lightgray-10)]', className)}
			{...props}
		/>
	)
}

export {
	Dialog,
	DialogTrigger,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
	type DialogProps,
	type DialogTriggerProps,
	type DialogCloseProps,
	type DialogContentProps,
	type DialogHeaderProps,
	type DialogFooterProps,
	type DialogTitleProps,
	type DialogDescriptionProps,
}

