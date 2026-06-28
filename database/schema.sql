-- Create table for storing GitScope AI analyses
CREATE TABLE IF NOT EXISTS public.analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    github_username TEXT UNIQUE NOT NULL,
    dna_type TEXT,
    ai_summary TEXT,
    consistency_analysis JSONB,
    repo_intelligence JSONB,
    recruiter_mode JSONB,
    roadmap JSONB,
    developer_wrapped JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Setup RLS (Row Level Security) so the backend can read/write but public can only read
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to analyses"
ON public.analyses FOR SELECT
USING (true);

-- Backend service key will bypass RLS for inserts/updates
