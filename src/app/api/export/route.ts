import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toCsv(rows: Record<string, string | number | null>[]) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (value: string | number | null) => {
    const stringValue = value == null ? "" : String(value);
    return `"${stringValue.replaceAll('"', '""')}"`;
  };

  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => escape(row[header])).join(",")),
  ].join("\n");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") ?? "json";

  const subscriptions = await prisma.subscription.findMany({
    orderBy: { nextBillingDate: "asc" },
  });

  const normalized = subscriptions.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    price: item.price,
    currency: item.currency,
    billingCycle: item.billingCycle,
    status: item.status,
    nextBillingDate: item.nextBillingDate.toISOString(),
    trialEndsAt: item.trialEndsAt?.toISOString() ?? null,
    website: item.website ?? null,
    notes: item.notes ?? null,
  }));

  if (format === "csv") {
    const csv = toCsv(normalized);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="subtrackr-export.csv"',
      },
    });
  }

  return NextResponse.json(normalized, {
    headers: {
      "Content-Disposition": 'attachment; filename="subtrackr-export.json"',
    },
  });
}
