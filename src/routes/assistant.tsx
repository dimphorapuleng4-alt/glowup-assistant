import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Plus, Send, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { AiNotice } from "@/components/AiNotice";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { assistantReply } from "@/lib/ai.functions";
import { saveChatMessage, todayISO, useChatMessages, useTasks } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "GlowBiz Assistant — AI Salon Chat" },
      {
        name: "description",
        content:
          "Chat with GlowBiz Assistant for salon marketing ideas, customer messages and daily priorities.",
      },
      { property: "og:title", content: "GlowBiz Assistant — AI Salon Chat" },
      {
        property: "og:description",
        content: "Your always-on AI business assistant for the salon floor.",
      },
    ],
  }),
  component: Assistant,
});

const starters = [
  "What should I focus on today?",
  "Give me five ideas to promote my braiding services.",
  "Write a message to a customer who missed their appointment.",
  "How can I get more lash clients?",
  "Help me organize my week.",
  "Summarize my business priorities.",
];

function newId() {
  return crypto.randomUUID();
}

function Assistant() {
  const [conversationId, setConversationId] = useState("");
  const [input, setInput] = useState("");
  const [pending, setPending] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  const { data: stored = [], refetch } = useChatMessages(conversationId);
  const { data: tasks = [] } = useTasks();
  const run = useServerFn(assistantReply);

  useEffect(() => {
    setConversationId(
      window.localStorage.getItem("glowbiz-conversation") ?? (() => {
        const id = newId();
        window.localStorage.setItem("glowbiz-conversation", id);
        return id;
      })(),
    );
  }, []);

  const messages = [
    ...stored.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    ...pending,
  ];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, pending.length]);

  const mutation = useMutation({
    mutationFn: async (text: string) => {
      const history = [...messages, { role: "user" as const, content: text }];
      const openTasks = tasks
        .filter((t) => !t.completed)
        .slice(0, 12)
        .map((t) => `- ${t.title} (${t.importance}, due ${t.deadline ?? "no date"})`)
        .join("\n");
      const reply = await run({
        data: {
          messages: history,
          context: `Today is ${todayISO()}. The owner's current open tasks:\n${openTasks || "(none)"}`,
        },
      });
      await saveChatMessage(conversationId, "user", text);
      await saveChatMessage(conversationId, "assistant", reply.text);
      return reply.text;
    },
    onSuccess: async () => {
      setPending([]);
      await refetch();
    },
    onError: (error: Error) => {
      setPending((p) => p.filter((m) => m.role !== "user" || true).slice(0, -0));
      toast.error(error.message || "GlowBiz Assistant could not reply.");
    },
  });

  function send(text: string) {
    const value = text.trim();
    if (!value || mutation.isPending || !conversationId) return;
    setPending([{ role: "user", content: value }]);
    setInput("");
    mutation.mutate(value);
  }

  function newConversation() {
    const id = newId();
    window.localStorage.setItem("glowbiz-conversation", id);
    setConversationId(id);
    setPending([]);
    toast.success("Started a new conversation");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="GlowBiz Assistant"
        subtitle="Your AI business assistant for the salon. Ask for ideas, messages, or a plan for the day."
        action={
          <Button variant="outline" className="rounded-full" onClick={newConversation}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New conversation
          </Button>
        }
      />

      <Card className="card-glow overflow-hidden rounded-3xl">
        <CardContent className="flex h-[60vh] flex-col gap-4 overflow-y-auto p-4 sm:p-6">
          {messages.length === 0 ? (
            <div className="m-auto max-w-lg text-center">
              <span className="surface-pink mx-auto flex h-14 w-14 items-center justify-center rounded-2xl">
                <Sparkles className="h-6 w-6" aria-hidden="true" />
              </span>
              <h2 className="font-display mt-4 text-2xl font-semibold">
                How can I help your salon today?
              </h2>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {starters.map((s) => (
                  <Button
                    key={s}
                    variant="outline"
                    className="rounded-full text-xs"
                    onClick={() => send(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                  message.role === "user"
                    ? "surface-pink ml-auto rounded-br-lg"
                    : "mr-auto rounded-bl-lg border border-border bg-blush text-blush-foreground",
                )}
              >
                {message.content}
              </div>
            ))
          )}

          {mutation.isPending ? (
            <div
              role="status"
              aria-live="polite"
              className="mr-auto flex items-center gap-2 rounded-3xl border border-border bg-blush px-4 py-3 text-sm text-muted-foreground"
            >
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              GlowBiz Assistant is typing…
            </div>
          ) : null}
          <div ref={endRef} />
        </CardContent>

        <div className="border-t border-border bg-card p-4">
          <div className="flex items-end gap-2">
            <Textarea
              aria-label="Message GlowBiz Assistant"
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Ask anything about running your salon…"
              className="resize-none"
            />
            <Button
              className="h-11 rounded-full"
              onClick={() => send(input)}
              disabled={mutation.isPending || !input.trim()}
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              Send
            </Button>
          </div>
        </div>
      </Card>

      <AiNotice />
    </div>
  );
}
