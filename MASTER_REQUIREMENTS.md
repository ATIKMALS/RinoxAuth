# RinoxAuth Master Requirements

## Product Goal
Build a production-ready licensing and authentication SaaS platform named `RinoxAuth` with a premium dark UI, secure licensing workflows, analytics, reseller support, and strong developer experience through SDKs and APIs.

## Product Naming and Branding
- Replace legacy naming references with `RinoxAuth`.
- Use consistent branding across dashboard, login, portal, docs, and API pages.
- Support logo, favicon, accent color, and theme customization from settings.

## Experience and Design Requirements
- Premium dark theme (deep navy/slate base, indigo accent).
- Smooth transitions and micro-interactions (200-300ms).
- Glassmorphism-inspired cards, subtle gradients, clean shadows.
- Particle or dynamic background effects on landing page.
- Smooth scrolling and responsive layouts for all core pages.
- Modern, SaaS-grade UI quality (inspired by Stripe/Vercel/Linear style).

## Documentation Requirements (README)
- Full project overview and architecture.
- Feature inventory and user roles.
- Installation and local setup (frontend + backend).
- Environment variables and secrets setup.
- API/backend setup and usage examples.
- SDK usage basics for supported languages.
- Deployment/hosting guide step-by-step.
- Security best practices and operational notes.

## Core Modules

### 1) Landing and Marketing
- Hero section with strong value proposition and trust badges.
- Feature grid with security/API/reseller/analytics highlights.
- CTA flows: signup, demo, docs.

### 2) Main Dashboard
- Executive stats cards (revenue, users, licenses, request health).
- Trend indicators and mini charts.
- Recent activity timeline.
- Quick action cards.
- System health/status widget.
- Meaningful empty states (no blank components).

### 3) License Management
- Secure random license key generation with structured format.
- Plan-aware licenses (Starter, Professional, Enterprise, Trial).
- Enhanced table: plan, issued-to, limits, dates, status, actions.
- Status model: Active, Expiring Soon, Expired, Revoked, Suspended.
- Generate License modal with plan, duration, features, device limit.
- License details modal: HWID, IP history, activation/check-in, grace period.
- Bulk operations: generate/import/export/revoke.
- Search, filters, pagination.

### 4) User Management
- Professional user table with plan/license/devices/login info.
- Expandable user detail rows.
- Create user flow with optional auto password, plan/license controls.
- Security options (HWID lock, IP restriction, optional 2FA rules).
- Bulk actions (change plan, extend, ban, export, delete).
- Status badges and top-level user stats cards.

### 5) Application Management
- App list redesigned as premium cards or hybrid table+cards.
- App credentials handling with secure masking/reveal patterns.
- Create app flow with feature toggles and security settings.
- Per-app analytics preview (users/licenses/requests/errors).
- Setup checklist flow for newly created apps.

### 6) Analytics
- KPI cards with growth trends.
- User growth, license distribution, login activity visualizations.
- Event stream and conversion section.
- Filter system (date/app/plan/country).
- Export options (CSV/PDF) and optional scheduled reports.

### 7) Reseller Management
- Reseller stats, searchable management table, pagination.
- Add reseller flow (credits, commission, permissions, limits).
- Expandable reseller detail with activity and commission history.
- Credit management and payout tracking.
- Reseller portal link and scoped capabilities.

### 8) API Credentials
- API key management with secure lifecycle practices.
- Generate key modal (scopes, expiration, IP restrictions, rate limits).
- One-time secret reveal flow with strong warnings.
- Key details view (usage, health indicators, logs).
- Rotation/revocation and security recommendation banner.

### 9) Activity Logs / Audit
- Timeline-centric logs view with severity and category labeling.
- Advanced filters (date, severity, category, actor).
- Log detail modal with structured payload data.
- Live log mode, retention policy, export configuration.

### 10) Settings
- General: profile, branding, appearance, localization.
- Security: session policy, password rules, 2FA, IP whitelist, sessions.
- API/Webhooks: base config, events, webhook secret, delivery tools.
- Notifications: email/in-app and channels.
- Future tabs: billing, team.
- Danger zone with strict confirmation flows.

## Security Requirements
- Strong random key generation for license/API credentials.
- Secret masking by default, explicit reveal UX for sensitive values.
- Role-based access for critical operations.
- Audit logging for admin/security actions.
- Optional IP restrictions and configurable session policies.
- Rotation reminders for stale keys.

## Developer Platform Requirements
- API-first design with clear docs and stable contracts.
- SDK coverage target: C++, C#, Python, plus additional common languages.
- Validation examples and quick-start snippets.
- Language SDKs must support license validation consistently.

## Data/Interaction Requirements
- Search and filter across major lists.
- Bulk actions for operational efficiency.
- Pagination controls (20/50/100).
- Export/import where relevant.
- Empty-state and onboarding hints for low-data environments.

## Non-Functional Requirements
- Responsive design (mobile/tablet/desktop).
- Performance-conscious rendering and animation.
- Accessibility-minded contrast and interaction states.
- Production readiness and maintainable modular architecture.

## Implementation Priority (High-Level)
1. Foundation: branding + design system + README baseline.
2. Core operational modules: Dashboard, License, User, Application.
3. Platform depth: Analytics, API credentials, Activity logs.
4. Business scale: Resellers, advanced security controls, future billing/team.
