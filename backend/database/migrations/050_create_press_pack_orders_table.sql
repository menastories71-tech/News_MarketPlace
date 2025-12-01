-- Create press_pack_orders table
CREATE TABLE IF NOT EXISTS press_pack_orders (
    id SERIAL PRIMARY KEY,
    press_pack_id INTEGER NOT NULL,
    press_pack_name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    customer_message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
    admin_notes TEXT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraint
    CONSTRAINT fk_press_pack_orders_press_pack_id
        FOREIGN KEY (press_pack_id) REFERENCES press_packs(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_press_pack_orders_press_pack_id ON press_pack_orders(press_pack_id);
CREATE INDEX IF NOT EXISTS idx_press_pack_orders_status ON press_pack_orders(status);
CREATE INDEX IF NOT EXISTS idx_press_pack_orders_customer_email ON press_pack_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_press_pack_orders_order_date ON press_pack_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_press_pack_orders_created_at ON press_pack_orders(created_at);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_press_pack_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_press_pack_orders_updated_at
    BEFORE UPDATE ON press_pack_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_press_pack_orders_updated_at();

-- Add comment to table
COMMENT ON TABLE press_pack_orders IS 'Table for storing press pack distribution orders from users';