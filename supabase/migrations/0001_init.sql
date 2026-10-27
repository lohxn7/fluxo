-- Fluxo — schema inicial no Supabase
-- Roda uma vez, colado no SQL Editor do painel (Project → SQL Editor → New query).
-- Idempotente: pode rodar de novo sem quebrar nada que já exista.

-- 1) Perfil (1 por usuário, estende auth.users com as preferências do app)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  theme text not null default 'claro' check (theme in ('claro','escuro','alto-contraste','automatico')),
  font_scale numeric not null default 1 check (font_scale >= 1 and font_scale <= 1.5),
  reduce_motion boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2) Colunas do quadro
create table if not exists public.columns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  "order" integer not null default 0,
  wip_limit integer,
  created_at timestamptz not null default now()
);

-- 3) Etiquetas
create table if not exists public.labels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null,
  created_at timestamptz not null default now()
);

-- 4) Tarefas
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  column_id uuid not null references public.columns(id) on delete cascade,
  label_id uuid references public.labels(id) on delete set null,
  title text not null,
  description text not null default '',
  priority text not null default 'media' check (priority in ('alta','media','baixa')),
  due_date date,
  due_time time,
  "order" integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5) Itens de checklist
create table if not exists public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  text text not null,
  done boolean not null default false,
  "order" integer not null default 0
);

-- 6) Anexos (só metadados — o arquivo em si vai pro Storage, bucket "attachments")
create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  mime_type text not null,
  size bigint not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_columns_user on public.columns(user_id);
create index if not exists idx_labels_user on public.labels(user_id);
create index if not exists idx_tasks_user on public.tasks(user_id);
create index if not exists idx_tasks_column on public.tasks(column_id);
create index if not exists idx_checklist_task on public.checklist_items(task_id);
create index if not exists idx_attachments_task on public.attachments(task_id);

-- Row Level Security: cada usuário só enxerga e mexe no que é dele
alter table public.profiles enable row level security;
alter table public.columns enable row level security;
alter table public.labels enable row level security;
alter table public.tasks enable row level security;
alter table public.checklist_items enable row level security;
alter table public.attachments enable row level security;

drop policy if exists "profiles: dono lê e edita" on public.profiles;
create policy "profiles: dono lê e edita" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "columns: dono lê e edita" on public.columns;
create policy "columns: dono lê e edita" on public.columns
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "labels: dono lê e edita" on public.labels;
create policy "labels: dono lê e edita" on public.labels
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "tasks: dono lê e edita" on public.tasks;
create policy "tasks: dono lê e edita" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "checklist: dono lê e edita" on public.checklist_items;
create policy "checklist: dono lê e edita" on public.checklist_items
  for all using (
    exists (select 1 from public.tasks t where t.id = checklist_items.task_id and t.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.tasks t where t.id = checklist_items.task_id and t.user_id = auth.uid())
  );

drop policy if exists "attachments: dono lê e edita" on public.attachments;
create policy "attachments: dono lê e edita" on public.attachments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Quando alguém cria conta: perfil + as 3 colunas padrão (estrutura, não dado de exemplo)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''));

  insert into public.columns (user_id, name, "order", wip_limit) values
    (new.id, 'A fazer', 0, null),
    (new.id, 'Fazendo', 1, 3),
    (new.id, 'Concluído', 2, null);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Bucket de anexos (privado — acesso só via RLS abaixo)
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;

drop policy if exists "attachments storage: dono lê e edita" on storage.objects;
create policy "attachments storage: dono lê e edita" on storage.objects
  for all using (
    bucket_id = 'attachments' and auth.uid()::text = (storage.foldername(name))[1]
  ) with check (
    bucket_id = 'attachments' and auth.uid()::text = (storage.foldername(name))[1]
  );
