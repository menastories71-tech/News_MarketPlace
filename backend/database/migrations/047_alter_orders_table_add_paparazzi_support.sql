-- Migration: Alter orders table to add paparazzi support
-- Created: 2025-11-30

-- Add new columns for paparazzi support
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type VARCHAR(20) DEFAULT 'publication' CHECK (order_type IN ('publication', 'paparazzi'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paparazzi_id INT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paparazzi_name VARCHAR(255) NULL;

-- Make publication_id and publication_name nullable since order_type determines which one is used
ALTER TABLE orders ALTER COLUMN publication_id DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN publication_name DROP NOT NULL;

-- Add foreign key constraint for paparazzi (nullable)
ALTER TABLE orders ADD CONSTRAINT fk_orders_paparazzi FOREIGN KEY (paparazzi_id) REFERENCES paparazzi(id) ON DELETE SET NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_type ON orders(order_type);
CREATE INDEX IF NOT EXISTS idx_orders_paparazzi ON orders(paparazzi_id);

-- Update existing records to have order_type = 'publication'
UPDATE orders SET order_type = 'publication' WHERE order_type IS NULL;