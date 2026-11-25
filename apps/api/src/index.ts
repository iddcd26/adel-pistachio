import { Hono } from "hono";

const app = new Hono();

export default {
  fetch: app.fetch,
  port: 3000,
};
