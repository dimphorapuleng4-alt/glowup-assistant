import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Clock, Plus, Trash2, Wand2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AiBadge, AiNotice } from "@/components/AiNotice";
import { AiThinking } from "@/components/Loading";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { planMyDay, type DayPlan } from "@/lib/ai.functions";
import {
  isThisWeek,
  todayISO,
  useAddTasks,
  useDeleteTask,
  useTasks,
  useUpdateTask,
  type Task,
} from "@/lib/data";
import { imageAlt, salonImages } from "@/lib/images";

export const Route = createFileRoute("/task-planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — GlowBiz AI" },
      {
        name: "description",
        content:
          "Capture salon tasks, sort them by urgency and effort, and let AI build a realistic daily schedule.",
      },
      { property: "og:title", content: "AI Task Planner — GlowBiz AI" },
      {
        property: "og:description",
        content: "Plan your salon day in one click with AI-ordered priorities.",
      },
    ],
  }),
  component: TaskPlanner,
});

function TaskPlanner() {
  const { data: tasks = [] } = useTasks();
  const addTasks = useAddTasks();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState(todayISO());
  const [importance, setImportance] = useState("medium");
  const [minutes, setMinutes] = useState("30");
  const [plan, setPlan] = useState<DayPlan | null>(null);

  const run = useServerFn(planMyDay);
  const planMutation = useMutation({
    mutationFn: async () =>
      run({
        data: {
          startTime: "09:00",
          hours: 8,
          tasks: open.map((t) => ({
            title: t.title,
            importance: t.importance,
            estimated_minutes: t.estimated_minutes,
            deadline: t.deadline,
          })),
        },
      }),
    onSuccess: (data) => setPlan(data),
    onError: (error: Error) => toast.error(error.message || "The AI could not build a plan."),
  });

  const open = tasks.filter((t) => !t.completed);
  const today = todayISO();
  const groups = {
    today: open.filter((t) => t.deadline && t.deadline <= today),
    week: open.filter((t) => t.deadline && t.deadline > today && isThisWeek(t.deadline)),
    upcoming: open.filter((t) => !t.deadline || !isThisWeek(t.deadline)),
  };
  const done = tasks.filter((t) => t.completed);

  function addTask() {
    if (!title.trim()) return;
    addTasks.mutate(
      [
        {
          title: title.trim(),
          deadline: deadline || null,
          importance,
          estimated_minutes: Number(minutes) || 30,
        },
      ],
      {
        onSuccess: () => {
          toast.success("Task created");
          setTitle("");
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Task Planner"
        subtitle="Everything you need to get done, ordered by what actually matters today."
        action={
          <Button
            size="lg"
            className="rounded-full"
            disabled={planMutation.isPending || open.length === 0}
            onClick={() => planMutation.mutate()}
          >
            <Wand2 className="h-4 w-4" aria-hidden="true" />
            Plan my day with AI
          </Button>
        }
      />

      <Card className="card-glow rounded-3xl">
        <CardHeader>
          <CardTitle className="font-display text-xl">Add a task</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr_1fr_auto] md:items-end">
            <div className="space-y-2">
              <Label htmlFor="task-title">Task</Label>
              <Input
                id="task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                placeholder="e.g. Order hair products"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-deadline">Deadline</Label>
              <Input
                id="task-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-importance">Importance</Label>
              <Select value={importance} onValueChange={setImportance}>
                <SelectTrigger id="task-importance">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-minutes">Minutes</Label>
              <Input
                id="task-minutes"
                type="number"
                min={5}
                step={5}
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
              />
            </div>
            <Button className="rounded-full" onClick={addTask} disabled={addTasks.isPending}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {planMutation.isPending ? <AiThinking label="GlowBiz AI is planning your day…" /> : null}

      {plan ? (
        <Card className="card-glow rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle className="font-display text-xl">Your AI day plan</CardTitle>
            <AiBadge />
          </CardHeader>
          <CardContent className="space-y-3">
            {plan.schedule.map((slot, i) => (
              <div
                key={i}
                className="flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-2xl border border-border bg-background/60 p-4"
              >
                <span className="font-display w-32 font-semibold">{slot.time}</span>
                <span className="font-medium">{slot.activity}</span>
                <span className="w-full text-xs text-muted-foreground sm:w-auto">{slot.why}</span>
              </div>
            ))}
            {plan.note ? <p className="text-sm text-muted-foreground">{plan.note}</p> : null}
          </CardContent>
        </Card>
      ) : null}

      <Tabs defaultValue="today">
        <TabsList className="rounded-full">
          <TabsTrigger value="today" className="rounded-full">
            Today ({groups.today.length})
          </TabsTrigger>
          <TabsTrigger value="week" className="rounded-full">
            This week ({groups.week.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="rounded-full">
            Upcoming ({groups.upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="done" className="rounded-full">
            Done ({done.length})
          </TabsTrigger>
        </TabsList>

        {(
          [
            ["today", groups.today],
            ["week", groups.week],
            ["upcoming", groups.upcoming],
            ["done", done],
          ] as const
        ).map(([key, list]) => (
          <TabsContent key={key} value={key} className="mt-4 space-y-3">
            {list.length === 0 ? (
              <div className="flex items-center gap-4 rounded-3xl border border-dashed border-border p-6">
                <img
                  src={salonImages.salon}
                  alt={imageAlt.salon}
                  width={1600}
                  height={900}
                  loading="lazy"
                  className="h-20 w-28 rounded-2xl object-cover"
                />
                <p className="text-sm text-muted-foreground">Nothing here right now.</p>
              </div>
            ) : (
              list.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggle={(completed) =>
                    updateTask.mutate(
                      { id: task.id, completed },
                      { onSuccess: () => completed && toast.success("Task completed") },
                    )
                  }
                  onImportance={(value) => updateTask.mutate({ id: task.id, importance: value })}
                  onRename={(value) => updateTask.mutate({ id: task.id, title: value })}
                  onDelete={() =>
                    deleteTask.mutate(task.id, { onSuccess: () => toast.success("Task deleted") })
                  }
                />
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>

      <AiNotice />
    </div>
  );
}

function TaskRow({
  task,
  onToggle,
  onImportance,
  onRename,
  onDelete,
}: {
  task: Task;
  onToggle: (completed: boolean) => void;
  onImportance: (value: string) => void;
  onRename: (value: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(task.title);

  return (
    <div className="card-glow flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4">
      <Checkbox
        checked={task.completed}
        onCheckedChange={(checked) => onToggle(Boolean(checked))}
        aria-label={`Mark ${task.title} as complete`}
      />
      <div className="min-w-0 flex-1">
        {editing ? (
          <Input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => {
              setEditing(false);
              if (value.trim() && value !== task.title) {
                onRename(value.trim());
                toast.success("Task updated");
              }
            }}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="block max-w-full truncate text-left font-medium hover:underline"
          >
            <span className={task.completed ? "line-through opacity-60" : undefined}>
              {task.title}
            </span>
          </button>
        )}
        <p className="mt-0.5 text-xs text-muted-foreground">
          {task.deadline ? `Due ${task.deadline}` : "No deadline"} ·{" "}
          <Clock className="inline h-3 w-3" aria-hidden="true" /> {task.estimated_minutes} min
          {task.owner ? ` · ${task.owner}` : ""}
          {task.source !== "manual" ? ` · from ${task.source}` : ""}
        </p>
      </div>
      <Select value={task.importance} onValueChange={onImportance}>
        <SelectTrigger className="w-32" aria-label="Priority">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>
      <Badge variant="secondary" className="hidden rounded-full capitalize sm:inline-flex">
        {task.importance}
      </Badge>
      <Button variant="ghost" size="icon" aria-label="Delete task" onClick={onDelete}>
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
