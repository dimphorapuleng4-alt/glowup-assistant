import { createFileRoute } from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useSaveService, useServices, type Service } from "@/lib/data";
import { imageAlt, imageFor, salonImages } from "@/lib/images";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services & Pricing — GlowBiz AI" },
      {
        name: "description",
        content:
          "Manage wigs, braids, nails and lash services with editable sample prices and durations.",
      },
      { property: "og:title", content: "Services & Pricing — GlowBiz AI" },
      {
        property: "og:description",
        content: "Your salon service menu, easy to edit and always up to date.",
      },
    ],
  }),
  component: Services,
});

function Services() {
  const { data: services = [] } = useServices();
  const saveService = useSaveService();
  const [editing, setEditing] = useState<Service | null>(null);

  const categories = Array.from(new Set(services.map((s) => s.category)));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Services & Pricing"
        subtitle="Sample prices and durations you can edit to match your salon exactly."
      />

      {categories.map((category) => (
        <section key={category} className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">{category}</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {services
              .filter((s) => s.category === category)
              .map((service) => (
                <Card key={service.id} className="card-glow overflow-hidden rounded-3xl pt-0">
                  <img
                    src={imageFor(service.image_key)}
                    alt={imageAlt[service.image_key as keyof typeof imageAlt] ?? service.name}
                    width={1600}
                    height={900}
                    loading="lazy"
                    className="h-40 w-full object-cover"
                  />
                  <CardContent className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-display text-lg font-semibold">{service.name}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${service.name}`}
                        onClick={() => setEditing(service)}
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                    {service.description ? (
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      <Badge className="rounded-full">R{service.price}</Badge>
                      <Badge variant="secondary" className="rounded-full">
                        {service.duration_minutes} min
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </section>
      ))}

      <p className="text-xs text-muted-foreground">
        Prices and durations shown are sample values for this demo salon — edit any service to use
        your real pricing.
      </p>

      <Dialog open={Boolean(editing)} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display">Edit service</DialogTitle>
          </DialogHeader>
          {editing ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="service-name">Name</Label>
                <Input
                  id="service-name"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="service-description">Description</Label>
                <Textarea
                  id="service-description"
                  rows={3}
                  value={editing.description ?? ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-price">Price</Label>
                <Input
                  id="service-price"
                  type="number"
                  min={0}
                  value={editing.price}
                  onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-duration">Duration (minutes)</Label>
                <Input
                  id="service-duration"
                  type="number"
                  min={5}
                  step={5}
                  value={editing.duration_minutes}
                  onChange={(e) =>
                    setEditing({ ...editing, duration_minutes: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="service-image">Image</Label>
                <Select
                  value={editing.image_key}
                  onValueChange={(value) => setEditing({ ...editing, image_key: value })}
                >
                  <SelectTrigger id="service-image">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(salonImages).map((key) => (
                      <SelectItem key={key} value={key} className="capitalize">
                        {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="rounded-full sm:col-span-2"
                disabled={saveService.isPending}
                onClick={() =>
                  saveService.mutate(
                    {
                      id: editing.id,
                      name: editing.name,
                      description: editing.description,
                      price: editing.price,
                      duration_minutes: editing.duration_minutes,
                      image_key: editing.image_key,
                    },
                    {
                      onSuccess: () => {
                        toast.success("Service updated");
                        setEditing(null);
                      },
                      onError: () => toast.error("Could not update that service"),
                    },
                  )
                }
              >
                Save changes
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
