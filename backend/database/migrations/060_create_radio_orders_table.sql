-- Create radio_orders table
CREATE TABLE IF NOT EXISTS radio_orders (
    id SERIAL PRIMARY KEY,
    radio_id INTEGER NOT NULL,
    radio_name VARCHAR(255) NOT NULL,
    customer_info JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for better performance
CREATE INDEX idx_radio_orders_radio_id ON radio_orders(radio_id);
CREATE INDEX idx_radio_orders_status ON radio_orders(status);
CREATE INDEX idx_radio_orders_created_at ON radio_orders(created_at);