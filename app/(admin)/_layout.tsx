import { useAuthStore } from '@/store/auth-store';
import { Redirect, Stack } from 'expo-router';
import React from 'react';

export default function AdminLayout() {
    const { user, token, loading } = useAuthStore();

    if (loading) return null;

    // Protective route for admin only
    if (!token || user?.role !== 'admin') {
        console.log('AdminLayout: Access denied, redirecting to login', { token: !!token, role: user?.role });
        return <Redirect href="/auth/login" />;
    }

    return (
        <Stack screenOptions={{ headerShown: true }}>
            <Stack.Screen
                name="cms"
                options={{
                    title: 'FreshRoot CMS',
                    headerTitleStyle: { fontWeight: 'bold' },
                }}
            />
        </Stack>
    );
}
