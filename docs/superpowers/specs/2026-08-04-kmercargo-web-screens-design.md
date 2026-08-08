# KmerCargo Web App — Screen Build Design

Date: 2026-08-04
Status: Approved

## Purpose

Build the KmerCargo web app screens described by the Stitch design framework in
`public/assets/stitch_kmercargo_design_framework/`, wired to the Django backend
where endpoints exist. Four feature areas: landing page, sign-in, dashboard, and
the remaining admin and fleet-owner screens.

## Backend reality

The backend at `http://localhost:8000/api/v1` is running and seeded. Its live
schema (`/api/schema/`) exposes fewer endpoints than `api_spec.yaml` documents.
Verified by comparing the live schema against the spec and by reading
`config/urls.py` and each app's `urls.py`.

| Module                        | State                        | Screens it backs                           |
| ----------------------------- | ---------------------------- | ------------------------------------------ |
| Auth                          | live                         | admin login, fleet registration, OTP       |
| Onboarding                    | live                         | business info, vehicle setup               |
| Vehicles                      | live                         | landing, vehicle setup                     |
| Bookings                      | live                         | trip data                                  |
| Dispatch                      | partial (accept/reject only) | —                                          |
| Admin API                     | stub, no routes              | all seven admin screens                    |
| Payments                      | stub, no routes              | revenue & settlements, financial dashboard |
| Tracking                      | stub, no routes              | fleet dashboard live positions             |
| Disputes                      | stub, no routes              | document inspector                         |
| Ratings, Zones, Notifications | stub, no routes              | —                                          |

The auth flow was confirmed working end to end: `POST /auth/otp/request` with
`{"phone_number":"+237691234567","purpose":"login"}` returns
`{"status":"success","data":{"dev_otp":"146012"}}`. In development the backend
returns the OTP in the response body, so sign-in is testable without SMS.

## Architecture

### API layer — `lib/api/`

A single typed client. Screens import only these modules and cannot tell a live
endpoint from a fixture.

```
client.ts       fetch wrapper: base URL from NEXT_PUBLIC_API_URL,
                {status, data, message} envelope unwrapping, Bearer token
                injection, typed ApiError on non-2xx or status:"error"
types.ts        TypeScript types transcribed from api_spec.yaml schemas
auth.ts         requestOtp, verifyOtp, refreshToken, getProfile, logout   LIVE
vehicles.ts     getCategories, getFareEstimate                            LIVE
onboarding.ts   getUploadUrl, submitDriver, getDriverStatus               LIVE
bookings.ts     listBookings, getBooking, createBooking, cancelBooking    LIVE
admin.ts        getOverview, getFleetApplications, getFleetApplication,
                getDriverApplication, getDocument, getTeam             FIXTURE
payments.ts     getWallet, getLedger, getSettlements                   FIXTURE
fixtures/       spec-shaped data for the stubbed modules
```

Every function is `async` and returns a typed value or throws `ApiError`.
Fixture-backed functions have identical signatures to their live counterparts.
When `admin_api` and `payments` ship routes, only those two files change; no
screen or test outside `lib/api/` is touched.

**Boundary rule:** components never call `fetch`. Tests mock `lib/api/*` modules,
never the network below them.

### Auth and session

- `POST /auth/otp/request` → `POST /auth/otp/verify` → JWT access (15 min) +
  refresh (30 days).
- Tokens stored in `httpOnly` cookies set by a Next.js route handler, so client
  JavaScript never holds them.
- Because the cookie is `httpOnly`, **all authenticated calls run server-side** —
  from Server Components or server actions. `client.ts` reads the access token
  from `cookies()` and sets the `Authorization` header there. Client Components
  never call `lib/api` directly for protected data; they receive it as props or
  invoke a server action.
- `client.ts` retries once through `/auth/token/refresh` on a 401, then gives up
  and the caller redirects to `/signin`.

The admin login screen (`admin_login_password_code`) is drawn with a password
field, but the backend has no password auth. Its visual treatment is kept
exactly — card, amber gradient button, monospace input — while the field accepts
a phone number and routes into the shared OTP verification screen.

### Routes

