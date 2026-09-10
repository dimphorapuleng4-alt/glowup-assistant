import { ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

export const RESPONSIBLE_AI_TEXT =
  "AI-generated content may contain errors or omissions. Review AI outputs before sending customer communications or making business decisions. Do not enter sensitive personal, financial, or confidential information unless appropriate and permitted.";

export function AiNotice({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border border-border bg-blush/70 p-4 text-xs leading-relaxed text-blush-foreground",
        className,
      )}
    >
      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p>
        <span className="font-semibold">Responsible AI.</span> {RESPONSIBLE_AI_TEXT}
      </p>
    </div>
  );
}

export function AiBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold tracking-wide text-accent-foreground uppercase",
        className,
      )}
    >
      AI-generated
    </span>
  );
}
