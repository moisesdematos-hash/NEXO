-- NEXO PostgreSQL Initial Schema Migration
-- Database architecture for Profiles, Tasks, Calendar Events, Lists, Goals, Learning MVP, Family RLS and AI Logs.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    phone_number TEXT,
    is_guest BOOLEAN DEFAULT FALSE,
    preferences JSONB DEFAULT '{"theme": "light", "simple_mode": false}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Trigger for Auto Creation of Profiles on Auth User Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, is_guest)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE((NEW.raw_user_meta_data->>'is_guest')::boolean, FALSE)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. FAMILY GROUPS & MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.family_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    invite_code TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(6), 'hex'),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    permissions JSONB DEFAULT '{"can_edit": true, "can_invite": false}'::jsonb,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(family_id, user_id)
);

ALTER TABLE public.family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Helper function to check family membership
CREATE OR REPLACE FUNCTION public.is_family_member(group_id UUID, member_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.family_members
        WHERE family_id = group_id AND user_id = member_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Family RLS Policies
CREATE POLICY "Family members can view group" ON public.family_groups
    FOR SELECT USING (public.is_family_member(id, auth.uid()));

CREATE POLICY "Owners can update family group" ON public.family_groups
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Family members can view members list" ON public.family_members
    FOR SELECT USING (public.is_family_member(family_id, auth.uid()));

-- 3. TASKS TABLE (Private vs Shared RLS)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    family_id UUID REFERENCES public.family_groups(id) ON DELETE SET NULL,
    is_private BOOLEAN DEFAULT TRUE,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS: Private tasks accessible ONLY to creator; Shared tasks accessible to family members
CREATE POLICY "Users can view private or family tasks" ON public.tasks
    FOR SELECT USING (
        (is_private = TRUE AND user_id = auth.uid()) OR
        (is_private = FALSE AND family_id IS NOT NULL AND public.is_family_member(family_id, auth.uid()))
    );

CREATE POLICY "Users can insert tasks" ON public.tasks
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users or family can update tasks" ON public.tasks
    FOR UPDATE USING (
        user_id = auth.uid() OR
        (is_private = FALSE AND family_id IS NOT NULL AND public.is_family_member(family_id, auth.uid()))
    );

CREATE POLICY "Users can delete own tasks" ON public.tasks
    FOR DELETE USING (user_id = auth.uid());

-- 4. EVENTS TABLE (Calendar)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    family_id UUID REFERENCES public.family_groups(id) ON DELETE SET NULL,
    is_private BOOLEAN DEFAULT TRUE,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    is_all_day BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view private or family events" ON public.events
    FOR SELECT USING (
        (is_private = TRUE AND user_id = auth.uid()) OR
        (is_private = FALSE AND family_id IS NOT NULL AND public.is_family_member(family_id, auth.uid()))
    );

CREATE POLICY "Users can manage own events" ON public.events
    FOR ALL USING (user_id = auth.uid());

-- 5. LISTS & LIST ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    family_id UUID REFERENCES public.family_groups(id) ON DELETE SET NULL,
    is_private BOOLEAN DEFAULT TRUE,
    title TEXT NOT NULL,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.list_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view private or family lists" ON public.lists
    FOR SELECT USING (
        (is_private = TRUE AND user_id = auth.uid()) OR
        (is_private = FALSE AND family_id IS NOT NULL AND public.is_family_member(family_id, auth.uid()))
    );

CREATE POLICY "Users can manage own lists" ON public.lists
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view items in readable lists" ON public.list_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.lists
            WHERE lists.id = list_items.list_id AND (
                (lists.is_private = TRUE AND lists.user_id = auth.uid()) OR
                (lists.is_private = FALSE AND lists.family_id IS NOT NULL AND public.is_family_member(lists.family_id, auth.uid()))
            )
        )
    );

-- 6. GOALS & LEARNING MVP TABLES
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_value INT DEFAULT 100,
    current_value INT DEFAULT 0,
    unit TEXT DEFAULT '%',
    deadline TIMESTAMPTZ,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.learning_objectives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    progress_percent INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.learning_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    objective_id UUID NOT NULL REFERENCES public.learning_objectives(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.learning_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL REFERENCES public.learning_plans(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own goals" ON public.goals FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users manage own learning objectives" ON public.learning_objectives FOR ALL USING (user_id = auth.uid());

-- 7. AI CONVERSATIONS & ACTIONS LOG TABLES
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'Conversa com Assistente NEXO',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_actions_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'failed', 'cancelled')),
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_actions_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own AI conversations" ON public.ai_conversations FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users view own AI actions log" ON public.ai_actions_log FOR SELECT USING (user_id = auth.uid());
