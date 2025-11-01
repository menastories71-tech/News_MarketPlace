-- Seed initial admin data for News Marketplace
-- Run this after creating the admins table

-- Insert super admin
INSERT INTO admins (email, password_hash, first_name, last_name, role, is_active)
VALUES (
  'superadmin@newsmarketplace.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6fMJyHnUeK', -- password: SuperAdmin123!
  'Super',
  'Admin',
  'super_admin',
  true
) ON CONFLICT (email) DO NOTHING;

-- Insert content manager
INSERT INTO admins (email, password_hash, first_name, last_name, role, is_active)
VALUES (
  'contentmanager@newsmarketplace.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6fMJyHnUeK', -- password: ContentManager123!
  'Content',
  'Manager',
  'content_manager',
  true
) ON CONFLICT (email) DO NOTHING;

-- Insert editor
INSERT INTO admins (email, password_hash, first_name, last_name, role, is_active)
VALUES (
  'editor@newsmarketplace.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6fMJyHnUeK', -- password: Editor123!
  'News',
  'Editor',
  'editor',
  true
) ON CONFLICT (email) DO NOTHING;

-- Insert registered user admin
INSERT INTO admins (email, password_hash, first_name, last_name, role, is_active)
VALUES (
  'useradmin@newsmarketplace.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6fMJyHnUeK', -- password: UserAdmin123!
  'User',
  'Admin',
  'registered_user',
  true
) ON CONFLICT (email) DO NOTHING;

-- Insert agency admin
INSERT INTO admins (email, password_hash, first_name, last_name, role, is_active)
VALUES (
  'agencyadmin@newsmarketplace.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6fMJyHnUeK', -- password: AgencyAdmin123!
  'Agency',
  'Admin',
  'agency',
  true
) ON CONFLICT (email) DO NOTHING;

-- Insert other role admin
INSERT INTO admins (email, password_hash, first_name, last_name, role, is_active)
VALUES (
  'otheradmin@newsmarketplace.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6fMJyHnUeK', -- password: OtherAdmin123!
  'Other',
  'Admin',
  'other',
  true
) ON CONFLICT (email) DO NOTHING;