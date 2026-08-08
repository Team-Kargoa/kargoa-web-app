# KmerCargo Web Screens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the KmerCargo web app's landing, sign-in, fleet-owner dashboard and admin console screens from the Stitch design framework, wired to the live Django backend where endpoints exist.

**Architecture:** A single typed API layer in `lib/api/` is the only thing that talks to the backend. Modules with live routes (auth, vehicles, onboarding, bookings) call the real server; modules whose backend apps are still stubs (admin, payments) resolve from fixtures shaped to `api_spec.yaml`. Every module exports the same async signature, so shipping a backend route later changes one file and no screens. Authenticated calls run server-side because the JWT lives in an `httpOnly` cookie.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Radix UI, lucide-react, recharts, Jest + React Testing Library.

## Global Constraints

- Design source of truth: `public/assets/stitch_kmercargo_design_framework/<screen>/code.html` and `screen.png`. Read **only** your own task's screen.
- Design tokens are already in `app/globals.css`. Use token classes, never raw hex.
- Corner radius 12px (`rounded-xl`) on buttons and cards. Primary buttons minimum height 56px (`h-14`).
- Every icon is paired with a visible text label.
- JetBrains Mono (`font-mono`) for XAF amounts, licence plates, OTP codes, tracking IDs and organisation IDs. Plus Jakarta Sans (`font-heading`) for headings. Inter (`font-sans`) for body.
- Mobile renders each design exactly as drawn. Desktop scales the same elements up — nothing added, nothing removed.
- Currency renders as `1,240,000 XAF` — thousands separators, code after the number.
- Phone numbers are E.164 Cameroon only: `^\+237[62][0-9]{8}$`.
- Tests colocated as `*.test.tsx` / `*.test.ts` beside the file under test.
- `collectCoverageFrom` measures `app/**` only, threshold 99.99%. Do not edit `jest.config.mjs`. `lib/**` and `components/**` are still tested.
- Before every commit: `npm run format:fix && npm run lint && npm run test:coverage` — all three green.
- Conventional Commits. **No `Co-Authored-By: Claude` trailer on any commit.**
- Components never call `fetch`. Tests mock `lib/api/*` modules.

## Verified backend facts

Base URL `http://localhost:8000/api/v1`. Envelope on every response:
`{"status": "success" | "error", "data": {...}, "message": "..."}`.

Confirmed live by direct request:

```
POST /auth/otp/request  {"phone_number":"+237691234567","purpose":"login"}
  -> {"status":"success","data":{"dev_otp":"146012"},"message":"OTP sent ..."}

POST /auth/otp/verify   {"phone_number":"...","code":"574704","purpose":"registration","role":"fleet_owner"}
  -> {"status":"success","data":{
       "access_token":"eyJ...","refresh_token":"6_favd...",
       "user":{"id":"fdd0e774-...","phone_number":"+237691234599",
               "role":"fleet_owner","full_name":"","profile_photo":null,
               "is_active":true,"date_joined":"2026-08-04T19:39:37.484667Z"}},
      "message":"Registration successful."}
```

`dev_otp` is present only in development. Treat it as optional.

Live routes: `/auth/*`, `/onboarding/*`, `/vehicles/categories`, `/vehicles/fare-estimate`, `/bookings/*`, `/dispatch/bookings/{id}/accept|reject`.
Stub apps with no routes: `admin_api`, `payments`, `tracking`, `disputes`, `ratings`, `zones`, `notifications`.

## File structure

```
lib/api/client.ts        fetch wrapper, envelope unwrap, auth header, ApiError
lib/api/types.ts         types transcribed from verified responses
lib/api/auth.ts          LIVE
lib/api/vehicles.ts      LIVE
lib/api/onboarding.ts    LIVE
lib/api/admin.ts         FIXTURE
lib/api/payments.ts      FIXTURE
lib/api/fixtures/*.ts    spec-shaped fixture data
lib/format.ts            formatXaf, formatPhone
app/page.tsx             landing
app/register/            partner registration hub
app/(auth)/              signin, register/fleet, verify
app/fleet/               fleet owner dashboard screens
app/admin/               admin console screens
components/marketing/    landing sections
components/auth/         otp form, phone field
components/fleet/        fleet dashboard widgets
components/admin/        existing shell, refit
```

## Branch sequence

`feature/landing-page-redesign` is the **integration branch** for tonight's
work. It is cut from `development` and carries Phase 1. The other three phases
are cut from it and merged back into it locally — those internal merges need no
review, because nothing has left the team's hands yet.

Only one pull request is opened: `feature/landing-page-redesign` →
`development`. That single PR is what the README's two-approval rule and the PR
Gatekeeper apply to.

```
development
 └── feature/landing-page-redesign      Phase 1 — landing, register hub, navbar,
      │                                          fonts, tokens, format helpers
      ├── feature/auth-otp              Phase 2 — merges back in
      ├── feature/fleet-dashboard       Phase 3 — merges back in
      └── feature/admin-console         Phase 4 — merges back in
                                        then ONE PR to development
```

**Ordering:** Phase 1 lands on the integration branch first, because Phases 3
and 4 need `lib/format.ts` from it. Phase 2 is cut next and merged back, because
Phases 3 and 4 both import `lib/api/client.ts` and `lib/session.ts` from it.
Phases 3 and 4 are then cut from the integration branch in parallel and merged
back as each finishes.

Merge internal branches with `--no-ff` so each phase stays a legible unit in the
final PR:

```bash
git checkout feature/landing-page-redesign
git merge --no-ff feature/auth-otp -m "merge: auth and OTP screens"
```

Run the full gate on the integration branch after every merge-back, not just on
the phase branches — a merge can break a neighbour's tests.

---

## Phase 1 — `feature/landing-page-redesign` (integration branch)

```bash
git checkout development && git pull
git checkout -b feature/landing-page-redesign
```

### Task 1.1: Fonts and missing design tokens

**Files:**

- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Test: `app/globals.test.ts` (not needed — see step 1)

**Interfaces:**

- Produces: CSS variables `--font-heading`, `--font-sans`, `--font-mono` bound to real fonts; Tailwind colour utilities `bg-dark`, `primary-container`, `on-primary-container`, `success-momo`.

