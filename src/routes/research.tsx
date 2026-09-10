import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Copy, Lightbulb, ListPlus, Save, Search, Target } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AiBadge, AiNotice } from "@/components/AiNotice";
import { AiThinking } from "@/components/Loading";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { researchQuestion, type ResearchResult } from "@/lib/ai.functions";
import { useAddTasks, useSaveAiResult } from "@/lib/data";
import { imageAlt, salonImages } from "@/lib/images";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Business Research — GlowBiz AI" },
      {
        name: "description",
        content:
          "Ask AI for salon marketing ideas, retention tactics and promotion plans, structured into insights and next steps.",
      },
      { property: "og:title", content: "Business Research — GlowBiz AI" },
      {
        property: "og:description",
        content: "Practical salon business ideas, organised into clear cards you can act on.",
      },
    ],
  }),
  component: Research,
});

const examples = [
  "How can I attract more clients?",
  "Give me marketing ideas for my salon.",
  "What promotions could increase bookings?",
  "How can I improve customer retention?",
  "Give me social media content ideas for braids.",
  "How can I promote my nail services?",
];

function Research() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<ResearchResult | null>(null);

  const run = useServerFn(researchQuestion);
  const addTasks = useAddTasks();
  const saveResult = useSaveAiResult();

  const mutation = useMutation({
    mutationFn: async () => run({ data: { question } }),
    onSuccess: (data) => setResult(data),
    onError: (error: Error) => toast.error(error.message || "The AI could not answer that."),
  });

  const sections = result
    ? [
        { title: "Key insights", icon: Lightbulb, items: result.insights },
        { title: "Recommendations", icon: Target, items: result.recommendations },
        { title: "Suggested next steps", icon: ListPlus, items: result.nextSteps },
        { title: "Risks & considerations", icon: AlertTriangle, items: result.risks },
      ]
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Business Research"
        subtitle="Ask a question about growing your salon and get structured, practical guidance you can review."
      />

      <Card className="card-glow rounded-3xl">
        <CardContent className="space-y-4 pt-6">
          <Textarea
            aria-label="Your business question"
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. What can I do to increase repeat customers?"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              className="rounded-full"
              disabled={question.trim().length < 3 || mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              {result ? "Regenerate" : "Research"}
            </Button>
            {examples.map((example) => (
              <Button
                key={example}
                variant="outline"
                className="rounded-full text-xs"
                onClick={() => setQuestion(example)}
              >
                {example}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {mutation.isPending ? <AiThinking label="GlowBiz AI is thinking it through…" /> : null}

      {result ? (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {sections.map(({ title, icon: Icon, items }) => (
              <Card key={title} className="card-glow rounded-3xl">
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <CardTitle className="font-display flex items-center gap-2 text-lg">
                    <Icon className="h-4.5 w-4.5 text-pink" aria-hidden="true" />
                    {title}
                  </CardTitle>
                  <AiBadge />
                </CardHeader>
                <CardContent>
                  {items?.length ? (
                    <ul className="space-y-3 text-sm leading-relaxed">
                      {items.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-background/60 p-3"
                        >
                          <span>{item}</span>
                          {title === "Suggested next steps" || title === "Recommendations" ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="shrink-0 rounded-full"
                              onClick={() =>
                                addTasks.mutate(
                                  [
                                    {
                                      title: item.slice(0, 120),
                                      details: item,
                                      importance: "medium",
                                      source: "research",
                                    },
                                  ],
                                  { onSuccess: () => toast.success("Task created") },
                                )
                              }
                            >
                              Add task
                            </Button>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nothing returned for this section.</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              className="rounded-full"
              onClick={() => {
                navigator.clipboard.writeText(
                  sections
                    .map((s) => `${s.title}\n${(s.items ?? []).map((i) => `- ${i}`).join("\n")}`)
                    .join("\n\n"),
                );
                toast.success("Research copied to your clipboard");
              }}
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
              Copy all
            </Button>
            <Button
              variant="secondary"
              className="rounded-full"
              onClick={() =>
                saveResult.mutate(
                  {
                    feature: "research",
                    title: question.slice(0, 120),
                    content: sections
                      .map((s) => `${s.title}: ${(s.items ?? []).join(" | ")}`)
                      .join("\n"),
                  },
                  { onSuccess: () => toast.success("AI output saved") },
                )
              }
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              Save insight
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border p-10 text-center">
          <img
            src={salonImages.salon}
            alt={imageAlt.salon}
            width={1600}
            height={900}
            loading="lazy"
            className="h-40 w-full max-w-lg rounded-2xl object-cover"
          />
          <p className="max-w-md text-sm text-muted-foreground">
            Pick one of the example questions or write your own. Answers come back as insights,
            recommendations, next steps and things to watch out for.
          </p>
        </div>
      )}

      <AiNotice />
    </div>
  );
}
