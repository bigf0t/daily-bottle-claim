
-- Create users table function
CREATE OR REPLACE FUNCTION create_users_table_if_not_exists()
RETURNS void AS $$
BEGIN
  -- Check if the table exists, if not create it
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    CREATE TABLE public.users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      total_claims INTEGER DEFAULT 0,
      streak INTEGER DEFAULT 0,
      last_claim TIMESTAMP WITH TIME ZONE DEFAULT NULL,
      is_admin BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
    );
    
    -- Add RLS policies for the users table
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    
    -- Policy for admin to see all
    CREATE POLICY "Admins can see all users" ON public.users
      FOR SELECT USING (auth.uid() IN (
        SELECT id FROM public.users WHERE is_admin = true
      ));
    
    -- Policy for users to see their own data
    CREATE POLICY "Users can see their own data" ON public.users
      FOR SELECT USING (auth.uid()::text = id::text);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create logs table function
CREATE OR REPLACE FUNCTION create_logs_table_if_not_exists()
RETURNS void AS $$
BEGIN
  -- Check if the table exists, if not create it
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'claim_logs') THEN
    CREATE TABLE public.claim_logs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
      username TEXT NOT NULL,
      result TEXT NOT NULL,
      ip_address TEXT,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
    );
    
    -- Add indexes for better performance
    CREATE INDEX claim_logs_user_id_idx ON public.claim_logs(user_id);
    CREATE INDEX claim_logs_timestamp_idx ON public.claim_logs(timestamp);
    
    -- Add RLS policies for the logs table
    ALTER TABLE public.claim_logs ENABLE ROW LEVEL SECURITY;
    
    -- Policy for admin to see all logs
    CREATE POLICY "Admins can see all logs" ON public.claim_logs
      FOR SELECT USING (auth.uid() IN (
        SELECT id FROM public.users WHERE is_admin = true
      ));
  END IF;
END;
$$ LANGUAGE plpgsql;
