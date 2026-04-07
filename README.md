# SubTrackr

A practical subscription tracker for everyday users. SubTrackr helps people track recurring payments, spot renewals before they happen, and understand recurring spend without digging through banking apps.

## Product snapshot
SubTrackr is currently a dashboard-first MVP with a local SQLite data store. It is designed to feel demo-ready while staying simple to run and extend.

### What the current MVP includes
- Dashboard-first subscription management
- Live subscription list backed by Prisma + SQLite
- Add / edit / delete subscription flow
- Search across name, category, notes, and website
- Category, status, sorting, and quick-view filters
- Reminder center for trials and upcoming renewals
- JSON import with duplicate skipping
- JSON / CSV export endpoints
- Spend by category visualization
- Insight cards for monthly spend, annualized spend, upcoming charges, trial risk, and paused/canceled overview
- Basic user-visible form error feedback
- More realistic billing math for monthly / annual / projected 30-day charge estimates

## Tech stack
- Next.js 16
- TypeScript
- Tailwind CSS 4
- Prisma 7 + SQLite adapter
- SQLite

## Local development
### 1. Install dependencies
```bash
npm install
```

### 2. Generate Prisma client
```bash
npm run db:generate
```

### 3. Apply database migration
```bash
npm run db:migrate -- --name init
```

### 4. Seed demo data (optional but recommended)
```bash
npm run db:seed
```

### 5. Start the app
```bash
npm run dev
```

Open <http://localhost:3000>

## Useful scripts
```bash
npm run dev
npm run build
npm run start
npm run lint
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Demo walkthrough
If you want to show the current MVP quickly, use this flow:

1. Open the dashboard
   - Review the top summary cards
   - Show current monthly spend, annualized spend, active subscriptions, and reminders

2. Show filtering and search
   - Try a quick view like `Renewing soon` or `High cost`
   - Search for a category, service name, or note keyword
   - Clear the filters to show the dashboard returning to the default state

3. Add or edit a subscription
   - Create a new subscription with a future billing date
   - Change its status to `Paused` or `Canceled`
   - Reopen the dashboard to show the list and insights updating

4. Open the reminder center
   - Show urgent trials
   - Show renewals in the next 7 days
   - Show projected 30-day charges

5. Demo import/export
   - Export current data as JSON or CSV
   - Paste JSON into the import form
   - Show duplicate skipping and feedback

## Data model notes
Each subscription currently stores:
- Name
- Category
- Price
- Currency
- Billing cycle
- Billing interval
- Status
- Next billing date
- Trial end date
- Website
- Notes
- Brand color

## Current calculation behavior
SubTrackr currently uses practical estimation logic for recurring billing:
- `MONTHLY`, `WEEKLY`, `YEARLY`, and `CUSTOM` contribute to monthly / annual estimates
- `TRIAL` does not count toward recurring spend estimates
- Future 30-day charge projection estimates repeated charges for weekly and custom cadences when they fall inside the next 30 days

This is intentionally useful, but not yet a full billing engine.

## Current MVP boundaries
The app is intentionally lightweight. It does **not** yet include:
- Authentication or multi-user accounts
- Real bank/card integrations
- Push/email reminder delivery
- Historical billing ledger
- Full recurring schedule generation by exact calendar semantics
- Robust multi-currency normalization and FX conversion

## Suggested next steps
- Renewal history and spend trend views
- Calendar sync or reminder delivery integrations
- Stronger validation with field-level persistence
- Better support for custom cadence semantics
- Multi-currency reporting
- Polished screenshots / landing assets for portfolio presentation

## Status
Current state: buildable, lint-clean, SQLite-backed MVP suitable for demos and further iteration.
