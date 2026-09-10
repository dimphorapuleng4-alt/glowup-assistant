
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT,
  preferred_service TEXT,
  notes TEXT,
  last_appointment DATE,
  next_appointment DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO anon, authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Demo workspace can manage customers" ON public.customers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  image_key TEXT NOT NULL DEFAULT 'salon',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO anon, authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Demo workspace can manage services" ON public.services FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  details TEXT,
  owner TEXT,
  deadline DATE,
  importance TEXT NOT NULL DEFAULT 'medium',
  estimated_minutes INTEGER NOT NULL DEFAULT 30,
  completed BOOLEAN NOT NULL DEFAULT false,
  source TEXT NOT NULL DEFAULT 'manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO anon, authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Demo workspace can manage tasks" ON public.tasks FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.ai_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_results TO anon, authenticated;
GRANT ALL ON public.ai_results TO service_role;
ALTER TABLE public.ai_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Demo workspace can manage ai results" ON public.ai_results FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX chat_messages_conversation_idx ON public.chat_messages (conversation_id, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO anon, authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Demo workspace can manage chat" ON public.chat_messages FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO public.services (category, name, description, price, duration_minutes, image_key) VALUES
('Hair', 'Wig Installation', 'Custom lace wig fitting, styling and finish. Sample price - edit to match your salon.', 850.00, 120, 'wigs'),
('Hair', 'Knotless Braids', 'Full head knotless braids in your choice of length. Sample price - edit to match your salon.', 900.00, 240, 'braids'),
('Hair', 'Silk Press & Styling', 'Wash, treatment, blow dry and silk press finish. Sample price - edit to match your salon.', 450.00, 90, 'styling'),
('Nails', 'Classic Manicure', 'Shape, cuticle care and polish of your choice. Sample price - edit to match your salon.', 250.00, 45, 'nails'),
('Nails', 'Nail Extensions', 'Acrylic or gel extensions with a gloss finish. Sample price - edit to match your salon.', 480.00, 90, 'nails'),
('Nails', 'Nail Art Add-on', 'Hand painted art, chrome or rhinestone detail. Sample price - edit to match your salon.', 120.00, 30, 'nails'),
('Lashes', 'Classic Lash Extensions', 'Natural one-to-one lash extension set. Sample price - edit to match your salon.', 400.00, 90, 'lashes'),
('Lashes', 'Volume Lash Styling', 'Fuller volume fans styled to your eye shape. Sample price - edit to match your salon.', 550.00, 120, 'lashes');

INSERT INTO public.customers (name, contact, preferred_service, notes, last_appointment, next_appointment) VALUES
('Thandi Mokoena', 'thandi@example.com', 'Knotless Braids', 'Prefers medium-sized braids, mid-back length.', CURRENT_DATE - 21, CURRENT_DATE + 3),
('Lerato Dlamini', '+27 82 000 1122', 'Volume Lash Styling', 'Sensitive eyes, uses low-fume adhesive.', CURRENT_DATE - 14, CURRENT_DATE + 1),
('Aisha Patel', 'aisha@example.com', 'Nail Extensions', 'Loves soft pink chrome finishes.', CURRENT_DATE - 7, CURRENT_DATE + 10),
('Naledi Khumalo', '+27 71 555 3344', 'Wig Installation', 'Bringing her own lace frontal.', CURRENT_DATE - 30, NULL),
('Zanele Ndlovu', 'zanele@example.com', 'Silk Press & Styling', 'Books before family events, usually Fridays.', CURRENT_DATE - 5, CURRENT_DATE + 6);

INSERT INTO public.tasks (title, details, owner, deadline, importance, estimated_minutes, completed, source) VALUES
('Confirm today''s appointments', 'Send confirmation messages to all clients booked today.', 'Owner', CURRENT_DATE, 'high', 30, false, 'manual'),
('Order lash supplies', 'Adhesive and 0.07 volume trays running low.', 'Sarah', CURRENT_DATE, 'high', 20, false, 'manual'),
('Reply to customer messages', 'WhatsApp and Instagram enquiries from yesterday.', 'Owner', CURRENT_DATE, 'medium', 45, false, 'manual'),
('Post Instagram promotion for braids', 'Share the new knotless braids special.', 'Owner', CURRENT_DATE + 1, 'medium', 30, false, 'manual'),
('Buy nail supplies', 'Gel top coat, files and chrome powder.', 'Owner', CURRENT_DATE + 2, 'medium', 60, false, 'manual'),
('Pay hair product supplier', 'Settle the monthly invoice.', 'Owner', CURRENT_DATE + 4, 'high', 15, false, 'manual'),
('Prepare salon for the weekend', 'Deep clean stations and restock towels.', 'Owner', CURRENT_DATE + 5, 'low', 90, false, 'manual'),
('Follow up with Naledi about her wig install', 'She has not rebooked since last month.', 'Owner', CURRENT_DATE + 3, 'medium', 15, false, 'manual');

INSERT INTO public.ai_results (feature, title, content) VALUES
('research', 'Ideas to increase weekday bookings', 'AI-generated draft: Consider a midweek loyalty offer, a lunchtime express manicure slot, and a referral reward for regular clients. Review these ideas against your own costs before promoting them.'),
('email', 'Appointment reminder draft', 'AI-generated draft: A friendly reminder message confirming date, time and preparation notes for an upcoming braiding appointment.');
