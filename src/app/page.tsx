import Link from "next/link";
import { SubscriptionStatus } from "@/generated/prisma/client";
import { BellRing, CalendarClock, CreditCard, Search, Sparkles, Wallet, X } from "lucide-react";
import { DeleteSubscriptionButton } from "@/components/delete-subscription-button";
import { EditSubscriptionLink } from "@/components/edit-subscription-link";
import { ImportSubscriptionsForm } from "@/components/import-subscriptions-form";
import { SubscriptionForm } from "@/components/subscription-form";
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

function getMessageLabel(
  message: string | undefined,
  imported?: string,
  skipped?: string,
) {
  if (message === "created") return "Subscription created successfully.";
  if (message === "updated") return "Subscription updated successfully.";
  if (message === "deleted") return "Subscription deleted successfully.";
  if (message === "delete-error-missing-id") {
    return "Delete failed because the subscription id was missing.";
  }
  if (message === "imported") {
    const importedCount = Number(imported ?? 0);
    const skippedCount = Number(skipped ?? 0);
    return `Import complete: ${importedCount} added, ${skippedCount} skipped.`;
  }
  return null;
}

function getStatusBadgeClass(status: string) {
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

function getMonthlyEquivalent(price: number, cycle: string, interval = 1) {
  if (cycle === "TRIAL") return 0;
  const intervalDays = getIntervalDays(cycle, interval);
  return price * (30 / intervalDays);
}

function getAnnualEquivalent(price: number, cycle: string, interval = 1) {
  if (cycle === "TRIAL") return 0;
  const intervalDays = getIntervalDays(cycle, interval);
  return price * (365 / intervalDays);
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

function buildDashboardQuery(params: {
  category?: string;
  status?: string;
  sort?: string;
  q?: string;
  view?: string;
}) {
  const search = new URLSearchParams();

  if (params.category && params.category !== "all") {
    search.set("category", params.category);
  }

  if (params.status && params.status !== "all") {
    search.set("status", params.status);
  }

  if (params.sort && params.sort !== "nextBilling") {
    search.set("sort", params.sort);
  }

  if (params.q && params.q.trim()) {
    search.set("q", params.q.trim());
  }

  if (params.view && params.view !== "custom") {
    search.set("view", params.view);
  }

  const query = search.toString();
  return query ? `/?${query}` : "/";
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const selectedCategory = typeof params.category === "string" ? params.category : "all";
  const selectedStatusParam = typeof params.status === "string" ? params.status : "all";
  const selectedSort = typeof params.sort === "string" ? params.sort : "nextBilling";
  const searchQuery = typeof params.q === "string" ? params.q.trim() : "";
  const selectedView = typeof params.view === "string" ? params.view : "custom";
  const selectedStatus =
    selectedStatusParam === "ACTIVE" ||
    selectedStatusParam === "PAUSED" ||
    selectedStatusParam === "CANCELED"
      ? selectedStatusParam
      : "all";
  const editId = typeof params.edit === "string" ? params.edit : undefined;
  const messageKey = typeof params.message === "string" ? params.message : undefined;
  const importedCount = typeof params.imported === "string" ? params.imported : undefined;
  const skippedCount = typeof params.skipped === "string" ? params.skipped : undefined;
  const messageLabel = getMessageLabel(messageKey, importedCount, skippedCount);

  const now = new Date();
  const next7Days = new Date(now);
  next7Days.setDate(next7Days.getDate() + 7);
  const next30Days = new Date(now);
  next30Days.setDate(next30Days.getDate() + 30);

  const where = {
    ...(selectedCategory === "all" ? {} : { category: selectedCategory }),
    ...(selectedStatus === "all" ? {} : { status: selectedStatus as SubscriptionStatus }),
    ...(searchQuery
      ? {
          OR: [
            { name: { contains: searchQuery } },
            { category: { contains: searchQuery } },
            { website: { contains: searchQuery } },
            { notes: { contains: searchQuery } },
          ],
        }
      : {}),
    ...(selectedView === "renewing-soon"
      ? {
          status: SubscriptionStatus.ACTIVE,
          nextBillingDate: {
            lte: next7Days,
          },
        }
      : {}),
    ...(selectedView === "high-cost"
      ? {
          status: SubscriptionStatus.ACTIVE,
          price: {
            gte: 15,
          },
        }
      : {}),
    ...(selectedView === "trials"
      ? {
          trialEndsAt: {
            not: null,
            lte: next7Days,
          },
        }
      : {}),
    ...(selectedView === "paused"
      ? {
          status: SubscriptionStatus.PAUSED,
        }
      : {}),
  };

  const subscriptions = await prisma.subscription.findMany({
    where,
    orderBy:
      selectedSort === "priceDesc"
        ? { price: "desc" }
        : selectedSort === "priceAsc"
          ? { price: "asc" }
          : selectedSort === "name"
            ? { name: "asc" }
            : { nextBillingDate: "asc" },
  });

  const allCategoriesRaw = await prisma.subscription.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  const allCategories = allCategoriesRaw.map((item) => item.category);

  const editingSubscription = editId
    ? await prisma.subscription.findUnique({ where: { id: editId } })
    : null;

  const activeSubscriptions = subscriptions.filter((item) => item.status === "ACTIVE");
  const pausedSubscriptions = subscriptions.filter((item) => item.status === "PAUSED");
  const canceledSubscriptions = subscriptions.filter((item) => item.status === "CANCELED");
  const monthlySpend = activeSubscriptions.reduce(
    (sum, item) => sum + getMonthlyEquivalent(item.price, item.billingCycle, item.billingInterval),
    0,
  );
  const annualSpend = activeSubscriptions.reduce(
    (sum, item) => sum + getAnnualEquivalent(item.price, item.billingCycle, item.billingInterval),
    0,
  );

  const upcomingSubscriptions = activeSubscriptions.filter(
    (item) => item.nextBillingDate <= next30Days,
  );

  const upcomingSpend = upcomingSubscriptions.reduce(
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
  const highestCostSubscription = [...activeSubscriptions].sort((a, b) => b.price - a.price)[0] ?? null;
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

  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedStatus !== "all" ||
    selectedSort !== "nextBilling" ||
    Boolean(searchQuery) ||
    selectedView !== "custom";

  const quickViews = [
    {
      label: "All subscriptions",
      value: "custom",
      href: buildDashboardQuery({
        category: selectedCategory,
        status: selectedStatus,
        sort: selectedSort,
        q: searchQuery,
      }),
      note: "Current dashboard view",
    },
    {
      label: "Renewing soon",
      value: "renewing-soon",
      href: buildDashboardQuery({
        category: selectedCategory,
        sort: selectedSort,
        q: searchQuery,
        view: "renewing-soon",
      }),
      note: "Active subscriptions due within 7 days",
    },
    {
      label: "High cost",
      value: "high-cost",
      href: buildDashboardQuery({
        category: selectedCategory,
        sort: selectedSort,
        q: searchQuery,
        view: "high-cost",
      }),
      note: "Active subscriptions priced at 15+",
    },
    {
      label: "Trials ending",
      value: "trials",
      href: buildDashboardQuery({
        category: selectedCategory,
        sort: selectedSort,
        q: searchQuery,
        view: "trials",
      }),
      note: "Trial expirations within 7 days",
    },
    {
      label: "Paused",
      value: "paused",
      href: buildDashboardQuery({
        category: selectedCategory,
        sort: selectedSort,
        q: searchQuery,
        view: "paused",
      }),
      note: "Subscriptions you paused",
    },
  ];

  const stats = [
    {
      label: "Monthly spend",
      value: formatCurrency(monthlySpend),
      note: `${activeSubscriptions.length} active subscriptions tracked`,
      icon: Wallet,
    },
    {
      label: "Annualized spend",
      value: formatCurrency(annualSpend),
      note: "Estimated based on current billing cycles",
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

  const insights = [
    {
      label: "Highest active cost",
      value: highestCostSubscription
        ? formatCurrency(highestCostSubscription.price, highestCostSubscription.currency)
        : "$0.00",
      note: highestCostSubscription
        ? `${highestCostSubscription.name} is currently your priciest active subscription`
        : "Add active subscriptions to surface this insight",
    },
    {
      label: "Upcoming 30-day charges",
      value: formatCurrency(upcomingSpend),
      note:
        upcomingSubscriptions.length > 0
          ? `${upcomingSubscriptions.length} active subscriptions are expected to bill within 30 days, including repeat weekly/custom charges`
          : "No active renewals are due in the next 30 days",
    },
    {
      label: "Trial risk",
      value: `${trialsEndingSoon.length} ending soon`,
      note:
        trialsEndingSoon[0] != null
          ? `${trialsEndingSoon[0].name} is the next trial to expire`
          : "No trial expirations are currently urgent",
    },
    {
      label: "Paused / canceled",
      value: `${pausedSubscriptions.length} / ${canceledSubscriptions.length}`,
      note: "Paused vs canceled subscriptions in the current view",
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
              SubTrackr now reads from a real SQLite database, supports quick add/edit/delete, and highlights the most urgent renewals and trial expirations.
            </p>
          </div>
          {messageLabel ? (
            <div className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
              {messageLabel}
            </div>
          ) : null}
        </div>

        <div className="grid min-w-[280px] gap-3 rounded-3xl bg-slate-950 p-5 text-white shadow-lg">
          <div className="text-sm text-slate-300">This month</div>
          <div className="text-4xl font-semibold">{formatCurrency(monthlySpend)}</div>
          <div className="rounded-2xl bg-white/10 p-4 text-sm text-slate-200">
            {upcomingSubscriptions.length} renewals and {trialsEndingSoon.length} urgent trial expirations within the next 30 days.
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.label}
              className="surface-card p-5"
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
          <article className="surface-card p-6">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Subscriptions</h2>
                <p className="text-sm text-slate-500">Live data from your local SQLite-backed MVP.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href="/reminders" className="rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:border-slate-300">
                    Open reminder center
                  </Link>
                  <Link href="/api/export?format=json" className="rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:border-slate-300">
                    Export JSON
                  </Link>
                  <Link href="/api/export?format=csv" className="rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:border-slate-300">
                    Export CSV
                  </Link>
                </div>
              </div>

              <div className="text-sm text-slate-500 md:text-right">
                Showing <span className="font-medium text-slate-900">{subscriptions.length}</span> matching subscriptions
              </div>
            </div>

            <div className="soft-panel mb-5 grid gap-4 p-4">
              <div className="grid gap-3">
                <div>
                  <div className="text-sm font-medium text-slate-700">Quick views</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {quickViews.map((view) => (
                      <Link
                        key={view.value}
                        href={view.href}
                        className={`rounded-full px-3 py-2 text-sm ${selectedView === view.value ? "bg-slate-900 text-white" : "filter-pill"}`}
                        title={view.note}
                      >
                        {view.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <form action="/" className="flex flex-col gap-3 md:flex-row md:items-center">
                  <input type="hidden" name="category" value={selectedCategory} />
                  <input type="hidden" name="status" value={selectedStatus} />
                  <input type="hidden" name="sort" value={selectedSort} />
                  {selectedView !== "custom" ? <input type="hidden" name="view" value={selectedView} /> : null}
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="search"
                      name="q"
                      defaultValue={searchQuery}
                      placeholder="Search by name, category, notes, or website"
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none ring-0 focus:border-indigo-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
                  >
                    Search
                  </button>
                  {searchQuery ? (
                    <Link
                      href={buildDashboardQuery({
                        category: selectedCategory,
                        status: selectedStatus,
                        sort: selectedSort,
                        view: selectedView,
                      })}
                      className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 hover:border-slate-300"
                    >
                      Clear search
                    </Link>
                  ) : null}
                </form>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-medium text-slate-700">Active filters:</span>
                {selectedView !== "custom" ? <span className="filter-pill px-3 py-1">View: {selectedView}</span> : null}
                {searchQuery ? <span className="filter-pill px-3 py-1">Search: {searchQuery}</span> : null}
                {selectedCategory !== "all" ? <span className="filter-pill px-3 py-1">Category: {selectedCategory}</span> : null}
                {selectedStatus !== "all" ? <span className="filter-pill px-3 py-1">Status: {selectedStatus}</span> : null}
                {selectedSort !== "nextBilling" ? <span className="filter-pill px-3 py-1">Sort: {selectedSort}</span> : null}
                {!hasActiveFilters ? <span className="filter-pill px-3 py-1">None</span> : null}
                {hasActiveFilters ? (
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 hover:border-slate-300"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear all
                  </Link>
                ) : null}
              </div>

              <div className="grid gap-3">
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Next billing", value: "nextBilling" },
                    { label: "Price ↑", value: "priceAsc" },
                    { label: "Price ↓", value: "priceDesc" },
                    { label: "Name", value: "name" },
                  ].map((sort) => (
                    <Link
                      key={sort.value}
                      href={buildDashboardQuery({
                        category: selectedCategory,
                        status: selectedStatus,
                        sort: sort.value,
                        q: searchQuery,
                        view: selectedView,
                      })}
                      className={`rounded-full px-3 py-2 text-sm ${selectedSort === sort.value ? "bg-slate-900 text-white" : "filter-pill"}`}
                    >
                      {sort.label}
                    </Link>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={buildDashboardQuery({
                      status: selectedStatus,
                      sort: selectedSort,
                      q: searchQuery,
                      view: selectedView,
                    })}
                    className={`rounded-full px-3 py-2 text-sm ${selectedCategory === "all" ? "bg-slate-900 text-white" : "filter-pill"}`}
                  >
                    All categories
                  </Link>
                  {allCategories.map((category) => (
                    <Link
                      key={category}
                      href={buildDashboardQuery({
                        category,
                        status: selectedStatus,
                        sort: selectedSort,
                        q: searchQuery,
                        view: selectedView,
                      })}
                      className={`rounded-full px-3 py-2 text-sm ${selectedCategory === category ? "bg-slate-900 text-white" : "filter-pill"}`}
                    >
                      {category}
                    </Link>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "All statuses", value: "all" },
                    { label: "Active", value: "ACTIVE" },
                    { label: "Paused", value: "PAUSED" },
                    { label: "Canceled", value: "CANCELED" },
                  ].map((status) => (
                    <Link
                      key={status.value}
                      href={buildDashboardQuery({
                        category: selectedCategory,
                        status: status.value,
                        sort: selectedSort,
                        q: searchQuery,
                        view: selectedView,
                      })}
                      className={`rounded-full px-3 py-2 text-sm ${selectedStatus === status.value ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-700"}`}
                    >
                      {status.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {subscriptions.length === 0 ? (
                <div className="empty-state p-6 text-sm text-slate-500">
                  No subscriptions match the current search and filter combination.
                  <div className="mt-2 text-slate-400">
                    Try clearing filters, changing your keyword, or add a new subscription to expand the dataset.
                  </div>
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
                        <div className={getStatusBadgeClass(item.status)}>
                          {item.status}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                      <div className="flex flex-wrap gap-3">
                        {item.trialEndsAt ? <span>Trial ends: {formatDate(item.trialEndsAt)}</span> : null}
                        {item.website ? <span>{item.website}</span> : null}
                        {item.notes ? <span className="max-w-[280px] truncate">{item.notes}</span> : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <EditSubscriptionLink id={item.id} />
                        <DeleteSubscriptionButton id={item.id} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="surface-card p-6">
            <h2 className="text-xl font-semibold text-slate-900">Upcoming reminders</h2>
            <div className="mt-4 space-y-3">
              {reminders.length === 0 ? (
                <div className="soft-panel p-4 text-sm text-slate-700">
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

          <article className="surface-card p-6">
            <h2 className="text-xl font-semibold text-slate-900">Insights snapshot</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {insights.map((item) => (
                <div key={item.label} className="soft-panel p-4">
                  <div className="text-sm text-slate-500">{item.label}</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</div>
                  <div className="mt-2 text-sm text-slate-500">{item.note}</div>
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="grid gap-6">
          <SubscriptionForm
            mode={editingSubscription ? "edit" : "create"}
            subscription={editingSubscription ?? undefined}
            message={messageKey}
          />

          <ImportSubscriptionsForm message={messageKey} />

          <article className="surface-card p-6">
            <h2 className="text-xl font-semibold text-slate-900">Spend by category</h2>
            <div className="mt-5 space-y-4">
              {categorySpend.length === 0 ? (
                <div className="soft-panel p-4 text-sm text-slate-700">
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
