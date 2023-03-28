import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

// Models
import { User, UserRequest, UserResponse } from '../models/user.model';

//Types
import { STORE_MODE } from '../typings/common.types';

// Store
import { useTokenStore } from './token.store';

// Middleware
import { interceptor } from './middleware/interceptor.middleware';

// Services
import { createUser, loginUser } from '../services/auth.service';

type State = {
  user: User | null;
  loginVisibleMode?: STORE_MODE;
}

type Actions = {
  clear: () => void;
  createUser: (user: UserRequest) => Promise<boolean>;
  login: (user: Omit<UserRequest, 'name'>) => Promise<boolean>;
  logout: () => void;
  getUser: () => User | null;
  isAuthenticated: () => boolean;
  setLoginVisibleMode: (loginVisibleMode?: STORE_MODE) => void;
}

export type AuthState = State & Actions;

const initialState = {
  user: null,
  loginVisibleMode: undefined,
};

export const useAuthStore = create<AuthState>()(
  persist(interceptor(devtools((set, get) => ({
    ...initialState,

    clear: () => set({ user: null, loginVisibleMode: undefined }),

    createUser: async (user: UserRequest) => {
      const response = (await createUser(user)) as UserResponse;
      if (!response) {
        return false;
      }
      set({ user: { id: response.id, name: response.name, email: response.email } });
      useTokenStore.getState().setAuthToken(response.token);
      return true;
    },

    login: async (user: Omit<UserRequest, 'name'>) => {
      const response = (await loginUser(user)) as UserResponse;
      if (!response) {
        return false;
      }
      set({ user: { id: response.id, name: response.name, email: response.email } });
      useTokenStore.getState().setAuthToken(response.token);
      return true;
    },

    logout: () => {
      set({ user: null });
      set({ loginVisibleMode: undefined });
      useTokenStore.getState().setAuthToken(null);
    },

    getUser: () => {
      return get().user;
    },

    isAuthenticated: () => {
      return useTokenStore.getState().getAuthToken() !== null;
    },

    setLoginVisibleMode: (loginVisibleMode?: STORE_MODE) => {
      set({ loginVisibleMode });
    }
  }))), {
    name: 'auth-storage',
    storage: createJSONStorage(() => sessionStorage)
  })
);