import { useState } from 'react';
import { Alert, Button, Form, Input, Typography } from 'antd';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { extractErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: RegisterFormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      await register(values.name, values.email, values.password);
      navigate('/app', { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start adapting banners in minutes">
      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 20 }} />}
      <Form<RegisterFormValues> layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Form.Item
          name="name"
          label="Name"
          rules={[
            { required: true, message: 'Please enter your name.' },
            { min: 2, message: 'Name must be at least 2 characters.' },
          ]}
        >
          <Input prefix={<UserOutlined style={{ color: '#6e81ad' }} />} placeholder="Your name" autoComplete="name" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please enter your email.' },
            { type: 'email', message: 'Please enter a valid email address.' },
          ]}
        >
          <Input prefix={<MailOutlined style={{ color: '#6e81ad' }} />} placeholder="you@company.com" autoComplete="email" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: 'Please enter a password.' },
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
          label="Confirm password"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm your password.' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) return Promise.resolve();
                return Promise.reject(new Error('Passwords do not match.'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#6e81ad' }} />}
            placeholder="Repeat your password"
            autoComplete="new-password"
          />
        </Form.Item>
        <Button
          className="gradient-btn"
          type="primary"
          htmlType="submit"
          size="large"
          block
          loading={submitting}
          style={{ marginTop: 8 }}
        >
          Create account
        </Button>
      </Form>
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <Typography.Text type="secondary">Already have an account? </Typography.Text>
        <Link to="/login">Login</Link>
      </div>
    </AuthLayout>
  );
}
