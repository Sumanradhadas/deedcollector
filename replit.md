# Deed Collection Dashboard

## Overview

This is a **Deed Collection Dashboard** application designed to aggregate and manage daily deed submissions from multiple machines/workstations. The system allows operators at different PCs to upload deed data throughout the day, which is then aggregated into a central dashboard for monitoring, export, and optional clearing.

**Core Purpose:**
- Receive deed data uploads from multiple machines via userscripts
- Aggregate daily submissions into a unified dashboard view
- Enable batch export of collected data (JSON format)
- Support data clearing after export for fresh daily cycles

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theme configuration
- **Build Tool**: Vite with hot module replacement
- **Animations**: Framer Motion for page transitions

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Style**: RESTful JSON endpoints
- **Dual Deployment Support**:
  - **Replit/Local**: Express server with Vite dev middleware
  - **Vercel**: Serverless functions in `/api` directory

### Data Storage
- **Primary Storage**: Vercel KV (Redis-compatible key-value store)
- **Key Pattern**: `deeds:${date}:${machineId}` for daily machine-specific records
- **Backup Schema**: PostgreSQL with Drizzle ORM (configured but KV is primary)
- **Schema Validation**: Zod for runtime type checking

### API Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/upload` | POST | Receive deed data from machines |
| `/api/fetch` | GET | Retrieve dashboard stats by date |
| `/api/export` | GET | Download all data for a date as JSON |
| `/api/clear` | DELETE | Remove all data for a specific date |

### Data Flow
1. Userscripts on operator machines POST to `/api/upload`
2. Data stored in Vercel KV with date-prefixed keys
3. Dashboard polls `/api/fetch` every 30 seconds
4. End-of-day export via `/api/export`
5. Optional cleanup via `/api/clear`

### Build System
- **Development**: `tsx` for TypeScript execution, Vite for frontend HMR
- **Production**: esbuild bundles server, Vite builds frontend
- **Output**: `dist/` directory with `index.cjs` (server) and `public/` (static assets)

## External Dependencies

### Cloud Services
- **Vercel KV**: Primary data storage (Redis-compatible, requires `KV_REST_API_URL` and `KV_REST_API_TOKEN`)
- **PostgreSQL**: Database configured via `DATABASE_URL` (Drizzle ORM ready)

### Key NPM Packages
- `@vercel/kv`: Vercel KV client
- `drizzle-orm` + `drizzle-kit`: Database ORM and migrations
- `@tanstack/react-query`: Data fetching and caching
- `zod`: Schema validation
- `date-fns`: Date manipulation
- `framer-motion`: Animations

### Environment Variables Required
```
DATABASE_URL        # PostgreSQL connection string
KV_REST_API_URL     # Vercel KV endpoint
KV_REST_API_TOKEN   # Vercel KV authentication
```