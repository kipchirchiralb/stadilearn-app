"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/session";
import { declineCertificate, issueCertificate, requestCertificate } from "@/lib/certificates";

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

export async function requestCertificateAction(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; ok?: boolean }> {
  const user = await getSessionUser();
  if (!user) return { error: "Sign in to request a certificate." };
  const courseId = idFrom(formData, "courseId");
  if (!courseId) return { error: "Choose a course." };
  const result = await requestCertificate(user, courseId);
  if ("error" in result) return result;
  revalidatePath("/app/certificates");
  revalidatePath("/app/certificates/approvals");
  return { ok: true };
}

export async function issueCertificateAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const user = await getSessionUser();
  if (!user || user.accountType !== "super_admin") return { error: "You cannot issue certificates." };
  const requestId = idFrom(formData, "requestId");
  if (!requestId) return { error: "Choose a request to issue." };
  const result = await issueCertificate(user, requestId, await actorIp());
  if ("error" in result) return result;
  revalidatePath("/app/certificates");
  revalidatePath("/app/certificates/approvals");
  revalidatePath("/app/dashboard");
  return {};
}

export async function declineCertificateAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const user = await getSessionUser();
  if (!user || user.accountType !== "super_admin") return { error: "You cannot decline certificate requests." };
  const requestId = idFrom(formData, "requestId");
  if (!requestId) return { error: "Choose a request to decline." };
  const reason = typeof formData.get("reason") === "string" ? String(formData.get("reason")) : "";
  const result = await declineCertificate(user, requestId, reason, await actorIp());
  if ("error" in result) return result;
  revalidatePath("/app/certificates");
  revalidatePath("/app/certificates/approvals");
  return {};
}