- [ ] **Step 1: Load the three fonts in the root layout**

`app/layout.tsx` is excluded from coverage (`!app/**/layout.tsx`), so it needs no test.

```tsx
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from 'next/font/google';

const heading = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-heading',
});
const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
});
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-mono',
});
```

Apply `className={`${heading.variable} ${body.variable} ${mono.variable}`}` to `<html>`.

- [ ] **Step 2: Add the four missing colour tokens to `@theme` in `app/globals.css`**

```css
--color-bg-dark: #0f172a;
--color-on-primary-container: #683c00;
--color-success-momo: #10b981;
--color-border-dark: #334155;
```

`--color-primary-container` already exists at `#ff9f1c`. Do not duplicate it.

- [ ] **Step 3: Verify the app still builds**

Run: `npm run build`
Expected: build succeeds, no font or CSS errors.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx app/globals.css
git commit -m "feat: load brand fonts and add missing design tokens"
```

### Task 1.2: Currency and phone formatting helpers

**Files:**

- Create: `lib/format.ts`
- Test: `lib/format.test.ts`

**Interfaces:**

- Produces: `formatXaf(amount: number | string): string`, `formatPhone(e164: string): string`. Used by Phases 3 and 4 for every money and phone display.

- [ ] **Step 1: Write the failing tests**

```ts
import { formatXaf, formatPhone } from './format';

describe('formatXaf', () => {
  it('groups thousands and appends the currency code', () => {
    expect(formatXaf(1240000)).toBe('1,240,000 XAF');
  });

  it('accepts the decimal strings the API returns', () => {
    expect(formatXaf('1500.00')).toBe('1,500 XAF');
  });

  it('renders zero without a sign', () => {
    expect(formatXaf(0)).toBe('0 XAF');
  });

  it('renders an em dash for an empty amount', () => {
    expect(formatXaf('')).toBe('—');
  });

  it('renders an em dash rather than NaN for invalid input', () => {
    expect(formatXaf(undefined as unknown as number)).toBe('—');
  });
});

