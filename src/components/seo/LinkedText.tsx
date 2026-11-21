import Link from "next/link";

/** Renders plain sentences that contain [label](href) links. */
export function LinkedText({ text }: { text: string }) {
  const pattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(text))) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const label = match[1];
    const href = match[2];
    if (href.startsWith("http")) {
      nodes.push(
        <a className="text-primary underline" href={href} key={index} rel="noopener noreferrer" target="_blank">
          {label}
        </a>,
      );
    } else {
      nodes.push(
        <Link className="text-primary underline" href={href} key={index}>
          {label}
        </Link>,
      );
    }
    last = match.index + match[0].length;
    index += 1;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
}
