# Reporter Submission System Design

## Overview
This document outlines the design for a reporter submission system that allows journalists and media professionals to register and submit their profiles for potential collaboration opportunities.

## Database Schema

### reporters Table

```sql
CREATE TABLE IF NOT EXISTS reporters (
    id SERIAL PRIMARY KEY,
    function_department VARCHAR(50) NOT NULL CHECK (function_department IN ('Commercial', 'Procurement', 'Publishing', 'Marketing', 'Accounts and Finance')),
    position VARCHAR(50) NOT NULL CHECK (position IN ('Journalist', 'Reporter', 'Contributor', 'Staff')),
    name VARCHAR(255) NOT NULL,
    gender VARCHAR(20),
    email VARCHAR(255) UNIQUE NOT NULL,
    whatsapp VARCHAR(20),
    publication_name VARCHAR(255),
    website_url VARCHAR(500),
    linkedin VARCHAR(500),
    instagram VARCHAR(500),
    facebook VARCHAR(500),
    publication_industry VARCHAR(255),
    publication_location VARCHAR(255),
    niche_industry VARCHAR(255),
    minimum_expectation_usd DECIMAL(10,2),
    articles_per_month INTEGER,
    turnaround_time VARCHAR(100),
    company_allowed_in_title BOOLEAN DEFAULT FALSE,
    individual_allowed_in_title BOOLEAN DEFAULT FALSE,
    subheading_allowed BOOLEAN DEFAULT FALSE,
    sample_url VARCHAR(500),
    will_change_wordings BOOLEAN DEFAULT FALSE,
    article_placed_permanently BOOLEAN DEFAULT FALSE,
    article_can_be_deleted BOOLEAN DEFAULT FALSE,
    article_can_be_modified BOOLEAN DEFAULT FALSE,
    terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    how_heard_about_us TEXT,
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    submitted_by_admin INTEGER REFERENCES admins(id) ON DELETE SET NULL,
    approved_at TIMESTAMP,
    approved_by INTEGER REFERENCES admins(id) ON DELETE SET NULL,
    rejected_at TIMESTAMP,
    rejected_by INTEGER REFERENCES admins(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    admin_comments TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reporters_email ON reporters(email);
CREATE INDEX IF NOT EXISTS idx_reporters_status ON reporters(status);
CREATE INDEX IF NOT EXISTS idx_reporters_is_active ON reporters(is_active);
CREATE INDEX IF NOT EXISTS idx_reporters_created_at ON reporters(created_at);
CREATE INDEX IF NOT EXISTS idx_reporters_function_department ON reporters(function_department);
CREATE INDEX IF NOT EXISTS idx_reporters_position ON reporters(position);

-- Update trigger
CREATE TRIGGER update_reporters_updated_at
    BEFORE UPDATE ON reporters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## API Endpoints

### User Routes (Authenticated Users)
- `POST /api/reporters` - Submit reporter profile
- `GET /api/reporters` - Get user's submitted reporters
- `GET /api/reporters/:id` - Get specific reporter profile
- `PUT /api/reporters/:id` - Update reporter profile (if pending)
- `DELETE /api/reporters/:id` - Delete reporter profile (if pending)

### Admin Routes (Admin Panel Access)
- `GET /api/reporters/admin` - Get all reporters with filtering
- `GET /api/reporters/admin/:id` - Get specific reporter details
- `PUT /api/reporters/admin/:id` - Update reporter (admin edit)
- `PUT /api/reporters/admin/:id/approve` - Approve reporter
- `PUT /api/reporters/admin/:id/reject` - Reject reporter
- `DELETE /api/reporters/admin/:id` - Delete reporter
- `DELETE /api/reporters/admin/:id/hard` - Hard delete reporter

### Bulk Operations (Admin Only)
- `POST /api/reporters/bulk-approve` - Bulk approve reporters
- `POST /api/reporters/bulk-reject` - Bulk reject reporters
- `DELETE /api/reporters/bulk` - Bulk delete reporters

## Validation Rules

### Required Fields
- function_department
- position
- name
- email
- terms_accepted (must be true)

### Field Validations
- email: Valid email format
- website_url: Valid URL format (if provided)
- linkedin, instagram, facebook: Valid URL format (if provided)
- minimum_expectation_usd: Positive decimal
- articles_per_month: Positive integer
- whatsapp: Valid phone format (if provided)

### Enum Validations
- function_department: Commercial, Procurement, Publishing, Marketing, Accounts and Finance
- position: Journalist, Reporter, Contributor, Staff
- status: pending, approved, rejected

## Search and Filter Capabilities

### Admin Filters
- status (pending, approved, rejected)
- function_department
- position
- publication_name
- publication_industry
- publication_location
- niche_industry
- date range (created_at)
- is_active

### Search Fields
- name
- email
- publication_name
- publication_industry
- publication_location
- niche_industry
- message

## Status Management Workflow

1. **Submission**: User submits reporter profile → status = 'pending'
2. **Review**: Admin reviews submission
3. **Approval**: Admin approves → status = 'approved', approved_at and approved_by set
4. **Rejection**: Admin rejects → status = 'rejected', rejected_at, rejected_by, rejection_reason set

## Email Notifications

### Approval Notification
- Subject: "Your Reporter Profile Has Been Approved!"
- Includes profile details and approval confirmation

### Rejection Notification
- Subject: "Reporter Profile Submission Update"
- Includes rejection reason and resubmission guidance

## Authentication & Authorization

### User Routes
- Require user authentication
- Users can only view/edit their own submissions
- Pending submissions can be edited/deleted

### Admin Routes
- Require admin authentication
- Role-based permissions for different operations
- Content Manager level required for bulk operations

## Relationships

- reporters.submitted_by → users.id (who submitted)
- reporters.submitted_by_admin → admins.id (admin who submitted on behalf of user)
- reporters.approved_by → admins.id (admin who approved)
- reporters.rejected_by → admins.id (admin who rejected)

## Frontend Integration

### User Submission Form
- Multi-step form with validation
- File upload for samples (if needed)
- reCAPTCHA integration
- Terms acceptance checkbox

### Admin Management Interface
- List view with filters and search
- Detail view for review
- Bulk actions toolbar
- Status update actions
- Export capabilities

## Security Considerations

- Input sanitization and validation
- SQL injection prevention
- XSS protection
- Rate limiting on submissions
- File upload restrictions (if implemented)
- Admin action logging

## Performance Optimizations

- Database indexes on frequently queried fields
- Pagination for large result sets
- Caching for enum values
- Optimized queries with proper joins

## Error Handling

- Comprehensive validation error messages
- Proper HTTP status codes
- Database transaction handling
- Graceful failure handling for email notifications

## Testing Strategy

- Unit tests for validation functions
- Integration tests for API endpoints
- Database migration tests
- Email notification tests
- Admin permission tests