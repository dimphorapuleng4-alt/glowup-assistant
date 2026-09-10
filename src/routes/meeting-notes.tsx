import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CalendarClock, ListChecks, Save, Sparkles, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AiBadge, AiNotice } from "@/components/AiNotice";
import { AiThinking } from "@/components/Loading";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { summarizeNotes, type NotesSummary } from "@/lib/ai.functions";
import { useAddTasks, useSaveAiResult } from "@/lib/data";

export const Route = createFileRoute("/meeting-notes")({
  head: () => ({
    meta: [
      { title: "AI Meeting Notes — GlowBiz AI" },
      {
        name: "description",
        content:
          "Paste salon meeting or call notes and get a summary, decisions, action items, deadlines and who is responsible.",
      },
      { property: "og:title", content: "AI Meeting Notes — GlowBiz AI" },
      {
        property: "og:description",
        content: "Turn messy salon notes into clear decisions and tasks you can plan.",
      },
    ],
  }),
  component: MeetingNotes,
});

const sample = `Team catch-up Monday.
Sarah will order new lash supplies by Friday.
We agreed to raise nail art add-on pricing next month.
Lebo to post the braids promo on Instagram on Wednesday.
Need to call the hair supplier about the late delivery.`;

function MeetingNotes() {
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<NotesSummary | null>(null);

  const run = useServerFn(summarizeNotes);
  const addTasks = useAddTasks();
  const saveResult = useSaveAiResult();

  const mutation = useMutation({
    mutationFn: async () => run({ data: { notes } }),
    onSuccess: (data) => setResult(data),
    onError: (error: Error) => toast.error(error.message || "The AI could not read those notes."),
  });

  function addToPlanner() {
    if (!result?.actionItems.length) return;
    addTasks.mutate(
      result.actionItems.map((item) => ({
        title: item.task,
        owner: item.responsible,
        deadline: /^\d{4}-\d{2}-\d{2}$/.test(item.deadline ?? "") ? item.deadline : null,
        details: item.deadline && !/^\d{4}-\d{2}-\d{2}$/.test(item.deadline)
          ? `Deadline mentioned in notes: ${item.deadline}`
          : null,
        importance: "medium",
        source: "meeting-notes",
      })),
      {
        onSuccess: () => toast.success("Action items added to your Task Planner"),
        onError: () => toast.error("Could not add those tasks"),
      },
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Meeting Notes"
        subtitle="Paste notes from a team catch-up, supplier call or client conversation. GlowBiz AI pulls out what matters."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="card-glow h-fit rounded-3xl">
          <CardHeader>
            <CardTitle className="font-display text-xl">Your notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              aria-label="Meeting notes"
              rows={14}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste your meeting or call notes here…"
            />
            <div className="flex flex-wrap gap-2">
              <Button
                className="rounded-full"
                disabled={notes.trim().length < 10 || mutation.isPending}
                onClick={() => mutation.mutate()}
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Summarize notes
              </Button>
              <Button variant="outline" className="rounded-full" onClick={() => setNotes(sample)}>
                Use example notes
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {mutation.isPending ? <AiThinking label="GlowBiz AI is reading your notes…" /> : null}

          {result ? (
            <>
              <Card className="card-glow rounded-3xl">
                <CardHeader className="flex flex-row items-center justify-between gap-3">
                  <CardTitle className="font-display text-xl">Summary</CardTitle>
                  <AiBadge />
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-relaxed">
                  <p>{result.summary}</p>

                  <Section title="Decisions" items={result.decisions} />
                  <Section title="Deadlines mentioned" items={result.deadlines} icon="date" />

                  <div>
                    <h3 className="mb-2 flex items-center gap-2 font-semibold">
                      <ListChecks className="h-4 w-4" aria-hidden="true" /> Action items
                    </h3>
                    {result.actionItems.length === 0 ? (
                      <p className="text-muted-foreground">No action items found in these notes.</p>
                    ) : (
                      <ul className="space-y-2">
                        {result.actionItems.map((item, i) => (
                          <li
                            key={i}
                            className="rounded-2xl border border-border bg-background/60 p-3"
                          >
                            <p className="font-medium">{item.task}</p>
                            <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                                {item.responsible ?? "Not stated"}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                                {item.deadline ?? "No deadline"}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      className="rounded-full"
                      disabled={!result.actionItems.length || addTasks.isPending}
                      onClick={addToPlanner}
                    >
                      Add action items to Task Planner
                    </Button>
                    <Button
                      variant="secondary"
                      className="rounded-full"
                      onClick={() =>
                        saveResult.mutate(
                          {
                            feature: "notes",
                            title: "Meeting summary",
                            content: result.summary,
                          },
                          { onSuccess: () => toast.success("AI output saved") },
                        )
                      }
                    >
                      <Save className="h-4 w-4" aria-hidden="true" />
                      Save summary
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}

          <AiNotice />
        </div>
      </div>
    </div>
  );
}

function Section({ title, items, icon }: { title: string; items: string[]; icon?: "date" }) {
  if (!items?.length) return null;
  return (
    <div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <ul className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <li key={i}>
            <Badge variant="secondary" className="rounded-full font-normal whitespace-normal">
              {icon === "date" ? <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" /> : null}
              {item}
            </Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}
