import Link from 'next/link'
import styles from './page.module.css'

export default function Home() {
	return (
		<div className={styles.page}>
			<main className={styles.main}>
				<h1>Welcome to Liitto</h1>
				<p>Your wedding invitation platform</p>
				<div className={styles.ctas}>
					<Link href="/admin" className={styles.primary}>
						Admin Panel
					</Link>
					<Link href="/login" className={styles.secondary}>
						Guest Login
					</Link>
				</div>
			</main>
		</div>
	)
}
