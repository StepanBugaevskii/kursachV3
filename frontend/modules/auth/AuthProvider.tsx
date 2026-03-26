'use client';

import { useEffect, useState } from 'react';
import { useUserStore } from '../users/model/userStore';
import { usersApi } from '../users/http/users.api';
import { AuthModal } from './AuthModal';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, login, isAuthenticated } = useUserStore();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем сохранённую сессию
    const checkAuth = async () => {
      const savedUserId = localStorage.getItem('userId');
      
      if (savedUserId) {
        try {
          const user = await usersApi.getOne(savedUserId);
          login(user);
        } catch (error) {
          console.error('Failed to restore session:', error);
          localStorage.removeItem('userId');
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    // Показываем модалку если не авторизован
    if (!loading && !isAuthenticated) {
      setAuthModalOpen(true);
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};
