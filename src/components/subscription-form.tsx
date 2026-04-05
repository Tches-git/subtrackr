import Link from "next/link";
import { createSubscription, updateSubscription } from "@/app/actions";

type SubscriptionFormData = {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  billingCycle: string;
  nextBillingDate: Date;
  trialEndsAt: Date | null;
  color: string | null;
  website: string | null;
  notes: string | null;
};

const billingCycles = [
  { label: "Monthly", value: "MONTHLY" },
  { label: "Yearly", value: "YEARLY" },
  { label: "Weekly", value: "WEEKLY" },
  { label: "Trial", value: "TRIAL" },
];

type Props = {
  mode: "create" | "edit";
  subscription?: SubscriptionFormData;
};

function toDateInput(value?: Date | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function SubscriptionForm({ mode, subscription }: Props) {
  const action = mode === "edit" ? updateSubscription : createSubscription;
  const title = mode === "edit" ? "Edit subscription" : "Add subscription";
  const description =
    mode === "edit"
      ? "Update an existing entry and keep the dashboard in sync."
      : "Create a real entry and watch the dashboard update from SQLite.";

  return (
    <form action={action} className="grid gap-4 rounded-3xl border border-white/70 bg-white p-6 shadow-sm">
      {mode === "edit" && subscription ? <input type="hidden" name="id" value={subscription.id} /> : null}

      <div>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-slate-600">
          Name
          <input name="name" required defaultValue={subscription?.name ?? ""} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-indigo-400" placeholder="Netflix" />
        </label>

        <label className="grid gap-2 text-sm text-slate-600">
          Category
          <input name="category" defaultValue={subscription?.category ?? ""} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-indigo-400" placeholder="Entertainment" />
        </label>

        <label className="grid gap-2 text-sm text-slate-600">
          Price
          <input name="price" type="number" step="0.01" min="0" required defaultValue={subscription?.price ?? ""} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-indigo-400" placeholder="9.99" />
        </label>

        <label className="grid gap-2 text-sm text-slate-600">
          Currency
          <input name="currency" defaultValue={subscription?.currency ?? "USD"} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-indigo-400" />
        </label>

        <label className="grid gap-2 text-sm text-slate-600">
          Billing cycle
          <select name="billingCycle" defaultValue={subscription?.billingCycle ?? "MONTHLY"} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-indigo-400">
            {billingCycles.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm text-slate-600">
          Next billing date
          <input name="nextBillingDate" type="date" required defaultValue={toDateInput(subscription?.nextBillingDate)} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-indigo-400" />
        </label>

        <label className="grid gap-2 text-sm text-slate-600">
          Trial ends at
          <input name="trialEndsAt" type="date" defaultValue={toDateInput(subscription?.trialEndsAt)} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-indigo-400" />
        </label>

        <label className="grid gap-2 text-sm text-slate-600">
          Brand color
          <input name="color" type="color" defaultValue={subscription?.color ?? "#6366f1"} className="h-12 rounded-2xl border border-slate-200 px-2 py-2 outline-none ring-0 focus:border-indigo-400" />
        </label>

        <label className="grid gap-2 text-sm text-slate-600">
          Website
          <input name="website" defaultValue={subscription?.website ?? ""} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-indigo-400" placeholder="https://example.com" />
        </label>
      </div>

      <label className="grid gap-2 text-sm text-slate-600">
        Notes
        <textarea name="notes" rows={3} defaultValue={subscription?.notes ?? ""} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-indigo-400" placeholder="Family plan, trial, student pricing..." />
      </label>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="inline-flex w-fit rounded-full bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-500">
          {mode === "edit" ? "Update subscription" : "Save subscription"}
        </button>
        {mode === "edit" ? (
          <Link href="/" className="inline-flex w-fit rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 hover:border-slate-300">
            Cancel
          </Link>
        ) : null}
      </div>
    </form>
  );
}
