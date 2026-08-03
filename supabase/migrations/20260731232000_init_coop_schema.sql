CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    member_id VARCHAR(50) UNIQUE,
    identity_type VARCHAR(20) DEFAULT 'guest',
    status VARCHAR(20) DEFAULT 'trial',
    trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    trial_end_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) + INTERVAL '30 days',
    stock_shares INT DEFAULT 0,
    contribution_points INT DEFAULT 0,
    edu_training_completed BOOLEAN DEFAULT FALSE,
    id_card_front_url TEXT,
    remittance_proof_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price_member NUMERIC(10, 2) NOT NULL,
    price_guest NUMERIC(10, 2) NOT NULL,
    is_tax_exempt BOOLEAN DEFAULT FALSE,
    temp_control VARCHAR(20) DEFAULT 'room_temp',
    is_preorder BOOLEAN DEFAULT FALSE,
    preorder_threshold INT DEFAULT 0,
    preorder_deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    temp_control VARCHAR(20) DEFAULT 'room_temp',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_product UNIQUE (member_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id) ON DELETE RESTRICT,
    total_amount NUMERIC(10, 2) NOT NULL,
    tax_amount NUMERIC(10, 2) DEFAULT 0.00,
    status VARCHAR(30) DEFAULT 'surveying',
    delivery_method VARCHAR(30) DEFAULT 'self_pickup',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL,
    tax_type VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
    payment_method VARCHAR(30) NOT NULL,
    status VARCHAR(20) DEFAULT 'unpaid',
    bank_last_five VARCHAR(5),
    invoice_number VARCHAR(50),
    paid_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.logistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
    recipient_name VARCHAR(100) NOT NULL,
    recipient_phone VARCHAR(20) NOT NULL,
    delivery_address TEXT,
    store_code_711 VARCHAR(10),
    shipment_no VARCHAR(100),
    temp_layer VARCHAR(20) DEFAULT 'room_temp',
    status VARCHAR(20) DEFAULT 'preparing',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.wishlist_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    product_name VARCHAR(150) NOT NULL,
    type VARCHAR(20) NOT NULL,
    expected_qty INT DEFAULT 1,
    reference_link TEXT,
    points_awarded INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
AS $$
BEGIN
  INSERT INTO public.members (user_id, email, name, phone, status)
  VALUES (
    new.id,
    COALESCE(new.email, concat(replace(new.id::text, '-', ''), '@placeholder.local')),
    COALESCE(new.raw_user_meta_data->>'name', '體驗訪客'),
    COALESCE(new.raw_user_meta_data->>'phone', concat('u-', substr(replace(new.id::text, '-', ''), 1, 18))),
    'trial'
  );
  RETURN NEW;
END;
$$
LANGUAGE plpgsql
SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
