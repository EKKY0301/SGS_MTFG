# Services

Separation used in this project:

1. Server-side proxy calls (auth only)
- `services/server/apiRequest.ts`
- `services/auth/service.ts`
- Used by `services/session/context/context.tsx`
- Calls go through Next route handler `/api/backend/...`

2. Client-side simple fetch calls (domain CRUD)
- `services/client/apiRequest.ts`
- `services/events/service.ts`
- `services/members/service.ts`
- `services/groups/service.ts`
- Calls go directly to `NEXT_PUBLIC_BACKEND_URL`

3. Compatibility alias
- `services/examples/apiRequest.ts`
- Re-exports server request object to avoid breaking old imports.

Notes:
- UI hiding for admin-only sections uses `isAdmin` from `useSessionContext()`.
- Keep sensitive auth/session flow in server-proxy layer.
