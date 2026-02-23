import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

interface User {
    id: string;
    name: string;
    email: string;
    rank: string;
    points: number;
    avatar: string;
    phone?: string;
    bio?: string;
    role: 'user' | 'agent';
}

interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    setUser: (user: User | null) => void;
    updateUser: (user: Partial<User>) => Promise<void>;
    setToken: (token: string | null) => void;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: null,
    loading: true,
    setUser: (user) => set({ user }),
    updateUser: async (updatedData) => {
        const currentUser = get().user;
        if (currentUser) {
            const newUser = { ...currentUser, ...updatedData };
            set({ user: newUser });
            await AsyncStorage.setItem('user', JSON.stringify(newUser));
        }
    },
    setToken: (token) => set({ token }),
    logout: async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        set({ user: null, token: null });
    },
    checkAuth: async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const userStr = await AsyncStorage.getItem('user');

            if (token && userStr) {
                set({ token, user: JSON.parse(userStr), loading: false });
            } else {
                set({ loading: false });
            }
        } catch (error) {
            set({ loading: false });
        }
    },
}));
