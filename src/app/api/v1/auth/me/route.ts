import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";

/** Current signed-in user, or `{ user: null }`. Used by the header. */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: {
      id: user.id,
      fullName: user.fullName,
      accountType: user.accountType,
      language: user.language,
    },
  });
}
