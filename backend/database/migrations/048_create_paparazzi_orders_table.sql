-- Create paparazzi_orders table
CREATE TABLE IF NOT EXISTS paparazzi_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paparazzi_id INT NOT NULL,
    paparazzi_name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    customer_message TEXT,
    status ENUM('pending', 'accepted', 'rejected', 'completed') DEFAULT 'pending',
    admin_notes TEXT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign key constraint
    CONSTRAINT fk_paparazzi_orders_paparazzi_id
        FOREIGN KEY (paparazzi_id) REFERENCES paparazzi(id) ON DELETE CASCADE,

    -- Indexes for better performance
    INDEX idx_paparazzi_orders_paparazzi_id (paparazzi_id),
    INDEX idx_paparazzi_orders_status (status),
    INDEX idx_paparazzi_orders_customer_email (customer_email),
    INDEX idx_paparazzi_orders_order_date (order_date)
);

-- Add comment to table
ALTER TABLE paparazzi_orders COMMENT = 'Table for storing paparazzi call booking orders from users';