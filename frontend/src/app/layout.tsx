import type { Metadata } from 'next'
import './global.css'
import './variables.css'
import Navbar from '@components/Navbar'
import NoConnection from '@/components/NoConnection'
import checkServerConnection from '@/api/auth'

export const metadata: Metadata = {
	title: 'whisp',
	description: 'social media',
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const isOnline = await checkServerConnection()
	console.log(isOnline)
	return (
		<html lang='en'>
			<body>
				{isOnline ? (
					<div className='sitecontainer'>
						<Navbar />
						{children}
					</div>
				) : (
					<NoConnection />
				)}
			</body>
		</html>
	)
}
