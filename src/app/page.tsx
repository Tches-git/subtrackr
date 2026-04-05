import { BellRing, CalendarClock, CreditCard, Sparkles, Wallet } from "lucide-react";

const subscriptions = [
  {
    name: "Netflix",
    category: "Entertainment",
    price: 15.99,
    cycle: "Monthly",
    nextBilling: "Apr 08",
    status: "Active",
    color: "bg-rose-500",
  },
  {
    name: "Spotify",
    category: "Music",
    price: 9.99,
    cycle: "Monthly",
    nextBilling: "Apr 12",
    status: "Active",
    color: "bg-emerald-500",
  },
  {
    name: "Notion AI",
    category: "Productivity",
    price: 10,
    cycle: "Monthly",
    nextBilling: "Apr 15",
    status: "Trial ending",
    color: "bg-zinc-900",
  },
  {
    name: "iCloud+",
    category: "Cloud",
    price: 2.99,
    cycle: "Monthly",
    nextBilling: "Apr 18",
    status: "Active",
    color: "bg-sky-500",
  },
];

const upcoming = [
  "Notion AI trial ends in 3 days",
  "Netflix renews this week",
  "2 subscriptions cost more than $10/month",
];

const categorySpend = [
  { label: "Entertainment", value: 15.99, width: "76%" },
  { label: "Productivity", value: 10, width: "48%" },
  { label: "Music", value: 9.99, width: "47%" },
  { label: "Cloud", value: 2.99, width: "14%" },
];

const stats = [
  {
    label: "Monthly spend",
    value: "$38.97",
    note: "+$10 trial risk this month",
    icon: Wallet,
  },
  {
    label: "Active subscriptions",
    value: "4",
    note: "1 trial needs attention",
    icon: CreditCard,
  },
  {
    label: "Next 30 days",
    value: "3 renewals",
    note: "Earliest on Apr 08",
    icon: CalendarClock,
  },
  {
    label: "Smart reminders",
    value: "3",
    note: "Potential savings highlighted",
    icon: BellRing,
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-10 lg:px-10">
      <section className="mb-8 flex flex-col gap-6 rounded-[32px] border border-white/60 bg-white/80 p-8 shadow-[0_20px_80px_rgba(79,70,229,0.10)] backdrop-blur md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
            <Sparkles className="h-4 w-4" />
            Everyday subscription clarity
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
              Stop forgetting renewals. Start understanding your recurring spend.
            </h1>
            <p className="max-w-xl text-base leading-7 text-slate-600 md:text-lg">
              SubTrackr helps you track subscriptions, spot upcoming charges, and cut unused services before they drain your budget.
            </p>
          </div>
        </div>

        <div className="grid min-w-[280px] gap-3 rounded-3xl bg-slate-950 p-5 text-white shadow-lg">
          <div className="text-sm text-slate-300">This month</div>
          <div className="text-4xl font-semibold">$38.97</div>
          <div className="rounded-2xl bg-white/10 p-4 text-sm text-slate-200">
            3 renewals and 1 trial expiration in the next 30 days.
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.label}
              className="rounded-3xl border border-white/70 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-sm text-slate-500">{item.label}</div>
              <div className="mt-1 text-3xl font-semibold text-slate-900">{item.value}</div>
              <div className="mt-2 text-sm text-slate-500">{item.note}</div>
            </article>
          );
        })}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <article className="rounded-3xl border border-white/70 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Subscriptions</h2>
              <p className="text-sm text-slate-500">A practical MVP snapshot of tracked recurring costs.</p>
            </div>
            <button className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
              Add subscription
            </button>
          </div>

          <div className="space-y-3">
            {subscriptions.map((item) => (
              <div
                key={item.name}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-11 w-11 rounded-2xl ${item.color}`} />
                  <div>
                    <div className="font-medium text-slate-900">{item.name}</div>
                    <div className="text-sm text-slate-500">
                      {item.category} · {item.cycle}
                    </div>
                  </div>
                </div>

                <div className="grid gap-1 text-sm md:text-right">
                  <div className="font-medium text-slate-900">${item.price.toFixed(2)}</div>
                  <div className="text-slate-500">Next billing: {item.nextBilling}</div>
                  <div className="text-xs font-medium text-amber-600">{item.status}</div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <div className="grid gap-6">
          <article className="rounded-3xl border border-white/70 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Upcoming reminders</h2>
            <div className="mt-4 space-y-3">
              {upcoming.map((item) => (
                <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-white/70 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Spend by category</h2>
            <div className="mt-5 space-y-4">
              {categorySpend.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>{item.label}</span>
                    <span>${item.value.toFixed(2)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-indigo-500" style={{ width: item.width }} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
