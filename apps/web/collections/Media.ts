import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
	slug: 'media',
	upload: {
		staticDir: '../../../public/uploads',
		imageSizes: [
			{
				name: 'thumbnail',
				width: 400,
				height: 300,
				position: 'centre',
			},
			{
				name: 'card',
				width: 800,
				height: 600,
				position: 'centre',
			},
			{
				name: 'hero',
				width: 1920,
				height: 1080,
				position: 'centre',
			},
		],
		mimeTypes: ['image/*'],
		adminThumbnail: 'thumbnail',
	},
	admin: {
		useAsTitle: 'alt',
	},
	access: {
		read: () => true, // Public
		create: ({ req }) => req.user?.role === 'admin',
		update: ({ req }) => req.user?.role === 'admin',
		delete: ({ req }) => req.user?.role === 'admin',
	},
	fields: [
		{
			name: 'tenant',
			type: 'relationship',
			relationTo: 'tenants',
			required: true,
			hasMany: false,
			admin: {
				description: 'The wedding this media belongs to',
			},
		},
		{
			name: 'alt',
			type: 'text',
			required: true,
			label: 'Alt Text',
			admin: {
				description: 'Description of the image for accessibility',
			},
		},
	],
}
