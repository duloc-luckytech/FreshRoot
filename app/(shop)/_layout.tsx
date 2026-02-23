import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';

export default function ShopLayout() {
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
