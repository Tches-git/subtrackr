import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { BillingCycle, PrismaClient, SubscriptionStatus } from "../src/generated/prisma/client";
import { demoSubscriptions } from "../src/lib/demo-data";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.subscription.deleteMany();

  for (const item of demoSubscriptions) {
    await prisma.subscription.create({
      data: {
        ...item,
        billingCycle: BillingCycle[item.billingCycle as keyof typeof BillingCycle],
        status: SubscriptionStatus[item.status as keyof typeof SubscriptionStatus],
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
