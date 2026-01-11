import { withPayload } from '@payloadcms/next/withPayload'
import { fileURLToPath } from 'url'
import path from 'path'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**.vercel-storage.com',
			},
		],
	},
	webpack: (config) => {
		config.resolve.alias['@payload-config'] = path.resolve(dirname, './payload.config.ts')
		return config
	},
}

export default withPayload(nextConfig)
