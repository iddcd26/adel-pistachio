import { Hono } from "hono";

const app = new Hono()
  .get("/", (c) => c.json({ status: "ok" }))
  .notFound((c) => c.json({ error: "Not found" }, 404))
  .onError((err, c) => {
    console.error(err);
    return c.json({ error: "Internal server error" }, 500);
  });

export default app;

export type AppType = typeof app;
