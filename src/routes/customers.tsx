import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Mail, Pencil, Plus, Trash2, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AiBadge, AiNotice } from "@/components/AiNotice";
import { AiThinking } from "@/components/Loading";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { customerMessage } from "@/lib/ai.functions";
import {
  useCustomers,
  useDeleteCustomer,
  useSaveAiResult,
  useSaveCustomer,
  type Customer,
} from "@/lib/data";

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Customers — GlowBiz AI" },
      {
        name: "description",
        content:
          "Keep salon clients, preferred services and appointment dates in one place, and draft messages with AI.",
      },
      { property: "og:title", content: "Customers — GlowBiz AI" },
      {
        property: "og:description",
        content: "Your salon client book, with AI-written follow-up messages.",
      },
    ],
  }),
  component: Customers,
});

const empty = {
  name: "",
  contact: "",
  preferred_service: "",
  notes: "",
  last_appointment: "",
  next_appointment: "",
};

function Customers() {
  const { data: customers = [] } = useCustomers();
  const saveCustomer = useSaveCustomer();
  const deleteCustomer = useDeleteCustomer();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<typeof empty & { id?: string }>(empty);

  function submit() {
    if (!form.name.trim()) return;
    saveCustomer.mutate(
      {
        ...form,
        name: form.name.trim(),
        last_appointment: form.last_appointment || null,
        next_appointment: form.next_appointment || null,
      },
      {
        onSuccess: () => {
          toast.success(form.id ? "Customer updated" : "Customer added");
          setOpen(false);
          setForm(empty);
        },
        onError: () => toast.error("Could not save that customer"),
      },
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        subtitle="Your client book — preferred services, appointment dates and personal notes."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full" onClick={() => setForm(empty)}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add customer
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle className="font-display">
                  {form.id ? "Edit customer" : "New customer"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 sm:grid-cols-2">
                {(
                  [
                    ["name", "Name", "text"],
                    ["contact", "Email or phone", "text"],
                    ["preferred_service", "Preferred service", "text"],
                    ["last_appointment", "Last appointment", "date"],
                    ["next_appointment", "Next appointment", "date"],
                  ] as const
                ).map(([key, label, type]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key}>{label}</Label>
                    <Input
                      id={key}
                      type={type}
                      value={form[key] ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    />
                  </div>
                ))}
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    rows={3}
                    value={form.notes ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Hair type, allergies, style preferences…"
                  />
                </div>
              </div>
              <Button className="rounded-full" onClick={submit} disabled={saveCustomer.isPending}>
                Save customer
              </Button>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {customers.map((customer) => (
          <CustomerCard
            key={customer.id}
            customer={customer}
            onEdit={() => {
              setForm({
                id: customer.id,
                name: customer.name,
                contact: customer.contact ?? "",
                preferred_service: customer.preferred_service ?? "",
                notes: customer.notes ?? "",
                last_appointment: customer.last_appointment ?? "",
                next_appointment: customer.next_appointment ?? "",
              });
              setOpen(true);
            }}
            onDelete={() =>
              deleteCustomer.mutate(customer.id, {
                onSuccess: () => toast.success("Customer removed"),
              })
            }
          />
        ))}
        {customers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No customers yet. Add your first client to get started.
          </p>
        ) : null}
      </div>

      <AiNotice />
    </div>
  );
}

function CustomerCard({
  customer,
  onEdit,
  onDelete,
}: {
  customer: Customer;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [message, setMessage] = useState("");
  const run = useServerFn(customerMessage);
  const saveResult = useSaveAiResult();

  const mutation = useMutation({
    mutationFn: async () =>
      run({
        data: {
          name: customer.name,
          contact: customer.contact,
          preferredService: customer.preferred_service,
          notes: customer.notes,
          lastAppointment: customer.last_appointment,
          nextAppointment: customer.next_appointment,
        },
      }),
    onSuccess: (data) => setMessage(data.text),
    onError: (error: Error) => toast.error(error.message || "The AI could not write that message."),
  });

  return (
    <Card className="card-glow flex flex-col rounded-3xl">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="min-w-0">
          <CardTitle className="font-display flex items-center gap-2 text-lg">
            <UserRound className="h-4.5 w-4.5 text-pink" aria-hidden="true" />
            <span className="truncate">{customer.name}</span>
          </CardTitle>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {customer.contact || "No contact saved"}
          </p>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" aria-label="Edit customer" onClick={onEdit}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Delete customer" onClick={onDelete}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 text-sm">
        {customer.preferred_service ? (
          <Badge variant="secondary" className="w-fit rounded-full">
            {customer.preferred_service}
          </Badge>
        ) : null}
        <p className="text-xs text-muted-foreground">
          Last visit: {customer.last_appointment ?? "—"} · Next: {customer.next_appointment ?? "—"}
        </p>
        {customer.notes ? <p className="text-muted-foreground">{customer.notes}</p> : null}

        {mutation.isPending ? <AiThinking label="Writing a message…" /> : null}

        {message ? (
          <div className="space-y-2 rounded-2xl border border-border bg-background/60 p-3">
            <AiBadge />
            <Textarea
              aria-label={`Message for ${customer.name}`}
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="rounded-full"
                onClick={() => {
                  navigator.clipboard.writeText(message);
                  toast.success("Message copied");
                }}
              >
                <Copy className="h-4 w-4" aria-hidden="true" />
                Copy
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="rounded-full"
                onClick={() =>
                  saveResult.mutate(
                    {
                      feature: "customer-message",
                      title: `Message for ${customer.name}`,
                      content: message,
                    },
                    { onSuccess: () => toast.success("Message saved") },
                  )
                }
              >
                Save
              </Button>
            </div>
          </div>
        ) : null}

        <Button
          variant="outline"
          className="mt-auto rounded-full"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          <Mail className="h-4 w-4" aria-hidden="true" />
          {message ? "Regenerate message" : "Generate customer message"}
        </Button>
      </CardContent>
    </Card>
  );
}
