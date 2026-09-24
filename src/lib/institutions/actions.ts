"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/session";
import { approveInstitution, grantInstitutionAdmin } from "@/lib/institutions";

function idFrom(formData: FormData, key: string) {
  const n = Number(formData.get(key));
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

async function actorIp() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  return h.get("x-real-ip")?.trim().slice(0, 64) || undefined;
}

export async function approveInstitutionAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const user = await getSessionUser();
  if (!user || user.accountType !== "super_admin") return { error: "You cannot approve institutions." };
  const institutionId = idFrom(formData, "institutionId");
  if (!institutionId) return { error: "Choose an institution to approve." };
  const result = await approveInstitution(user, institutionId, await actorIp());
  if ("error" in result) return result;
  revalidatePath("/app/dashboard");
  return {};
}

export async function grantInstitutionAdminAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const user = await getSessionUser();
  if (!user || user.accountType !== "super_admin") return { error: "You cannot grant institution admin access." };
  const institutionId = idFrom(formData, "institutionId");
  const userId = idFrom(formData, "userId");
  if (!institutionId || !userId) return { error: "Choose a person to nominate." };
  const result = await grantInstitutionAdmin(user, institutionId, userId, await actorIp());
  if ("error" in result) return result;
  revalidatePath("/app/dashboard");
  return {};
}
