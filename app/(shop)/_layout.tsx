import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack } from 'expo-router';

export default function ShopLayout() {
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
                name="[id]"
                options={{ title: 'Chi tiết cửa hàng' }}
            />
            <Stack.Screen
                name="cart"
                options={{
                    presentation: 'modal',
                    title: 'Giỏ hàng'
                }}
            />
            <Stack.Screen
                name="checkout"
                options={{ title: 'Thanh toán' }}
            />
            <Stack.Screen
                name="directions"
                options={{
                    title: 'Chỉ đường',
                    headerShown: false, // We use custom back button
                }}
            />
        </Stack>
    );
}
