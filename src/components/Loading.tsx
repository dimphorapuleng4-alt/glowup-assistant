import { Loader2 } from "lucide-react";

export function AiThinking({ label = "GlowBiz AI is writing…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground"
    >
      <Loader2 className="h-4 w-4 animate-spin text-pink" aria-hidden="true" />
      {label}
    </div>
  );
}
