import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';

export default function AccountLayout() {
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
