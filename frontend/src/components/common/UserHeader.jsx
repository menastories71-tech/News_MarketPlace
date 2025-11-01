import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Icon from './Icon';

export default function UserHeader({ onSearch }) {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const theme = { primary: '#0D3B66', muted: '#F1F5F9', text: '#0F172A' };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 900, background: '#fff', borderBottom: '1px solid #eef2f7' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => setOpen(!open)} aria-label="Toggle menu" style={{ background: 'transparent', border: 'none', display: 'inline-flex', alignItems: 'center', padding: 6 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: '0 0 auto' }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#e6f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="shield-check" size="md" style={{ color: theme.primary }} />
          </div>
          <div style={{ fontWeight: 800, color: theme.text }}>News Marketplace</div>
        </div>

        <nav style={{ marginLeft: 24, display: open ? 'block' : 'flex', gap: 16, alignItems: 'center', flex: 1 }}>
          <a href="/" style={{ color: theme.text, textDecoration: 'none', fontWeight: 600 }}>Home</a>
          <a href="/news" style={{ color: theme.text, textDecoration: 'none' }}>News</a>
          <a href="/sections" style={{ color: theme.text, textDecoration: 'none' }}>Sections</a>
          <a href="/about" style={{ color: theme.text, textDecoration: 'none' }}>About</a>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              onChange={(e) => onSearch && onSearch(e.target.value)}
              placeholder="Search news..."
              style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #e6e9ef', background: '#fff', minWidth: 180 }}
            />
            {isAuthenticated ? (
              <a href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: theme.text }}>
                <Icon name="user-circle" size="md" style={{ color: theme.primary }} />
                <span style={{ fontWeight: 600 }}>{user?.first_name}</span>
              </a>
            ) : (
              <button style={{ background: theme.primary, color: '#fff', padding: '8px 12px', borderRadius: 8, border: 'none', fontWeight: 700, cursor: 'pointer' }}>Sign in</button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
