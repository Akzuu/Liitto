import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
	slug: 'users',
	auth: {
		tokenExpiration: 7200, // 2 hours
		cookies: {
			secure: true,
			sameSite: 'Lax',
		},
	},
	admin: {
		useAsTitle: 'fullName',
		defaultColumns: ['fullName', 'email', 'role', 'tenant'],
	},
	access: {
		read: ({ req }) => {
			if (req.user?.role === 'admin') return true
			return {
				id: {
					equals: req.user?.id,
				},
			}
		},
		create: ({ req }) => req.user?.role === 'admin',
		update: ({ req }) => {
			if (req.user?.role === 'admin') return true
			return {
				id: {
					equals: req.user?.id,
				},
			}
		},
		delete: ({ req }) => req.user?.role === 'admin',
	},
	fields: [
		{
			name: 'tenant',
			type: 'relationship',
			relationTo: 'tenants',
			required: false, // Allow first user without tenant
			hasMany: false,
			admin: {
				description: 'The wedding this user belongs to (optional for first admin)',
			},
		},
		{
			name: 'role',
			type: 'select',
			options: [
				{
					label: 'Admin',
					value: 'admin',
				},
				{
					label: 'Guest',
					value: 'guest',
				},
			],
			required: true,
			defaultValue: 'guest',
			admin: {
				description: 'Admin: Full access | Guest: Can only RSVP',
			},
		},
		{
			name: 'fullName',
			type: 'text',
			required: true,
			label: 'Full Name',
			admin: {
				description: 'Used as username for guest login',
			},
		},
		{
			name: 'email',
			type: 'email',
			label: 'Email',
			admin: {
				description: 'Optional for guests, required for admins',
			},
		},
		{
			name: 'pin',
			type: 'text',
			label: '4-Digit PIN',
			admin: {
				description: 'For guest authentication (will be hashed)',
				condition: (data) => data.role === 'guest',
			},
			minLength: 4,
			maxLength: 4,
		},
		{
			name: 'familyGroup',
			type: 'text',
			label: 'Family Group',
			admin: {
				description: 'Group name for family members sharing login',
				condition: (data) => data.role === 'guest',
			},
		},
		{
			name: 'allowedGuestCount',
			type: 'number',
			label: 'Allowed Guest Count',
			admin: {
				description: 'Total number of people allowed (including primary guest)',
				condition: (data) => data.role === 'guest',
			},
			min: 1,
			defaultValue: 1,
		},
	],
}
