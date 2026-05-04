-- Tabela de contratos
create table if not exists contracts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  sender_name text not null,
  sender_email text not null,
  pdf_url text,           -- URL do PDF no Supabase Storage (upload)
  template_content text,  -- Conteúdo de texto se for template
  type text not null default 'pdf', -- 'pdf' ou 'template'
  created_at timestamptz default now()
);

-- Tabela de signatários
create table if not exists signatories (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid references contracts(id) on delete cascade,
  name text not null,
  email text not null,
  token uuid default gen_random_uuid(), -- token único do link de assinatura
  signed_at timestamptz,
  signed_name text,    -- nome que o signatário digitou ao assinar
  ip_address text,
  created_at timestamptz default now()
);

-- Habilitar RLS
alter table contracts enable row level security;
alter table signatories enable row level security;

-- Políticas abertas (ajuste para produção com auth)
create policy "allow all" on contracts for all using (true);
create policy "allow all" on signatories for all using (true);

-- Storage bucket para PDFs
insert into storage.buckets (id, name, public) 
values ('contracts', 'contracts', true)
on conflict do nothing;

create policy "allow uploads" on storage.objects
  for insert with check (bucket_id = 'contracts');

create policy "allow reads" on storage.objects
  for select using (bucket_id = 'contracts');
