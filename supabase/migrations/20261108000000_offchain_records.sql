-- Quintti off-chain records.
--
-- The treasury contract on Stellar holds the money and enforces the rules. These tables only add
-- what people need to read it: the building's name, names for known addresses, and, for each
-- expense, a description and its invoice file. Every row is keyed by the treasury contract, so one
-- database can serve several buildings.
--
-- Only the app's server reads and writes them, with the secret key. Row level security is on and no
-- policy grants anything to the anon or authenticated roles, so the public API exposes nothing.
-- See docs/decisions/0013-offchain-records-in-supabase.md.

-- One row per treasury: how the building is called in the app.
create table public.buildings (
  contract_id text primary key
    check (contract_id ~ '^C[A-Z2-7]{55}$'),
  network text not null default 'testnet'
    check (network in ('testnet', 'local')),
  name text not null
    check (char_length(btrim(name)) between 1 and 120),
  city text
    check (city is null or char_length(btrim(city)) between 1 and 120),
  units integer
    check (units is null or units between 1 and 100000),
  created_at timestamptz not null default now()
);

comment on table public.buildings is 'The building behind each treasury contract. Written by the team.';

-- Human names for addresses the building knows: the assembly, the administrator, council members.
create table public.people (
  contract_id text not null
    check (contract_id ~ '^C[A-Z2-7]{55}$'),
  address text not null
    check (address ~ '^[GC][A-Z2-7]{55}$'),
  display_name text not null
    check (char_length(btrim(display_name)) between 1 and 80),
  note text
    check (note is null or char_length(note) <= 160),
  created_at timestamptz not null default now(),
  primary key (contract_id, address)
);

comment on table public.people is 'Names shown instead of raw addresses. Written by the team; never used for authorization.';

-- The words and the file behind each expense. The server writes a row only after checking that the
-- file's SHA-256 equals the invoice_hash the contract stores for that expense.
create table public.expense_details (
  contract_id text not null
    check (contract_id ~ '^C[A-Z2-7]{55}$'),
  expense_id integer not null
    check (expense_id >= 0),
  description text not null
    check (char_length(btrim(description)) between 3 and 500),
  vendor_label text
    check (vendor_label is null or char_length(btrim(vendor_label)) between 1 and 120),
  invoice_hash text not null
    check (invoice_hash ~ '^[0-9a-f]{64}$'),
  invoice_path text not null
    check (char_length(invoice_path) between 1 and 300),
  invoice_name text not null
    check (char_length(invoice_name) between 1 and 200),
  invoice_type text not null
    check (invoice_type in ('application/pdf', 'image/png', 'image/jpeg', 'image/webp')),
  invoice_size integer not null
    check (invoice_size between 1 and 4194304),
  created_at timestamptz not null default now(),
  primary key (contract_id, expense_id)
);

comment on table public.expense_details is 'Description and invoice of an on-chain expense. Written once, verified against the contract.';

-- Details are written once. A correction is a deliberate act by the team (drop the trigger, fix,
-- recreate it), never something the app can do.
create function public.forbid_expense_details_change()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception 'expense details are written once and cannot change';
end;
$$;

create trigger expense_details_write_once
  before update or delete on public.expense_details
  for each row execute function public.forbid_expense_details_change();

-- Nothing is reachable through the public API: only the server, with the secret key.
alter table public.buildings enable row level security;
alter table public.people enable row level security;
alter table public.expense_details enable row level security;

revoke all on table public.buildings, public.people, public.expense_details from anon, authenticated;
revoke all on function public.forbid_expense_details_change() from public, anon, authenticated;

-- Private bucket for invoice files. The server serves them; the limits match the app's own.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('invoices', 'invoices', false, 4194304, array['application/pdf', 'image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;
