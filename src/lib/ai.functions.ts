import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SALON_CONTEXT = `The business is GlowBiz, a small beauty salon offering wigs, braids, hair styling, manicures, nail extensions, nail art, lash extensions and lash styling. The person you help is the salon owner.`;

/* ------------------------------- Email ---------------------------------- */

const EmailInput = z.object({
  recipient: z.string().max(200).default(""),
  purpose: z.string().min(1).max(500),
  details: z.string().max(4000).default(""),
  tone: z.string().max(50).default("Professional"),
  adjustment: z.string().max(200).optional(),
  previousDraft: z.string().max(8000).optional(),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => EmailInput.parse(data))
  .handler(async ({ data }) => {
    const { runAI } = await import("./ai-gateway.server");

    const system = `You are an AI communication assistant for a professional beauty salon. ${SALON_CONTEXT}
Write concise, polished customer emails based only on the information the salon owner provides.
Output format: a subject line on the first line prefixed with "Subject: ", a blank line, then the email body ending with a sign-off placeholder the owner can edit.
Constraints: no markdown, no bullet symbols unless the details need a short list, 120-200 words, match the requested tone exactly.`;

    const prompt = data.previousDraft
      ? `Revise the email draft below. Change requested: ${data.adjustment ?? "improve it"}.
Keep the same facts and the same purpose. Do not add new information.

DRAFT:
${data.previousDraft}`
      : `Recipient / customer: ${data.recipient || "(not provided)"}
Purpose of the email: ${data.purpose}
Important details provided by the owner: ${data.details || "(none provided)"}
Desired tone: ${data.tone}

Write the email now.`;

    return { text: await runAI(system, prompt) };
  });

/* --------------------------- Meeting notes ------------------------------ */

const NotesInput = z.object({ notes: z.string().min(10).max(20000) });

export type NotesSummary = {
  summary: string;
  decisions: string[];
  actionItems: { task: string; responsible: string | null; deadline: string | null }[];
  deadlines: string[];
};

export const summarizeNotes = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => NotesInput.parse(data))
  .handler(async ({ data }): Promise<NotesSummary> => {
    const { runAI, parseJson } = await import("./ai-gateway.server");

    const system = `You are an AI meeting-notes assistant for a beauty salon owner. ${SALON_CONTEXT}
Extract structure from raw notes. Use only what is written in the notes.
Return ONLY valid JSON with this exact shape:
{"summary": string, "decisions": string[], "actionItems": [{"task": string, "responsible": string or null, "deadline": string or null}], "deadlines": string[]}
Use null when a responsible person or deadline is not stated. Never guess names or dates.`;

    const raw = await runAI(system, `Meeting / call notes:\n\n${data.notes}`);
    return parseJson<NotesSummary>(raw, {
      summary: raw,
      decisions: [],
      actionItems: [],
      deadlines: [],
    });
  });

/* ------------------------------ Research -------------------------------- */

const ResearchInput = z.object({
  question: z.string().min(3).max(1000),
});

export type ResearchResult = {
  insights: string[];
  recommendations: string[];
  nextSteps: string[];
  risks: string[];
};

export const researchQuestion = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => ResearchInput.parse(data))
  .handler(async ({ data }): Promise<ResearchResult> => {
    const { runAI, parseJson } = await import("./ai-gateway.server");

    const system = `You are an AI business research assistant for a small beauty salon owner. ${SALON_CONTEXT}
You have no access to the internet, the salon's books, or any live data. Base answers on general small-business and beauty-industry practice, and say so when something depends on the owner's own numbers.
Return ONLY valid JSON with this exact shape:
{"insights": string[], "recommendations": string[], "nextSteps": string[], "risks": string[]}
Each array holds 3-5 short, practical, self-contained sentences. Next steps must be concrete tasks the owner can add to a to-do list.`;

    const raw = await runAI(system, `The salon owner asks: ${data.question}`);
    return parseJson<ResearchResult>(raw, {
      insights: [raw],
      recommendations: [],
      nextSteps: [],
      risks: [],
    });
  });

