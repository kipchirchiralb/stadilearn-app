"use client";

import { useEffect, useRef, useState } from "react";
import { MarkdownMessage } from "@/components/ai/MarkdownMessage";
import { FormAlert, inputClass } from "@/components/forms/fields";

type Kind = "tutor" | "support" | "trainer";
type Citation = { n: number; title: string; course: string | null; section: string | null; url: string };
type Message = { id?: number; role: "user" | "assistant"; content: string; citations?: Citation[]; grounded?: boolean };
type ConversationSummary = { id: number; assistant: Kind; title: string };

const KINDS: { value: Kind; label: string; icon: string; hint: string }[] = [
  { value: "tutor", label: "Tutor", icon: "psychology", hint: "Explanations, hints and examples from your course material." },
  { value: "support", label: "Support", icon: "support_agent", hint: "Accounts, one-time codes, finding pages, and how to study in Moodle." },
  { value: "trainer", label: "Trainer", icon: "edit_note", hint: "Draft lesson plans, quizzes, feedback and admin documents." },
];

const FLAG_REASONS = [
  { value: "incorrect", label: "Incorrect" },
  { value: "unsafe", label: "Unsafe or inappropriate" },
  { value: "unhelpful", label: "Not helpful" },
  { value: "assessment_help", label: "Gave away graded answers" },
  { value: "other", label: "Other" },
];

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json" } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
  return data as T;
}

