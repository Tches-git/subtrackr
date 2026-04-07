# Changelog

## 0.1.0 - MVP demo-ready release

### Summary
SubTrackr has been advanced from an early CRUD prototype into a demo-ready subscription tracking MVP with a cleaner product surface, improved filtering, reminder workflows, better billing estimates, and delivery documentation.

### Delivered
#### Core product flows
- Added and refined subscription create / edit / delete flows
- Connected the dashboard to live Prisma + SQLite data
- Added reminder center for near-term renewals and trial expirations
- Added JSON import and JSON / CSV export support

#### Search and filtering
- Added keyword search across name, category, notes, and website
- Added category, status, and sorting controls
- Added quick views for common scenarios:
  - All subscriptions
  - Renewing soon
  - High cost
  - Trials ending
  - Paused
- Added active filter summary and clear actions

#### Form UX
- Added visible error feedback for subscription forms
- Added visible error feedback for JSON import
- Replaced generic input failure behavior with user-readable messages

#### Dashboard and reminders UX
- Added dashboard insight cards
- Added reminder summaries and projected 30-day charges
- Unified card, filter pill, badge, and empty-state styling across pages

#### Data quality improvements
- Added more realistic monthly and annual spend estimation
- Added projected 30-day charge estimation using billing cadence
- Improved handling for weekly / yearly / custom / trial billing semantics

#### Project cleanup
- Removed unused `add-subscription-form.tsx`
- Removed unused direct dependencies:
  - `@hookform/resolvers`
  - `react-hook-form`
  - `zod`
  - `recharts`
  - `clsx`
  - `tailwind-merge`
  - `date-fns`
- Refreshed lockfile after dependency cleanup

#### Documentation
- Rewrote README to reflect the actual MVP
- Added setup steps, demo walkthrough, product boundaries, and next-step roadmap

### Validation
- `npm install` passed
- `npm run build` passed
- `npm run lint` passed

### Current release position
SubTrackr is now at a presentable MVP milestone:
- buildable
- lint-clean
- demo-friendly
- suitable for continued iteration

### Known boundaries
This release is still intentionally lightweight:
- no authentication or multi-user accounts
- no real reminder delivery
- no billing history ledger
- no exact recurring engine by calendar semantics
- no full multi-currency normalization

### Recommended next phase
- renewal history and spend trends
- stronger validation persistence and richer edit flows
- calendar sync / reminder delivery
- portfolio screenshots and release assets