/* ----------------------------- Day planner ------------------------------ */

const PlanInput = z.object({
  startTime: z.string().max(10).default("09:00"),
  hours: z.number().min(1).max(14).default(8),
  tasks: z
    .array(
      z.object({
        title: z.string(),
        importance: z.string(),
        estimated_minutes: z.number(),
        deadline: z.string().nullable().optional(),
      }),
    )
    .max(50),
});

export type DayPlan = {
  schedule: { time: string; activity: string; why: string }[];
  note: string;
};

export const planMyDay = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => PlanInput.parse(data))
  .handler(async ({ data }): Promise<DayPlan> => {
    const { runAI, parseJson } = await import("./ai-gateway.server");

    const system = `You are an AI task planner for a busy beauty salon owner. ${SALON_CONTEXT}
Order the owner's own tasks by urgency, importance, deadline and effort into a realistic working day. Do not invent tasks the owner did not enter, apart from short breaks.
Return ONLY valid JSON with this exact shape:
{"schedule": [{"time": "09:00-09:30", "activity": string, "why": string}], "note": string}
"why" is one short sentence. "note" is one sentence of advice about the plan.`;

    const list = data.tasks
      .map(
        (t) =>
          `- ${t.title} | importance: ${t.importance} | about ${t.estimated_minutes} min | deadline: ${t.deadline ?? "none"}`,
      )
      .join("\n");

    const raw = await runAI(
      system,
      `Working day starts at ${data.startTime} and lasts about ${data.hours} hours.\nOutstanding tasks:\n${list || "(no tasks entered)"}`,
    );
    return parseJson<DayPlan>(raw, { schedule: [], note: raw });
  });

/* ------------------------------ Assistant ------------------------------- */

const ChatInput = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(6000) }))
    .min(1)
    .max(40),
  context: z.string().max(4000).optional(),
});

export const assistantReply = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => ChatInput.parse(data))
  .handler(async ({ data }) => {
    const { runAIChat } = await import("./ai-gateway.server");

    const system = `You are GlowBiz Assistant, a practical AI business assistant for a beauty salon owner. ${SALON_CONTEXT}
Be concise and actionable: short paragraphs or tight bullet lists, never walls of text. Offer options the owner can act on today.
If the owner asks about their own bookings, revenue or clients, only use details they have written in the conversation or in the context block; otherwise ask for them.
${data.context ? `\nContext the owner's dashboard shared with you:\n${data.context}` : ""}`;

    return { text: await runAIChat(system, data.messages) };
  });

/* -------------------------- Customer message ---------------------------- */

const CustomerMessageInput = z.object({
  name: z.string().max(200),
  contact: z.string().max(200).nullable().optional(),
  preferredService: z.string().max(200).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  lastAppointment: z.string().nullable().optional(),
  nextAppointment: z.string().nullable().optional(),
  purpose: z.string().max(500).default("A friendly check-in and invitation to rebook"),
  tone: z.string().max(50).default("Friendly"),
});

export const customerMessage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => CustomerMessageInput.parse(data))
  .handler(async ({ data }) => {
    const { runAI } = await import("./ai-gateway.server");

    const system = `You are an AI communication assistant for a beauty salon. ${SALON_CONTEXT}
Write a short message (60-120 words) the owner can send by email or WhatsApp. Use only the customer details supplied. Never invent prices, times or services. Leave [square bracket] placeholders where a fact is missing.`;

    const prompt = `Customer name: ${data.name}
Contact: ${data.contact || "(not provided)"}
Preferred service: ${data.preferredService || "(not provided)"}
Owner's notes: ${data.notes || "(none)"}
Last appointment: ${data.lastAppointment || "(not provided)"}
Next appointment: ${data.nextAppointment || "(none booked)"}
Purpose: ${data.purpose}
Tone: ${data.tone}`;

    return { text: await runAI(system, prompt) };
  });
