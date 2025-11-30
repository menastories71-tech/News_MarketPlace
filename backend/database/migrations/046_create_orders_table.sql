-- Create orders table for publication booking requests
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    publication_id INT NOT NULL,
    publication_name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    customer_message TEXT,
    status ENUM('pending', 'accepted', 'rejected', 'completed') DEFAULT 'pending',
    admin_notes TEXT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraint
    CONSTRAINT fk_orders_publication FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE,

    -- Indexes for better performance
    INDEX idx_orders_status (status),
    INDEX idx_orders_publication (publication_id),
    INDEX idx_orders_customer_email (customer_email),
    INDEX idx_orders_date (order_date)
);

-- Insert sample data for testing
INSERT INTO orders (publication_id, publication_name, price, customer_name, customer_email, customer_phone, customer_message, status) VALUES
(1, 'Sample Publication', 99.99, 'John Doe', 'john@example.com', '+1234567890', 'Please contact me for article submission details.', 'pending'),
(2, 'Tech News Daily', 149.99, 'Jane Smith', 'jane@example.com', '+1987654321', 'Looking forward to working with your team.', 'accepted');