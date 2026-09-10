DROP POLICY IF EXISTS "Demo workspace can manage ai results" ON public.ai_results;
DROP POLICY IF EXISTS "Demo workspace can manage chat" ON public.chat_messages;
DROP POLICY IF EXISTS "Demo workspace can manage customers" ON public.customers;
DROP POLICY IF EXISTS "Demo workspace can manage services" ON public.services;
DROP POLICY IF EXISTS "Demo workspace can manage tasks" ON public.tasks;

REVOKE ALL ON public.ai_results FROM anon;
REVOKE ALL ON public.chat_messages FROM anon;
REVOKE ALL ON public.customers FROM anon;
REVOKE ALL ON public.tasks FROM anon;
REVOKE ALL ON public.services FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_results TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT SELECT ON public.services TO anon;

GRANT ALL ON public.ai_results TO service_role;
GRANT ALL ON public.chat_messages TO service_role;
GRANT ALL ON public.customers TO service_role;
GRANT ALL ON public.tasks TO service_role;
GRANT ALL ON public.services TO service_role;

ALTER TABLE public.ai_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signed-in staff manage ai results" ON public.ai_results FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Signed-in staff manage chat" ON public.chat_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Signed-in staff manage customers" ON public.customers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Signed-in staff manage tasks" ON public.tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can view services" ON public.services FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Signed-in staff insert services" ON public.services FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Signed-in staff update services" ON public.services FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Signed-in staff delete services" ON public.services FOR DELETE TO authenticated USING (true);