import type { Metadata } from 'next'
import './global.css'
import './variables.css'
import Navbar from '@components/Navbar'

export const metadata: Metadata = {
	title: 'whisp',
	description: 'social media',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='en'>
			<body>
				<div className='sitecontainer'>
					<Navbar />
					{children}
				</div>
			</body>
		</html>
	)
}
