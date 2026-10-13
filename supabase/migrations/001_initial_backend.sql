create extension if not exists pgcrypto;

create table if not exists public.products (
  id text primary key,
  name text not null,
  base_price numeric(10, 2) not null check (base_price >= 0),
  category text not null,
  images text[] not null default '{}',
  description text not null default '',
  customizable boolean not null default true,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_options (
  product_id text primary key references public.products(id) on delete cascade,
  colors text[] not null default '{}',
  sizes text[] not null default '{}'
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'pending',
  fulfillment_status text not null default 'needs_review',
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  customer_email text,
  customer_name text,
  shipping_line1 text,
  shipping_line2 text,
  shipping_city text,
  shipping_state text,
  shipping_postal_code text,
  shipping_country text,
  subtotal_cents integer not null default 0,
  tax_cents integer not null default 0,
  total_cents integer not null default 0,
  admin_notes text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text references public.products(id),
  product_name text not null,
  product_price_cents integer not null,
  color text not null,
  size text not null,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.order_item_uploads (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  storage_bucket text not null,
  storage_path text not null,
  original_filename text not null,
  mime_type text,
  file_size integer,
  created_at timestamptz not null default now()
);

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'footer',
  created_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_products_updated_at on public.products;
create trigger touch_products_updated_at
before update on public.products
for each row execute function public.touch_updated_at();

drop trigger if exists touch_orders_updated_at on public.orders;
create trigger touch_orders_updated_at
before update on public.orders
for each row execute function public.touch_updated_at();

insert into storage.buckets (id, name, public)
values ('pet-photos', 'pet-photos', false)
on conflict (id) do nothing;

alter table public.products enable row level security;
alter table public.product_options enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_item_uploads enable row level security;
alter table public.subscribers enable row level security;

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
on public.products for select
using (active = true);

drop policy if exists "Public can read product options for active products" on public.product_options;
create policy "Public can read product options for active products"
on public.product_options for select
using (
  exists (
    select 1 from public.products
    where products.id = product_options.product_id
      and products.active = true
  )
);

insert into public.products
  (id, name, base_price, category, images, description, customizable, active, sort_order)
values
  ('embroidered-hoodie', 'Embroidered Hoodie', 110, 'Hoodies', array['/assets/embroidered-hoodie.jpeg','/assets/gallery-1.png'], 'A soft fleece hoodie stitched with a custom portrait of your favorite pet.', true, true, 10),
  ('embroidered-crewneck', 'Embroidered Crewneck', 100, 'Crewnecks', array['/assets/embroidered-crewneck.jpg','/assets/gallery-2.png'], 'A classic crewneck with portrait embroidery placed over the heart.', true, true, 20),
  ('embroidered-sweatsuit', 'Embroidered Sweatsuit Set', 145, 'Sets', array['/assets/embroidered-sweatsuit-set.jpg','/assets/gallery-3.png'], 'A matching hoodie and jogger set with a sweet custom pet portrait detail.', true, true, 30),
  ('pet-name-add-on', 'Pet Name Add-On', 10, 'Add-Ons', array['/assets/custom-portrait-crew.jpg','/assets/gallery-4.png'], 'Warm neutral fleece finished with a detailed thread portrait.', true, true, 40),
  ('pet-face-add-on', 'Additional Pet Face Add-On', 30, 'Add-Ons', array['/assets/faq-embroidered-frenchies.jpg','/assets/gallery-5.png'], 'A relaxed hoodie designed for everyday wear and tiny embroidered tributes.', true, true, 50),
  ('gift-card', 'ThePawPatch Gift Card', 25, 'Gifts', array['/assets/custom-embroidery-gift-card.jpg'], 'Give them a head start on their own custom pet portrait piece.', false, true, 60)
on conflict (id) do update set
  name = excluded.name,
  base_price = excluded.base_price,
  category = excluded.category,
  images = excluded.images,
  description = excluded.description,
  customizable = excluded.customizable,
  active = excluded.active,
  sort_order = excluded.sort_order;

insert into public.product_options (product_id, colors, sizes)
values
  ('embroidered-hoodie', array['Blush','Cream','Sage','Charcoal'], array['XS','S','M','L','XL','2XL']),
  ('embroidered-crewneck', array['Sky','Sand','Ivory','Olive'], array['XS','S','M','L','XL','2XL']),
  ('embroidered-sweatsuit', array['Buttercream','Heather','Rose','Forest'], array['XS','S','M','L','XL']),
  ('pet-name-add-on', array['Oat','Mocha','Pine','White'], array['S','M','L','XL']),
  ('pet-face-add-on', array['Mint','Petal','Cream','Black'], array['XS','S','M','L','XL','2XL']),
  ('gift-card', array['Digital'], array['$25','$50','$100','$150'])
on conflict (product_id) do update set
  colors = excluded.colors,
  sizes = excluded.sizes;
