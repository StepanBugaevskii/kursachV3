'use client';

import { Layout, Typography, Card, Avatar, Descriptions, Button, Space, Form, Input, Modal, message } from 'antd';
import { UserOutlined, EditOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useUserStore } from '@/modules/users/model/userStore';
import { usersApi } from '@/modules/users/http/users.api';
import Link from 'next/link';

const { Header, Content } = Layout;
const { Title } = Typography;

export default function ProfilePage() {
  const { currentUser, setCurrentUser } = useUserStore();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Mock user if not logged in (for demo)
  useEffect(() => {
    if (!currentUser) {
      setCurrentUser({
        id: 'demo-user-1',
        displayName: 'Demo User',
        email: 'demo@meshare.com',
        role: 'user',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }, [currentUser, setCurrentUser]);

  const handleEdit = () => {
    form.setFieldsValue({
      displayName: currentUser?.displayName,
      email: currentUser?.email,
    });
    setEditModalOpen(true);
  };

  const handleSave = async (values: any) => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const updated = await usersApi.update(currentUser.id, values);
      setCurrentUser(updated);
      message.success('Profile updated successfully');
      setEditModalOpen(false);
    } catch (error) {
      message.error('Failed to update profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white shadow-sm flex items-center justify-between">
        <Link href="/">
          <Title level={3} className="mb-0! text-blue-600! cursor-pointer">
            MeshShare
          </Title>
        </Link>
        <Space>
          <Link href="/files">
            <Button>Files</Button>
          </Link>
          <Link href="/peers">
            <Button>Peers</Button>
          </Link>
        </Space>
      </Header>

      <Content className="p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <div className="flex items-center gap-6 mb-6">
              <Avatar 
                size={100} 
                src={currentUser.avatarUrl}
                icon={<UserOutlined />} 
              />
              <div className="flex-1">
                <Title level={2} className="mb-2!">{currentUser.displayName}</Title>
                <Button icon={<EditOutlined />} onClick={handleEdit}>
                  Edit Profile
                </Button>
              </div>
            </div>

            <Descriptions bordered column={1}>
              <Descriptions.Item label="Email">{currentUser.email}</Descriptions.Item>
              <Descriptions.Item label="Role">{currentUser.role}</Descriptions.Item>
              <Descriptions.Item label="Status">{currentUser.status}</Descriptions.Item>
              <Descriptions.Item label="Member Since">
                {new Date(currentUser.createdAt).toLocaleDateString()}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>
      </Content>

      <Modal
        title="Edit Profile"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            label="Display Name"
            name="displayName"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Save
              </Button>
              <Button onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
