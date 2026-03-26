import { create } from 'zustand';
import { User } from '../http/users.api';

interface UserStore {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  currentUser: null,
  isAuthenticated: false,
  
  setCurrentUser: (user) => set({ currentUser: user }),
  
  login: (user) => set({ currentUser: user, isAuthenticated: true }),
  
  logout: () => set({ currentUser: null, isAuthenticated: false }),
}));
