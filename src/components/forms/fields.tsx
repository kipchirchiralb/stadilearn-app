export const inputClass =
  "mt-1 w-full rounded-lg bg-surface-container-lowest px-space-sm py-space-sm font-body-md text-body-md text-on-surface ring-1 ring-outline-variant placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary-container";

export const submitClass =
  "inline-flex w-full sm:w-auto items-center justify-center gap-space-xs bg-primary-container text-on-primary font-label-lg text-label-lg px-space-lg py-space-sm rounded-lg hover:bg-primary transition-all disabled:opacity-60 disabled:cursor-not-allowed";

export function Field({
  label,
  hint,
  optional,
  children,
}: {
  label: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-label-md text-label-md text-on-surface">
        {label}
        {optional && <span className="font-body-sm text-on-surface-variant font-normal"> (optional)</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block font-body-sm text-body-sm text-on-surface-variant">{hint}</span>}
    </label>
  );
}

export function FormAlert({ tone, children }: { tone: "error" | "success" | "info"; children: React.ReactNode }) {
  const styles = {
    error: "bg-error-container text-on-error-container",
    success: "bg-primary-fixed text-on-primary-fixed",
    info: "bg-surface-container text-on-surface",
  }[tone];
  const icon = { error: "error", success: "check_circle", info: "info" }[tone];
  return (
    <div className={`${styles} rounded-lg p-space-sm flex items-start gap-space-xs font-body-sm text-body-sm`} role={tone === "error" ? "alert" : "status"}>
      <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
        {icon}
      </span>
      <div>{children}</div>
    </div>
  );
}
