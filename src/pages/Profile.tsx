import { useEffect, useState } from 'react';
import { App as AntApp, Avatar, Button, Card, Col, Form, Input, Row, Statistic, Typography } from 'antd';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import client, { extractErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { User, UserStats } from '../types';
import { parseServerDate } from '../utils/date';

interface ProfileFormValues {
  name: string;
  email: string;
}

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const { user, applyUser, applyToken, logout } = useAuth();
  const { message } = AntApp.useApp();
  const [profileForm] = Form.useForm<ProfileFormValues>();
  const [passwordForm] = Form.useForm<PasswordFormValues>();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    client
      .get<UserStats>('/auth/stats')
      .then(({ data }) => setStats(data))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (user) profileForm.setFieldsValue({ name: user.name, email: user.email });
  }, [user, profileForm]);

  const saveProfile = async (values: ProfileFormValues) => {
    setSavingProfile(true);
    try {
      const { data } = await client.patch<{ user: User }>('/auth/profile', values);
      applyUser(data.user);
      message.success('Profile updated.');
    } catch (error) {
      message.error(extractErrorMessage(error));
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (values: PasswordFormValues) => {
    setSavingPassword(true);
    try {
      const { data } = await client.patch<{ token: string; message: string }>('/auth/password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      applyToken(data.token);
      passwordForm.resetFields();
      message.success('Password updated.');
    } catch (error) {
      message.error(extractErrorMessage(error));
    } finally {
      setSavingPassword(false);
    }
  };

  const memberSince = user?.createdAt
    ? parseServerDate(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="profile-page">
      <Card className="glass-card">
        <div className="profile-head">
          <Avatar
            size={72}
            style={{ background: 'linear-gradient(135deg, #3663f0, #6f96ff)', fontSize: 30, flexShrink: 0 }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <div style={{ minWidth: 0 }}>
            <Typography.Title level={3} style={{ margin: 0, letterSpacing: '-0.02em' }}>
              {user?.name}
            </Typography.Title>
            <Typography.Text type="secondary" style={{ wordBreak: 'break-all' }}>
              {user?.email}
            </Typography.Text>
            {memberSince && (
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 12.5 }}>
                  Member since {memberSince}
                </Typography.Text>
              </div>
            )}
          </div>
        </div>

        <Row gutter={16} style={{ marginTop: 24 }}>
          <Col xs={8}>
            <Statistic title="Chats" value={stats?.chats ?? 0} />
          </Col>
          <Col xs={8}>
            <Statistic title="Generations" value={stats?.generations ?? 0} />
          </Col>
          <Col xs={8}>
            <Statistic title="Banners created" value={stats?.banners ?? 0} />
          </Col>
        </Row>
      </Card>

      <Card className="glass-card" title="Account details">
        <Form<ProfileFormValues> form={profileForm} layout="vertical" onFinish={saveProfile} requiredMark={false}>
          <Form.Item
            name="name"
            label="Name"
            rules={[
              { required: true, message: 'Please enter your name.' },
              { min: 2, message: 'Name must be at least 2 characters.' },
            ]}
          >
            <Input prefix={<UserOutlined style={{ color: '#6e81ad' }} />} placeholder="Your name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email.' },
              { type: 'email', message: 'Please enter a valid email address.' },
            ]}
          >
            <Input prefix={<MailOutlined style={{ color: '#6e81ad' }} />} placeholder="you@company.com" />
          </Form.Item>
          <Button className="gradient-btn" type="primary" htmlType="submit" loading={savingProfile}>
            Save changes
          </Button>
        </Form>
      </Card>

      <Card className="glass-card" title="Change password">
        <Form<PasswordFormValues> form={passwordForm} layout="vertical" onFinish={savePassword} requiredMark={false}>
          <Form.Item
            name="currentPassword"
            label="Current password"
            rules={[{ required: true, message: 'Please enter your current password.' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#6e81ad' }} />}
              placeholder="Current password"
              autoComplete="current-password"
            />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="New password"
            rules={[
              { required: true, message: 'Please enter a new password.' },
              { min: 6, message: 'Password must be at least 6 characters.' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#6e81ad' }} />}
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Confirm new password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your new password.' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                  return Promise.reject(new Error('Passwords do not match.'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#6e81ad' }} />}
              placeholder="Repeat new password"
              autoComplete="new-password"
            />
          </Form.Item>
          <Button className="gradient-btn" type="primary" htmlType="submit" loading={savingPassword}>
            Update password
          </Button>
        </Form>
      </Card>

      <Card className="glass-card">
        <Button danger onClick={logout}>
          Logout
        </Button>
      </Card>
    </div>
  );
}
