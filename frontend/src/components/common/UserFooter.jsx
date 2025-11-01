import React from 'react';
import Icon from './Icon';

export default function UserFooter() {
  const theme = { primary: '#0D3B66', muted: '#F1F5F9', text: '#0F172A' };

  return (
    <footer style={{ background: theme.muted, borderTop: '1px solid #eef2f7', padding: '40px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#e6f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="shield-check" size="md" style={{ color: theme.primary }} />
              </div>
              <div style={{ fontWeight: 800, color: theme.text }}>News Marketplace</div>
            </div>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <a href="/" style={{ color: theme.text, textDecoration: 'none', fontWeight: 600 }}>Home</a>
              <a href="/news" style={{ color: theme.text, textDecoration: 'none' }}>News</a>
              <a href="/sections" style={{ color: theme.text, textDecoration: 'none' }}>Sections</a>
              <a href="/about" style={{ color: theme.text, textDecoration: 'none' }}>About</a>
              <a href="/contact" style={{ color: theme.text, textDecoration: 'none' }}>Contact</a>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #e6e9ef', paddingTop: 24, textAlign: 'center' }}>
            <p style={{ color: '#64748B', fontSize: '14px' }}>
              © 2023 News Marketplace. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}