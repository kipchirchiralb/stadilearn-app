import { redirect } from "next/navigation";

export default function SupportAssistantPage() {
  redirect("/app/assistant?kind=support");
}
