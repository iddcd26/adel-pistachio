import { asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { validator } from "hono/validator";
import { z } from "zod";

import db from "@/db";
import { products } from "@/db/schema";
import { requireAdmin, type AdminEnv } from "@/middleware/auth";

const idParamSchema = z.object({
  id: z.coerce
    .number({ error: "شناسه محصول نامعتبر است" })
    .int("شناسه محصول نامعتبر است")
    .positive("شناسه محصول نامعتبر است"),
});

const updateProductSchema = z
  .object({
    price: z
      .number({ error: "قیمت باید عدد باشد" })
      .int("قیمت باید عدد صحیح باشد")
      .positive("قیمت باید بزرگ‌تر از صفر باشد"),
    inStock: z.boolean({ error: "وضعیت موجودی نامعتبر است" }),
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "حداقل یک فیلد برای به‌روزرسانی لازم است",
  });

const validateIdParam = validator("param", (value, c) => {
  const parsed = idParamSchema.safeParse(value);
  if (!parsed.success) {
    return c.json(
      {
        error: "ورودی‌های خود را کنترل کنید.",
        issues: parsed.error.issues,
      },
      400,
    );
  }
  return parsed.data;
});

const validateProductUpdate = validator("json", (value, c) => {
  const parsed = updateProductSchema.safeParse(value);
  if (!parsed.success) {
    return c.json(
      {
        error: "ورودی‌های خود را کنترل کنید.",
        issues: parsed.error.issues,
      },
      400,
    );
  }
  return parsed.data;
});

const productsRoutes = new Hono<AdminEnv>()
  .get("/", async (c) => {
    const rows = await db.select().from(products).orderBy(asc(products.id));
    return c.json(rows);
  })
  .get("/:id", validateIdParam, async (c) => {
    const { id } = c.req.valid("param");

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));

    if (!product) {
      return c.json({ error: "محصول یافت نشد." }, 404);
    }

    return c.json(product);
  })
  .patch(
    "/:id",
    requireAdmin,
    validateIdParam,
    validateProductUpdate,
    async (c) => {
      const { id } = c.req.valid("param");
      const patch = c.req.valid("json");

      const [updated] = await db
        .update(products)
        .set(patch)
        .where(eq(products.id, id))
        .returning();

      if (!updated) {
        return c.json({ error: "محصول یافت نشد." }, 404);
      }

      return c.json(updated);
    },
  );

export default productsRoutes;