| Area        | Route                         | Design source                           |
| ----------- | ----------------------------- | --------------------------------------- |
| Public      | `/`                           | `kmercargo_national_landing_page`       |
| Public      | `/register`                   | `web_portal_partner_registration_hub`   |
| Auth        | `/signin`                     | `admin_login_password_code`             |
| Auth        | `/register/fleet`             | `fleet_owner_registration_entry`        |
| Auth        | `/verify`                     | `fleet_owner_otp_verification`          |
| Onboarding  | `/onboarding/business`        | `fleet_owner_onboarding_business_info`  |
| Onboarding  | `/onboarding/vehicle`         | `fleet_owner_vehicle_setup`             |
| Fleet owner | `/fleet`                      | `fleet_owner_dashboard_overview`        |
| Fleet owner | `/fleet/drivers`              | `fleet_owner_driver_vehicle_management` |
| Fleet owner | `/fleet/revenue`              | `fleet_owner_revenue_settlements`       |
| Admin       | `/admin`                      | existing shell, refit                   |
| Admin       | `/admin/fleet-approvals`      | `admin_fleet_approval_queue`            |
| Admin       | `/admin/fleet-approvals/[id]` | `admin_fleet_application_review`        |
| Admin       | `/admin/drivers/[id]`         | `admin_driver_application_review`       |
| Admin       | `/admin/documents/[id]`       | `admin_document_inspector`              |
| Admin       | `/admin/finance`              | `admin_financial_dashboard`             |
| Admin       | `/admin/team`                 | `admin_team_management`                 |

### Existing code

- `app/admin/` — keep the sidebar and shell structure, restyle to match
  `admin_fleet_approval_queue`, replace mock data with `lib/api/admin.ts`.
- `app/auth/` — replaced by `/signin`; the email/password `verifyCredentials`
  server action and its `AUTH_EMAIL`/`AUTH_PASSWORD` env vars are removed.
- `components/Navbar.tsx` — pill styling retained; items become **Registration,
  Support, Help** plus a "Get Started" amber CTA, matching the design's nav set.
  On mobile the design's fixed bottom nav also renders, as drawn.
- `app/page.tsx` — replaced by the design-faithful landing page.

### Styling

`app/globals.css` already carries the `DESIGN.md` token values. Additions:

- Three fonts via `next/font/google`: Plus Jakarta Sans (headings), Inter (body),
  JetBrains Mono (XAF amounts, plates, OTP codes, tracking IDs).
- Missing aliases: `bg-dark` (`#0F172A`), `primary-container` (`#FF9F1C`),
  `on-primary-container` (`#683C00`), `success-momo` (`#10B981`).

Design rules held everywhere: 12px corner radius, 56px minimum touch target on
primary buttons, icons always paired with a text label, Safety Amber CTAs on
Deep Slate text for outdoor contrast.

**Responsive rule:** each screen renders its design exactly at mobile width. On
desktop the same elements, copy, colours and order scale up — role cards side by
side, value props three across, hero and CTA panels widening. No element is added
or removed between breakpoints. Admin screens are desktop-first, matching how
they are drawn.

## Testing

- Jest + React Testing Library, tests colocated as `*.test.tsx`.
- `collectCoverageFrom` currently measures `app/**` only, at a 99.99% threshold.
  That config is left unchanged. `lib/**` and `components/**` are tested anyway
  as a matter of course, they simply are not in the gate's denominator.
- `lib/api/client.ts` tests cover envelope unwrapping, error mapping, token
  injection, and the single refresh-retry path.
- Screen tests assert rendered content and user-visible behaviour against mocked
  `lib/api` modules — not implementation details.

## Execution

Subagent-driven. Each subagent reads only its own screen's `code.html` and
`screen.png`, keeping the orchestrating session's context small.

Four branches off `development`, per README:

1. `feature/landing-page` — `/`, `/register`, navbar, footer, fonts, tokens
2. `feature/auth-otp` — `lib/api/` client + auth, `/signin`, `/register/fleet`,
   `/verify`, session cookies
3. `feature/fleet-dashboard` — `/onboarding/*`, `/fleet/*`
4. `feature/admin-console` — `/admin/*` refit and new screens

`lib/api/client.ts` and `types.ts` land first on `feature/auth-otp`, since the
other two dashboard branches depend on them.

Per branch: TDD, then `npm run format:fix`, `npm run lint`, `npm run test:coverage`
all green before committing. Conventional Commits. Commits authored by the repo
owner with no Claude co-author trailer. PRs target `development`.

## Risks

- **Coverage gate.** 99.99% on `app/**` applies to every new route file. This is
  the most likely cause of the night running long.
- **Scope.** Sixteen screens across four areas in one session is aggressive. If
  time runs short, the order above degrades gracefully: landing and auth are the
  screens with real backend support, so they carry the most value.
- **Fixture drift.** Fixtures follow `api_spec.yaml`, which the live backend
  already diverges from. They are a scaffold for stubbed modules, not a contract.