export function AssistantChat({
  firstName,
  canUseTrainer,
  initialKind = "tutor",
}: {
  firstName: string;
  canUseTrainer: boolean;
  initialKind?: Kind;
}) {
  const [kind, setKind] = useState<Kind>(initialKind === "trainer" && !canUseTrainer ? "tutor" : initialKind);
  const [courseId, setCourseId] = useState<number | "">("");
  const [courses, setCourses] = useState<{ id: number; title: string }[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const kinds = KINDS.filter((k) => k.value !== "trainer" || canUseTrainer);

  useEffect(() => {
    api<{ courses: { id: number; title: string }[] }>("/api/v1/ai/courses").then((d) => setCourses(d.courses)).catch(() => {});
    refreshConversations();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  function refreshConversations() {
    api<{ conversations: ConversationSummary[] }>("/api/v1/ai/conversations").then((d) => setConversations(d.conversations)).catch(() => {});
  }

  function newChat() {
    setConversationId(null);
    setMessages([]);
    setError("");
    setNotice("");
  }

  async function openConversation(id: number) {
    setError("");
    setNotice("");
    try {
      const d = await api<{ conversation: { id: number; assistant: Kind; courseId: number | null }; messages: Message[] }>(
        `/api/v1/ai/conversations/${id}`,
      );
      setConversationId(d.conversation.id);
      setKind(d.conversation.assistant);
      setCourseId(d.conversation.courseId ?? "");
      setMessages(d.messages);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    setDraft("");
    setError("");
    setNotice("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setSending(true);
    try {
      const d = await api<{ conversationId: number; messageId: number; reply: string; citations: Citation[]; grounded: boolean }>(
        "/api/v1/ai/chat",
        { method: "POST", body: JSON.stringify({ assistant: kind, message: text, conversationId, courseId: courseId || null }) },
      );
      if (!conversationId) refreshConversations();
      setConversationId(d.conversationId);
      setMessages((m) => [...m, { id: d.messageId, role: "assistant", content: d.reply, citations: d.citations, grounded: d.grounded }]);
    } catch (err) {
      setError((err as Error).message);
      setDraft(text);
      setMessages((m) => m.slice(0, -1));
    } finally {
      setSending(false);
    }
  }

  async function flag(messageId: number, reason: string) {
    try {
      const d = await api<{ message: string }>(`/api/v1/ai/messages/${messageId}/flag`, { method: "POST", body: JSON.stringify({ reason }) });
      setNotice(d.message);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function escalate() {
    if (!conversationId) return;
    try {
      const d = await api<{ message: string }>(`/api/v1/ai/conversations/${conversationId}/escalate`, { method: "POST", body: "{}" });
      setNotice(d.message);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const started = messages.length > 0;
  const current = kinds.find((k) => k.value === kind) ?? kinds[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-gutter">
      <aside className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm h-fit">
        <button
          className="w-full inline-flex items-center justify-center gap-space-xs bg-primary-container text-on-primary font-label-md text-label-md px-space-md py-space-sm rounded-lg hover:bg-primary transition-all"
          onClick={newChat}
          type="button"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[18px]">add</span>
          New conversation
        </button>
        <h2 className="mt-space-md font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Recent</h2>
        <ul className="mt-space-xs space-y-1 max-h-[50vh] overflow-y-auto">
          {conversations.length === 0 && <li className="font-body-sm text-body-sm text-on-surface-variant">No conversations yet.</li>}
          {conversations.map((c) => (
            <li key={c.id}>
              <button
                className={`w-full text-left rounded-lg px-space-sm py-space-xs font-body-sm text-body-sm truncate hover:bg-surface-container ${
                  c.id === conversationId ? "bg-surface-container text-primary font-bold" : "text-on-surface"
                }`}
                onClick={() => openConversation(c.id)}
                title={c.title}
                type="button"
              >
                {c.title}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section aria-label="Assistant conversation" className="bg-surface-container-lowest rounded-2xl shadow-sm flex flex-col min-h-[70vh] min-w-0">
        <div className="p-space-md border-b border-outline-variant/40 flex flex-col md:flex-row md:items-end gap-space-sm">
          <div className="flex gap-space-xs flex-wrap" role="radiogroup" aria-label="Assistant">
            {kinds.map((k) => (
              <button
                aria-checked={kind === k.value}
                className={`inline-flex items-center gap-1 rounded-full px-space-md py-space-xs font-label-md text-label-md ring-1 transition-colors disabled:opacity-50 ${
                  kind === k.value ? "bg-primary-container text-on-primary ring-primary-container" : "text-on-surface ring-outline-variant hover:bg-surface-container"
                }`}
                disabled={started && kind !== k.value}
                key={k.value}
                onClick={() => setKind(k.value)}
                role="radio"
                type="button"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">{k.icon}</span>
                {k.label}
              </button>
            ))}
          </div>
          {kind === "tutor" && courses.length > 0 && (
            <label className="md:ml-auto md:w-72 block">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Course</span>
              <select
                className={inputClass}
                disabled={started}
                onChange={(e) => setCourseId(e.target.value ? Number(e.target.value) : "")}
                value={courseId}
              >
                <option value="">All courses</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </label>
          )}
        </div>

        <div aria-live="polite" className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-space-md space-y-space-md">
          {!started && (
            <div className="text-center py-space-xl max-w-lg mx-auto">
              <span aria-hidden="true" className="material-symbols-outlined text-[40px] text-primary">{current.icon}</span>
              <p className="font-headline-sm text-headline-sm text-on-surface mt-space-sm">Hello {firstName}, how can I help?</p>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">{current.hint}</p>
            </div>
          )}

          {messages.map((m, i) =>
            m.role === "user" ? (
              <div className="flex justify-end min-w-0" key={i}>
                <div className="min-w-0 max-w-[min(100%,42rem)] rounded-2xl rounded-br-sm bg-primary-container text-on-primary px-space-md py-space-sm font-body-md text-body-md whitespace-pre-wrap [overflow-wrap:anywhere]">
                  {m.content}
                </div>
              </div>
            ) : (
              <div className="flex justify-start min-w-0 w-full" key={i}>
                <div className="min-w-0 w-full max-w-full overflow-hidden rounded-2xl rounded-bl-sm bg-surface-container px-space-md py-space-sm">
                  <div className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant mb-1">
                    <span aria-hidden="true" className="material-symbols-outlined text-[16px]">smart_toy</span>
                    AI-generated
                    {m.grounded === false && <span> · not found in course material</span>}
                  </div>
                  <MarkdownMessage content={m.content} />
                  {m.citations && m.citations.length > 0 && (
                    <ol className="mt-space-sm space-y-1 border-t border-outline-variant/40 pt-space-xs">
                      {m.citations.map((c) => (
                        <li className="font-body-sm text-body-sm" key={c.n}>
                          <a className="text-primary hover:underline [overflow-wrap:anywhere]" href={c.url} rel="noopener noreferrer" target="_blank">
                            [{c.n}] {[c.course, c.title].filter(Boolean).join(" › ")}
                          </a>
                        </li>
                      ))}
                    </ol>
                  )}
                  {m.id && (
                    <label className="mt-space-xs flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant">
                      <span aria-hidden="true" className="material-symbols-outlined text-[16px]">flag</span>
                      <select
                        aria-label="Flag this answer"
                        className="bg-transparent focus:outline-none cursor-pointer"
                        defaultValue=""
                        onChange={(e) => e.target.value && flag(m.id!, e.target.value)}
                      >
                        <option value="">Flag answer</option>
                        {FLAG_REASONS.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
              </div>
            ),
          )}

          {sending && (
            <div className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
              <span aria-hidden="true" className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
              Thinking…
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form className="p-space-md border-t border-outline-variant/40 space-y-space-sm" onSubmit={send}>
          {error && <FormAlert tone="error">{error}</FormAlert>}
          {notice && <FormAlert tone="success">{notice}</FormAlert>}
          <div className="flex items-end gap-space-sm">
            <label className="flex-1">
              <span className="sr-only">Your message</span>
              <textarea
                className={`${inputClass} resize-none`}
                maxLength={4000}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Ask a question…"
                rows={2}
                value={draft}
              />
            </label>
            <button
              aria-label="Send"
              className="inline-flex items-center justify-center bg-primary-container text-on-primary rounded-lg h-11 w-11 hover:bg-primary transition-all disabled:opacity-60"
              disabled={sending || !draft.trim()}
              type="submit"
            >
              <span aria-hidden="true" className="material-symbols-outlined">send</span>
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
            <span>AI can be wrong. Check important answers with your course material or trainer.</span>
            {kind === "support" && conversationId && (
              <button className="text-primary font-bold hover:text-secondary-container" onClick={escalate} type="button">
                Talk to a person
              </button>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
