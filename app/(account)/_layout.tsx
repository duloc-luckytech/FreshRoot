import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack } from 'expo-router';

export default function AccountLayout() {
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
                name="edit-profile"
                options={{ title: 'Chỉnh sửa hồ sơ' }}
            />
            <Stack.Screen
                name="security"
                options={{ title: 'Bảo mật' }}
            />
            <Stack.Screen
                name="emergency"
                options={{ title: 'Liên lạc khẩn cấp (SOS)' }}
            />
            <Stack.Screen
                name="addresses"
                options={{ title: 'Địa chỉ đã lưu' }}
            />
        </Stack>
    );
}
