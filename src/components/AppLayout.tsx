import { useEffect, useState } from 'react';
import { Avatar, Button, Drawer, Dropdown, Grid, Typography } from 'antd';
import { LogoutOutlined, MenuOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const screens = Grid.useBreakpoint();
  const isDesktop = Boolean(screens.lg);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const userMenu = {
    items: [
      {
        key: 'email',
        label: <Typography.Text type="secondary">{user?.email}</Typography.Text>,
        disabled: true,
      },
      { type: 'divider' as const },
      {
        key: 'profile',
        icon: <SettingOutlined />,
        label: 'Profile settings',
        onClick: () => navigate('/app/profile'),
      },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', onClick: logout },
    ],
  };

  return (
    <div className="app-shell">
      {isDesktop ? (
        <Sidebar />
      ) : (
        <Drawer
          open={drawerOpen}
          placement="left"
          onClose={() => setDrawerOpen(false)}
          width={296}
          closable={false}
          styles={{ body: { padding: 0, background: '#0a1020' } }}
        >
          <Sidebar onNavigate={() => setDrawerOpen(false)} />
        </Drawer>
      )}

      <div className="app-main">
        <header className="app-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {!isDesktop && (
              <Button type="text" icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)} aria-label="Open chats" />
            )}
          </div>
          <Dropdown menu={userMenu} trigger={['click']} placement="bottomRight">
            <Button type="text" style={{ height: 42, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar
                size={30}
                style={{ background: 'linear-gradient(135deg, #3663f0, #6f96ff)' }}
                icon={<UserOutlined />}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <span style={{ fontWeight: 600 }}>{user?.name}</span>
            </Button>
          </Dropdown>
        </header>

        <div className="app-scroll">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
