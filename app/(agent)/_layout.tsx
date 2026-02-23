import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';

export default function AgentLayout() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const router = useRouter();

    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerBackTitle: 'Quay lại',
                headerTintColor: colors.tint,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                        <IconSymbol name="chevron.left" size={24} color={colors.tint} />
                    </TouchableOpacity>
                ),
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
