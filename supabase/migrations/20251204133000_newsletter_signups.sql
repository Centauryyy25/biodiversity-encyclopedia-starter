-- Create newsletter signups table
CREATE TABLE IF NOT EXISTS public.newsletter_signups (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text NOT NULL UNIQUE,
    topic text,
    source text DEFAULT 'homepage',
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.handle_newsletter_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS handle_newsletter_updated_at ON public.newsletter_signups;
CREATE TRIGGER handle_newsletter_updated_at
BEFORE UPDATE ON public.newsletter_signups
FOR EACH ROW EXECUTE FUNCTION public.handle_newsletter_updated_at();

-- Enable row level security (service key bypasses by default)
ALTER TABLE public.newsletter_signups ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts for newsletter signups
DROP POLICY IF EXISTS "Allow public newsletter signups" ON public.newsletter_signups;
CREATE POLICY "Allow public newsletter signups"
    ON public.newsletter_signups
    FOR INSERT
    WITH CHECK (true);
