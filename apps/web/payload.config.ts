import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

// Collections
import { Tenants } from './collections/Tenants'
import { Users } from './collections/Users'
import { WeddingInfo } from './collections/WeddingInfo'
import { Media } from './collections/Media'
import { Gallery } from './collections/Gallery'
import { Guests } from './collections/Guests'
import { RSVPResponses } from './collections/RSVPResponses'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
	admin: {
		user: 'users',
		meta: {
			titleSuffix: '- Liitto Wedding Platform',
		},
	},
	collections: [Tenants, Users, WeddingInfo, Media, Gallery, Guests, RSVPResponses],
	editor: lexicalEditor(),
	secret: process.env.PAYLOAD_SECRET || '',
	typescript: {
		outputFile: path.resolve(dirname, 'payload-types.ts'),
	},
	db: postgresAdapter({
		pool: {
			connectionString: process.env.DATABASE_URL || '',
		},
	}),
	sharp,
	plugins: [],
})
