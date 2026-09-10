import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Copy, Save, Wand2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AiBadge, AiNotice } from "@/components/AiNotice";
import { AiThinking } from "@/components/Loading";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { generateEmail } from "@/lib/ai.functions";
import { useSaveAiResult } from "@/lib/data";
import { salonImages, imageAlt } from "@/lib/images";

export const Route = createFileRoute("/email-assistant")({
  head: () => ({
    meta: [
      { title: "AI Email Assistant — GlowBiz AI" },
      {
        name: "description",
        content:
          "Write appointment confirmations, reminders, follow-ups and promotions for your salon clients with AI.",
      },
      { property: "og:title", content: "AI Email Assistant — GlowBiz AI" },
      {
        property: "og:description",
        content: "Polished salon customer emails in seconds, always editable before you send.",
      },
    ],
  }),
  component: EmailAssistant,
});

const tones = ["Professional", "Friendly", "Persuasive", "Apologetic", "Promotional"];
const purposes = [
  "Appointment confirmation",
  "Appointment reminder",
  "Customer follow-up",
  "Late appointment message",
  "Cancellation response",
  "Complaint response",
  "Promotional email",
  "New service announcement",
  "Thank-you message",
];

function EmailAssistant() {
  const [recipient, setRecipient] = useState("");
  const [purpose, setPurpose] = useState<string>(purposes[0] ?? "");
  const [details, setDetails] = useState("");
  const [tone, setTone] = useState<string>(tones[0] ?? "");
  const [draft, setDraft] = useState("");

  const run = useServerFn(generateEmail);
  const saveResult = useSaveAiResult();

  const mutation = useMutation({
    mutationFn: async (adjustment?: string) =>
      run({
        data: {
          recipient,
          purpose,
          details,
          tone,
          adjustment,
          previousDraft: adjustment ? draft : undefined,
        },
      }),
    onSuccess: (result) => setDraft(result.text),
    onError: (error: Error) => toast.error(error.message || "The AI could not finish that draft."),
  });

  const busy = mutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Email Assistant"
        subtitle="Describe the message you need. GlowBiz AI writes a polished draft you can edit before sending."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <Card className="card-glow h-fit rounded-3xl">
          <CardHeader>
            <CardTitle className="font-display text-xl">Email details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient / customer</Label>
              <Input
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g. Thandi Mokoena"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose of email</Label>
              <Select value={purpose} onValueChange={setPurpose}>
                <SelectTrigger id="purpose">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {purposes.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Important details</Label>
              <Textarea
                id="details"
                rows={5}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Date and time, service booked, what changed, anything the client must know."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger id="tone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tones.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full rounded-full"
              size="lg"
              disabled={busy}
              onClick={() => mutation.mutate(undefined)}
            >
              <Wand2 className="h-4 w-4" aria-hidden="true" />
              {draft ? "Generate again" : "Generate email"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {busy ? <AiThinking /> : null}

          <Card className="card-glow rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle className="font-display text-xl">Draft</CardTitle>
              {draft ? <AiBadge /> : null}
            </CardHeader>
            <CardContent className="space-y-4">
              {draft ? (
                <>
                  <Textarea
                    aria-label="AI generated email draft"
                    rows={16}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    className="font-sans text-sm leading-relaxed"
                  />
                  <div className="flex flex-wrap gap-2">
                    {[
                      ["Regenerate", undefined],
                      ["Make more professional", "make it more professional and formal"],
                      ["Make friendlier", "make it warmer and friendlier"],
                      ["Make shorter", "make it noticeably shorter while keeping every fact"],
                    ].map(([label, adjustment]) => (
                      <Button
                        key={label as string}
                        variant="outline"
                        className="rounded-full"
                        disabled={busy}
                        onClick={() => mutation.mutate(adjustment as string | undefined)}
                      >
                        {label}
                      </Button>
                    ))}
                    <Button
                      variant="secondary"
                      className="rounded-full"
                      onClick={() => {
                        navigator.clipboard.writeText(draft);
                        toast.success("Email copied to your clipboard");
                      }}
                    >
                      <Copy className="h-4 w-4" aria-hidden="true" />
                      Copy
                    </Button>
                    <Button
                      variant="secondary"
                      className="rounded-full"
                      onClick={() =>
                        saveResult.mutate(
                          {
                            feature: "email",
                            title: `${purpose}${recipient ? ` — ${recipient}` : ""}`,
                            content: draft,
                          },
                          { onSuccess: () => toast.success("AI output saved") },
                        )
                      }
                    >
                      <Save className="h-4 w-4" aria-hidden="true" />
                      Save
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border p-8 text-center">
                  <img
                    src={salonImages.products}
                    alt={imageAlt.products}
                    width={1024}
                    height={768}
                    loading="lazy"
                    className="h-32 w-full max-w-xs rounded-2xl object-cover"
                  />
                  <p className="text-sm text-muted-foreground">
                    Fill in the details on the left and your draft will appear here, ready to edit.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <AiNotice />
        </div>
      </div>
    </div>
  );
}
