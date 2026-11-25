import { Hono } from "hono";

import { logger } from "@/lib/logger";
import authRoutes from "@/routes/auth";

const app = new Hono()
  .use("*", async (c, next) => {
    const start = performance.now();
    await next();
    logger.info(
      {
        method: c.req.method,
        path: c.req.path,
        status: c.res.status,
        durationMs: Math.round(performance.now() - start),
      },
      "request",
    );
  })
  .get("/err", (_c) => {
    throw new Error("Something happened");
  })
  .get("/", (c) => c.json({ status: "ok" }))
  .route("/auth", authRoutes)
  .notFound((c) => c.json({ error: "Not found" }, 404))
  .onError((err, c) => {
    logger.error({ err }, "unhandled error");
    return c.json({ error: "Internal server error" }, 500);
  });

export default app;

export type AppType = typeof app;
