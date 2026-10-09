import type { Config } from "@netlify/edge-functions";
import { clearedCookies } from "./lib/auth.ts";

export default async (request: Request) => {
  const headers = new Headers({ location: new URL("/login/?signed_out=1", request.url).toString(), "cache-control": "no-store" });
  for (const cookie of clearedCookies()) headers.append("set-cookie", cookie);
  return new Response(null, { status: 302, headers });
};

export const config: Config = { path: "/auth/logout" };
