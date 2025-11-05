import { Slide } from '@/components/Slide'
import styles from '@styles/Home.module.css'

import { Search as SearchIcon } from 'lucide-react'

export default async function Home() {
	const response = await fetch('https://jsonplaceholder.typicode.com/posts')
	const posts: { userId: number; id: number; title: string; body: string }[] =
		await response.json()

	return (
		<div className={(styles.page, styles.homePage)}>
			<Slide offset={25} className={styles.feedSection}>
				<ul>
					{posts.map(post => (
						<li key={post.id}>
							<h1 style={{ fontSize: '20px' }}>
								{post.id} : {post.title} {/* //todo todo */}
							</h1>
							<span>{post.body}</span>
							<hr></hr>
						</li>
					))}
				</ul>
			</Slide>
			<Slide offset={80} className={styles.searchSection}>
				<div className={styles.searchBar}>
					<input className={styles.searchBarInput} type='text' />
					<button className={styles.searchBarSubmit}>
						<SearchIcon />
					</button>
				</div>
				<div className={styles.searchResults}>results</div>
			</Slide>
		</div>
	)
}
