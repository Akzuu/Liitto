import type { CollectionConfig } from 'payload'

export const Tenants: CollectionConfig = {
	slug: 'tenants',
	admin: {
		useAsTitle: 'coupleName',
		defaultColumns: ['coupleName', 'weddingDate', 'isActive'],
	},
	access: {
		read: () => true,
		create: ({ req }) => req.user?.role === 'admin',
		update: ({ req }) => req.user?.role === 'admin',
		delete: ({ req }) => req.user?.role === 'admin',
	},
	fields: [
		{
			name: 'coupleName',
			type: 'text',
			required: true,
			label: 'Couple Name',
			admin: {
				description: 'e.g., "Emma & John"',
			},
		},
		{
			name: 'subdomain',
			type: 'text',
			unique: true,
			label: 'Subdomain',
			admin: {
				description: 'For SaaS: emma-john (leave empty for single wedding)',
			},
		},
		{
			name: 'customDomain',
			type: 'text',
			label: 'Custom Domain',
			admin: {
				description: 'Optional custom domain for this wedding',
			},
		},
		{
			name: 'weddingDate',
			type: 'date',
			required: true,
			label: 'Wedding Date',
			admin: {
				date: {
					pickerAppearance: 'dayOnly',
				},
			},
		},
		{
			name: 'isActive',
			type: 'checkbox',
			defaultValue: true,
			label: 'Active',
			admin: {
				description: 'Deactivate to disable this wedding site',
			},
		},
	],
}
