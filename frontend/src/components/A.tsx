import Link from 'next/link'
import { ReactNode } from 'react'

interface AProps {
	href: string
	children: ReactNode
}

function A({ children, href }: AProps) {
	return <Link href={href}>children</Link>
}

export default A
