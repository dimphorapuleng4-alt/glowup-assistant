import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
export type Customer = Database["public"]["Tables"]["customers"]["Row"];
export type CustomerInsert = Database["public"]["Tables"]["customers"]["Insert"];
export type Service = Database["public"]["Tables"]["services"]["Row"];
export type ServiceUpdate = Database["public"]["Tables"]["services"]["Update"];
export type AiResult = Database["public"]["Tables"]["ai_results"]["Row"];

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as T;
}

/* ------------------------------- Tasks ---------------------------------- */

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () =>
      unwrap<Task[]>(
        await supabase
          .from("tasks")
          .select("*")
          .order("completed", { ascending: true })
          .order("deadline", { ascending: true, nullsFirst: false })
          .order("created_at", { ascending: true }),
      ),
  });
}

export function useAddTasks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tasks: TaskInsert[]) => {
      const { error } = await supabase.from("tasks").insert(tasks);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Task> & { id: string }) => {
      const { error } = await supabase.from("tasks").update(patch).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

/* ----------------------------- Customers -------------------------------- */

export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: async () =>
      unwrap<Customer[]>(
        await supabase.from("customers").select("*").order("created_at", { ascending: true }),
      ),
  });
}

export function useSaveCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (customer: CustomerInsert & { id?: string }) => {
      const { error } = customer.id
        ? await supabase.from("customers").update(customer).eq("id", customer.id)
        : await supabase.from("customers").insert(customer);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("customers").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}

/* ------------------------------ Services -------------------------------- */

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: async () =>
      unwrap<Service[]>(
        await supabase
          .from("services")
          .select("*")
          .order("category", { ascending: true })
          .order("created_at", { ascending: true }),
      ),
  });
}

export function useSaveService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: ServiceUpdate & { id: string }) => {
      const { error } = await supabase.from("services").update(patch).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
}

/* ----------------------------- AI results ------------------------------- */

export function useAiResults(limit = 8) {
  return useQuery({
    queryKey: ["ai_results", limit],
    queryFn: async () =>
      unwrap<AiResult[]>(
        await supabase
          .from("ai_results")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(limit),
      ),
  });
}

export function useSaveAiResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (result: { feature: string; title: string; content: string }) => {
      const { error } = await supabase.from("ai_results").insert(result);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai_results"] }),
  });
}

/* -------------------------------- Chat ---------------------------------- */

export function useChatMessages(conversationId: string) {
  return useQuery({
    queryKey: ["chat", conversationId],
    queryFn: async () =>
      unwrap<Database["public"]["Tables"]["chat_messages"]["Row"][]>(
        await supabase
          .from("chat_messages")
          .select("*")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true }),
      ),
    enabled: Boolean(conversationId),
  });
}

export async function saveChatMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
) {
  await supabase.from("chat_messages").insert({ conversation_id: conversationId, role, content });
}

/* ------------------------------- Helpers -------------------------------- */

export const todayISO = () => new Date().toISOString().slice(0, 10);

export function isToday(date: string | null) {
  return Boolean(date) && date === todayISO();
}

export function isThisWeek(date: string | null) {
  if (!date) return false;
  const d = new Date(date + "T00:00:00");
  const now = new Date();
  const end = new Date(now);
  end.setDate(now.getDate() + 7);
  return d >= new Date(todayISO() + "T00:00:00") && d <= end;
}
