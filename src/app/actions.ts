"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { BillingCycle, SubscriptionStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

function getString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function createSubscription(formData: FormData) {
  const name = getString(formData.get("name"));
  const category = getString(formData.get("category")) || "Other";
  const priceValue = getString(formData.get("price"));
  const currency = getString(formData.get("currency")) || "USD";
  const billingCycleValue = getString(formData.get("billingCycle")) || "MONTHLY";
  const nextBillingDateValue = getString(formData.get("nextBillingDate"));
  const trialEndsAtValue = getString(formData.get("trialEndsAt"));
  const color = getString(formData.get("color")) || "#6366f1";
  const website = getString(formData.get("website"));
  const notes = getString(formData.get("notes"));

  const price = Number(priceValue);
  const nextBillingDate = nextBillingDateValue ? new Date(nextBillingDateValue) : null;
  const trialEndsAt = trialEndsAtValue ? new Date(trialEndsAtValue) : null;

  if (!name || Number.isNaN(price) || price < 0 || !nextBillingDate) {
    throw new Error("Invalid subscription input");
  }

  const billingCycle = Object.values(BillingCycle).includes(billingCycleValue as BillingCycle)
    ? (billingCycleValue as BillingCycle)
    : BillingCycle.MONTHLY;

  await prisma.subscription.create({
    data: {
      name,
      category,
      price,
      currency,
      billingCycle,
      billingInterval: 1,
      status: SubscriptionStatus.ACTIVE,
      nextBillingDate,
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
  const nextBillingDateValue = getString(formData.get("nextBillingDate"));
  const trialEndsAtValue = getString(formData.get("trialEndsAt"));
  const color = getString(formData.get("color")) || "#6366f1";
  const website = getString(formData.get("website"));
  const notes = getString(formData.get("notes"));

  const price = Number(priceValue);
  const nextBillingDate = nextBillingDateValue ? new Date(nextBillingDateValue) : null;
  const trialEndsAt = trialEndsAtValue ? new Date(trialEndsAtValue) : null;

  if (!id || !name || Number.isNaN(price) || price < 0 || !nextBillingDate) {
    throw new Error("Invalid subscription input");
  }

  const billingCycle = Object.values(BillingCycle).includes(billingCycleValue as BillingCycle)
    ? (billingCycleValue as BillingCycle)
    : BillingCycle.MONTHLY;

  await prisma.subscription.update({
    where: { id },
    data: {
      name,
      category,
      price,
      currency,
      billingCycle,
      nextBillingDate,
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
    throw new Error("Missing subscription id");
  }

  await prisma.subscription.delete({
    where: { id },
  });

  revalidatePath("/");
  redirect("/?message=deleted");
}
