import { getSessionUser, type SessionUser } from "@/lib/auth/session";
import { countAssociatedCertificates } from "@/lib/certificates";
import { listInstitutionAffiliations, wantsInstitutionDashboard } from "@/lib/institutions";

export type HeaderUser = {
  fullName: string;
  nav: "certificates" | "approvals" | "institution";
  associatedCertificates?: number;
};

export async function getHeaderUser(): Promise<HeaderUser | null> {
  const user = await getSessionUser();
  if (!user) return null;
  return headerUserFrom(user);
}

export async function headerUserFrom(user: SessionUser): Promise<HeaderUser> {
  if (user.accountType === "super_admin") {
    return { fullName: user.fullName, nav: "approvals" };
  }
  const affiliations = await listInstitutionAffiliations(user.id);
  if (wantsInstitutionDashboard(affiliations)) {
    const ids = affiliations.filter((row) => row.access === "full").map((row) => row.id);
    return {
      fullName: user.fullName,
      nav: "institution",
      associatedCertificates: await countAssociatedCertificates(ids),
    };
  }
  return { fullName: user.fullName, nav: "certificates" };
}
