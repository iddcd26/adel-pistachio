import db from "@/db";
import type { NewProduct } from "@/db/schema";
import { products } from "@/db/schema";
import { logger } from "@/lib/logger";

const seedProducts: NewProduct[] = [
  { id: 1, name: "پسته احمدآقایی", price: 2_150_000 },
  { id: 2, name: "پسته اکبری", price: 2_350_000 },
  { id: 3, name: "پسته کله‌قوچی", price: 2_500_000 },
  { id: 4, name: "پسته فندقی", price: 1_950_000 },
  { id: 5, name: "مغز پسته احمدآقایی", price: 1_850_000 },
  { id: 6, name: "مغز پسته اکبری", price: 4_800_000 },
  { id: 7, name: "مغز پسته کله‌قوچی", price: 1_750_000 },
  { id: 8, name: "مغز پسته فندقی", price: 1_750_000 },
];

await db.delete(products);
await db.insert(products).values(seedProducts);

logger.info({ count: seedProducts.length }, "Seeded products");
