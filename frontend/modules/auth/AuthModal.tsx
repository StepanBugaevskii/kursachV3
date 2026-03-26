'use client';

import { Modal, Form, Input, Button, Tabs, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { usersApi } from '../users/http/users.api';
import { useUserStore } from '../users/model/userStore';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const { login } = useUserStore();
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      // Простая авторизация - ищем пользователя по email
      const users = await usersApi.getAll();
      const user = users.find(u => u.email === values.email);
      
      if (user) {
        login(user);
        localStorage.setItem('userId', user.id);
        message.success('Welcome back!');
        onClose();
      } else {
        message.error('User not found');
      }
    } catch (error) {
      message.error('Login failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: { displayName: string; email: string; password: string }) => {
    setLoading(true);
    try {
      const newUser = await usersApi.create({
        displayName: values.displayName,
        email: values.email,
        passwordHash: values.password, // В реальном приложении нужно хешировать
        role: 'user',
        status: 'active',
      });
      
      login(newUser);
      localStorage.setItem('userId', newUser.id);
      message.success('Account created successfully!');
      onClose();
    } catch (error) {
      message.error('Registration failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Welcome to MeshShare"
      open={open}
      onCancel={onClose}
      footer={null}
      width={400}
      closable={false}
      maskClosable={false}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'login',
            label: 'Login',
            children: (
              <Form
                form={loginForm}
                onFinish={handleLogin}
                layout="vertical"
              >
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Please enter a valid email' },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="Email"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: 'Please enter your password' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Password"
                    size="large"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                    block
                  >
                    Login
                  </Button>
                </Form.Item>
              </Form>
            ),
          },
          {
            key: 'register',
            label: 'Register',
            children: (
              <Form
                form={registerForm}
                onFinish={handleRegister}
                layout="vertical"
              >
                <Form.Item
                  name="displayName"
                  rules={[{ required: true, message: 'Please enter your name' }]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Display Name"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Please enter a valid email' },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="Email"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: 'Please enter a password' },
                    { min: 6, message: 'Password must be at least 6 characters' },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Password"
                    size="large"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                    block
                  >
                    Register
                  </Button>
                </Form.Item>
              </Form>
            ),
          },
        ]}
      />
    </Modal>
  );
};
