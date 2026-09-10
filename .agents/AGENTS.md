# KTLTC Project Guidelines

This file contains the core guidelines and context for the KTLTC project. Please read and adhere to these rules for all future interactions to ensure consistency.

## Project Stack
- **Framework:** Next.js (App Router) v16.1.4, React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Libraries:** HeroUI (@heroui/react), Ant Design
- **Database:** MongoDB (using Mongoose for ORM)
- **Authentication:** NextAuth.js v5 (beta)
- **Deployment:** PM2 Cluster Mode

## Coding Standards
1. **App Router:** Use the Next.js App Router architecture (`src/app/` directory). Prefer Server Components by default; use `"use client"` only when client-side interactivity is required.
2. **TypeScript:** Strictly type all components, props, and API responses.
3. **Styling:** Use Tailwind CSS utility classes. Avoid creating custom CSS files unless absolutely necessary.
4. **Database:** Use Mongoose models located in `src/models/` for database interactions. Connect via the shared lib (e.g., `src/lib/db.ts` or similar).
5. **Components:** Keep components small, reusable, and placed in `src/components/`.

## Deployment & Server Rules (CRITICAL)
1. **Next.js Standalone Mode + PM2 Cluster:** The app MUST be run using Next.js `standalone` mode combined with PM2 in cluster mode to avoid port conflicts (`EADDRINUSE`) when running 4 instances.
   - **Configuration:** `next.config.mjs` must have `output: "standalone"`.
   - **PM2 Config:** Always use `ecosystem.config.js` to start the app.
2. **Zero-Downtime Updates:** When applying code changes to production, ALWAYS use the following zero-downtime deployment process to prevent the website from crashing for active users:
   ```bash
   cd ~/ktltc
   npm run build
   # (public and .next/static folders are already symlinked to .next/standalone)
   pm2 reload ktltc
   pm2 save
   ```
3. **Memory Management:** The server has 32GB of RAM. The `ktltc` PM2 cluster must be kept at a maximum of **4 instances**. Do not scale up beyond 4 instances, as this will cause Out-Of-Memory (OOM) errors and crash `cloudflared` (Error 1033).
   - *Command to verify:* `pm2 scale ktltc 4`

## General AI Instructions
- Before modifying or adding new features, explore the `src/` directory to follow existing patterns.
- Keep responses concise and focused on the technical implementation.
- If proposing architectural changes, ask for user approval first.
- **Language:** ALWAYS communicate with the user in Thai (ภาษาไทย).

## M1 Cognitive Agent: Architecture & Operating Rules
M1 is the local server-side AI cognitive agent for KTLTC (Super Admin Dashboard). When interacting with or maintaining M1, adhere to the 4-Step Cognitive Framework:

1. **4-Step Cognitive Architecture:**
   - **Step 1: Intent & Context Ingestion:** Parse user commands, correlate with live device telemetry, and inspect real server file code. Do NOT hallucinate or insert unrelated critical alerts into conversation.
   - **Step 2: Execution Planning & Safety:** Always check Next.js Route Groups (`src/app/(website)/`, `src/app/dashboard/`) before modifying/creating routes to prevent duplicate route conflicts (`You cannot have two parallel pages that resolve to the same path`). Never delete existing functional code with empty mocks.
   - **Step 3: Deterministic Execution:** Use `[CODE_PROPOSAL]` JSON blocks with valid syntax. Use `action: "patch"` for targeted modifications on large files and `action: "modify"`/`"create"` for whole files. Leverage the Live Background Task Runner for `npm run build && pm2 reload`.
   - **Step 4: Verification & Feedback:** Verify builds succeed with exit code 0, confirm live route status via endpoints, and output concise status reports in Thai.

2. **Route Groups Awareness (CRITICAL):**
   - Website public pages are grouped under `src/app/(website)/` (e.g. `/test` resides in `src/app/(website)/test/page.tsx`).
   - Admin and dashboard routes reside in `src/app/dashboard/`.
   - Never create parallel pages that conflict between route groups.

