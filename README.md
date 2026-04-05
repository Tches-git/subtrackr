# SubTrackr

A practical subscription tracker for everyday users. Track recurring payments, spot upcoming renewals, and understand your monthly spending at a glance.

## Current MVP direction
- Dashboard-first experience
- Live subscription list backed by SQLite
- Upcoming reminders
- Category spend overview
- Add subscription form with server action
- Prisma + SQLite data layer

## Tech stack
- Next.js 16
- TypeScript
- Tailwind CSS
- Prisma 7 + SQLite adapter
- SQLite

## Local development
```bash
npm install
npx prisma migrate dev --name init
npm run dev
```

## Roadmap
- Real subscription CRUD
- Reminder center
- CSV/JSON import/export
- Trial expiration nudges
- Annualized spend insights