describe('formatPhone', () => {
  it('spaces a Cameroon E.164 number for display', () => {
    expect(formatPhone('+237691234567')).toBe('+237 6 91 23 45 67');
  });

  it('returns unrecognised input unchanged', () => {
    expect(formatPhone('12345')).toBe('12345');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest lib/format.test.ts`
Expected: FAIL, "Cannot find module './format'".

- [ ] **Step 3: Implement `lib/format.ts`**

```ts
const XAF_FORMATTER = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
});

const CAMEROON_E164 = /^\+237([62])(\d{2})(\d{2})(\d{2})(\d{2})$/;

export function formatXaf(amount: number | string): string {
  const value = Number(amount);
  if (!Number.isFinite(value) || amount === '') return '—';
  return `${XAF_FORMATTER.format(value)} XAF`;
}

export function formatPhone(e164: string): string {
  const match = CAMEROON_E164.exec(e164);
  if (!match) return e164;
  const [, prefix, ...pairs] = match;
  return `+237 ${prefix} ${pairs.join(' ')}`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest lib/format.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/format.ts lib/format.test.ts
git commit -m "feat: add XAF and phone formatting helpers"
```

### Task 1.3: Navbar refit

**Files:**

- Modify: `components/Navbar.tsx`
- Modify: `components/Navbar.test.tsx`

**Interfaces:**

- Produces: `<Navbar />` with nav items Registration, Support, Help and a "Get Started" CTA.

- [ ] **Step 1: Rewrite the test for the design's nav set**

```tsx
import { render, screen } from '@testing-library/react';
import Navbar from './Navbar';

describe('Navbar', () => {
  it('renders the brand', () => {
    render(<Navbar />);
    expect(screen.getByText('KmerCargo')).toBeInTheDocument();
  });

  it.each([
    ['Registration', '/register'],
    ['Support', '/support'],
    ['Help', '/help'],
  ])('links %s to %s', (label, href) => {
    render(<Navbar />);
    expect(screen.getByRole('link', { name: label })).toHaveAttribute(
      'href',
      href,
    );
  });

  it('renders the primary call to action', () => {
    render(<Navbar />);
    expect(screen.getByRole('link', { name: 'Get Started' })).toHaveAttribute(
      'href',
      '/register',
    );
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest components/Navbar.test.tsx`
Expected: FAIL — current navbar renders "KARGOA", "How It Works", "Features", "Drivers", "FAQ".

- [ ] **Step 3: Update `components/Navbar.tsx`**

Keep the existing pill container (`rounded-full border bg-surface/80 backdrop-blur-md`). Replace the brand text with `KmerCargo` beside a `Truck` icon from lucide-react. Replace the four nav links with the three above. Replace the "Download App" button with a `Link` to `/register` labelled "Get Started", styled `bg-primary-container text-on-primary-container rounded-xl`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest components/Navbar.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/Navbar.tsx components/Navbar.test.tsx
git commit -m "feat: align navbar items with the KmerCargo design"
```

### Task 1.4: Landing page

**Files:**

- Modify: `app/page.tsx`
- Modify: `app/page.test.tsx`
- Create: `components/marketing/role-card.tsx`
- Create: `components/marketing/role-card.test.tsx`
- Create: `components/marketing/value-prop.tsx`
- Create: `components/marketing/value-prop.test.tsx`
- Create: `components/marketing/bottom-nav.tsx`
- Create: `components/marketing/bottom-nav.test.tsx`

**Design:** `public/assets/stitch_kmercargo_design_framework/kmercargo_national_landing_page/` — read `code.html` and `screen.png` before writing any markup.

**Interfaces:**

- Produces: `RoleCard`, `ValueProp`, `BottomNav` — reused by Task 1.5.

```tsx
type RoleCardProps = {
  eyebrow: string; // "INTERNAL" | "PARTNERS"
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  tone: 'light' | 'amber';
};
```

`tone: 'light'` is the Admin Portal card — white surface, dark CTA button.
`tone: 'amber'` is the Fleet Partner card — `bg-primary-container` surface,
`bg-on-primary-container` CTA button.

```tsx
type ValuePropProps = {
  icon: LucideIcon;
  tone: 'success' | 'primary' | 'secondary';
  title: string;
  description: string;
};
```

- [ ] **Step 1: Write failing tests for the three components**

`components/marketing/role-card.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { Truck } from 'lucide-react';
import { RoleCard } from './role-card';

const props = {
  eyebrow: 'PARTNERS',
  icon: Truck,
  title: 'Fleet Partner',
  description: 'Register your trucks.',
  ctaLabel: 'Join the Fleet',
  ctaHref: '/register/fleet',
  tone: 'amber' as const,
};

it('renders the eyebrow, title and description', () => {
  render(<RoleCard {...props} />);
  expect(screen.getByText('PARTNERS')).toBeInTheDocument();
  expect(
    screen.getByRole('heading', { name: 'Fleet Partner' }),
  ).toBeInTheDocument();
  expect(screen.getByText('Register your trucks.')).toBeInTheDocument();
});

it('links the call to action', () => {
  render(<RoleCard {...props} />);
  expect(screen.getByRole('link', { name: /Join the Fleet/ })).toHaveAttribute(
    'href',
    '/register/fleet',
  );
});

it('applies the light tone when asked', () => {
  const { container } = render(<RoleCard {...props} tone="light" />);
  expect(container.firstChild).toHaveClass('bg-white');
});
```

Write equivalent tests for `ValueProp` (renders title, description, and an icon with `aria-hidden`) and `BottomNav` (renders Registration, Support, Help links, each with a visible text label).

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest components/marketing`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement the three components from the design**

Match `code.html` exactly for copy, order and colour. Translate its Tailwind classes to this repo's token classes — `bg-primary-container`, `text-on-primary-container`, `bg-bg-dark`, `text-success-momo`. Icons come from lucide-react, not Material Symbols: `Truck`, `LayoutDashboard`, `Users`, `Banknote`, `Route`, `ShieldCheck`, `ClipboardList`, `Headset`, `CircleHelp`. Every icon gets `aria-hidden="true"` because it sits beside a text label.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest components/marketing`
Expected: PASS.

- [ ] **Step 5: Write the failing landing page test**

`app/page.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import HomePage from './page';

describe('landing page', () => {
  it('renders the hero headline and eyebrow', () => {
    render(<HomePage />);
    expect(screen.getByText('RELIABLE LOGISTICS')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Move Anything in Cameroon' }),
    ).toBeInTheDocument();
  });

  it('offers both role entry points', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('heading', { name: 'Admin Portal' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Fleet Partner' }),
    ).toBeInTheDocument();
  });

  it('lists the three value propositions', () => {
    render(<HomePage />);
    expect(screen.getByText('Guaranteed Payments')).toBeInTheDocument();
    expect(screen.getByText('Optimal Routing')).toBeInTheDocument();
    expect(screen.getByText('Verified Cargo')).toBeInTheDocument();
  });

  it('closes with the scale call to action', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('heading', { name: 'Ready to Scale?' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Get Started Now' }),
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run it to verify it fails**

Run: `npx jest app/page.test.tsx`
Expected: FAIL — the current page renders "Move Cargo Across Cameroon...".

- [ ] **Step 7: Rebuild `app/page.tsx` from the design**

Sections in the design's order: hero (full-bleed image, gradient to `bg-dark`, eyebrow badge, h1, subcopy) → role cards overlapping the hero by `-mt-8` → "Why Partner with Us?" heading with a `border-l-4 border-primary-container pl-4` accent → three value props → dark rounded CTA panel with two buttons.

Responsive: role cards `grid-cols-1 md:grid-cols-2`, value props `md:grid-cols-3`, hero `h-[530px] md:h-[640px]`, content `max-w-6xl mx-auto`. Copy stays byte-identical to `code.html`.

The hero image in `code.html` is a Google CDN URL that will not resolve. Use the existing `public/hero.png`.

- [ ] **Step 8: Run tests to verify they pass**

Run: `npx jest app/page.test.tsx`
Expected: PASS.

- [ ] **Step 9: Full gate, then commit**

```bash
npm run format:fix && npm run lint && npm run test:coverage
git add app/page.tsx app/page.test.tsx components/marketing
git commit -m "feat: rebuild landing page from the KmerCargo design"
```

### Task 1.5: Partner registration hub

**Files:**

- Create: `app/register/page.tsx`
- Create: `app/register/page.test.tsx`

**Design:** `public/assets/stitch_kmercargo_design_framework/web_portal_partner_registration_hub/`

**Interfaces:**

- Consumes: `RoleCard` from Task 1.4.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react';
import RegisterPage from './page';

describe('partner registration hub', () => {
  it('renders the hub headline', () => {
    render(<RegisterPage />);
    expect(
      screen.getByRole('heading', {
        name: 'The Backbone of Cameroon Logistics',
      }),
    ).toBeInTheDocument();
  });

  it.each([
    ['I am a Fleet Owner', 'Register Fleet', '/register/fleet'],
    ['I am an Admin', 'Request Admin Access', '/signin'],
    ['I am a Corporate Client', 'Open Business Account', '/register/business'],
  ])('offers the %s path', (title, cta, href) => {
    render(<RegisterPage />);
    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: new RegExp(cta) })).toHaveAttribute(
      'href',
      href,
    );
  });

  it('shows the network statistics', () => {
    render(<RegisterPage />);
    expect(screen.getByText('TRUCKS ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('500+')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx jest app/register/page.test.tsx`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement the page from the design**

Three role cards, each with a benefit list (`CircleCheck` icon + label) above its CTA, then the statistics strip (`500+ / TRUCKS ACTIVE`, `10k+ / MONTHLY TRIPS`, `99.2% / SAFETY RATING`) in `font-mono`. Cards stack on mobile, `md:grid-cols-3` on desktop.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest app/register/page.test.tsx`
Expected: PASS.

- [ ] **Step 5: Full gate, then commit**

```bash
npm run format:fix && npm run lint && npm run test:coverage
git add app/register
git commit -m "feat: add partner registration hub"
```

---

## Phase 2 — `feature/auth-otp`

```bash
git checkout feature/landing-page-redesign
git checkout -b feature/auth-otp
```

### Task 2.1: API types

**Files:**

- Create: `lib/api/types.ts`

**Interfaces:**

- Produces: every type below. Phases 3 and 4 import from here.

- [ ] **Step 1: Write `lib/api/types.ts`**

Transcribed from the verified live responses. No test — this file is types only and emits no runtime code.

```ts
export type Envelope<T> = {
  status: 'success' | 'error';
  data: T;
  message: string;
};

export type Role = 'customer' | 'driver' | 'fleet_owner' | 'admin';
export type OtpPurpose = 'registration' | 'login';

export type UserSummary = {
  id: string;
  phone_number: string;
  role: Role;
  full_name: string;
  profile_photo: string | null;
  is_active: boolean;
  date_joined: string;
};

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  user: UserSummary;
};

export type OtpRequestResult = {
  dev_otp?: string;
};

export type VehicleCategory = {
  id: string;
  name: string;
  description: string;
  base_fare: string;
  per_km_rate: string;
  minimum_fare: string;
  is_active: boolean;
};
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/api/types.ts
git commit -m "feat: add API types from the KmerCargo backend schema"
```

### Task 2.2: API client

**Files:**

- Create: `lib/api/client.ts`
- Test: `lib/api/client.test.ts`

**Interfaces:**

- Consumes: `Envelope` from Task 2.1.
- Produces:

```ts
export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number);
}

export function apiRequest<T>(
  path: string,
  options?: { method?: string; body?: unknown; token?: string },
): Promise<T>;
```

Every other `lib/api/*` module calls `apiRequest`.

**Deviation from the spec, deliberate:** the spec described an automatic
refresh-retry inside the client. Keeping that out makes the client a pure,
trivially testable function. Token refresh is instead an explicit
`refreshTokens()` call from `lib/session.ts` when `getAccessToken()` finds no
valid access cookie. Same behaviour, one less hidden code path.

- [ ] **Step 1: Write the failing tests**

```ts
import { apiRequest, ApiError } from './client';

const okResponse = (data: unknown) =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ status: 'success', data, message: 'ok' }),
  } as Response);

describe('apiRequest', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = 'http://api.test/api/v1';
    global.fetch = jest.fn();
  });

  it('unwraps the envelope and returns data', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okResponse({ id: '1' }));
    await expect(apiRequest('/auth/profile')).resolves.toEqual({ id: '1' });
  });

  it('prefixes the configured base URL', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okResponse({}));
    await apiRequest('/auth/profile');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://api.test/api/v1/auth/profile',
      expect.anything(),
    );
  });

  it('sends a JSON body for writes', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okResponse({}));
    await apiRequest('/auth/otp/request', {
      method: 'POST',
      body: { phone_number: '+237691234567' },
    });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ phone_number: '+237691234567' }),
      }),
    );
  });

  it('attaches the bearer token when given one', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okResponse({}));
    await apiRequest('/auth/profile', { token: 'jwt-abc' });
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init.headers.Authorization).toBe('Bearer jwt-abc');
  });

  it('omits the Authorization header without a token', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okResponse({}));
    await apiRequest('/vehicles/categories');
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init.headers.Authorization).toBeUndefined();
  });

  it('throws ApiError carrying the backend message on an HTTP error', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 429,
      json: () =>
        Promise.resolve({
          status: 'error',
          data: {},
          message: 'Too many OTP requests.',
        }),
    } as Response);

    await expect(apiRequest('/auth/otp/request')).rejects.toThrow(
      new ApiError('Too many OTP requests.', 429),
    );
  });

  it('throws ApiError when the envelope reports an error on a 200', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({ status: 'error', data: {}, message: 'Invalid OTP.' }),
    } as Response);

    await expect(apiRequest('/auth/otp/verify')).rejects.toThrow(
      'Invalid OTP.',
    );
  });

  it('falls back to a generic message when the body is not JSON', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('not json')),
    } as unknown as Response);

    await expect(apiRequest('/auth/profile')).rejects.toThrow(
      'Request failed with status 500',
    );
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest lib/api/client.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `lib/api/client.ts`**

```ts
import type { Envelope } from './types';

const BASE_URL = () =>
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string;
};

export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, token }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL()}${path}`, {
    method,
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

  const envelope = await response
    .json()
    .then((value) => value as Envelope<T>)
    .catch(() => null);

  if (!envelope) {
    throw new ApiError(
      `Request failed with status ${response.status}`,
      response.status,
    );
  }

  if (!response.ok || envelope.status === 'error') {
    throw new ApiError(envelope.message, response.status);
  }

  return envelope.data;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest lib/api/client.test.ts`
Expected: PASS, 8 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/api/client.ts lib/api/client.test.ts
git commit -m "feat: add typed API client with envelope unwrapping"
```

### Task 2.3: Auth API module

**Files:**

- Create: `lib/api/auth.ts`
- Test: `lib/api/auth.test.ts`

**Interfaces:**

- Consumes: `apiRequest` (Task 2.2), types (Task 2.1).
- Produces:

```ts
export function requestOtp(
  phoneNumber: string,
  purpose: OtpPurpose,
): Promise<OtpRequestResult>;
export function verifyOtp(input: {
  phoneNumber: string;
  code: string;
  purpose: OtpPurpose;
  role?: Role;
}): Promise<TokenPair>;
export function getProfile(token: string): Promise<UserSummary>;
export function refreshTokens(refreshToken: string): Promise<TokenPair>;
export function logout(token: string, refreshToken: string): Promise<void>;
```

- [ ] **Step 1: Write the failing tests**

```ts
import { requestOtp, verifyOtp, getProfile } from './auth';
import { apiRequest } from './client';

jest.mock('./client');
const mockedRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

beforeEach(() => mockedRequest.mockReset());

describe('requestOtp', () => {
  it('posts the phone number and purpose', async () => {
    mockedRequest.mockResolvedValue({ dev_otp: '146012' });
    await expect(requestOtp('+237691234567', 'login')).resolves.toEqual({
      dev_otp: '146012',
    });
    expect(mockedRequest).toHaveBeenCalledWith('/auth/otp/request', {
      method: 'POST',
      body: { phone_number: '+237691234567', purpose: 'login' },
    });
  });
});

describe('verifyOtp', () => {
  it('posts the code and returns the token pair', async () => {
    const tokens = { access_token: 'a', refresh_token: 'r', user: {} };
    mockedRequest.mockResolvedValue(tokens);

    await expect(
      verifyOtp({
        phoneNumber: '+237691234567',
        code: '482931',
        purpose: 'login',
      }),
    ).resolves.toBe(tokens);

    expect(mockedRequest).toHaveBeenCalledWith('/auth/otp/verify', {
      method: 'POST',
      body: {
        phone_number: '+237691234567',
        code: '482931',
        purpose: 'login',
      },
    });
  });

  it('includes the role when registering', async () => {
    mockedRequest.mockResolvedValue({});
    await verifyOtp({
      phoneNumber: '+237691234567',
      code: '482931',
      purpose: 'registration',
      role: 'fleet_owner',
    });
    expect(mockedRequest).toHaveBeenCalledWith(
      '/auth/otp/verify',
      expect.objectContaining({
        body: expect.objectContaining({ role: 'fleet_owner' }),
      }),
    );
  });
});

describe('getProfile', () => {
  it('sends the bearer token', async () => {
    mockedRequest.mockResolvedValue({ id: '1' });
    await getProfile('jwt-abc');
    expect(mockedRequest).toHaveBeenCalledWith('/auth/profile', {
      token: 'jwt-abc',
    });
  });
});
```

Add equivalent tests for `refreshTokens` (posts `{ refresh_token }` to `/auth/token/refresh`) and `logout` (posts `{ refresh_token }` to `/auth/logout` with the access token).

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest lib/api/auth.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `lib/api/auth.ts`**

Thin wrappers over `apiRequest`. `verifyOtp` omits `role` entirely when it is `undefined` — the tests above assert the exact body.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest lib/api/auth.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/api/auth.ts lib/api/auth.test.ts
git commit -m "feat: add auth API module for the OTP flow"
```

### Task 2.4: Session cookies and server actions

**Files:**

- Create: `lib/session.ts`
- Test: `lib/session.test.ts`
- Create: `app/(auth)/actions.ts`
- Test: `app/(auth)/actions.test.ts`
- Delete: `app/auth/page.tsx`, `app/auth/page.test.tsx`, `app/auth/actions.ts`, `app/auth/actions.test.ts`

**Interfaces:**

- Produces:

```ts
// lib/session.ts
export async function createSession(tokens: TokenPair): Promise<void>;
export async function getAccessToken(): Promise<string | undefined>;
export async function destroySession(): Promise<void>;

// app/(auth)/actions.ts
export type AuthState = { error: string | null };
export async function sendOtp(
  state: AuthState,
  formData: FormData,
): Promise<AuthState>;
export async function confirmOtp(
  state: AuthState,
  formData: FormData,
): Promise<AuthState>;
```

`sendOtp` reads `phone_number` and `purpose`. `confirmOtp` reads `phone_number`, `code`, `purpose`, optional `role`; on success it calls `createSession` then `redirect()` to `/fleet` for `fleet_owner`, `/admin` for `admin`, `/` otherwise.

- [ ] **Step 1: Write the failing session tests**

```ts
import { cookies } from 'next/headers';
import { createSession, getAccessToken, destroySession } from './session';

jest.mock('next/headers');
const store = { set: jest.fn(), get: jest.fn(), delete: jest.fn() };
(cookies as jest.Mock).mockResolvedValue(store);

beforeEach(() => jest.clearAllMocks());

it('stores both tokens as httpOnly cookies', async () => {
  await createSession({
    access_token: 'a',
    refresh_token: 'r',
    user: {} as never,
  });

  expect(store.set).toHaveBeenCalledWith(
    'access_token',
    'a',
    expect.objectContaining({ httpOnly: true, sameSite: 'lax' }),
  );
  expect(store.set).toHaveBeenCalledWith(
    'refresh_token',
    'r',
    expect.objectContaining({ httpOnly: true }),
  );
});

it('reads the access token back', async () => {
  store.get.mockReturnValue({ value: 'a' });
  await expect(getAccessToken()).resolves.toBe('a');
});

it('returns undefined when no cookie is set', async () => {
  store.get.mockReturnValue(undefined);
  await expect(getAccessToken()).resolves.toBeUndefined();
});

it('clears both cookies on destroy', async () => {
  await destroySession();
  expect(store.delete).toHaveBeenCalledWith('access_token');
  expect(store.delete).toHaveBeenCalledWith('refresh_token');
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx jest lib/session.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `lib/session.ts`**

`access_token` cookie `maxAge: 60 * 15`, `refresh_token` cookie `maxAge: 60 * 60 * 24 * 30`. Both `httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/'`.

- [ ] **Step 4: Run to verify it passes**

Run: `npx jest lib/session.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Write the failing action tests**

Cover, for `sendOtp`: rejects a phone number failing `^\+237[62][0-9]{8}$` with `{ error: 'Enter a valid Cameroon phone number.' }` without calling the API; calls `requestOtp` on a valid number and returns `{ error: null }`; maps a thrown `ApiError` to `{ error: <its message> }`.

For `confirmOtp`: rejects a code that is not six digits; calls `verifyOtp`, then `createSession`, then redirects to `/fleet` for a `fleet_owner`; redirects to `/admin` for an `admin`; returns the `ApiError` message on failure.

- [ ] **Step 6: Run to verify they fail**

Run: `npx jest "app/(auth)/actions.test.ts"`
Expected: FAIL, module not found.

- [ ] **Step 7: Implement `app/(auth)/actions.ts`**

`'use server'` at the top. Validate first, call `lib/api/auth`, catch `ApiError` and return its message. Never leak a non-`ApiError` message to the user — return `'Something went wrong. Please try again.'`.

- [ ] **Step 8: Run to verify they pass, then delete the old auth route**

```bash
npx jest "app/(auth)"
git rm -r app/auth
```

- [ ] **Step 9: Full gate, then commit**

```bash
npm run format:fix && npm run lint && npm run test:coverage
git add lib/session.ts lib/session.test.ts "app/(auth)"
git commit -m "feat: add httpOnly session cookies and OTP server actions"
```

### Task 2.5: Phone and OTP input components

**Files:**

- Create: `components/auth/phone-field.tsx` + test
- Create: `components/auth/otp-field.tsx` + test

**Design:** `fleet_owner_otp_verification/code.html` for the OTP boxes.

**Interfaces:**

- Produces: `<PhoneField name="phone_number" />` — a `+237`-prefixed text input, `inputMode="tel"`, `font-mono`. `<OtpField name="code" />` — six single-character boxes that advance focus on entry and combine into one hidden input value.

- [ ] **Step 1: Write the failing tests**

For `PhoneField`: renders a labelled input; shows the `+237` prefix; the input carries the given `name`.
For `OtpField`: renders six boxes; typing a digit moves focus to the next box; typing six digits sets the hidden input's value to the joined code; Backspace on an empty box moves focus back.

- [ ] **Step 2: Run to verify they fail**

Run: `npx jest components/auth`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement both components**

Both are `'use client'`. `OtpField` holds a `string[]` of length 6 in state and renders a `<input type="hidden">` with the joined value, so the server action reads one `code` field.

- [ ] **Step 4: Run to verify they pass**

Run: `npx jest components/auth`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/auth
git commit -m "feat: add phone and OTP input components"
```

### Task 2.6: Sign-in, fleet registration and OTP verification screens

**Files:**

- Create: `app/(auth)/signin/page.tsx` + test
- Create: `app/(auth)/register/fleet/page.tsx` + test
- Create: `app/(auth)/verify/page.tsx` + test
- Create: `app/(auth)/layout.tsx`

**Designs:** `admin_login_password_code/`, `fleet_owner_registration_entry/`, `fleet_owner_otp_verification/` — read each before writing its screen.

**Interfaces:**

- Consumes: `sendOtp`, `confirmOtp` (Task 2.4); `PhoneField`, `OtpField` (Task 2.5).

- [ ] **Step 1: Write the failing tests**

Each screen test mocks `app/(auth)/actions` and asserts: the design's headings and copy render; the form submits through the right action; an error returned by the action is displayed. `/verify` additionally reads `?phone=` and `?purpose=` from `searchParams` and renders the masked number.

- [ ] **Step 2: Run to verify they fail**

Run: `npx jest "app/(auth)"`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement the three screens**

`/signin` follows `admin_login_password_code` exactly — centred card, amber rounded-square truck icon, "KmerCargo" over "Admin Portal", the amber gradient submit button, the "Request Admin Access" link, the footer note. Per the design decision in the spec, the single field is a phone number rather than a password, because the backend has no password auth; the visual treatment is unchanged.

Forms use `useActionState(sendOtp, { error: null })`. On success `sendOtp`
**returns `{ error: null }`** — it does not redirect. The client screen owns
navigation to `/verify?phone=…&purpose=…`, appending `&role=fleet_owner` on the
fleet registration path. Only `confirmOtp` calls `redirect()`, after
`createSession`. This split matters: `sendOtp` never receives `role`, so a
server-side redirect there could not carry it, and fleet-owner registration
would break.

- [ ] **Step 4: Run to verify they pass**

Run: `npx jest "app/(auth)"`
Expected: PASS.

- [ ] **Step 5: Manually verify against the live backend**

```bash
npm run dev
```

Visit `/register/fleet`, submit `+237691234567`, read `dev_otp` from the backend response, enter it at `/verify`, confirm the redirect to `/fleet` and that `access_token` is set as an httpOnly cookie.

- [ ] **Step 6: Full gate, then commit**

```bash
npm run format:fix && npm run lint && npm run test:coverage
git add "app/(auth)"
git commit -m "feat: add sign-in, fleet registration and OTP verification screens"
```

---

## Phase 3 — `feature/fleet-dashboard`

Cut from the integration branch after Phase 2 has merged back into it, so
`lib/api/client.ts`, `lib/session.ts` and `lib/format.ts` are all present.

```bash
git checkout feature/landing-page-redesign
git checkout -b feature/fleet-dashboard
```

### Task 3.1: Vehicles, onboarding and payments API modules

**Files:**

- Create: `lib/api/vehicles.ts` + test (LIVE — `/vehicles/categories`, `/vehicles/fare-estimate`)
- Create: `lib/api/onboarding.ts` + test (LIVE — `/onboarding/upload-url`, `/onboarding/driver`, `/onboarding/driver/status`)
- Create: `lib/api/payments.ts` + test (FIXTURE)
- Create: `lib/api/fixtures/payments.ts`

**Type-ownership rule:** `lib/api/types.ts` holds only types shared across
modules (`Envelope`, `Role`, `UserSummary`, `TokenPair`, `VehicleCategory`).
Every other type below is declared and exported by the module that owns it —
`DriverSubmission` in `onboarding.ts`, `Wallet` and `Settlement` in
`payments.ts`. Screens import them from that module.

**Interfaces:**

- Produces:

```ts
// vehicles.ts — live
export function getCategories(): Promise<VehicleCategory[]>;

// onboarding.ts — live
// CORRECTED 2026-08-06 against the running server with a real driver token.
// The shapes originally written here were invented and did not exist on the
// backend. A full end-to-end POST /onboarding/driver was verified live.
export type DocumentType =
  | 'license'
  | 'national_id'
  | 'live_selfie'
  | 'vehicle_registration'
  | 'dispute_evidence';
export type FileType = 'image/jpeg' | 'image/png' | 'application/pdf';

export type DriverSubmission = {
  license_document: string; // object_url from getUploadUrl
  national_id_document: string;
  live_selfie: string;
  vehicle: {
    plate_number: string; // max 20 chars
    registration_doc: string;
    category_id: string; // UUID of an active VehicleCategory
  };
};
export function getUploadUrl(
  token: string,
  documentType: DocumentType,
  fileType: FileType,
): Promise<{ upload_url: string; object_url: string }>;
export function submitDriver(
  token: string,
  payload: DriverSubmission,
): Promise<void>;
export function getDriverStatus(
  token: string,
): Promise<{ verification_status: string; rejection_reason: string | null }>;

// payments.ts — fixture until apps/payments ships routes
export type Wallet = { balance: string; pending: string; currency: 'XAF' };
export type Settlement = {
  id: string;
  period: string;
  amount: string;
  status: 'paid' | 'pending';
};
export function getWallet(token: string): Promise<Wallet>;
export function getSettlements(token: string): Promise<Settlement[]>;
```

`getCategories` takes no token — `/vehicles/categories` is public, confirmed by
an unauthenticated 200 response returning the four seeded categories.

- [ ] **Step 1: Write failing tests for both modules**

`onboarding.test.ts` mocks `./client` and asserts each function's path, method, body and token, exactly as Task 2.3 does for auth.

`payments.test.ts` asserts `getWallet` resolves the fixture and, critically, that it **never calls `apiRequest`** — `expect(apiRequest).not.toHaveBeenCalled()`. That test is what will fail loudly and remind you to delete the fixture when the backend ships.

- [ ] **Step 2: Run to verify they fail**

Run: `npx jest lib/api`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement both modules**

Head `lib/api/payments.ts` with this comment:

```ts
// FIXTURE-BACKED. apps/payments has no routes yet (verified 2026-08-04).
// When /payments/wallet ships, replace these bodies with apiRequest calls.
// Signatures must not change — screens depend on them.
```

- [ ] **Step 4: Run to verify they pass**

Run: `npx jest lib/api`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/api
git commit -m "feat: add onboarding and payments API modules"
```

### Task 3.2: Fleet dashboard overview

**Files:**

- Create: `app/fleet/page.tsx` + test
- Create: `app/fleet/layout.tsx`
- Create: `components/fleet/stat-card.tsx` + test
- Create: `components/fleet/performance-chart.tsx` + test
- Create: `components/fleet/driver-table.tsx` + test

**Design:** `fleet_owner_dashboard_overview/`

**Interfaces:**

- Consumes: `formatXaf` (Task 1.2), `getWallet` (Task 3.1), `getAccessToken` (Task 2.4).

- [ ] **Step 1: Write the failing component tests**

`StatCard`: renders label, value, and an optional trend badge; the value uses `font-mono`.
`PerformanceChart`: renders seven day labels Mon–Sun and highlights the peak day. Mock `recharts` — it does not render in jsdom.
`DriverTable`: renders a row per driver with name, status, vehicle ID and current route; vehicle IDs use `font-mono`.

- [ ] **Step 2: Run to verify they fail**

Run: `npx jest components/fleet`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement the three components from the design**

Active trucks card with progress bar, the amber gradient earnings card, the pending-verifications card with its red count and "Requires Action" pill, the weekly/monthly toggle, the bar chart, the active drivers table.

- [ ] **Step 4: Run to verify they pass**

Run: `npx jest components/fleet`
Expected: PASS.

- [ ] **Step 5: Write the failing page test**

Mock `lib/api/payments` and `lib/session`. Assert the page renders "Fleet Operations", "ACTIVE TRUCKS", the earnings formatted as `1,240,000 XAF`, and the drivers table.

- [ ] **Step 6: Run to verify it fails, implement, run to verify it passes**

Run: `npx jest app/fleet`

- [ ] **Step 7: Full gate, then commit**

```bash
npm run format:fix && npm run lint && npm run test:coverage
git add app/fleet components/fleet
git commit -m "feat: add fleet owner dashboard overview"
```

### Task 3.3: Driver & vehicle management, revenue & settlements, onboarding screens

**Files:**

- Create: `app/fleet/drivers/page.tsx` + test — design `fleet_owner_driver_vehicle_management/`
- Create: `app/fleet/revenue/page.tsx` + test — design `fleet_owner_revenue_settlements/`
- Create: `app/onboarding/business/page.tsx` + test — design `fleet_owner_onboarding_business_info/`
- Create: `app/onboarding/vehicle/page.tsx` + test — design `fleet_owner_vehicle_setup/`

**Interfaces:**

- Consumes: `DriverTable`, `StatCard` (Task 3.2); `getUploadUrl`, `submitDriver`, `getSettlements` (Task 3.1); `getCategories` from `lib/api/vehicles.ts`.

- [ ] **Step 1 through 4: One screen at a time**

For each of the four screens, in order: read its `code.html` and `screen.png`; write the failing test asserting its headings, its data rows and its primary action; run it and watch it fail; implement from the design; run it and watch it pass; commit that screen alone.

`/onboarding/vehicle` populates its category selector from the live `/vehicles/categories` endpoint — four categories are seeded (Pickup, Mini Truck, Standard Truck, Large Truck).

- [ ] **Step 5: Full gate, then final commit**

```bash
npm run format:fix && npm run lint && npm run test:coverage
git commit -m "feat: add fleet management, settlements and onboarding screens"
```

---

## Phase 4 — `feature/admin-console`

Cut from the integration branch after Phase 2 has merged back into it. May run
in parallel with Phase 3 — the two phases share no files.

```bash
git checkout feature/landing-page-redesign
git checkout -b feature/admin-console
```

### Task 4.1: Admin API module

**Files:**

- Create: `lib/api/admin.ts` + test
- Create: `lib/api/fixtures/admin.ts`

**Interfaces:**

Per the type-ownership rule in Task 3.1, `AdminOverview`, `FleetApplication`,
`DriverApplication`, `DocumentRecord` and `TeamMember` are declared and exported
by `lib/api/admin.ts` itself, not by `lib/api/types.ts`.

- Produces:

```ts
export function getOverview(token: string): Promise<AdminOverview>;
export function getFleetApplications(
  token: string,
): Promise<FleetApplication[]>;
export function getFleetApplication(
  token: string,
  id: string,
): Promise<FleetApplication>;
export function getDriverApplication(
  token: string,
  id: string,
): Promise<DriverApplication>;
export function getDocument(token: string, id: string): Promise<DocumentRecord>;
export function getTeam(token: string): Promise<TeamMember[]>;
```

`FleetApplication` matches the approval queue design: `{ id, organization, reference, fleet_size, region, applied_date, status }` where `status` is `'pending_review' | 'under_verification' | 'flagged' | 'approved'`.

- [ ] **Step 1: Write the failing tests**

Assert each function resolves its fixture, that `getFleetApplication` throws `ApiError` with status 404 for an unknown id, and that no function calls `apiRequest`.

- [ ] **Step 2: Run to verify they fail**

Run: `npx jest lib/api/admin.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement the module and fixtures**

Seed the fixtures with the exact rows drawn in `admin_fleet_approval_queue/screen.png`: Société de Transport Littoral (KMER-88219, 24 vehicles, Douala, 12/05/2024, pending review); Mfoundi Express Logistics (KMER-10992, 08, Yaoundé, 11/05/2024, under verification); Rapid Cargo North (KMER-55410, 42, Garoua, 10/05/2024, flagged); West Region Transporters Co-op (KMER-99032, 115, Bafoussam, 09/05/2024, pending review).

Head the file with the same FIXTURE-BACKED comment as `payments.ts`, naming `apps/admin_api`.

- [ ] **Step 4: Run to verify they pass**

Run: `npx jest lib/api/admin.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/api/admin.ts lib/api/fixtures/admin.ts lib/api/admin.test.ts
git commit -m "feat: add admin API module backed by spec-shaped fixtures"
```

### Task 4.2: Refit the admin shell

**Files:**

- Modify: `components/admin/app-sidebar.tsx`
- Modify: `components/admin/admin-header.tsx`
- Modify: `app/admin/page.tsx` + test
- Delete: `app/admin/[section]/` (replaced by the real routes below)

**Design:** `admin_fleet_approval_queue/` — its sidebar and header are the reference.

- [ ] **Step 1: Write the failing sidebar test**

Assert the sidebar renders exactly five items — Dashboard, Fleet Approvals, Driver Verification, Financial Oversight, Settings — each linking to its route, each with a visible text label.

- [ ] **Step 2: Run to verify it fails**

Run: `npx jest components/admin`
Expected: FAIL — the current sidebar renders thirteen items.

- [ ] **Step 3: Reduce the sidebar to the design's five items and restyle the header**

Header: truck icon, "KmerCargo Admin" in amber, bell and help icons, "Admin User / Super Admin" with avatar. Sidebar active item uses `bg-secondary-container/40`.

- [ ] **Step 4: Run to verify it passes**

Run: `npx jest components/admin`
Expected: PASS.

- [ ] **Step 5: Remove the placeholder section route and commit**

```bash
git rm -r "app/admin/[section]"
npm run format:fix && npm run lint && npm run test:coverage
git add app/admin components/admin
git commit -m "refactor: refit admin shell to the KmerCargo design"
```

### Task 4.3: Fleet approvals queue

**Files:**

- Create: `app/admin/fleet-approvals/page.tsx` + test
- Create: `components/admin/status-badge.tsx` + test
- Create: `components/admin/application-table.tsx` + test

**Design:** `admin_fleet_approval_queue/`

- [ ] **Step 1: Write the failing tests**

`StatusBadge`: renders the human label for each of the four statuses with its own tone — pending review amber, under verification blue, flagged red, approved green.
`ApplicationTable`: renders a row per application with organisation, reference in `font-mono`, fleet size pill, region, applied date and status badge; the view action is a link to `/admin/fleet-approvals/<id>` with an accessible name.
Page: renders the "Fleet Approvals Queue" heading, the search field, both filter selects, the four rows, "SHOWING 1-4 OF 28 APPLICATIONS", and the three summary cards (Total Pending 28, Processing Time 1.4 Days, Critical Flags 03).

- [ ] **Step 2: Run to verify they fail**

Run: `npx jest app/admin/fleet-approvals components/admin`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement from the design**

- [ ] **Step 4: Run to verify they pass, then commit**

```bash
npm run format:fix && npm run lint && npm run test:coverage
git add app/admin/fleet-approvals components/admin
git commit -m "feat: add fleet approvals queue"
```

### Task 4.4: Remaining admin screens

**Files:**

- Create: `app/admin/fleet-approvals/[id]/page.tsx` + test — design `admin_fleet_application_review/`
- Create: `app/admin/drivers/[id]/page.tsx` + test — design `admin_driver_application_review/`
- Create: `app/admin/documents/[id]/page.tsx` + test — design `admin_document_inspector/`
- Create: `app/admin/finance/page.tsx` + test — design `admin_financial_dashboard/`
- Create: `app/admin/team/page.tsx` + test — design `admin_team_management/`

**Interfaces:**

- Consumes: `StatusBadge` (Task 4.3); `getFleetApplication`, `getDriverApplication`, `getDocument`, `getTeam`, `getOverview` (Task 4.1); `formatXaf` (Task 1.2).

- [ ] **Step 1 through 5: One screen at a time**

For each of the five screens, in order: read its `code.html` and `screen.png`; write the failing test asserting its headings, its data and its primary actions; run it and watch it fail; implement from the design; run it and watch it pass; commit that screen alone.

Dynamic routes take `params: Promise<{ id: string }>` and `await` it — Next.js 16 requires this. An unknown id calls `notFound()`.

- [ ] **Step 6: Full gate, then final commit**

```bash
npm run format:fix && npm run lint && npm run test:coverage
git commit -m "feat: add admin review, document, finance and team screens"
```

---

## Definition of done

- [ ] Phases 2, 3 and 4 merged back into `feature/landing-page-redesign` with
      `--no-ff`.
- [ ] Exactly one pull request open: `feature/landing-page-redesign` →
      `development`, for the team's two approvals.
- [ ] `npm run lint`, `npm run format`, `npm run test:coverage` green on the
      integration branch after the final merge — not just on the phase branches.
- [ ] No commit carries a `Co-Authored-By: Claude` trailer.
- [ ] Sign-in works end to end against the running backend.
- [ ] Every fixture-backed module carries the FIXTURE-BACKED comment naming the backend app that will replace it.
