import Link from "next/link";
import { SubscriptionStatus } from "@/generated/prisma/client";
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

function getStatusBadgeClass(status: SubscriptionStatus) {
  if (status === "ACTIVE") return "status-badge status-badge-active";
  if (status === "PAUSED") return "status-badge status-badge-paused";
  return "status-badge status-badge-canceled";
}

function getIntervalDays(cycle: string, interval = 1) {
  const safeInterval = Math.max(interval || 1, 1);
  if (cycle === "WEEKLY") return 7 * safeInterval;
  if (cycle === "YEARLY") return 365 * safeInterval;
  if (cycle === "CUSTOM") return 30 * safeInterval;
  return 30 * safeInterval;
}

function getProjectedChargesWithinWindow(
  price: number,
  cycle: string,
  nextBillingDate: Date,
  windowEnd: Date,
  interval = 1,
) {
  if (cycle === "TRIAL" || nextBillingDate > windowEnd) {
    return 0;
  }

  const intervalDays = getIntervalDays(cycle, interval);
  const diffMs = windowEnd.getTime() - nextBillingDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const occurrences = Math.floor(diffDays / intervalDays) + 1;
  return price * Math.max(occurrences, 0);
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

  const activeSubscriptions = subscriptions.filter((item) => item.status === "ACTIVE");
  const urgentTrials = activeSubscriptions.filter(
    (item) => item.trialEndsAt && item.trialEndsAt <= next7Days,
  );
  const urgentRenewals = activeSubscriptions.filter((item) => item.nextBillingDate <= next7Days);
  const upcomingRenewals = activeSubscriptions.filter(
    (item) => item.nextBillingDate > next7Days && item.nextBillingDate <= next30Days,
  );
  const projected30DayCharges = activeSubscriptions.reduce(
    (sum, item) =>
      sum +
      getProjectedChargesWithinWindow(
        item.price,
        item.billingCycle,
        item.nextBillingDate,
        next30Days,
        item.billingInterval,
      ),
    0,
  );

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-10 lg:px-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Reminder center</h1>
          <p className="mt-2 text-slate-600">
            Review urgent trials, near-term renewals, and upcoming recurring charges in one place.
          </p>
        </div>
        <Link href="/" className="filter-pill px-4 py-2 text-sm font-medium hover:border-slate-300">
          Back to dashboard
        </Link>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <article className="surface-card p-5">
          <div className="text-sm text-slate-500">Urgent trials</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">{urgentTrials.length}</div>
          <div className="mt-2 text-sm text-slate-500">Trials ending within 7 days</div>
        </article>
        <article className="surface-card p-5">
          <div className="text-sm text-slate-500">Renewing soon</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">{urgentRenewals.length}</div>
          <div className="mt-2 text-sm text-slate-500">Active subscriptions due within 7 days</div>
        </article>
        <article className="surface-card p-5">
          <div className="text-sm text-slate-500">Upcoming 30 days</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">{upcomingRenewals.length}</div>
          <div className="mt-2 text-sm text-slate-500">Additional active renewals after the urgent window</div>
        </article>
        <article className="surface-card p-5 md:col-span-3">
          <div className="text-sm text-slate-500">Projected 30-day charges</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">{formatCurrency(projected30DayCharges)}</div>
          <div className="mt-2 text-sm text-slate-500">Estimated using billing cycle cadence, including repeated weekly/custom charges.</div>
        </article>
      </div>

      <div className="grid gap-6">
        <section className="surface-card p-6">
          <h2 className="text-xl font-semibold text-slate-900">Urgent trial expirations</h2>
          <div className="mt-4 space-y-3">
            {urgentTrials.length === 0 ? (
              <div className="empty-state p-4 text-sm text-slate-600">No trial expirations in the next 7 days.</div>
            ) : (
              urgentTrials.map((item) => (
                <div key={item.id} className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-100">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="mt-1">Trial ends on {formatDate(item.trialEndsAt!)}</div>
                    </div>
                    <span className={getStatusBadgeClass(item.status)}>{item.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="surface-card p-6">
          <h2 className="text-xl font-semibold text-slate-900">Renewing in the next 7 days</h2>
          <div className="mt-4 space-y-3">
            {urgentRenewals.length === 0 ? (
              <div className="empty-state p-4 text-sm text-slate-600">No renewals due in the next 7 days.</div>
            ) : (
              urgentRenewals.map((item) => (
                <div key={item.id} className="rounded-2xl bg-indigo-50 p-4 text-sm text-indigo-900 ring-1 ring-indigo-100">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="mt-1">
                        Renews on {formatDate(item.nextBillingDate)} · {formatCurrency(item.price, item.currency)}
                      </div>
                    </div>
                    <span className={getStatusBadgeClass(item.status)}>{item.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="surface-card p-6">
          <h2 className="text-xl font-semibold text-slate-900">Upcoming in 30 days</h2>
          <div className="mt-4 space-y-3">
            {upcomingRenewals.length === 0 ? (
              <div className="empty-state p-4 text-sm text-slate-600">No additional renewals in the next 30 days.</div>
            ) : (
              upcomingRenewals.map((item) => (
                <div key={item.id} className="soft-panel p-4 text-sm text-slate-700">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-slate-900">{item.name}</div>
                      <div className="mt-1">
                        Renews on {formatDate(item.nextBillingDate)} · {formatCurrency(item.price, item.currency)}
                      </div>
                    </div>
                    <span className={getStatusBadgeClass(item.status)}>{item.status}</span>
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
