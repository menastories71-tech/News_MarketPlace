import React from 'react';
import Icon from '../common/Icon';

export default function Sidebar({
  admin,
  roleDisplayNames,
  theme,
  sidebarOpen,
  setSidebarOpen,
  sidebarStyles,
  mobileSidebarOverlay,
  isMobile,
  headerHeight,
  sidebarWidth,
  sidebarZ = 200,
  mobileOverlayZ = 500
}) {
  // NEW: nicer style tokens used inline (declare first to avoid reference errors)
  const headingStyle = { fontWeight: 900, letterSpacing: 2, marginBottom: 18, color: '#0b2545', fontSize: 13 };
  const cardStyle = { background: '#ffffff', borderRadius: 12, padding: 14, boxShadow: '0 8px 24px rgba(7,22,48,0.06)', marginBottom: 18 };
  const avatarStyle = { width: 56, height: 56, borderRadius: 12, background: '#eaf2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: theme.primary, fontSize: 20 };
  const statTile = { flex: 1, background: '#f8fafc', padding: 12, borderRadius: 10, textAlign: 'center', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)' };
  const navItemBase = { display: 'flex', alignItems: 'center', gap: 12, color: theme.text, textDecoration: 'none', padding: '10px 12px', borderRadius: 10, transition: 'background 140ms, transform 140ms', cursor: 'pointer' };
  const navIconCircle = (bg) => ({ width: 36, height: 36, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' });

  // compute desktop fixed styles so sidebar sticks to viewport left (matches screenshot)
  const desktopFixedStyles = {
    ...sidebarStyles,
    position: 'fixed',
    left: 0,
    top: headerHeight,
    height: `calc(100vh - ${headerHeight}px)`,
    zIndex: sidebarZ, // below header but visible
    borderRadius: 0,
    display: sidebarOpen ? 'block' : 'none', // show/hide via inline style
    boxSizing: 'border-box',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    paddingRight: 8
  };

  // mobile sliding overlay styles (small slide animation)
  const mobileOverlayStyles = {
    ...mobileSidebarOverlay,
    transform: sidebarOpen ? 'translateX(0)' : `translateX(-${sidebarWidth}px)`,
    transition: 'transform 220ms ease',
    display: sidebarOpen ? 'block' : 'none',
    zIndex: mobileOverlayZ,
    overflowY: 'auto',
    boxSizing: 'border-box'
  };

  // When tailwind is not guaranteed, control visibility using inline display.
  const desktopStyleToUse = isMobile ? { ...sidebarStyles, boxSizing: 'border-box', overflowY: 'auto' } : desktopFixedStyles;

  return (
    <>
      {/* Desktop aside (fixed on viewport left when not mobile) */}
      <aside
        style={{ ...desktopStyleToUse, padding: 18 }}
        aria-hidden={!sidebarOpen}
        role="navigation"
      >
        <div style={headingStyle}>ADMIN PANEL</div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={avatarStyle}>
              {admin?.first_name ? admin.first_name[0].toUpperCase() : 'M'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, color: '#0f172a' }}>{admin?.first_name ? `${admin.first_name} ${admin.last_name}` : 'Master Admin'}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{roleDisplayNames[admin?.role] || 'Master Admin'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <div style={statTile}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>11</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>Total Admins</div>
            </div>
            <div style={statTile}>
              <div style={{ fontSize: 18, fontWeight: 800, color: theme.primary }}>11</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>Active</div>
            </div>
          </div>
        </div>

        <nav>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: 12 }}>
              <a
                href="/admin/dashboard"
                style={{
                  ...navItemBase,
                  background: theme.primary,
                  color: '#fff',
                  fontWeight: 700,
                  boxShadow: '0 6px 14px rgba(13,52,92,0.12)'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = ''}
              >
                <span style={navIconCircle('#0b3a61')}><Icon name="home" size="sm" style={{ color: '#fff' }} /></span>
                <span>Dashboard</span>
              </a>
            </li>

            <li style={{ marginBottom: 10 }}>
              <a
                href="/admin/news"
                style={navItemBase}
                onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={navIconCircle('#e6f0ff')}><Icon name="document-text" size="sm" style={{ color: theme.primary }} /></span>
                <span>News Management</span>
              </a>
            </li>

            <li style={{ marginBottom: 10 }}>
              <a
                href="/admin/media"
                style={navItemBase}
                onMouseEnter={e => e.currentTarget.style.background = '#fdf7ec'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={navIconCircle('#fff7ed')}><Icon name="arrow-down-tray" size="sm" style={{ color: theme.warning }} /></span>
                <span>Media</span>
              </a>
            </li>

            <li style={{ marginBottom: 10 }}>
              <a
                href="/admin/contacts"
                style={navItemBase}
                onMouseEnter={e => e.currentTarget.style.background = '#e0f2fe'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/admin/contacts';
                }}
              >
                <span style={navIconCircle('#e6f3ff')}><Icon name="chat-bubble-left-right" size="sm" style={{ color: '#0369a1' }} /></span>
                <span>Contact Management</span>
              </a>
            </li>

            <li>
              <a
                href="/admin/settings"
                style={navItemBase}
                onMouseEnter={e => e.currentTarget.style.background = '#fff1f0'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={navIconCircle('#fff0f6')}><Icon name="cog-6-tooth" size="sm" style={{ color: theme.secondary }} /></span>
                <span>Settings</span>
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Mobile sliding overlay */}
      <div style={isMobile ? mobileOverlayStyles : { display: 'none' }} aria-hidden={!sidebarOpen}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} aria-label="Close sidebar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <nav style={{ marginTop: 8 }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: 12 }}><a href="/admin/dashboard" style={{ color: theme.text, textDecoration: 'none', fontWeight: 600 }}>Dashboard</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/contacts" style={{ color: theme.text, textDecoration: 'none' }}>Contacts</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/news" style={{ color: theme.text, textDecoration: 'none' }}>News</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/media" style={{ color: theme.text, textDecoration: 'none' }}>Media</a></li>
            <li><a href="/admin/settings" style={{ color: theme.text, textDecoration: 'none' }}>Settings</a></li>
          </ul>
        </nav>
      </div>
    </>
  );
}
