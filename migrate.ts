import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const oldDB = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.OLD_DATABASE_URL!,
  }),
});

const newDB = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.NEW_DATABASE_URL!,
  }),
});
async function migrate() {
  const models = [
    "object",
    "zone",
    "language",
    "admin",
    "location",
    "category",
    "categoryImage",
    "item",
    "media",
  ] as const;

  for (const model of models) {
    const records = await (oldDB[model] as any).findMany();
    if (records.length > 0) {
      await (newDB[model] as any).createMany({ data: records, skipDuplicates: true });
    }
    console.log(`Migrated ${records.length} ${model} records`);
  }
}

migrate()
  .then(() => {
    console.log("DONE");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });