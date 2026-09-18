import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AssistantChat } from "@/components/ai/AssistantChat";
import { AiDisclosureNotice, Section } from "@/components/ui";
import { canUseTrainerAssistant, getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "AI assistant", robots: { index: false } };

export default async function AssistantPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/app/assistant");

  return (
    <Section tone="low">
      <h1 className="font-headline-md text-headline-md text-on-surface mb-space-md">AI assistant</h1>
      <AssistantChat canUseTrainer={canUseTrainerAssistant(user)} firstName={user.fullName.split(" ")[0]} />
      <div className="mt-space-lg">
        <AiDisclosureNotice />
      </div>
    </Section>
  );
}
