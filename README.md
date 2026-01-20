# Liitto

Wedding invitation platform built with Next.js and PostgreSQL.

Around 90 % of the code has been vibe coded. While this project serves an actual purpose, it is also a testing ground for
AI assisted development.

## Authentication

**Technology:** Better Auth with passkeys

**Route Protection:** Three-layer system

1. **Proxy middleware** - Blocks admin-only routes for non-admin users
2. **Protected layout** - Verifies session exists for all authenticated routes
3. **Data Access Layer (DAL)** - Centralized session verification for components

**Route types:**

- Admin-only: Dashboard, users, guests, settings (requires admin role)
- Authenticated: Pending approval page, setup passkey (requires login only)
- Public: Login, register, wedding info

The proxy handles role-based redirects, while the layout ensures authentication. Routes under `(protected)` group automatically get session context via `AuthProvider`.
