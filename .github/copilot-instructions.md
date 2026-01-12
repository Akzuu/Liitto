# Liitto - Copilot Instructions

## Project Overview
Liitto is a wedding invitation platform built as a **pnpm + Turborepo monorepo** with Next.js apps. The platform uses:
- **Payload CMS v3** for content management, authentication, and admin interface
- **Next.js 16** (App Router) with React 19
- **HeroUI** for UI components
- **PostgreSQL** with Payload's postgres adapter for data storage
- **Biome** for linting/formatting (not ESLint/Prettier)

## Architecture

### Monorepo Structure
- **apps/web** - Main wedding platform (Next.js, port 3000) with Payload CMS integrated
- **packages/typescript-config** - Shared TypeScript configs
- **packages/biome-config** - Shared Biome linting/formatting configs

### Wedding Platform Stack
- **CMS**: Payload CMS v3 (`@payloadcms/next`, `@payloadcms/db-postgres`, `@payloadcms/richtext-lexical`)
- **Database**: PostgreSQL (connection via `DATABASE_URL` in .env.local)
- **Authentication**: Payload Auth (unified for admins and guests)
- **UI Library**: HeroUI (`@heroui/react`) with Framer Motion
  - **IMPORTANT**: Always consult the HeroUI MCP server (configured in `.vscode/mcp.json`) before using HeroUI components to verify correct API, props, and available exports
- **Images**: Sharp for optimization, local uploads to `public/uploads/`
- **Maps**: React-Leaflet with OpenStreetMap
- **QR Codes**: qrcode library for invitation generation

### Payload Collections (Database Schema)
Located in `apps/web/collections/`:
1. **Weddings** - Wedding instances (multi-tenant support for future SaaS)
2. **Users** - Unified authentication for all user types:
   - **Super Admin**: Platform-level access to all weddings (no wedding relationship required)
   - **Wedding Admin**: Access to specific wedding, manages content and guest list
   - **Guest**: Linked to single wedding, authenticates with name + auto-generated 4-digit PIN
3. **WeddingInfo** - Ceremony details, venue, story content
4. **RSVPResponses** - RSVP form submissions

#### User/Guest Workflow:
- Wedding admin imports guests with: name, allowedPlusOnes
- 4-digit PIN auto-generated on user creation (shown to admin for printing)
- Email is optional initially, required only when guest submits RSVP
- Guests authenticate with name + PIN
- Guest-specific fields (conditional on role='guest'): allowedPlusOnes, isPrimaryContact, invitationSentDate, qrCode, notes

All collections include `wedding` relationship field for multi-tenant isolation (except super admin users).

## Development Workflows

### Running Commands
Use Turborepo for all build/dev/lint operations:
```bash
pnpm dev           # Start all apps in dev mode (uses turbo run dev)
pnpm build         # Build all apps and packages
pnpm lint          # Run Biome checks across workspace
pnpm check-types   # TypeScript type checking
```

Individual app commands:
```bash
cd apps/web
pnpm dev          # Starts Next.js on port 3000
pnpm check-types  # Runs `next typegen && tsc --noEmit`
pnpm build        # Build for production
```

## Code Conventions

### Formatting & Linting
- **Use Biome, not ESLint/Prettier** - All lint commands run `biome check --write`
- Formatting: **tabs** (indent width 2), line width 120
- Root biome.json provides base config; apps/packages extend from `@repo/biome-config/base` and `@repo/biome-config/next-js`

### TypeScript Configuration
- Apps extend `@repo/typescript-config/nextjs.json`
- All Next.js apps use `next typegen` for type generation before type checking

### Component Patterns
- Use `"use client"` directive for interactive components
- Export named components with explicit TypeScript interfaces
- Components accept `className` prop for styling flexibility
- Use HeroUI components for UI elements

### Payload CMS Patterns
- Collections in `apps/web/collections/` directory
- All collections import types from `payload`
- Access control functions check `req.user?.role`
- Tenant isolation via relationship fields
- Auth configuration in Users collection

### Next.js App Structure
- Uses App Router with app directory
- Local fonts loaded via `next/font/local` (Geist Sans & Mono)
- Metadata exported from layout.tsx
- Global styles in app/globals.css

## Key Files & Patterns

### Configuration Hierarchy
1. Root configs: [biome.json](biome.json), [turbo.json](turbo.json), [pnpm-workspace.yaml](pnpm-workspace.yaml)
2. Shared configs: `packages/{biome-config,typescript-config}/`
3. App configs extend shared configs via `extends` field

### Turbo Pipeline
[turbo.json](turbo.json) defines task dependencies:
- `build` depends on `^build` (dependencies built first)
- `build` outputs to `.next/**` (excludes cache)
- `dev` runs with `cache: false` and `persistent: true` (long-running)
- All tasks inherit dependency order from `dependsOn: ["^{task}"]`

## Important Notes
- Package manager: **pnpm 9.0.0** (enforced via packageManager field)
- Node version: **>=18** required
- React version: **19.2.0** (latest)
- TypeScript: **5.9.2** (shared across all packages)
- When adding dependencies to apps, use `workspace:*` for internal packages
