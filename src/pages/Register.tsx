import { useState } from 'react';
import { Alert, Button, Form, Input } from 'antd';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
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
  const { createUser } = useAuth();
  const [form] = Form.useForm<RegisterFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdEmail, setCreatedEmail] = useState<string | null>(null);

  const onFinish = async (values: RegisterFormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      const user = await createUser(values.name, values.email, values.password);
      form.resetFields();
      setCreatedEmail(user.email);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Create an account" subtitle="Administrator-only account provisioning">
      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 20 }} />}
      {createdEmail && (
        <Alert
          type="success"
          message={`Account created for ${createdEmail}.`}
          showIcon
          closable
          onClose={() => setCreatedEmail(null)}
          style={{ marginBottom: 20 }}
        />
      )}
      <Form<RegisterFormValues> form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Form.Item
          name="name"
          label="Name"
          rules={[
            { required: true, message: 'Please enter your name.' },
            { min: 2, message: 'Name must be at least 2 characters.' },
          ]}
        >
          <Input prefix={<UserOutlined style={{ color: '#6e81ad' }} />} placeholder="User name" autoComplete="name" />
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
        <Link to="/app">Back to BannerAI</Link>
      </div>
    </AuthLayout>
  );
}
