import { deleteCookie, getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";

import { logger } from "@/lib/logger";

export const SESSION_COOKIE = "admin_session";

export type AdminEnv = { Variables: { adminPhone: string } };

export const requireAdmin = createMiddleware<AdminEnv>(async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE);
  const authSecret = process.env.AUTH_SECRET;

  if (authSecret && token) {
    try {
      const payload = await verify(token, authSecret, "HS256");
      if (payload.role === "admin" && typeof payload.sub === "string") {
        c.set("adminPhone", payload.sub);
        return next();
      }
    } catch {
      // invalid or expired token — fall through to rejection
    }
  } else if (!authSecret) {
    logger.error({ missing: ["AUTH_SECRET"] }, "admin auth is not configured");
  }

  deleteCookie(c, SESSION_COOKIE, { path: "/" });
  return c.json({ error: "ابتدا وارد شوید." }, 401);
});
