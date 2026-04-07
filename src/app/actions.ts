"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { BillingCycle, SubscriptionStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

function getString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeBillingCycle(value: string) {
  return Object.values(BillingCycle).includes(value as BillingCycle)
    ? (value as BillingCycle)
    : BillingCycle.MONTHLY;
}

function normalizeStatus(value: string) {
  return Object.values(SubscriptionStatus).includes(value as SubscriptionStatus)
    ? (value as SubscriptionStatus)
    : SubscriptionStatus.ACTIVE;
}

function parseDate(value: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function redirectWithMessage(message: string, extra?: Record<string, string | number>) {
  const search = new URLSearchParams({ message });

  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      search.set(key, String(value));
    }
  }

  redirect(`/?${search.toString()}`);
}

export async function createSubscription(formData: FormData) {
  const name = getString(formData.get("name"));
  const category = getString(formData.get("category")) || "Other";
  const priceValue = getString(formData.get("price"));
  const currency = getString(formData.get("currency")) || "USD";
  const billingCycleValue = getString(formData.get("billingCycle")) || "MONTHLY";
  const statusValue = getString(formData.get("status")) || "ACTIVE";
  const nextBillingDateValue = getString(formData.get("nextBillingDate"));
  const trialEndsAtValue = getString(formData.get("trialEndsAt"));
  const color = getString(formData.get("color")) || "#6366f1";
  const website = getString(formData.get("website"));
  const notes = getString(formData.get("notes"));

  const price = Number(priceValue);
  const nextBillingDate = parseDate(nextBillingDateValue);
  const trialEndsAt = parseDate(trialEndsAtValue);

  if (!name) {
    redirectWithMessage("form-error-name");
  }

  if (Number.isNaN(price) || price < 0) {
    redirectWithMessage("form-error-price");
  }

  if (!nextBillingDate) {
    redirectWithMessage("form-error-next-billing");
  }

  const safeNextBillingDate = nextBillingDate as Date;
  const billingCycle = normalizeBillingCycle(billingCycleValue);
  const status = normalizeStatus(statusValue);

  await prisma.subscription.create({
    data: {
      name,
      category,
      price,
      currency,
      billingCycle,
      billingInterval: 1,
      status,
      nextBillingDate: safeNextBillingDate,
      trialEndsAt,
      color,
      website: website || null,
      notes: notes || null,
    },
  });

  revalidatePath("/");
  redirect("/?message=created");
}

export async function updateSubscription(formData: FormData) {
  const id = getString(formData.get("id"));
  const name = getString(formData.get("name"));
  const category = getString(formData.get("category")) || "Other";
  const priceValue = getString(formData.get("price"));
  const currency = getString(formData.get("currency")) || "USD";
  const billingCycleValue = getString(formData.get("billingCycle")) || "MONTHLY";
  const statusValue = getString(formData.get("status")) || "ACTIVE";
  const nextBillingDateValue = getString(formData.get("nextBillingDate"));
  const trialEndsAtValue = getString(formData.get("trialEndsAt"));
  const color = getString(formData.get("color")) || "#6366f1";
  const website = getString(formData.get("website"));
  const notes = getString(formData.get("notes"));

  const price = Number(priceValue);
  const nextBillingDate = parseDate(nextBillingDateValue);
  const trialEndsAt = parseDate(trialEndsAtValue);

  if (!id) {
    redirectWithMessage("form-error-missing-id");
  }

  if (!name) {
    redirectWithMessage("form-error-name", { edit: id });
  }

  if (Number.isNaN(price) || price < 0) {
    redirectWithMessage("form-error-price", { edit: id });
  }

  if (!nextBillingDate) {
    redirectWithMessage("form-error-next-billing", { edit: id });
  }

  const safeNextBillingDate = nextBillingDate as Date;
  const billingCycle = normalizeBillingCycle(billingCycleValue);
  const status = normalizeStatus(statusValue);

  await prisma.subscription.update({
    where: { id },
    data: {
      name,
      category,
      price,
      currency,
      billingCycle,
      status,
      nextBillingDate: safeNextBillingDate,
      trialEndsAt,
      color,
      website: website || null,
      notes: notes || null,
    },
  });

  revalidatePath("/");
  redirect("/?message=updated");
}

export async function deleteSubscription(formData: FormData) {
  const id = getString(formData.get("id"));

  if (!id) {
    redirectWithMessage("delete-error-missing-id");
  }

  await prisma.subscription.delete({
    where: { id },
  });

  revalidatePath("/");
  redirect("/?message=deleted");
}

export async function importSubscriptions(formData: FormData) {
  const payload = getString(formData.get("payload"));

  if (!payload) {
    redirectWithMessage("import-error-empty");
  }

  let parsed: Array<Record<string, unknown>> = [];

  try {
    const raw = JSON.parse(payload) as unknown;
    if (!Array.isArray(raw)) {
      throw new Error("Import payload must be a JSON array");
    }
    parsed = raw as Array<Record<string, unknown>>;
  } catch {
    redirectWithMessage("import-error");
  }

  let imported = 0;
  let skipped = 0;

  for (const item of parsed) {
    const name = typeof item.name === "string" ? item.name.trim() : "";
    const category = typeof item.category === "string" ? item.category.trim() : "Other";
    const price = Number(item.price ?? 0);
    const currency = typeof item.currency === "string" ? item.currency.trim() || "USD" : "USD";
    const billingCycle = normalizeBillingCycle(typeof item.billingCycle === "string" ? item.billingCycle : "MONTHLY");
    const status = normalizeStatus(typeof item.status === "string" ? item.status : "ACTIVE");
    const nextBillingDateValue = typeof item.nextBillingDate === "string" ? item.nextBillingDate : "";
    const trialEndsAtValue = typeof item.trialEndsAt === "string" ? item.trialEndsAt : "";
    const color = typeof item.color === "string" ? item.color : "#6366f1";
    const website = typeof item.website === "string" ? item.website : null;
    const notes = typeof item.notes === "string" ? item.notes : null;

    if (!name || Number.isNaN(price) || price < 0 || !nextBillingDateValue) {
      skipped += 1;
      continue;
    }

    const nextBillingDate = parseDate(nextBillingDateValue);

    if (!nextBillingDate) {
      skipped += 1;
      continue;
    }

    const existing = await prisma.subscription.findFirst({
      where: {
        name,
        price,
        nextBillingDate,
      },
      select: { id: true },
    });

    if (existing) {
      skipped += 1;
      continue;
    }

    await prisma.subscription.create({
      data: {
        name,
        category,
        price,
        currency,
        billingCycle,
        billingInterval: 1,
        status,
        nextBillingDate,
        trialEndsAt: parseDate(trialEndsAtValue),
        color,
        website,
        notes,
      },
    });

    imported += 1;
  }

  revalidatePath("/");
  redirect(`/?message=imported&imported=${imported}&skipped=${skipped}`);
}
