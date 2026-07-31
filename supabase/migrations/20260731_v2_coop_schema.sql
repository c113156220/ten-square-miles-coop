-- 10M Co-op v2 Migration SQL
-- Target: PostgreSQL (Supabase)
-- Strategy: non-destructive first, then constraints/indexes
-- ======================================================

BEGIN;

-- ======================================================
-- 0) Prerequisites
-- ======================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ======================================================
-- 1) ENUM types (replace free-text status/type fields)
-- ======================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'member_identity_type_enum') THEN
    CREATE TYPE member_identity_type_enum AS ENUM ('guest', 'verified_member', 'admin', 'board');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'member_status_enum') THEN
    CREATE TYPE member_status_enum AS ENUM ('trial', 'pending', 'verified', 'expired');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_category_enum') THEN
    CREATE TYPE product_category_enum AS ENUM ('bento', 'agricultural', 'processed_food', 'daily_use');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'temp_control_enum') THEN
    CREATE TYPE temp_control_enum AS ENUM ('room_temp', 'refrigerated', 'frozen');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'delivery_method_enum') THEN
    CREATE TYPE delivery_method_enum AS ENUM ('self_pickup', 'home_delivery', 'store_delivery_711');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_stage_enum') THEN
    CREATE TYPE order_stage_enum AS ENUM ('surveying', 'pre_ordering', 'confirmed', 'cancelled');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fulfillment_status_enum') THEN
    CREATE TYPE fulfillment_status_enum AS ENUM ('pending', 'sourcing', 'preparing', 'ready_for_pickup', 'shipped', 'completed', 'cancelled');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum') THEN
    CREATE TYPE payment_status_enum AS ENUM ('unpaid', 'paid', 'failed', 'refunded', 'partially_refunded');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_enum') THEN
    CREATE TYPE payment_method_enum AS ENUM ('credit_card', 'action_pay', 'bank_transfer');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tax_type_enum') THEN
    CREATE TYPE tax_type_enum AS ENUM ('exempt', 'taxable');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'logistics_status_enum') THEN
    CREATE TYPE logistics_status_enum AS ENUM ('preparing', 'shipped', 'arrived', 'picked_up', 'cancelled');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'temp_layer_enum') THEN
    CREATE TYPE temp_layer_enum AS ENUM ('room_temp', 'cold', 'frozen');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'wishlist_type_enum') THEN
    CREATE TYPE wishlist_type_enum AS ENUM ('wishlist', 'survey');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pickup_timeslot_enum') THEN
    CREATE TYPE pickup_timeslot_enum AS ENUM ('lunch', 'dinner');
  END IF;
END$$;

-- ======================================================
-- 2) members: convert identity_type/status to ENUM
-- ======================================================

ALTER TABLE members
  ADD COLUMN IF NOT EXISTS identity_type_v2 member_identity_type_enum,
  ADD COLUMN IF NOT EXISTS status_v2 member_status_enum;

UPDATE members
SET identity_type_v2 = CASE identity_type
  WHEN 'guest' THEN 'guest'::member_identity_type_enum
  WHEN 'verified_member' THEN 'verified_member'::member_identity_type_enum
  WHEN 'admin' THEN 'admin'::member_identity_type_enum
  WHEN 'board' THEN 'board'::member_identity_type_enum
  ELSE 'guest'::member_identity_type_enum
END
WHERE identity_type_v2 IS NULL;

UPDATE members
SET status_v2 = CASE status
  WHEN 'trial' THEN 'trial'::member_status_enum
  WHEN 'pending' THEN 'pending'::member_status_enum
  WHEN 'verified' THEN 'verified'::member_status_enum
  WHEN 'expired' THEN 'expired'::member_status_enum
  ELSE 'trial'::member_status_enum
END
WHERE status_v2 IS NULL;

