"use client";

import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/** Drop decorative rules the model often puts at the start or end of a reply. */
function normalize(text: string) {
  return text.replace(/^(?:\s*---\s*\n)+/, "").replace(/(?:\n\s*---\s*)+$/, "").trim();
}

function safeHref(href: string | undefined) {
  if (!href) return undefined;
  const value = href.trim();
  if (/^(https?:|mailto:|\/|#)/i.test(value) && !/^javascript:/i.test(value)) return value;
  return undefined;
}

const components: Components = {
  p: ({ children }) => <p className="mb-space-sm last:mb-0 max-w-full">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-on-surface">{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  h1: ({ children }) => <h3 className="font-headline-sm text-headline-sm text-on-surface mt-space-sm mb-space-xs first:mt-0">{children}</h3>,
  h2: ({ children }) => <h3 className="font-headline-sm text-headline-sm text-on-surface mt-space-sm mb-space-xs first:mt-0">{children}</h3>,
  h3: ({ children }) => <h4 className="font-label-lg text-label-lg text-on-surface mt-space-sm mb-space-xs first:mt-0">{children}</h4>,
  h4: ({ children }) => <h4 className="font-label-lg text-label-lg text-on-surface mt-space-sm mb-space-xs first:mt-0">{children}</h4>,
  h5: ({ children }) => <p className="font-label-md text-label-md text-on-surface mt-space-sm mb-space-xs first:mt-0">{children}</p>,
  h6: ({ children }) => <p className="font-label-md text-label-md text-on-surface mt-space-sm mb-space-xs first:mt-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-space-sm list-disc space-y-1 pl-space-md last:mb-0 max-w-full">{children}</ul>,
  ol: ({ children }) => <ol className="mb-space-sm list-decimal space-y-1 pl-space-md last:mb-0 max-w-full">{children}</ol>,
  li: ({ children }) => <li className="[&>p]:mb-1 [&>p:last-child]:mb-0">{children}</li>,
  hr: () => <hr className="my-space-md border-0 border-t border-outline-variant/70" />,
  blockquote: ({ children }) => (
    <blockquote className="my-space-sm max-w-full border-l-2 border-primary-container pl-space-sm text-on-surface-variant last:mb-0">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => {
    const safe = safeHref(href);
    if (!safe) return <span>{children}</span>;
    const external = /^https?:/i.test(safe);
    return (
      <a
        className="text-primary underline underline-offset-2 hover:text-secondary-container [overflow-wrap:anywhere]"
        href={safe}
        {...(external ? { rel: "noopener noreferrer", target: "_blank" } : {})}
      >
        {children}
      </a>
    );
  },
  pre: ({ children }) => (
    <pre className="my-space-sm max-w-full overflow-x-auto rounded-lg bg-surface-container-high p-space-sm font-mono text-body-sm last:mb-0 [&_code]:bg-transparent [&_code]:p-0 [&_code]:rounded-none">
      {children}
    </pre>
  ),
  code: ({ children }) => (
    <code className="break-all rounded bg-surface-container-highest px-1 py-px font-mono text-[13px]">{children}</code>
  ),
  table: ({ children }) => (
    <div className="my-space-sm max-w-full overflow-x-auto last:mb-0">
      <table className="w-full max-w-full border-collapse text-body-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border-b border-outline-variant px-space-sm py-1 text-left font-label-md">{children}</th>,
  td: ({ children }) => <td className="border-t border-outline-variant/40 px-space-sm py-1">{children}</td>,
  img: ({ alt }) => (alt ? <span className="italic text-on-surface-variant">{alt}</span> : null),
};

export function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="min-w-0 max-w-full overflow-x-auto font-body-md text-body-md text-on-surface [overflow-wrap:anywhere]">
      <Markdown components={components} remarkPlugins={[remarkGfm]}>
        {normalize(content)}
      </Markdown>
    </div>
  );
}
