-- Create theme_orders table
CREATE TABLE IF NOT EXISTS theme_orders (
    id SERIAL PRIMARY KEY,
    theme_id INTEGER NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
    theme_name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2),
    customer_info JSONB NOT NULL,
    order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    notes TEXT,
    submitted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_theme_orders_theme_id ON theme_orders(theme_id);
CREATE INDEX IF NOT EXISTS idx_theme_orders_status ON theme_orders(status);
CREATE INDEX IF NOT EXISTS idx_theme_orders_submitted_by ON theme_orders(submitted_by);
CREATE INDEX IF NOT EXISTS idx_theme_orders_created_at ON theme_orders(created_at);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_theme_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_theme_orders_updated_at
    BEFORE UPDATE ON theme_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_theme_orders_updated_at();