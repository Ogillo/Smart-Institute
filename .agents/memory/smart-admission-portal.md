---
name: Smart Admission Portal
description: Architecture decisions and conventions for the Smart Multi-Institution Admission and Student Onboarding Management System.
---

## Stack
- Frontend: `artifacts/admission-portal` — React + Vite + Tailwind v4 + Clerk auth + Wouter routing + Recharts
- Backend: `artifacts/api-server` — Express 5 + Clerk middleware + Drizzle ORM + pino logging
- Database: PostgreSQL via `lib/db` (Drizzle ORM, schema in `lib/db/src/schema/`)
- API client: `lib/api-client-react` (React Query hooks, generated from `lib/api-spec/openapi.yaml`)
- Zod schemas: `lib/api-zod` (server-side validation)

## Auth
- Clerk with `publishableKeyFromHost` + `proxyUrl = import.meta.env.VITE_CLERK_PROXY_URL`
- Secrets: `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`
- DB user sync: POST `/api/users/sync` called on every sign-in via `useSyncUser`
- Cookie-based auth — no Authorization headers or `getToken()`

## User Roles
`super_admin | institution_admin | admission_officer | finance_officer | storekeeper | parent`

## DB Schema files (lib/db/src/schema/)
`users, institutions, applications, students, guardians, medicalRecords, documents, inventory, requirementOrders, payments, receipts, classes, streams, dormitories, studentAllocations, notifications, auditLogs, admissionCodes`

**Why:** Schema is split into separate files per domain to keep it maintainable.

## Routing Convention
- `/` — public landing (Clerk unprotected)
- `/portal/*` — parent/student routes
- `/admin/*` — institution staff routes
- `/super-admin/*` — super admin routes
- After sign-in → `/dashboard-router` → redirects by role

## API Route Patterns (artifacts/api-server/src/routes/)
All routes mounted at `/api` prefix in `app.ts`.
Auth: `requireAuth` middleware reads Clerk session → fetches DB user via clerkId.

## Demo Data
5 institutions seeded (3 approved), admission codes like `GVS2027A001`, fee structures, inventory items, classes/streams, dormitories all seeded.

## Known Quirks
- `useToast` must be imported from `@/hooks/use-toast` not `@/components/ui/use-toast`
- `Link` from wouter must be explicitly imported in each page file
- `institutionId` on the DB user object (`me?.institutionId`) is how admin pages scope their data queries
