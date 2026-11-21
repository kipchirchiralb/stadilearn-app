import { redirect } from "next/navigation";
import { noIndexMeta } from "@/lib/seo";

export const metadata = noIndexMeta("Support");

export default function SupportAssistantPage() {
  redirect("/app/assistant?kind=support");
}
