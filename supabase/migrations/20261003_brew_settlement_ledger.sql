-- Brew Battle payment and settlement ledger.
-- Apply to the EspresSUI Supabase project before enabling automated settlement.

create table if not exists public.brew_entry_payments (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references public.battle_rounds(id) on delete cascade,
  wallet_address text not null,
  tx_digest text not null unique,
  amount_mist bigint not null check (amount_mist = 100000000),
  network text not null default 'testnet',
  status text not null default 'verified' check (status in ('verified','consumed','refunded')),
  consumed_attempt_id uuid null,
  created_at timestamptz not null default now(),
  consumed_at timestamptz null
);

create index if not exists brew_entry_payments_battle_idx
  on public.brew_entry_payments (battle_id, created_at);

create index if not exists brew_entry_payments_wallet_idx
  on public.brew_entry_payments (wallet_address, battle_id);

create table if not exists public.brew_round_settlements (
  battle_id uuid primary key references public.battle_rounds(id) on delete cascade,
  total_entries integer not null,
  unique_brewers integer not null,
  total_pool_mist bigint not null,
  buyback_burn_mist bigint not null,
  marketing_mist bigint not null,
  status text not null default 'pending' check (status in ('pending','paying','paid','failed')),
  settled_at timestamptz null,
  created_at timestamptz not null default now()
);

create table if not exists public.brew_round_payouts (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references public.battle_rounds(id) on delete cascade,
  place integer not null check (place between 1 and 3),
  wallet_address text not null,
  score integer not null,
  share_pct numeric(5,2) not null,
  amount_mist bigint not null,
  amount_sui numeric(20,9) not null,
  status text not null default 'pending' check (status in ('pending','submitted','paid','failed')),
  tx_digest text null unique,
  paid_at timestamptz null,
  created_at timestamptz not null default now(),
  unique (battle_id, place)
);

create index if not exists brew_round_payouts_battle_idx
  on public.brew_round_payouts (battle_id, place);

alter table public.brew_entry_payments enable row level security;
alter table public.brew_round_settlements enable row level security;
alter table public.brew_round_payouts enable row level security;

-- No public write policies are intentionally created.
-- Server-side service credentials remain the only writer.
