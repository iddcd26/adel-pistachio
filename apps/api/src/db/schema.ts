import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  inStock: integer("in_stock", { mode: "boolean" }).notNull().default(true),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
