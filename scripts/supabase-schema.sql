-- Tabela de progresso (uma por usuário)
create table if not exists progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade unique,
  child_name text default 'Minha Criança',
  level integer default 1,
  vocabulary jsonb default '{"colors":0,"animals":0,"fruits":0,"numbers":0,"house":0}',
  games_played integer default 0,
  songs_listened integer default 0,
  streak integer default 0,
  last_active timestamptz default now(),
  created_at timestamptz default now()
);

-- Segurança: cada usuário só vê/edita seu próprio progresso
alter table progress enable row level security;

create policy "Users can view own progress"
  on progress for select using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on progress for insert with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on progress for update using (auth.uid() = user_id);

-- Tabela de músicas dos usuários
create table if not exists user_songs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  title_pt text default '',
  theme text default '',
  duration integer default 120,
  audio_file text default '',
  audio_url text default '',
  youtube_url text default '',
  lyrics jsonb default '[]',
  difficulty text default 'easy',
  active boolean default true,
  tags text[] default '{}',
  created_at timestamptz default now()
);

alter table user_songs enable row level security;

create policy "Users can manage own songs"
  on user_songs for all using (auth.uid() = user_id);
