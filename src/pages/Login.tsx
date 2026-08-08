import { useState } from 'react';
import { Alert, Button, Form, Input, Typography } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { extractErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: LoginFormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      await login(values.email, values.password);
      navigate('/app', { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to adapt your advertising creatives">
      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 20 }} />}
      <Form<LoginFormValues> layout="vertical" onFinish={onFinish} requiredMark={false}>
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
          rules={[{ required: true, message: 'Please enter your password.' }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#6e81ad' }} />}
            placeholder="Your password"
            autoComplete="current-password"
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
          Login
        </Button>
      </Form>
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <Typography.Text type="secondary">Don&apos;t have an account? </Typography.Text>
        <Link to="/register">Create account</Link>
      </div>
    </AuthLayout>
  );
}
