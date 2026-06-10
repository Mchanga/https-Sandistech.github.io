import { AUTH_COOKIE } from "@/lib/auth";
import { ok } from "@/lib/api-helpers";

export async function POST() {
  const res = ok({ success: true });
  res.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}
