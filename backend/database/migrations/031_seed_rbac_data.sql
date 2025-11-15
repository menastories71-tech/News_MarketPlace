-- Migration: Seed RBAC data with default permissions, roles, and role-permission assignments
-- Created: 2025-11-15

-- Insert default permissions
INSERT INTO permissions (name, description, resource, action) VALUES
('admin:manage', 'Manage administrators', 'admin', 'manage'),
('user:manage', 'Manage users', 'user', 'manage'),
('website:manage', 'Manage websites', 'website', 'manage'),
('agency:manage', 'Manage agencies', 'agency', 'manage'),
('reporter:manage', 'Manage reporters', 'reporter', 'manage'),
('podcaster:manage', 'Manage podcasters', 'podcaster', 'manage'),
('blog:manage', 'Manage blogs', 'blog', 'manage'),
('press_pack:manage', 'Manage press packs', 'press_pack', 'manage'),
('theme:manage', 'Manage themes', 'theme', 'manage'),
('award:manage', 'Manage awards', 'award', 'manage'),
('career:manage', 'Manage careers', 'career', 'manage'),
('radio:manage', 'Manage radios', 'radio', 'manage'),
('real_estate:manage', 'Manage real estates', 'real_estate', 'manage'),
('group:manage', 'Manage groups', 'group', 'manage'),
('powerlist:manage', 'Manage powerlists', 'powerlist', 'manage'),
('notification:manage', 'Manage notifications', 'notification', 'manage'),
('backup:manage', 'Manage backups', 'backup', 'manage')
ON CONFLICT (name) DO NOTHING;

-- Insert default roles
INSERT INTO roles (name, description) VALUES
('super_admin', 'Super administrator with all permissions'),
('content_manager', 'Content manager for blogs, press packs, and themes'),
('editor', 'Editor for content review and management'),
('registered_user', 'Registered user with basic access'),
('agency', 'Agency user'),
('other', 'Other role')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
-- Super admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'super_admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Content manager gets content-related permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'content_manager' AND p.resource IN ('blog', 'press_pack', 'theme', 'award', 'career', 'radio', 'real_estate', 'group', 'powerlist', 'notification')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Editor gets similar permissions to content manager
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'editor' AND p.resource IN ('blog', 'press_pack', 'theme', 'award', 'career', 'radio', 'real_estate', 'group', 'powerlist', 'notification')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Agency gets agency and related permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'agency' AND p.resource IN ('agency', 'press_pack')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Registered user gets basic permissions (none for now)
-- Other gets no permissions