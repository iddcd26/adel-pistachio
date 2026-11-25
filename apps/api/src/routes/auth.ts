import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { sign } from "hono/jwt";
import { validator } from "hono/validator";
import { z } from "zod";

import { logger } from "@/lib/logger";
import { SESSION_COOKIE, requireAdmin, type AdminEnv } from "@/middleware/auth";

// Iranian mobile number: optional +98/0098/0 prefix, then 9 followed by 9 digits.
const iranPhone = z
  .string({ error: "شماره موبایل الزامی است" })
  .regex(/^(?:\+98|0098|0)?9\d{9}$/, "شماره موبایل نامعتبر است");

const loginSchema = z.object({
  phone: iranPhone,
  password: z
    .string({ error: "رمز عبور الزامی است" })
    .min(1, "رمز عبور الزامی است"),
});

const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

const auth = new Hono<AdminEnv>()
  .post(
    "/admin/login",
    validator("json", (value, c) => {
      const parsed = loginSchema.safeParse(value);
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
    }),
    async (c) => {
      const { phone, password } = c.req.valid("json");

      const adminPhone = process.env.ADMIN_PHONE;
      const adminPassword = process.env.ADMIN_PASSWORD;
      const authSecret = process.env.AUTH_SECRET;

      if (!adminPhone || !adminPassword || !authSecret) {
        logger.error(
          {
            missing: [
              ...(adminPhone ? [] : ["ADMIN_PHONE"]),
              ...(adminPassword ? [] : ["ADMIN_PASSWORD"]),
              ...(authSecret ? [] : ["AUTH_SECRET"]),
            ],
          },
          "admin login is not configured",
        );
        return c.json({ error: "شماره موبایل یا رمز عبور نادرست است." }, 401);
      }

      if (phone !== adminPhone || password !== adminPassword) {
        return c.json({ error: "شماره موبایل یا رمز عبور نادرست است." }, 401);
      }

      const token = await sign(
        {
          sub: phone,
          role: "admin",
          exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
        },
        authSecret,
        "HS256",
      );

      setCookie(c, SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "Lax",
        path: "/",
        maxAge: SESSION_MAX_AGE,
        secure: process.env.NODE_ENV === "production",
      });

      return c.json({ phone });
    },
  )
  .use("*", requireAdmin)
  .get("/me", (c) => c.json({ phone: c.get("adminPhone") }));

export default auth;