ALTER TABLE members
  ALTER COLUMN identity_type_v2 SET NOT NULL,
  ALTER COLUMN status_v2 SET NOT NULL,
  ALTER COLUMN identity_type_v2 SET DEFAULT 'guest',
  ALTER COLUMN status_v2 SET DEFAULT 'trial';

ALTER TABLE members DROP COLUMN IF EXISTS identity_type;
ALTER TABLE members DROP COLUMN IF EXISTS status;
ALTER TABLE members RENAME COLUMN identity_type_v2 TO identity_type;
ALTER TABLE members RENAME COLUMN status_v2 TO status;

-- ======================================================
-- 3) products: convert category/temp and add constraints
-- ======================================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS category_v2 product_category_enum,
  ADD COLUMN IF NOT EXISTS temp_control_v2 temp_control_enum;

UPDATE products
SET category_v2 = CASE category
  WHEN 'bento' THEN 'bento'::product_category_enum
  WHEN 'agricultural' THEN 'agricultural'::product_category_enum
  WHEN 'processed_food' THEN 'processed_food'::product_category_enum
  WHEN 'daily_use' THEN 'daily_use'::product_category_enum
  ELSE 'daily_use'::product_category_enum
END
WHERE category_v2 IS NULL;

UPDATE products
SET temp_control_v2 = CASE temp_control
  WHEN 'room_temp' THEN 'room_temp'::temp_control_enum
  WHEN 'refrigerated' THEN 'refrigerated'::temp_control_enum
  WHEN 'frozen' THEN 'frozen'::temp_control_enum
  ELSE 'room_temp'::temp_control_enum
END
WHERE temp_control_v2 IS NULL;

ALTER TABLE products
  ALTER COLUMN category_v2 SET NOT NULL,
  ALTER COLUMN temp_control_v2 SET NOT NULL,
  ALTER COLUMN temp_control_v2 SET DEFAULT 'room_temp';

ALTER TABLE products DROP COLUMN IF EXISTS category;
ALTER TABLE products DROP COLUMN IF EXISTS temp_control;
ALTER TABLE products RENAME COLUMN category_v2 TO category;
ALTER TABLE products RENAME COLUMN temp_control_v2 TO temp_control;

ALTER TABLE products
  ADD CONSTRAINT products_price_member_non_negative CHECK (price_member >= 0),
  ADD CONSTRAINT products_price_guest_non_negative CHECK (price_guest >= 0),
  ADD CONSTRAINT products_preorder_threshold_non_negative CHECK (preorder_threshold >= 0);

-- ======================================================
-- 4) orders: split status into order_stage + fulfillment_status
--            add bento fields and amount constraints
-- ======================================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS order_stage order_stage_enum,
  ADD COLUMN IF NOT EXISTS fulfillment_status fulfillment_status_enum,
  ADD COLUMN IF NOT EXISTS delivery_method_v2 delivery_method_enum,
  ADD COLUMN IF NOT EXISTS meal_date date,
  ADD COLUMN IF NOT EXISTS pickup_timeslot pickup_timeslot_enum,
  ADD COLUMN IF NOT EXISTS kitchen_note text;

UPDATE orders
SET order_stage = CASE status
  WHEN 'surveying' THEN 'surveying'::order_stage_enum
  WHEN 'pre_ordering' THEN 'pre_ordering'::order_stage_enum
  WHEN 'cancelled' THEN 'cancelled'::order_stage_enum
  ELSE 'confirmed'::order_stage_enum
END
WHERE order_stage IS NULL;

UPDATE orders
SET fulfillment_status = CASE status
  WHEN 'sourcing' THEN 'sourcing'::fulfillment_status_enum
  WHEN 'ready_for_pickup' THEN 'ready_for_pickup'::fulfillment_status_enum
  WHEN 'completed' THEN 'completed'::fulfillment_status_enum
  WHEN 'cancelled' THEN 'cancelled'::fulfillment_status_enum
  WHEN 'pre_ordering' THEN 'pending'::fulfillment_status_enum
  WHEN 'surveying' THEN 'pending'::fulfillment_status_enum
  ELSE 'pending'::fulfillment_status_enum
