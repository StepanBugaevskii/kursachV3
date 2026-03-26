'use client';

import { Result, Button } from 'antd';
import { WifiOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

export default function OfflinePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Result
        icon={<WifiOutlined className="text-gray-400" />}
        title="You're Offline"
        subTitle="Please check your internet connection and try again."
        extra={
          <Button type="primary" onClick={() => router.push('/')}>
            Try Again
          </Button>
        }
      />
    </div>
  );
}
