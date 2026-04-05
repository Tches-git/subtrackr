import Link from "next/link";
import { Pencil } from "lucide-react";

export function EditSubscriptionLink({ id }: { id: string }) {
  return (
    <Link
      href={`/?edit=${id}`}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 hover:border-indigo-200 hover:text-indigo-600"
    >
      <Pencil className="h-4 w-4" />
      Edit
    </Link>
  );
}