END
WHERE fulfillment_status IS NULL;

UPDATE orders
SET delivery_method_v2 = CASE delivery_method
  WHEN 'self_pickup' THEN 'self_pickup'::delivery_method_enum
  WHEN 'home_delivery' THEN 'home_delivery'::delivery_method_enum
  WHEN 'store_delivery_711' THEN 'store_delivery_711'::delivery_method_enum
  ELSE 'self_pickup'::delivery_method_enum
END
WHERE delivery_method_v2 IS NULL;

ALTER TABLE orders
  ALTER COLUMN order_stage SET NOT NULL,
  ALTER COLUMN order_stage SET DEFAULT 'confirmed',
  ALTER COLUMN fulfillment_status SET NOT NULL,
  ALTER COLUMN fulfillment_status SET DEFAULT 'pending',
  ALTER COLUMN delivery_method_v2 SET NOT NULL,
  ALTER COLUMN delivery_method_v2 SET DEFAULT 'self_pickup';

ALTER TABLE orders DROP COLUMN IF EXISTS status;
ALTER TABLE orders DROP COLUMN IF EXISTS delivery_method;
ALTER TABLE orders RENAME COLUMN delivery_method_v2 TO delivery_method;

ALTER TABLE orders
  ADD CONSTRAINT orders_total_amount_non_negative CHECK (total_amount >= 0),
  ADD CONSTRAINT orders_tax_amount_non_negative CHECK (tax_amount >= 0);

-- ======================================================
-- 5) order_items: tax fields to improve invoice traceability
-- ======================================================

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS tax_type_v2 tax_type_enum,
  ADD COLUMN IF NOT EXISTS tax_rate numeric(5,4) NOT NULL DEFAULT 0.0000,
  ADD COLUMN IF NOT EXISTS tax_amount numeric(10,2) NOT NULL DEFAULT 0.00;

UPDATE order_items
SET tax_type_v2 = CASE tax_type
  WHEN 'exempt' THEN 'exempt'::tax_type_enum
  WHEN 'taxable' THEN 'taxable'::tax_type_enum
  ELSE 'taxable'::tax_type_enum
END
WHERE tax_type_v2 IS NULL;

ALTER TABLE order_items
  ALTER COLUMN tax_type_v2 SET NOT NULL;

ALTER TABLE order_items DROP COLUMN IF EXISTS tax_type;
ALTER TABLE order_items RENAME COLUMN tax_type_v2 TO tax_type;

ALTER TABLE order_items
  ADD CONSTRAINT order_items_unit_price_non_negative CHECK (unit_price >= 0),
  ADD CONSTRAINT order_items_tax_rate_range CHECK (tax_rate >= 0 AND tax_rate <= 1),
  ADD CONSTRAINT order_items_tax_amount_non_negative CHECK (tax_amount >= 0);

-- ======================================================
-- 6) payments: switch 1:1 -> 1:N and add gateway fields
-- ======================================================

-- drop old unique constraint on order_id (if exists)
DO $$
DECLARE
  c_name text;
BEGIN
  SELECT conname INTO c_name
  FROM pg_constraint
  WHERE conrelid = 'payments'::regclass
    AND contype = 'u'
    AND conname ILIKE '%order_id%';

  IF c_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE payments DROP CONSTRAINT %I', c_name);
  END IF;
