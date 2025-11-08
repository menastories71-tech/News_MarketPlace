import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Icon from '../common/Icon';
import Sidebar from './Sidebar';

// ----------------- CHANGES START -----------------
// Brand colors from Color palette .pdf - using only defined colors
const theme = {
	primary: '#1976D2',        // Primary Blue
	primaryDark: '#0D47A1',    // Primary Dark
	primaryLight: '#E3F2FD',   // Primary Light
	secondary: '#00796B',      // Secondary Teal
	secondaryDark: '#004D40',  // Secondary Dark
	secondaryLight: '#E0F2F1', // Secondary Light
	success: '#4CAF50',        // Success Green
	warning: '#FF9800',        // Warning Orange
	danger: '#F44336',         // Error Red
	info: '#9C27B0',           // Info Purple
	textPrimary: '#212121',    // Text Primary
	textSecondary: '#757575',  // Text Secondary
	textDisabled: '#BDBDBD',   // Text Disabled
	background: '#FFFFFF',     // Background
	backgroundAlt: '#FAFAFA',  // Background Alt
	backgroundSoft: '#F5F5F5', // Background Soft
	borderLight: '#E0E0E0',    // Border Light
	borderMedium: '#BDBDBD',   // Border Medium
	borderDark: '#757575',     // Border Dark
	roleColors: {
		super_admin: { bg: '#E0F2F1', color: '#004D40' }, // Using secondary colors
		content_manager: { bg: '#E3F2FD', color: '#0D47A1' }, // Using primary colors
		editor: { bg: '#FAFAFA', color: '#212121' }, // Using neutral colors
		registered_user: { bg: '#F5F5F5', color: '#757575' }, // Using neutral colors
		agency: { bg: '#E0F2F1', color: '#00796B' }, // Using secondary colors
		other: { bg: '#FAFAFA', color: '#757575' } // Using neutral colors
	}
};

