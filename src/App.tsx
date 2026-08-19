import { ReactNode } from 'react';
import { App as AntApp, ConfigProvider, Spin } from 'antd';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatsProvider } from './context/ChatsContext';
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/Login';
import ProfilePage from './pages/Profile';
import RegisterPage from './pages/Register';
import { appTheme } from './theme';

function FullScreenLoader() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spin size="large" />
    </div>
  );
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, initializing } = useAuth();
  if (initializing) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicOnly({ children }: { children: ReactNode }) {
  const { user, initializing } = useAuth();
  if (initializing) return <FullScreenLoader />;
  if (user) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, initializing } = useAuth();
  if (initializing) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.isAdmin) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ConfigProvider theme={appTheme}>
      <AntApp>
        <AuthProvider>
          <ChatsProvider>
            <BrowserRouter>
              <Routes>
                <Route
                  path="/login"
                  element={
                    <PublicOnly>
                      <LoginPage />
                    </PublicOnly>
                  }
                />
                <Route
                  path="/admin/register"
                  element={
                    <RequireAdmin>
                      <RegisterPage />
                    </RequireAdmin>
                  }
                />
                <Route
                  path="/app"
                  element={
                    <RequireAuth>
                      <AppLayout />
                    </RequireAuth>
                  }
                >
                  <Route index element={<ChatPage />} />
                  <Route path="c/:chatId" element={<ChatPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                </Route>
                <Route path="*" element={<Navigate to="/app" replace />} />
              </Routes>
            </BrowserRouter>
          </ChatsProvider>
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  );
}