END$$;

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS provider varchar(50),
  ADD COLUMN IF NOT EXISTS provider_txn_id varchar(120),
  ADD COLUMN IF NOT EXISTS gateway_payload jsonb,
  ADD COLUMN IF NOT EXISTS refunded_amount numeric(10,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS status_v2 payment_status_enum,
  ADD COLUMN IF NOT EXISTS payment_method_v2 payment_method_enum;

UPDATE payments
SET status_v2 = CASE status
  WHEN 'unpaid' THEN 'unpaid'::payment_status_enum
  WHEN 'paid' THEN 'paid'::payment_status_enum
  WHEN 'refunded' THEN 'refunded'::payment_status_enum
  ELSE 'unpaid'::payment_status_enum
END
WHERE status_v2 IS NULL;

UPDATE payments
SET payment_method_v2 = CASE payment_method
  WHEN 'credit_card' THEN 'credit_card'::payment_method_enum
  WHEN 'action_pay' THEN 'action_pay'::payment_method_enum
  WHEN 'bank_transfer' THEN 'bank_transfer'::payment_method_enum
  ELSE 'bank_transfer'::payment_method_enum
END
WHERE payment_method_v2 IS NULL;

ALTER TABLE payments
  ALTER COLUMN status_v2 SET NOT NULL,
  ALTER COLUMN status_v2 SET DEFAULT 'unpaid',
  ALTER COLUMN payment_method_v2 SET NOT NULL;

ALTER TABLE payments DROP COLUMN IF EXISTS status;
ALTER TABLE payments DROP COLUMN IF EXISTS payment_method;
ALTER TABLE payments RENAME COLUMN status_v2 TO status;
ALTER TABLE payments RENAME COLUMN payment_method_v2 TO payment_method;

ALTER TABLE payments
  ADD CONSTRAINT payments_refunded_amount_non_negative CHECK (refunded_amount >= 0);

CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_provider_txn_id
  ON payments(provider_txn_id)
  WHERE provider_txn_id IS NOT NULL;

-- ======================================================
-- 7) logistics: switch 1:1 -> 1:N, temp enum and shipping fields
-- ======================================================

DO $$
DECLARE
  c_name text;
BEGIN
  SELECT conname INTO c_name
  FROM pg_constraint
  WHERE conrelid = 'logistics'::regclass
    AND contype = 'u'
    AND conname ILIKE '%order_id%';

  IF c_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE logistics DROP CONSTRAINT %I', c_name);
  END IF;
END$$;

ALTER TABLE logistics
  ADD COLUMN IF NOT EXISTS shipment_group varchar(30),
  ADD COLUMN IF NOT EXISTS carrier varchar(50),
  ADD COLUMN IF NOT EXISTS shipping_fee numeric(10,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS estimated_arrival_at timestamptz,
  ADD COLUMN IF NOT EXISTS temp_layer_v2 temp_layer_enum,
  ADD COLUMN IF NOT EXISTS status_v2 logistics_status_enum;

UPDATE logistics
SET temp_layer_v2 = CASE temp_layer
  WHEN 'room_temp' THEN 'room_temp'::temp_layer_enum
  WHEN 'cold' THEN 'cold'::temp_layer_enum
  WHEN 'frozen' THEN 'frozen'::temp_layer_enum
  ELSE 'room_temp'::temp_layer_enum
END
WHERE temp_layer_v2 IS NULL;

UPDATE logistics
SET status_v2 = CASE status
  WHEN 'preparing' THEN 'preparing'::logistics_status_enum
  WHEN 'shipped' THEN 'shipped'::logistics_status_enum
  WHEN 'arrived' THEN 'arrived'::logistics_status_enum
  WHEN 'picked_up' THEN 'picked_up'::logistics_status_enum
  ELSE 'preparing'::logistics_status_enum
END
WHERE status_v2 IS NULL;

ALTER TABLE logistics
  ALTER COLUMN temp_layer_v2 SET NOT NULL,
  ALTER COLUMN temp_layer_v2 SET DEFAULT 'room_temp',
  ALTER COLUMN status_v2 SET NOT NULL,
  ALTER COLUMN status_v2 SET DEFAULT 'preparing';

ALTER TABLE logistics DROP COLUMN IF EXISTS temp_layer;
ALTER TABLE logistics DROP COLUMN IF EXISTS status;
ALTER TABLE logistics RENAME COLUMN temp_layer_v2 TO temp_layer;
ALTER TABLE logistics RENAME COLUMN status_v2 TO status;

ALTER TABLE logistics
  ADD CONSTRAINT logistics_shipping_fee_non_negative CHECK (shipping_fee >= 0);

-- ======================================================
-- 8) wishlist_surveys: type to ENUM
-- ======================================================