const AdminDashboard = () => {
  const { admin, logout, hasRole, hasAnyRole, getRoleLevel } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  // z-index layering constants (header must be topmost)
  const headerZ = 1000;
  const mobileOverlayZ = 500; // under header but above page content
  const sidebarZ = 200;       // desktop sidebar z-index (under overlay and header)

  // header height used for mobile overlay positioning
  const headerHeight = 64;
  // apply this as top padding for the main content so nothing scrolls underneath the header
  const mainPaddingTop = headerHeight + 18;

  // Sidebar styles and items
  const sidebarWidth = 240;
  const leftGap = 24; // extra gap between sidebar and centered content
  const sidebarStyles = {
    width: sidebarWidth,
    backgroundColor: theme.background,
    borderRight: `1px solid ${theme.borderLight}`,
    padding: 16,
    boxSizing: 'border-box',
    borderRadius: 8
  };
  // single mobileSidebarOverlay definition (keeps headerHeight/sidebarWidth in sync)
  const mobileSidebarOverlay = {
    position: 'fixed',
    top: headerHeight,
    left: 0,
    height: `calc(100vh - ${headerHeight}px)`,
    zIndex: mobileOverlayZ,
    backgroundColor: '#fff',
    padding: 16,
    boxSizing: 'border-box',
    width: sidebarWidth,
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
  };

  const roleDisplayNames = {
    'super_admin': 'Super Administrator',
    'content_manager': 'Content Manager',
    'editor': 'Editor',
    'registered_user': 'Registered User',
    'agency': 'Agency',
    'other': 'Other'
  };

  // Small shared button styles to reflect brand palette (use inline so no CSS file needed)
  const btnPrimary = {
    backgroundColor: theme.primary,
    color: '#FFFFFF',
    padding: '0.625rem 1rem',
    borderRadius: '0.5rem',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    border: 'none',
    boxShadow: `0 6px 18px rgba(25,118,210,0.14)`
  };

  const btnSecondary = {
    backgroundColor: '#FFFFFF',
    color: theme.textPrimary,
    border: `1px solid ${theme.borderLight}`,
    padding: '0.5rem 0.875rem',
    borderRadius: '0.5rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxSizing: 'border-box'
  };

  // Slightly improved role badge sizing/line-height
  const getRoleStyle = (role) => {
    const r = theme.roleColors[role] || theme.roleColors.other;
    return {
      backgroundColor: r.bg,
      color: r.color,
      padding: '0.125rem 0.5rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: 600,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      lineHeight: 1
    };
  };

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen && isMobile) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
    return undefined;
  }, [sidebarOpen, isMobile]);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: theme.muted, color: theme.text, paddingBottom: '3rem' }}
    >
      {/* Header */}
      <header
        className="shadow-sm"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: headerZ,
          backgroundColor: theme.background,           // ensure header is opaque white
          boxShadow: '0 6px 20px rgba(2,6,23,0.06)', // slightly stronger shadow
          borderBottom: `1px solid ${theme.borderLight}`  // explicit bottom border to separate content
        }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10" style={{ minHeight: 64 }}>
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center">
              {/* Mobile toggle button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-3 md:hidden"
                aria-label="Toggle sidebar"
                style={{ background: 'transparent', border: 'none', padding: 6, cursor: 'pointer' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
              </button>

              {/* Desktop toggle button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-3 hidden md:block"
                aria-label="Toggle sidebar"
                style={{ background: 'transparent', border: 'none', padding: 6, cursor: 'pointer' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon name="shield-check" size="lg" style={{ color: '#1976D2' }} />
                <span style={{ fontWeight: 700, fontSize: 18 }}>News Marketplace Admin</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button aria-label="Toggle theme" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                {/* simple moon icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
              </button>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700 }}>{admin?.first_name ? `${admin.first_name} ${admin.last_name}` : 'Master Admin'}</div>
                <div style={{ marginTop: 6 }}>
                  <span style={getRoleStyle(admin?.role)}>{roleDisplayNames[admin?.role] || '—'}</span>
                </div>
              </div>

              <button onClick={logout} style={{ ...btnPrimary, padding: '0.45rem 0.75rem' }}>
                <Icon name="arrow-right-on-rectangle" size="sm" style={{ color: '#fff', marginRight: 8 }} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar fixed on desktop (so it sits at viewport left) */}
      <Sidebar
        admin={admin}
        roleDisplayNames={roleDisplayNames}
        theme={theme}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarStyles={sidebarStyles}
        mobileSidebarOverlay={mobileSidebarOverlay}
        isMobile={isMobile}
        headerHeight={headerHeight}
        sidebarWidth={sidebarWidth}
        sidebarZ={sidebarZ}
        mobileOverlayZ={mobileOverlayZ}
      />

      {/* Main Layout content (centered max width). On desktop add left margin equal to sidebar width + leftGap when sidebar visible.
          mainPaddingTop prevents content from sliding under the sticky header when scrolling. */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10" style={{
        paddingTop: mainPaddingTop,
        marginLeft: !isMobile && sidebarOpen ? (sidebarWidth + leftGap) : 0,
        transition: 'margin-left 0.28s ease-in-out'
      }}>
         <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <main style={{ flex: 1, minWidth: 0, paddingLeft: !isMobile ? leftGap : 0 }}>
            {/* Hero / big title */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 28, border: `4px solid #000`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginTop: 0 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#e6f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="toggle-left" size="sm" style={{ color: '#1976D2' }} />
                  </div>
                  <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800 }}>News Marketplace Dashboard</h1>
                </div>
                <p style={{ marginTop: 8, color: '#757575' }}>Manage news content, sources, and reports.</p>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                <div style={getRoleStyle(admin?.role)}>Role: {roleDisplayNames[admin?.role] || 'Master Admin'}</div>
                <div style={{ fontSize: 12, color: '#757575' }}>Last login: {admin?.last_login ? new Date(admin.last_login).toLocaleString() : '—'}</div>
                <button onClick={logout} style={{ ...btnPrimary, marginTop: 6 }}>Logout</button>
              </div>
            </div>

            {/* Stats grid */}
            {/* small helper data + render */}
            {/* ...existing code... but replace with mapping below */}
            {/* stats array & rendering */}
            {(() => {
              const stats = [
                { id: 1, label: 'Total News', value: 1094, bg: '#e6f0ff', icon: 'document-text' },
                { id: 2, label: 'Sections', value: 8, bg: '#dcfce7', icon: 'list-bullet' },
                { id: 3, label: 'Sources', value: 165, bg: '#efe9ff', icon: 'boxes' },
                { id: 4, label: 'Topics', value: 89, bg: '#fee2e2', icon: 'tag' },
                { id: 5, label: 'Video Reports', value: 12, bg: '#e0f2fe', icon: 'video' },
                { id: 6, label: 'Registered Users', value: 1, bg: '#fff7ed', icon: 'users' }
              ];
              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 18, marginTop: 20 }}>
                  {stats.map(s => (
                    <div key={s.id} style={{ background: '#fff', borderRadius: 12, padding: 18, boxShadow: '0 8px 20px rgba(2,6,23,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 52, height: 52, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name={s.icon} size="lg" style={{ color: '#1976D2' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 12, color: '#757575' }}>{s.label}</div>
                          <div style={{ fontSize: 22, fontWeight: 800 }}>{s.value}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Role Information (improved UI) */}
            <div style={{ height: 24 }} /> {/* spacer */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Current Role Card */}
              <div style={{ background: '#fff', borderRadius: 12, padding: 18, border: `1px solid ${theme.muted}`, boxShadow: '0 6px 18px rgba(2,6,23,0.04)' }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: theme.text }}>Your Permissions</h3>
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 13, color: '#757575', marginBottom: 8 }}>Current Role</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ padding: '8px 12px', borderRadius: 999, background: (theme.roleColors[admin?.role]?.bg || theme.roleColors.other.bg), color: (theme.roleColors[admin?.role]?.color || theme.roleColors.other.color), fontWeight: 800 }}>
                      {roleDisplayNames[admin?.role] || '—'}
                    </div>
                    <div style={{ fontSize: 12, color: '#757575' }}>
                      <div>Level <strong style={{ color: theme.text }}>{getRoleLevel()}</strong></div>
                      <div style={{ marginTop: 6 }}>Last Login <div style={{ fontWeight: 600 }}>{admin?.last_login ? new Date(admin.last_login).toLocaleString() : 'Never'}</div></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Access Rights Card */}
              <div style={{ background: '#fff', borderRadius: 12, padding: 18, border: `1px solid ${theme.muted}`, boxShadow: '0 6px 18px rgba(2,6,23,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 13, color: '#757575', fontWeight: 700 }}>Access Rights</div>
                </div>
                <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    { key: 'sys', label: 'System Administration', ok: hasRole('super_admin') },
                    { key: 'content', label: 'Content Management', ok: hasAnyRole(['super_admin', 'content_manager']) },
                    { key: 'editorial', label: 'Editorial Access', ok: hasAnyRole(['super_admin', 'content_manager', 'editor']) }
                  ].map(item => (
                    <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 999, background: item.ok ? (theme.roleColors.other.bg) : '#fff5f5', border: `1px solid ${item.ok ? 'transparent' : theme.danger}` }}>
                      <Icon name={item.ok ? 'check-circle' : 'x-circle'} size="sm" style={{ color: item.ok ? theme.success : theme.danger }} />
                      <div style={{ fontSize: 13, color: '#212121' }}>{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
           </main>
         </div>
       </div>
    </div>
  );
};

export default AdminDashboard;