import Link from "next/link";
import { prisma } from "@/lib/prisma";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export default async function RemindersPage() {
  const subscriptions = await prisma.subscription.findMany({
    orderBy: { nextBillingDate: "asc" },
  });

  const now = new Date();
  const next7Days = new Date(now);
  next7Days.setDate(next7Days.getDate() + 7);
  const next30Days = new Date(now);
  next30Days.setDate(next30Days.getDate() + 30);

  const urgentTrials = subscriptions.filter((item) => item.trialEndsAt && item.trialEndsAt <= next7Days);
  const urgentRenewals = subscriptions.filter((item) => item.nextBillingDate <= next7Days);
  const upcomingRenewals = subscriptions.filter(
    (item) => item.nextBillingDate > next7Days && item.nextBillingDate <= next30Days,
  );

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-10 lg:px-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Reminder center</h1>
          <p className="mt-2 text-slate-600">
            Review urgent trials, near-term renewals, and upcoming recurring charges in one place.
          </p>
        </div>
        <Link href="/" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-300">
          Back to dashboard
        </Link>
      </div>

      <div className="grid gap-6">
        <section className="rounded-3xl border border-white/70 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Urgent trial expirations</h2>
          <div className="mt-4 space-y-3">
            {urgentTrials.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No trial expirations in the next 7 days.</div>
            ) : (
              urgentTrials.map((item) => (
                <div key={item.id} className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
                  <div className="font-medium">{item.name}</div>
                  <div>Trial ends on {formatDate(item.trialEndsAt!)}</div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-white/70 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Renewing in the next 7 days</h2>
          <div className="mt-4 space-y-3">
            {urgentRenewals.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No renewals due in the next 7 days.</div>
            ) : (
              urgentRenewals.map((item) => (
                <div key={item.id} className="rounded-2xl bg-indigo-50 p-4 text-sm text-indigo-900">
                  <div className="font-medium">{item.name}</div>
                  <div>
                    Renews on {formatDate(item.nextBillingDate)} · {formatCurrency(item.price, item.currency)}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-white/70 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Upcoming in 30 days</h2>
          <div className="mt-4 space-y-3">
            {upcomingRenewals.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No additional renewals in the next 30 days.</div>
            ) : (
              upcomingRenewals.map((item) => (
                <div key={item.id} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                  <div className="font-medium text-slate-900">{item.name}</div>
                  <div>
                    Renews on {formatDate(item.nextBillingDate)} · {formatCurrency(item.price, item.currency)}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
