import { createFileRoute } from "@tanstack/react-router";
import { Moon, ShieldCheck, Sun } from "lucide-react";

import { RESPONSIBLE_AI_TEXT } from "@/components/AiNotice";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings & Responsible AI — GlowBiz AI" },
      {
        name: "description",
        content:
          "Switch between light and dark mode and read how GlowBiz AI uses artificial intelligence responsibly.",
      },
      { property: "og:title", content: "Settings & Responsible AI — GlowBiz AI" },
      {
        property: "og:description",
        content: "Appearance settings and responsible AI guidance for your salon dashboard.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, toggle } = useTheme();
  const setTheme = (next: "light" | "dark") => {
    if (next !== theme) toggle();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Personalise how GlowBiz looks and understand how the AI features work."
      />

      <Card className="card-glow rounded-3xl">
        <CardHeader>
          <CardTitle className="font-display text-xl">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            variant={theme === "light" ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setTheme("light")}
          >
            <Sun className="h-4 w-4" aria-hidden="true" />
            Light mode
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setTheme("dark")}
          >
            <Moon className="h-4 w-4" aria-hidden="true" />
            Dark mode
          </Button>
        </CardContent>
      </Card>

      <Card className="card-glow rounded-3xl">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2 text-xl">
            <ShieldCheck className="h-5 w-5 text-pink" aria-hidden="true" />
            Responsible AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>{RESPONSIBLE_AI_TEXT}</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Every AI answer is a draft suggestion — always review it before sending.</li>
            <li>
              The assistant will not invent customer details, prices, appointment times or
              guaranteed results.
            </li>
            <li>
              It does not browse the internet; research answers are general business guidance based
              on the model's training.
            </li>
            <li>
              Only share information with the assistant that you are comfortable processing
              digitally, and keep sensitive client data to a minimum.
            </li>
            <li>You stay responsible for the final decisions and messages your salon sends.</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="card-glow rounded-3xl">
        <CardHeader>
          <CardTitle className="font-display text-xl">About GlowBiz AI</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          GlowBiz AI is a management dashboard for a beauty salon offering wigs, braids, nails and
          lashes. Customers, services, tasks, saved AI outputs and chat history are stored in your
          project database so your work is here next time you open it.
        </CardContent>
      </Card>
    </div>
  );
}
