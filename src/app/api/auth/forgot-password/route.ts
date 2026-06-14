import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { db } from "@/db";
import { users, passwordResetTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ok, handleError } from "@/lib/api-helpers";

const schema = z.object({ email: z.string().email() });

// No email provider is configured for this deployment, so the reset token is
// returned directly to the requester to complete the flow on the next screen.
export async function POST(req: NextRequest) {
  try {
    const { email } = schema.parse(await req.json());

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()));

    if (!user) {
      return ok({
        found: false,
        message: "No account found with that email.",
      });
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt,
    });

    return ok({ found: true, token });
  } catch (err) {
    return handleError(err);
  }
}
