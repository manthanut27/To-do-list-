-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- Create tasks table with recurrence support
CREATE TYPE public.recurrence_type AS ENUM ('none', 'daily', 'weekly', 'monthly', 'yearly');

CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  due_date TIMESTAMPTZ,
  recurrence recurrence_type DEFAULT 'none',
  recurrence_end_date TIMESTAMPTZ,
  parent_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON public.tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create next recurring task
CREATE OR REPLACE FUNCTION public.create_next_recurring_task()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  next_due_date TIMESTAMPTZ;
BEGIN
  -- Only create next task if this one is completed and has recurrence
  IF NEW.completed = TRUE AND NEW.recurrence != 'none' AND OLD.completed = FALSE THEN
    -- Calculate next due date based on recurrence type
    CASE NEW.recurrence
      WHEN 'daily' THEN
        next_due_date := NEW.due_date + INTERVAL '1 day';
      WHEN 'weekly' THEN
        next_due_date := NEW.due_date + INTERVAL '1 week';
      WHEN 'monthly' THEN
        next_due_date := NEW.due_date + INTERVAL '1 month';
      WHEN 'yearly' THEN
        next_due_date := NEW.due_date + INTERVAL '1 year';
      ELSE
        next_due_date := NULL;
    END CASE;

    -- Only create if before end date (if set)
    IF next_due_date IS NOT NULL AND 
       (NEW.recurrence_end_date IS NULL OR next_due_date <= NEW.recurrence_end_date) THEN
      INSERT INTO public.tasks (
        user_id,
        project_id,
        title,
        description,
        priority,
        due_date,
        recurrence,
        recurrence_end_date,
        parent_task_id
      ) VALUES (
        NEW.user_id,
        NEW.project_id,
        NEW.title,
        NEW.description,
        NEW.priority,
        next_due_date,
        NEW.recurrence,
        NEW.recurrence_end_date,
        NEW.id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER create_recurring_task_trigger
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.create_next_recurring_task();