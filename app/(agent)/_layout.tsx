import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack } from 'expo-router';
import React from 'react';

export default function AgentLayout() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerBackTitle: 'Quay lại',
                headerTintColor: colors.tint,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}>
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="shop-setup"
                options={{
                    title: 'Thiết lập cửa hàng',
                }}
            />
            <Stack.Screen
                name="recipes"
                options={{
                    title: 'Quản lý món ăn',
                }}
            />
            <Stack.Screen
                name="recipe-form"
                options={{
                    title: 'Thông tin món ăn',
                }}
            />
            <Stack.Screen
                name="vouchers"
                options={{
                    title: 'Quản lý mã giảm giá',
                }}
            />
        </Stack>
    );
}
