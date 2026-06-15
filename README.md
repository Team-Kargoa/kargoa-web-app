# Kargoa Web App

Next.js web dashboard for **KmerCargo** platform administrators to manage
driver onboarding, fleet verification, financial ledger monitoring, and
dispute resolution.

This app is one component of the wider Kargoa platform, which also includes
a backend API and two Flutter mobile apps (customer and driver). All
repositories live under the [Team-Kargoa](https://github.com/Team-Kargoa)
GitHub organization.

---

## Table of contents

- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [Branching strategy](#branching-strategy)
- [Commit message convention](#commit-message-convention)
- [Development workflow (TDD)](#development-workflow-tdd)
- [Running tests & coverage](#running-tests--coverage)
- [Code style & static analysis](#code-style--static-analysis)
- [Continuous integration & PR gatekeeper](#continuous-integration--pr-gatekeeper)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Tech stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** TypeScript / React
- **Linting & formatting:** ESLint (`next/core-web-vitals`), Prettier
- **Testing:** Jest + React Testing Library
- **CI:** GitHub Actions
  ([.github/workflows/web-ci.yml](.github/workflows/web-ci.yml),
  [.github/workflows/pr-gatekeeper.yml](.github/workflows/pr-gatekeeper.yml))

> Architecture decisions (state management, data fetching, authentication,
> design system, etc.) should be documented here as they are made, so new
> contributors don't have to reverse-engineer them from the code.

## Prerequisites

Install the following before working on this project:

| Tool                                  | Notes                                                                   |
| ------------------------------------- | ----------------------------------------------------------------------- |
| [Node.js](https://nodejs.org/)        | v22 (LTS) — matches the version used in CI                              |
| npm                                   | bundled with Node.js                                                    |
| Git                                   | for version control                                                     |
| [pre-commit](https://pre-commit.com/) | `pip install pre-commit` — runs the local quality gates described below |

## Getting started

### 1. Clone the repository

```bash
git clone git@github.com:Team-Kargoa/kargoa-web-app.git
cd kargoa-web-app
```

### 2. Install dependencies

```bash
npm ci
```

### 3. Install the Git hooks (mandatory)

This repo enforces formatting, linting, commit message rules, and a test/coverage
gate via [pre-commit](https://pre-commit.com/). Install the hooks once per clone:

```bash
pre-commit install --hook-type pre-commit --hook-type commit-msg --hook-type pre-push
```

### 4. Run the app

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

### 5. Run the tests

```bash
npm test
```

## Project structure

```
app/
  layout.tsx          # root layout (HTML shell, metadata)
  page.tsx            # dashboard home page
  page.test.tsx       # tests colocated with the code they cover
  (more routes/components/services as the app grows)
jest.config.js        # Jest configuration (incl. coverage threshold)
jest.setup.ts         # Jest setup (testing-library matchers)
.eslintrc.json         # ESLint configuration
.prettierrc.json        # Prettier configuration
.pre-commit-config.yaml
.github/workflows/    # CI and PR gatekeeper pipelines
```

Tests are colocated with the source files they cover (e.g.
`app/page.tsx` → `app/page.test.tsx`).

## Branching strategy

| Branch                        | Purpose                                                                     |
| ----------------------------- | --------------------------------------------------------------------------- |
| `main`                        | Production-ready code only (default branch). No direct pushes.              |
| `development`                 | Integration branch. All feature/fix branches target this. No direct pushes. |
| `feature/<short-description>` | New features, branched from `development`                                   |
| `fix/<short-description>`     | Bug fixes, branched from `development`                                      |
| `chore/<short-description>`   | Tooling, config, docs, dependency updates                                   |

Examples: `feature/driver-onboarding-review`,
`fix/ledger-totals-rounding`, `chore/upgrade-next`.

Release flow: `development` → (tested & stable) → merged into `main` → tagged
release.

## Commit message convention

All commits **must** follow [Conventional Commits](https://www.conventionalcommits.org/).
This is enforced automatically by the `commit-msg` hook — non-conforming
commits are rejected.

Format: `<type>: <short description>`

| Type       | Use for                                                 |
| ---------- | ------------------------------------------------------- |
| `feat`     | a new feature                                           |
| `fix`      | a bug fix                                               |
| `test`     | adding or updating tests                                |
| `refactor` | code change that neither fixes a bug nor adds a feature |
| `docs`     | documentation only                                      |
| `style`    | formatting only, no code logic change                   |
| `chore`    | tooling, config, dependencies, CI                       |
| `perf`     | performance improvements                                |

Examples:

```
feat: add driver onboarding review queue
fix: correct rounding in ledger totals
test: add unit tests for dispute resolution actions
chore: bump next to 14.2.x
```

## Development workflow (TDD)

This project follows **Test-Driven Development**. The rules below are
non-negotiable and are enforced by tooling wherever possible:

1. **Every task must include tests.** No new feature, fix, or change to
   behavior is complete without accompanying unit/component tests. Write the
   failing test first, then implement until it passes.
2. **All tests must pass before you can push.** The `pre-push` hook runs the
   full test suite with coverage — a failing test blocks the push entirely.
3. **Minimum line/branch/function/statement coverage: 99.99%.** Enforced via
   the `coverageThreshold` in [jest.config.js](jest.config.js), both locally
   (`pre-push`) and in CI. `app/**/layout.tsx` and type declaration files are
   excluded from coverage — see `collectCoverageFrom` in that file for the
   exact list.
4. **Static analysis must be clean.** `npm run lint` (ESLint) must report zero
   issues.
5. **Code must be formatted.** Prettier runs at commit time; unformatted code
   is rejected.

### What runs, and when

| Stage                    | Hook                      | Command                                                  |
| ------------------------ | ------------------------- | -------------------------------------------------------- |
| `git commit`             | `prettier-format`         | `prettier --check .` on the project                      |
| `git commit`             | `eslint`                  | `npm run lint`                                           |
| `git commit` (message)   | `conventional-pre-commit` | validates commit message format                          |
| `git push`               | `jest-coverage`           | `npm run test:coverage` (fails below 99.99%)             |
| GitHub Actions (push/PR) | `web-ci.yml`              | lint, format check, and coverage gate run again remotely |
| GitHub Actions (PR)      | `pr-gatekeeper.yml`       | lint/format + review-count check (see below)             |

## Running tests & coverage

```bash
# Run the full test suite
npm test

# Run with coverage and enforce the project threshold
npm run test:coverage

# Watch mode while developing
npm test -- --watch
```

Place tests next to the file under test, using the `.test.ts` /
`.test.tsx` suffix (e.g. `app/page.tsx` → `app/page.test.tsx`).

## Code style & static analysis

- Linting rules are defined in [.eslintrc.json](.eslintrc.json), extending
  `next/core-web-vitals` plus `prettier` (to disable rules that conflict with
  formatting).
- Run `npm run lint` before pushing — CI will fail on any warning or error.
- Run `npm run format:fix` to auto-format your code with Prettier; the
  pre-commit hook checks `npm run format` (a no-write check) and will reject a
  commit containing unformatted files.

## Continuous integration & PR gatekeeper

Every push and pull request triggers
[.github/workflows/web-ci.yml](.github/workflows/web-ci.yml), which:

1. Checks out the code and sets up Node.js 22.
2. Runs `npm ci`.
3. Runs `npm run lint`.
4. Runs `npm run format` (Prettier check).
5. Runs the test suite with coverage and enforces the 99.99% threshold via
   `npm run test:coverage`.

### PR Gatekeeper bot

Branch protection rules aren't available on this private repo under our
current GitHub plan, so a **PR Gatekeeper** workflow
([.github/workflows/pr-gatekeeper.yml](.github/workflows/pr-gatekeeper.yml))
runs on every PR targeting `main` or `development`. It checks `prettier` and
`eslint`, counts approving reviews, and applies a `do-not-merge` label and
comment if either requirement isn't met:

- **2 approving reviews** are required.
- Prettier and ESLint checks must both pass.

**Do not merge a PR while it has the `do-not-merge` label**, even though
GitHub won't block the merge button itself. The label is removed
automatically once the PR is clean and has the required approvals.

## Contributing

### Step-by-step for a new task

1. Sync with `development`:
   ```bash
   git checkout development
   git pull
   ```
2. Create a branch for your task:
   ```bash
   git checkout -b feature/<short-description>
   ```
3. **Write tests first** describing the expected behavior (they should fail).
4. Implement the change until the tests pass.
5. Run the local checks:
   ```bash
   npm run format:fix
   npm run lint
   npm run test:coverage
   ```
6. Commit using the Conventional Commits format (the hook will reject bad
   messages).
7. Push your branch — the pre-push hook re-runs tests and the coverage gate:
   ```bash
   git push origin feature/<short-description>
   ```
8. Open a Pull Request against `development`. Fill in a clear description of
   what changed and why.
9. Ensure the CI workflow passes and watch for the PR Gatekeeper comment.
10. Request reviews from teammates and address all feedback until the
    `do-not-merge` label is removed.
11. Once approved and all checks pass, merge the PR.

### Pull request checklist

- [ ] Tests added/updated for all new or changed behavior
- [ ] `npm run lint` passes with no issues
- [ ] `npm run format:fix` applied
- [ ] Coverage threshold maintained (99.99%, excluding excluded files)
- [ ] Commit messages follow Conventional Commits
- [ ] No secrets, API keys, or credentials committed

## Troubleshooting

- **`pre-commit` not found** — install it with `pip install pre-commit`, then
  re-run `pre-commit install --hook-type pre-commit --hook-type commit-msg --hook-type pre-push`.
- **Push rejected due to coverage** — run `npm run test:coverage` locally to
  see which files are under-covered, then add the missing tests.
- **ESLint failures** — run `npm run lint` locally for full output; fix
  issues or, if a rule genuinely doesn't apply, discuss with the team before
  adding an exception to `.eslintrc.json`.
- **Prettier failures** — run `npm run format:fix` to auto-fix formatting.
- **`next-env.d.ts` missing / TypeScript path errors** — run `npm run dev` or
  `npm run build` once; Next.js generates this file automatically (it's
  gitignored).

## License

This project is licensed under the terms of the [LICENSE](LICENSE) file
(MIT).
