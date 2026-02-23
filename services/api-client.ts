import { useAuthStore } from '@/store/auth-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Base URL - change to your local IP for physical device testing
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001/api';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized/expired token
            await AsyncStorage.removeItem('token');
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);

export default apiClient;
