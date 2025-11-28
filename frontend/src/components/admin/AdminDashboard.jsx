import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Icon from '../common/Icon';
import Sidebar from './Sidebar';
import api from '../../services/api';

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
  const [stats, setStats] = useState({
    totalBlogs: 0,
    totalPublications: 0,
    totalWebsites: 0,
    totalPodcasters: 0,
    totalReporters: 0,
    totalRealEstates: 0,
    totalUsers: 0,
    totalAdmins: 0
  });
  const [loading, setLoading] = useState(true);

  // z-index layering constants
  const mobileOverlayZ = 500; // above page content
  const sidebarZ = 200;       // desktop sidebar z-index (under overlay)

  // header height used for mobile overlay positioning (no header, so 0)
  const headerHeight = 0;
  // apply this as top padding for the main content
  const mainPaddingTop = 0;

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
  // single mobileSidebarOverlay definition
  const mobileSidebarOverlay = {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
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

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [
        blogsRes,
        publicationsRes,
        websitesRes,
        podcastersRes,
        reportersRes,
        realEstatesRes,
        usersRes,
        rolesRes
      ] = await Promise.allSettled([
        api.get('/blogs?page=1&limit=1'),
        api.get('/publications/admin?page=1&limit=1'),
        api.get('/websites/?page=1&limit=1'),
        api.get('/podcasters/admin?page=1&limit=1'),
        api.get('/reporters/admin?page=1&limit=1'),
        api.get('/real-estates/admin?page=1&limit=1'),
        api.get('/admin/auth/users'),
        api.get('/admin/role-permissions/roles?page=1&limit=1')
      ]);

      setStats({
        totalBlogs: blogsRes.status === 'fulfilled' ? blogsRes.value.data.pagination?.total || 0 : 0,
        totalPublications: publicationsRes.status === 'fulfilled' ? publicationsRes.value.data.pagination?.total || 0 : 0,
        totalWebsites: websitesRes.status === 'fulfilled' ? websitesRes.value.data.pagination?.total || 0 : 0,
        totalPodcasters: podcastersRes.status === 'fulfilled' ? podcastersRes.value.data.pagination?.total || 0 : 0,
        totalReporters: reportersRes.status === 'fulfilled' ? reportersRes.value.data.pagination?.total || 0 : 0,
        totalRealEstates: realEstatesRes.status === 'fulfilled' ? realEstatesRes.value.data.pagination?.total || 0 : 0,
        totalUsers: usersRes.status === 'fulfilled' ? Array.isArray(usersRes.value.data.users) ? usersRes.value.data.users.length : 0 : 0,
        totalAdmins: rolesRes.status === 'fulfilled' ? rolesRes.value.data.pagination?.total || 0 : 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
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
                <p style={{ marginTop: 8, color: '#757575' }}>Manage content, users, and system administration.</p>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                <div style={getRoleStyle(admin?.role)}>Role: {roleDisplayNames[admin?.role] || 'Master Admin'}</div>
                <div style={{ fontSize: 12, color: '#757575' }}>Last login: {admin?.last_login ? new Date(admin.last_login).toLocaleString() : '—'}</div>
                <button onClick={logout} style={{ ...btnPrimary, marginTop: 6 }}>Logout</button>
              </div>
            </div>

            {/* Stats grid */}
            {(() => {
              const statsData = [
                { id: 1, label: 'Total Blogs', value: stats.totalBlogs, bg: '#e6f0ff', icon: 'document-text' },
                { id: 2, label: 'Publications', value: stats.totalPublications, bg: '#dcfce7', icon: 'newspaper' },
                { id: 3, label: 'Websites', value: stats.totalWebsites, bg: '#efe9ff', icon: 'globe' },
                { id: 4, label: 'Podcasters', value: stats.totalPodcasters, bg: '#fee2e2', icon: 'microphone' },
                { id: 5, label: 'Reporters', value: stats.totalReporters, bg: '#e0f2fe', icon: 'user-group' },
                { id: 6, label: 'Real Estates', value: stats.totalRealEstates, bg: '#fff7ed', icon: 'home' },
                { id: 7, label: 'Users', value: stats.totalUsers, bg: '#f0f9ff', icon: 'users' },
                { id: 8, label: 'Admin Roles', value: stats.totalAdmins, bg: '#e0f2f1', icon: 'shield-check' }
              ];

              if (loading) {
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 18, marginTop: 20 }}>
                    {Array.from({ length: 8 }).map((_, index) => (
                      <div key={index} style={{ background: '#fff', borderRadius: 12, padding: 18, boxShadow: '0 8px 20px rgba(2,6,23,0.06)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{ width: 52, height: 52, borderRadius: 12, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: 24, height: 24, background: '#e0e0e0', borderRadius: 4 }}></div>
                          </div>
                          <div>
                            <div style={{ fontSize: 12, color: '#e0e0e0', height: 12, background: '#f5f5f5', borderRadius: 4, marginBottom: 8 }}></div>
                            <div style={{ fontSize: 22, fontWeight: 800, height: 28, background: '#f5f5f5', borderRadius: 4 }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }

              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 18, marginTop: 20 }}>
                  {statsData.map(s => (
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