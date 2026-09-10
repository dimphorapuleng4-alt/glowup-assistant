import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarCheck,
  Mail,
  MessageSquareHeart,
  NotebookPen,
  Search,
  Sparkles,
  Wand2,
} from "lucide-react";

import { AiNotice } from "@/components/AiNotice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAiResults, useCustomers, useTasks, todayISO } from "@/lib/data";
import { imageAlt, salonImages } from "@/lib/images";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GlowBiz AI — Salon Dashboard" },
      {
        name: "description",
        content:
          "GlowBiz AI is an AI-powered dashboard for beauty salons: appointments, tasks, customer emails and business research in one place.",
      },
      { property: "og:title", content: "GlowBiz AI — Salon Dashboard" },
      {
        property: "og:description",
        content: "Spend less time managing your salon and more time serving your clients.",
      },
    ],
  }),
  component: Dashboard,
});

const quickActions = [
  { to: "/email-assistant", label: "Generate Customer Email", icon: Mail },
  { to: "/meeting-notes", label: "Summarize Meeting", icon: NotebookPen },
  { to: "/task-planner", label: "Plan My Day", icon: CalendarCheck },
  { to: "/research", label: "Research My Business", icon: Search },
  { to: "/assistant", label: "Ask AI Salon Assistant", icon: Sparkles },
] as const;

const inspiration = [
  { key: "wigs" as const, label: "Wigs" },
  { key: "braids" as const, label: "Braids" },
  { key: "nails" as const, label: "Nails" },
  { key: "lashes" as const, label: "Lashes" },
];

function Dashboard() {
  const { data: tasks = [] } = useTasks();
  const { data: customers = [] } = useCustomers();
  const { data: aiResults = [] } = useAiResults(4);

  const today = todayISO();
  const appointmentsToday = customers.filter((c) => c.next_appointment === today);
  const tasksDueToday = tasks.filter((t) => !t.completed && t.deadline && t.deadline <= today);
  const openTasks = tasks.filter((t) => !t.completed);
  const priorities = [...openTasks]
    .sort((a, b) => {
      const rank = { high: 0, medium: 1, low: 2 } as Record<string, number>;
      const byImportance = (rank[a.importance] ?? 1) - (rank[b.importance] ?? 1);
      if (byImportance !== 0) return byImportance;
      return (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999");
    })
    .slice(0, 5);

  const stats = [
    {
      label: "Today's Appointments",
      value: appointmentsToday.length,
      hint: appointmentsToday.map((c) => c.name).join(", ") || "Nothing booked for today",
    },
    {
      label: "Tasks Due Today",
      value: tasksDueToday.length,
      hint: `${openTasks.length} open in total`,
    },
    {
      label: "Customers",
      value: customers.length,
      hint: "Saved in your client book",
    },
    {
      label: "Saved AI Results",
      value: aiResults.length,
      hint: "Drafts and insights you kept",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="surface-blush relative overflow-hidden rounded-3xl border border-border p-6 shadow-[var(--shadow-soft)] sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <Badge className="rounded-full bg-card text-foreground shadow-[var(--shadow-soft)]">
              GlowBiz AI
            </Badge>
            <h1 className="font-display mt-4 text-4xl font-semibold sm:text-5xl">
              Good morning <span aria-hidden="true">👋</span>
            </h1>
            <p className="mt-3 max-w-lg text-base text-muted-foreground">
              Let&apos;s make running your salon easier today.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full">
                <Link to="/task-planner">
                  <Wand2 className="h-4 w-4" aria-hidden="true" />
                  Plan my day
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full bg-card">
                <Link to="/assistant">Ask GlowBiz Assistant</Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {inspiration.map(({ key, label }, index) => (
              <figure
                key={key}
                className="group relative overflow-hidden rounded-2xl shadow-[var(--shadow-soft)]"
              >
                <img
                  src={salonImages[key]}
                  alt={imageAlt[key]}
                  width={1024}
                  height={768}
                  loading={index === 0 ? "eager" : "lazy"}
                  className="h-32 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-40"
                />
                <figcaption className="absolute bottom-2 left-2 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold">
                  {label}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="card-glow rounded-3xl border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-4xl font-semibold">{stat.value}</p>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{stat.hint}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section>
        <h2 className="font-display mb-4 text-2xl font-semibold">AI Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {quickActions.map(({ to, label, icon: Icon }) => (
            <Button
              key={to}
              asChild
              variant="outline"
              className="card-glow h-auto justify-start rounded-2xl border-border bg-card px-5 py-5 text-left hover:-translate-y-0.5 hover:bg-blush"
            >
              <Link to={to}>
                <span className="surface-pink mr-3 flex h-10 w-10 items-center justify-center rounded-xl">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-base font-semibold">{label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="card-glow rounded-3xl">
          <CardHeader>
            <CardTitle className="font-display text-xl">Today&apos;s Priorities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {priorities.length === 0 ? (
              <EmptyState
                image="products"
                text="No open tasks yet. Add your first one in the AI Task Planner."
              />
            ) : (
              priorities.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-background/60 p-4"
                >
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.deadline ? `Due ${task.deadline}` : "No deadline"} ·{" "}
                      {task.estimated_minutes} min
                    </p>
                  </div>
                  <Badge
                    variant={task.importance === "high" ? "default" : "secondary"}
                    className="rounded-full capitalize"
                  >
                    {task.importance}
                  </Badge>
                </div>
              ))
            )}
            <Button asChild variant="ghost" className="rounded-full">
              <Link to="/task-planner">Open task planner</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="card-glow rounded-3xl">
          <CardHeader>
            <CardTitle className="font-display text-xl">Recent AI Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiResults.length === 0 ? (
              <EmptyState
                image="salon"
                text="Saved AI drafts and insights will appear here once you start generating."
              />
            ) : (
              aiResults.map((result) => (
                <div key={result.id} className="rounded-2xl border border-border bg-background/60 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{result.title}</p>
                    <Badge variant="secondary" className="rounded-full capitalize">
                      {result.feature}
                    </Badge>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{result.content}</p>
                </div>
              ))
            )}
            <Button asChild variant="ghost" className="rounded-full">
              <Link to="/research">
                <MessageSquareHeart className="h-4 w-4" aria-hidden="true" />
                Research something new
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="font-display mb-4 text-2xl font-semibold">Salon Inspiration</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(["wigs", "braids", "nails", "lashes"] as const).map((key) => (
            <figure key={key} className="card-glow overflow-hidden rounded-3xl border border-border bg-card">
              <img
                src={salonImages[key]}
                alt={imageAlt[key]}
                width={1024}
                height={768}
                loading="lazy"
                className="h-44 w-full object-cover"
              />
              <figcaption className="p-4 text-sm font-medium capitalize">{key}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <AiNotice />
    </div>
  );
}

function EmptyState({ image, text }: { image: "products" | "salon"; text: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-dashed border-border p-4">
      <img
        src={salonImages[image]}
        alt={imageAlt[image]}
        width={1024}
        height={768}
        loading="lazy"
        className="h-16 w-16 rounded-xl object-cover"
      />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
