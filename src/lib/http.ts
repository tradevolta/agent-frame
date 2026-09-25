import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { UserError } from "./pipeline";
import { ConfigError } from "./config-error";
import { brand } from "./brand";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

/** Wrap a route handler: user-facing errors → 400, everything else → 500 (logged). */
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof UserError) return json({ error: err.message }, 400);
      if (err instanceof ConfigError) {
        console.error(`[config] ${err.service}: ${err.message}`);
        return json({ error: `This isn't available yet while we finish setting up. Please try again soon or email ${brand.supportEmail}.`, service: err.service }, 503);
      }
      if (err instanceof ZodError) return json({ error: err.issues[0]?.message ?? "Invalid input" }, 400);
      console.error("[api]", err);
      return json({ error: "Something went wrong. Please try again." }, 500);
    }
  };
}
