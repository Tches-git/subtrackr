import Link from "next/link";
import { BellRing, CalendarClock, CreditCard, Sparkles, Wallet } from "lucide-react";
import { AddSubscriptionForm } from "@/components/add-subscription-form";
import { DeleteSubscriptionButton } from "@/components/delete-subscription-button";
import { prisma } from "@/lib/prisma";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
  }).format(date);
}

function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function getCycleLabel(cycle: string) {
  return cycle.charAt(0) + cycle.slice(1).toLowerCase();
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const selectedCategory = typeof params.category === "string" ? params.category : "all";

  const subscriptions = await prisma.subscription.findMany({
    where: selectedCategory === "all" ? undefined : { category: selectedCategory },
    orderBy: {
      nextBillingDate: "asc",
    },
  });

  const allCategoriesRaw = await prisma.subscription.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  const allCategories = allCategoriesRaw.map((item) => item.category);

  const activeSubscriptions = subscriptions.filter((item) => item.status === "ACTIVE");
  const monthlySpend = activeSubscriptions.reduce((sum, item) => {
    if (item.billingCycle === "YEARLY") return sum + item.price / 12;
    if (item.billingCycle === "WEEKLY") return sum + item.price * 4;
    return sum + item.price;
  }, 0);

  const now = new Date();
  const next7Days = new Date(now);
  next7Days.setDate(next7Days.getDate() + 7);
  const next30Days = new Date(now);
  next30Days.setDate(next30Days.getDate() + 30);

  const upcomingSubscriptions = activeSubscriptions.filter(
    (item) => item.nextBillingDate <= next30Days,
  );

  const upcoming7Days = activeSubscriptions.filter((item) => item.nextBillingDate <= next7Days);
  const trialsEndingSoon = subscriptions.filter(
    (item) => item.trialEndsAt && item.trialEndsAt <= next7Days,
  );

  const categoryMap = new Map<string, number>();
  for (const item of activeSubscriptions) {
    const current = categoryMap.get(item.category) ?? 0;
    categoryMap.set(item.category, current + item.price);
  }

  const categorySpend = [...categoryMap.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const topCategoryValue = categorySpend[0]?.value ?? 1;

  const reminders = [
    ...trialsEndingSoon.map((item) => ({
      id: `trial-${item.id}`,
      tone: "warning",
      text: `${item.name} trial ends on ${formatDate(item.trialEndsAt!)}`,
    })),
    ...upcoming7Days.map((item) => ({
      id: `renewal-${item.id}`,
      tone: "default",
      text: `${item.name} renews on ${formatDate(item.nextBillingDate)}`,
    })),
    ...activeSubscriptions
      .filter((item) => item.price >= 15)
      .slice(0, 2)
      .map((item) => ({
        id: `cost-${item.id}`,
        tone: "muted",
        text: `${item.name} is one of your higher-cost subscriptions at ${formatCurrency(item.price, item.currency)}.`,
      })),
  ].slice(0, 5);

  const stats = [
    {
      label: "Monthly spend",
      value: formatCurrency(monthlySpend),
      note: `${activeSubscriptions.length} active subscriptions tracked`,
      icon: Wallet,
    },
    {
      label: "Active subscriptions",
      value: String(activeSubscriptions.length),
      note: `${subscriptions.length - activeSubscriptions.length} inactive or canceled`,
      icon: CreditCard,
    },
    {
      label: "Next 30 days",
      value: `${upcomingSubscriptions.length} renewals`,
      note:
        upcomingSubscriptions[0] != null
          ? `Earliest on ${formatDate(upcomingSubscriptions[0].nextBillingDate)}`
          : "No renewals due soon",
      icon: CalendarClock,
    },
    {
      label: "Smart reminders",
      value: String(reminders.length),
      note: reminders[0]?.text ?? "No urgent reminders yet",
      icon: BellRing,
    },
  ];

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
              SubTrackr now reads from a real SQLite database, supports quick add/delete, and highlights the most urgent renewals and trial expirations.
            </p>
          </div>
        </div>

        <div className="grid min-w-[280px] gap-3 rounded-3xl bg-slate-950 p-5 text-white shadow-lg">
          <div className="text-sm text-slate-300">This month</div>
          <div className="text-4xl font-semibold">{formatCurrency(monthlySpend)}</div>
          <div className="rounded-2xl bg-white/10 p-4 text-sm text-slate-200">
            {upcomingSubscriptions.length} renewals and {trialsEndingSoon.length} urgent trial expirations within the next 30 days.
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

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="grid gap-6">
          <article className="rounded-3xl border border-white/70 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Subscriptions</h2>
                <p className="text-sm text-slate-500">Live data from your local SQLite-backed MVP.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href="/"
                  className={`rounded-full px-3 py-2 text-sm ${selectedCategory === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}
                >
                  All
                </Link>
                {allCategories.map((category) => (
                  <Link
                    key={category}
                    href={`/?category=${encodeURIComponent(category)}`}
                    className={`rounded-full px-3 py-2 text-sm ${selectedCategory === category ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {subscriptions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                  No subscriptions in this view yet. Add your first one to start tracking recurring costs.
                </div>
              ) : (
                subscriptions.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="h-11 w-11 rounded-2xl"
                          style={{ backgroundColor: item.color ?? "#6366f1" }}
                        />
                        <div>
                          <div className="font-medium text-slate-900">{item.name}</div>
                          <div className="text-sm text-slate-500">
                            {item.category} · {getCycleLabel(item.billingCycle)}
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-1 text-sm md:text-right">
                        <div className="font-medium text-slate-900">
                          {formatCurrency(item.price, item.currency)}
                        </div>
                        <div className="text-slate-500">
                          Next billing: {formatDate(item.nextBillingDate)}
                        </div>
                        <div className="text-xs font-medium text-amber-600">{item.status}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                      <div className="flex flex-wrap gap-3">
                        {item.trialEndsAt ? <span>Trial ends: {formatDate(item.trialEndsAt)}</span> : null}
                        {item.website ? <span>{item.website}</span> : null}
                      </div>
                      <DeleteSubscriptionButton id={item.id} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="rounded-3xl border border-white/70 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Upcoming reminders</h2>
            <div className="mt-4 space-y-3">
              {reminders.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                  No urgent reminders. Add more subscriptions or trial dates to populate this view.
                </div>
              ) : (
                reminders.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-2xl p-4 text-sm ${item.tone === "warning" ? "bg-amber-50 text-amber-800" : item.tone === "muted" ? "bg-slate-50 text-slate-700" : "bg-indigo-50 text-indigo-700"}`}
                  >
                    {item.text}
                  </div>
                ))
              )}
            </div>
          </article>
        </div>

        <div className="grid gap-6">
          <AddSubscriptionForm />

          <article className="rounded-3xl border border-white/70 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Spend by category</h2>
            <div className="mt-5 space-y-4">
              {categorySpend.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                  Category insights will appear after you add subscriptions.
                </div>
              ) : (
                categorySpend.map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>{item.label}</span>
                      <span>{formatCurrency(item.value)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-indigo-500"
                        style={{ width: `${Math.max((item.value / topCategoryValue) * 100, 8)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
