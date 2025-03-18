-- Create user_streaks table
create table public.user_streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_reflection_date timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.user_streaks enable row level security;

-- Create policies
create policy "Users can view their own streaks"
  on public.user_streaks for select
  using (auth.uid() = user_id);

create policy "Users can update their own streaks"
  on public.user_streaks for update
  using (auth.uid() = user_id);

create policy "Users can insert their own streaks"
  on public.user_streaks for insert
  with check (auth.uid() = user_id);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_user_streaks_updated_at
  before update on public.user_streaks
  for each row
  execute function public.handle_updated_at(); 