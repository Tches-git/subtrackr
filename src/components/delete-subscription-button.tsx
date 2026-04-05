import { Trash2 } from "lucide-react";
import { deleteSubscription } from "@/app/actions";

export function DeleteSubscriptionButton({ id }: { id: string }) {
  return (
    <form action={deleteSubscription}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 hover:border-rose-200 hover:text-rose-600"
        onClick={(event) => {
          if (!confirm("Delete this subscription?")) {
            event.preventDefault();
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </button>
    </form>
  );
}
