/**
 * DEVELOPMENT ONLY: create (or reuse) an active account and print a session
 * cookie, so the assistant can be tried without going through emailed OTP.
 *
 *   npm run dev:session -- you@example.com
 *   npm run dev:session -- teacher@example.com --type teacher --moodle-user-id 5
 *
 * Then, in the browser dev tools on http://localhost:3000, add a cookie
 * named sl_session with the printed value (Path=/, HttpOnly).
 */
import { createSession } from "@/lib/auth/session";
import { appDb, closePools } from "@/lib/db";

async function main() {
  if (process.env.NODE_ENV === "production") throw new Error("dev-session is disabled in production");
  const args = process.argv.slice(2);
  const email = args.find((a) => a.includes("@"));
  if (!email) throw new Error("Usage: npm run dev:session -- email [--type learner|teacher|super_admin] [--moodle-user-id N]");
  const flag = (name: string) => {
    const i = args.indexOf(name);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const type = flag("--type") ?? "learner";
  if (!["learner", "teacher", "super_admin"].includes(type)) throw new Error("--type must be learner, teacher or super_admin");
  const moodleUserId = flag("--moodle-user-id") ? Number(flag("--moodle-user-id")) : null;

  // Create or reactivate the account first, then set the role separately: the
  // 3-super-admin trigger also fires on the INSERT half of an upsert, so an
  // upsert with account_type fails for existing admins once all 3 slots are used.
  await appDb.transaction(async (tx) => {
    await tx.execute(
      `INSERT INTO users (email, full_name, status, email_verified_at, moodle_user_id)
       VALUES (?, ?, 'active', UTC_TIMESTAMP(3), ?)
       ON DUPLICATE KEY UPDATE status = 'active',
         moodle_user_id = COALESCE(VALUES(moodle_user_id), moodle_user_id)`,
      [email, email.split("@")[0], moodleUserId],
    );
    await tx.execute("UPDATE users SET account_type = ? WHERE email = ? AND account_type <> ?", [type, email, type]);
  });
  const [user] = await appDb.query<{ id: number }>("SELECT id FROM users WHERE email = ?", [email]);
  const { token, expires } = await createSession(Number(user.id), { userAgent: "dev-session script" });

  console.log(`User #${user.id} (${type}) ready.`);
  console.log(`Cookie  sl_session=${token}`);
  console.log(`Expires ${expires.toISOString()}`);
}

main()
  .catch((err) => {
    console.error(err.message ?? err);
    process.exitCode = 1;
  })
  .finally(closePools);
