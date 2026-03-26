import { Card, Avatar, Typography, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { User } from '../http/users.api';

const { Text, Title } = Typography;

interface UserCardProps {
  user: User;
  onClick?: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onClick }) => {
  return (
    <Card hoverable onClick={onClick} className="w-full">
      <div className="flex items-center gap-4">
        <Avatar 
          size={64} 
          src={user.avatarUrl} 
          icon={<UserOutlined />}
        />
        <div className="flex-1">
          <Title level={5} className="!mb-1">{user.displayName}</Title>
          <Text type="secondary">{user.email}</Text>
          <div className="mt-2">
            <Tag color={user.status === 'active' ? 'green' : 'red'}>
              {user.status}
            </Tag>
            <Tag>{user.role}</Tag>
          </div>
        </div>
      </div>
    </Card>
  );
};
