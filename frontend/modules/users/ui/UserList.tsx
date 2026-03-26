import { List, Spin } from 'antd';
import { UserCard } from './UserCard';
import { User } from '../http/users.api';

interface UserListProps {
  users: User[];
  loading?: boolean;
  onUserClick?: (user: User) => void;
}

export const UserList: React.FC<UserListProps> = ({ users, loading, onUserClick }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <List
      grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
      dataSource={users}
      renderItem={(user) => (
        <List.Item>
          <UserCard user={user} onClick={() => onUserClick?.(user)} />
        </List.Item>
      )}
    />
  );
};