ALTER TABLE wishlist_surveys
  ADD COLUMN IF NOT EXISTS type_v2 wishlist_type_enum;

UPDATE wishlist_surveys
SET type_v2 = CASE type
  WHEN 'wishlist' THEN 'wishlist'::wishlist_type_enum
  WHEN 'survey' THEN 'survey'::wishlist_type_enum
  ELSE 'wishlist'::wishlist_type_enum
END
WHERE type_v2 IS NULL;

ALTER TABLE wishlist_surveys
  ALTER COLUMN type_v2 SET NOT NULL;

ALTER TABLE wishlist_surveys DROP COLUMN IF EXISTS type;
ALTER TABLE wishlist_surveys RENAME COLUMN type_v2 TO type;

ALTER TABLE wishlist_surveys
  ADD CONSTRAINT wishlist_surveys_expected_qty_positive CHECK (expected_qty > 0),
  ADD CONSTRAINT wishlist_surveys_points_awarded_non_negative CHECK (points_awarded >= 0);

-- ======================================================
-- 9) New table: bento_menus (daily menu and cutoff)
-- ======================================================

CREATE TABLE IF NOT EXISTS bento_menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  meal_date date NOT NULL,
  timeslot pickup_timeslot_enum NOT NULL,
  price_member numeric(10,2) NOT NULL CHECK (price_member >= 0),
  price_guest numeric(10,2) NOT NULL CHECK (price_guest >= 0),
  max_qty int NOT NULL CHECK (max_qty >= 0),
  preorder_cutoff_at timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(product_id, meal_date, timeslot)
);

-- ======================================================
-- 10) New table: inventory_reservations (anti-oversell)
-- ======================================================

CREATE TABLE IF NOT EXISTS inventory_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id uuid NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  reserved_qty int NOT NULL CHECK (reserved_qty > 0),
  released_qty int NOT NULL DEFAULT 0 CHECK (released_qty >= 0),
  status varchar(20) NOT NULL DEFAULT 'reserved', -- reserved/released/consumed
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ======================================================
-- 11) Operational indexes
-- ======================================================

CREATE INDEX IF NOT EXISTS idx_orders_member_created_at
  ON orders(member_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_order_stage
  ON orders(order_stage);

CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_status
  ON orders(fulfillment_status);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id
  ON order_items(order_id);

CREATE INDEX IF NOT EXISTS idx_order_items_product_id
  ON order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_payments_order_id_status
  ON payments(order_id, status);

CREATE INDEX IF NOT EXISTS idx_logistics_order_id_status
  ON logistics(order_id, status);

CREATE INDEX IF NOT EXISTS idx_wishlist_surveys_member_created_at
  ON wishlist_surveys(member_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bento_menus_meal_date_timeslot
  ON bento_menus(meal_date, timeslot);

CREATE INDEX IF NOT EXISTS idx_inventory_reservations_product_status
  ON inventory_reservations(product_id, status);

-- ======================================================
-- 12) Trigger: auto-update updated_at for logistics/inventory_reservations
-- ======================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_logistics_set_updated_at ON logistics;
CREATE TRIGGER trg_logistics_set_updated_at
BEFORE UPDATE ON logistics
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_inventory_reservations_set_updated_at ON inventory_reservations;
CREATE TRIGGER trg_inventory_reservations_set_updated_at
BEFORE UPDATE ON inventory_reservations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
