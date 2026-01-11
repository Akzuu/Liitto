import type { CollectionConfig } from 'payload'

export const Gallery: CollectionConfig = {
	slug: 'gallery',
	admin: {
		useAsTitle: 'title',
		defaultColumns: ['title', 'isPublished', 'tenant'],
	},
	access: {
		read: ({ req }) => {
			// Public can only read published galleries
			if (!req.user) {
				return {
					isPublished: {
						equals: true,
					},
				}
			}
			// Admins can read all
			if (req.user.role === 'admin') return true
			// Guests can read published
			return {
				isPublished: {
					equals: true,
				},
			}
		},
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
				description: 'The wedding this gallery belongs to',
			},
		},
		{
			name: 'title',
			type: 'text',
			required: true,
			label: 'Gallery Title',
			admin: {
				description: 'e.g., "Engagement Photos", "Pre-Wedding"',
			},
		},
		{
			name: 'description',
			type: 'textarea',
			label: 'Description',
			admin: {
				description: 'Optional description of this gallery',
			},
		},
		{
			name: 'images',
			type: 'array',
			label: 'Images',
			minRows: 1,
			fields: [
				{
					name: 'image',
					type: 'upload',
					relationTo: 'media',
					required: true,
					label: 'Image',
				},
				{
					name: 'caption',
					type: 'text',
					label: 'Caption',
					admin: {
						description: 'Optional caption for this image',
					},
				},
			],
		},
		{
			name: 'isPublished',
			type: 'checkbox',
			defaultValue: true,
			label: 'Published',
			admin: {
				description: 'Uncheck to hide this gallery from guests',
			},
		},
	],
}
