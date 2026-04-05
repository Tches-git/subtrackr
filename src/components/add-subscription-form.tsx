import { createSubscription } from "@/app/actions";

const billingCycles = [
  { label: "Monthly", value: "MONTHLY" },
  { label: "Yearly", value: "YEARLY" },
  { label: "Weekly", value: "WEEKLY" },
  { label: "Trial", value: "TRIAL" },
];

export function AddSubscriptionForm() {
  return (
    <form action={createSubscription} className="grid gap-4 rounded-3xl border border-white/70 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Add subscription</h2>
        <p className="mt-1 text-sm text-slate-500">Create a real entry and watch the dashboard update from SQLite.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-slate-600">
          Name
          <input name="name" required className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-indigo-400" placeholder="Netflix" />
        </label>

        <label className="grid gap-2 text-sm text-slate-600">
          Category
          <input name="category" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-indigo-400" placeholder="Entertainment" />
        </label>

        <label className="grid gap-2 text-sm text-slate-600">
          Price
          <input name="price" type="number" step="0.01" min="0" required className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-indigo-400" placeholder="9.99" />
        </label>

        <label className="grid gap-2 text-sm text-slate-600">
          Currency
          <input name="currency" defaultValue="USD" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-indigo-400" />
        </label>

        <label className="grid gap-2 text-sm text-slate-600">
          Billing cycle
          <select name="billingCycle" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-indigo-400">
            {billingCycles.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm text-slate-600">
          Next billing date
          <input name="nextBillingDate" type="date" required className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-indigo-400" />
        </label>

        <label className="grid gap-2 text-sm text-slate-600">
          Trial ends at
          <input name="trialEndsAt" type="date" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-indigo-400" />
        </label>

        <label className="grid gap-2 text-sm text-slate-600">
          Brand color
          <input name="color" type="color" defaultValue="#6366f1" className="h-12 rounded-2xl border border-slate-200 px-2 py-2 outline-none ring-0 focus:border-indigo-400" />
        </label>

        <label className="grid gap-2 text-sm text-slate-600">
          Website
          <input name="website" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-indigo-400" placeholder="https://example.com" />
        </label>
      </div>

      <label className="grid gap-2 text-sm text-slate-600">
        Notes
        <textarea name="notes" rows={3} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-indigo-400" placeholder="Family plan, trial, student pricing..." />
      </label>

      <button type="submit" className="inline-flex w-fit rounded-full bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-500">
        Save subscription
      </button>
    </form>
  );
}
