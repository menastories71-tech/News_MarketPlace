-- Create orders table for publication and paparazzi booking requests
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_type VARCHAR(20) DEFAULT 'publication' CHECK (order_type IN ('publication', 'paparazzi')),
    publication_id INT NULL,
    publication_name VARCHAR(255) NULL,
    paparazzi_id INT NULL,
    paparazzi_name VARCHAR(255) NULL,
    price DECIMAL(10,2),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    customer_message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
    admin_notes TEXT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraints (nullable since order_type determines which one is used)
    CONSTRAINT fk_orders_publication FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE SET NULL,
    CONSTRAINT fk_orders_paparazzi FOREIGN KEY (paparazzi_id) REFERENCES paparazzi(id) ON DELETE SET NULL,

    -- Indexes for better performance
    INDEX idx_orders_status (status),
    INDEX idx_orders_type (order_type),
    INDEX idx_orders_publication (publication_id),
    INDEX idx_orders_paparazzi (paparazzi_id),
    INDEX idx_orders_customer_email (customer_email),
    INDEX idx_orders_date (order_date)
);

-- Insert sample data for testing
INSERT INTO orders (publication_id, publication_name, price, customer_name, customer_email, customer_phone, customer_message, status) VALUES
(1, 'Sample Publication', 99.99, 'John Doe', 'john@example.com', '+1234567890', 'Please contact me for article submission details.', 'pending'),
(2, 'Tech News Daily', 149.99, 'Jane Smith', 'jane@example.com', '+1987654321', 'Looking forward to working with your team.', 'accepted');