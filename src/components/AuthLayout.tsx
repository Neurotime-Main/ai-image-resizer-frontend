import { ReactNode } from 'react';
import { Card, Typography } from 'antd';
import { ThunderboltFilled } from '@ant-design/icons';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="auth-page">
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div className="auth-brand">
          <span className="brand-mark">
            <ThunderboltFilled />
          </span>
          <span className="brand-text">BannerAI</span>
        </div>
        <Card className="glass-card auth-card">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Typography.Title level={3} style={{ marginBottom: 6, letterSpacing: '-0.02em' }}>
              {title}
            </Typography.Title>
            <Typography.Text type="secondary">{subtitle}</Typography.Text>
          </div>
          {children}
        </Card>
      </div>
    </div>
  );
}
