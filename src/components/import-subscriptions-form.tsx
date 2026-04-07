import { importSubscriptions } from "@/app/actions";

const samplePayload = `[
  {
    "name": "YouTube Premium",
    "category": "Entertainment",
    "price": 12.99,
    "currency": "USD",
    "billingCycle": "MONTHLY",
    "nextBillingDate": "2026-04-20T00:00:00.000Z",
    "trialEndsAt": null,
    "website": "https://youtube.com",
    "notes": "Family plan",
    "color": "#ef4444"
  }
]`;

function getImportErrorLabel(message?: string) {
  if (message === "import-error") return "Import failed. Please paste a valid JSON array payload.";
  if (message === "import-error-empty") return "Please paste a JSON payload before importing.";
  return null;
}

export function ImportSubscriptionsForm({ message }: { message?: string }) {
  const errorLabel = getImportErrorLabel(message);

  return (
    <form action={importSubscriptions} className="grid gap-4 rounded-3xl border border-white/70 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Import JSON</h2>
        <p className="mt-1 text-sm text-slate-500">
          Paste an exported JSON array to bulk-create subscriptions. Duplicate items with the same name, price, and next billing date will be skipped.
        </p>
      </div>

      {errorLabel ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorLabel}
        </div>
      ) : null}

      <label className="grid gap-2 text-sm text-slate-600">
        JSON payload
        <textarea
          name="payload"
          rows={10}
          defaultValue={samplePayload}
          className="rounded-2xl border border-slate-200 px-4 py-3 font-mono text-xs outline-none ring-0 focus:border-indigo-400"
        />
      </label>

      <button type="submit" className="inline-flex w-fit rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800">
        Import subscriptions
      </button>
    </form>
  );
}
