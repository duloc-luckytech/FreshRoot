import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BiometricService } from '@/services/biometric-service';
import { deactivateAccount, toggleBiometrics, updatePassword } from '@/services/profile-service';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, View } from 'react-native';

export default function SecurityScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const { logout } = useAuthStore();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [biometricsEnabled, setBiometricsEnabled] = useState(false);
    const [isBiometricSupported, setIsBiometricSupported] = useState(false);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        const checkSupport = async () => {
            const supported = await BiometricService.isSupported();
            setIsBiometricSupported(supported);

            const credentials = await BiometricService.getCredentials();
            setBiometricsEnabled(!!credentials);
        };
        checkSupport();
    }, []);

    const handlePasswordUpdate = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu mới không khớp.');
            return;
        }

        setLoading(true);
        try {
            const response = await updatePassword({ currentPassword, newPassword });
            if (response.data.success) {
                Alert.alert('Thành công', 'Mật khẩu đã được cập nhật.');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (error: any) {
            Alert.alert('Lỗi', error.response?.data?.message || 'Không thể cập nhật mật khẩu.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleBiometrics = async (value: boolean) => {
        if (value) {
            // First, perform the biometric scan to confirm identity
            const authenticated = await BiometricService.authenticate('Xác nhận Face ID để kích hoạt');

            if (authenticated) {
                // Now ask for the password ONE TIME to store it securely for future logins
                Alert.prompt(
                    'Bộ lưu trữ bảo mật',
                    'Vui lòng nhập mật khẩu đăng nhập của bạn để lưu vào chuỗi khóa bảo mật. Bạn sẽ không cần nhập lại mật khẩu này cho các lần đăng nhập sau bằng Face ID.',
                    [
                        {
                            text: 'Hủy',
                            style: 'cancel',
                            onPress: () => setBiometricsEnabled(false)
                        },
                        {
                            text: 'Lưu mật khẩu',
                            onPress: async (password?: string) => {
                                if (!password) {
                                    Alert.alert('Lỗi', 'Cần có mật khẩu để hoàn tất thiết lập Face ID');
                                    setBiometricsEnabled(false);
                                    return;
                                }

                                const { user } = useAuthStore.getState();
                                if (user?.email) {
                                    await BiometricService.saveCredentials({
                                        email: user.email,
                                        password: password
                                    });
                                    setBiometricsEnabled(true);
                                    Alert.alert('Thành công', 'Face ID đã được kích hoạt. Lần tới bạn chỉ cần quyét khuôn mặt để vào app!');
                                }
                            }
                        }
                    ],
                    'secure-text'
                );
            } else {
                setBiometricsEnabled(false);
            }
        } else {
            // Disable and clear
            await BiometricService.clearCredentials();
            setBiometricsEnabled(false);
            Alert.alert('Đã tắt', 'Đã xóa thông tin đăng nhập Face ID.');
        }

        try {
            await toggleBiometrics(value);
        } catch (e) {
            console.error('Toggle biometrics error:', e);
        }
    };

    const handleDeactivate = () => {
        Alert.alert(
            'Xác nhận vô hiệu hóa',
            'Bạn có chắc chắn muốn vô hiệu hóa tài khoản? Hành động này không thể hoàn tác.',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Vô hiệu hóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deactivateAccount();
                            await logout();
                            router.replace('/(auth)/login');
                        } catch (e) {
                            Alert.alert('Lỗi', 'Không thể vô hiệu hóa tài khoản.');
                        }
                    }
                }
            ]
        );
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <IconSymbol name="chevron.left" size={24} color={colors.text} />
                </TouchableOpacity>
                <ThemedText type="subtitle">Bảo mật</ThemedText>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Đổi mật khẩu</ThemedText>
                    <View style={styles.passwordCard}>
                        <TextInput
                            style={[styles.input, { backgroundColor: 'rgba(142, 142, 147, 0.1)', color: colors.text }]}
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            placeholder="Mật khẩu hiện tại"
                            placeholderTextColor="#8e8e93"
                            secureTextEntry
                        />
                        <TextInput
                            style={[styles.input, { backgroundColor: 'rgba(142, 142, 147, 0.1)', color: colors.text }]}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="Mật khẩu mới"
                            placeholderTextColor="#8e8e93"
                            secureTextEntry
                        />
                        <TextInput
                            style={[styles.input, { backgroundColor: 'rgba(142, 142, 147, 0.1)', color: colors.text }]}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Xác nhận mật khẩu mới"
                            placeholderTextColor="#8e8e93"
                            secureTextEntry
                        />
                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: colors.tint }]}
                            onPress={handlePasswordUpdate}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#FFF" /> : <ThemedText style={styles.saveButtonText}>Cập nhật mật khẩu</ThemedText>}
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Xác thực sinh trắc học</ThemedText>
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <ThemedText style={styles.settingLabel}>Face ID / Vân tay</ThemedText>
                            <ThemedText style={styles.settingSub}>Sử dụng sinh trắc học để đăng nhập nhanh</ThemedText>
                        </View>
                        <Switch
                            value={biometricsEnabled}
                            onValueChange={handleToggleBiometrics}
                            trackColor={{ false: '#767577', true: '#2ECC71' }}
                            thumbColor={biometricsEnabled ? '#FFF' : '#f4f3f4'}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Quyền riêng tư</ThemedText>
                    <TouchableOpacity style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <ThemedText style={styles.settingLabel}>Xóa tài khoản</ThemedText>
                            <ThemedText style={styles.settingSub}>Ngừng sử dụng dịch vụ và xóa dữ liệu</ThemedText>
                        </View>
                        <TouchableOpacity onPress={handleDeactivate}>
                            <IconSymbol name="trash.fill" size={20} color="#E74C3C" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    content: {
        paddingHorizontal: 20,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
        opacity: 0.8,
    },
    passwordCard: {
        backgroundColor: 'rgba(142, 142, 147, 0.05)',
        padding: 20,
        borderRadius: 20,
        gap: 15,
    },
    input: {
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    saveButton: {
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5,
    },
    saveButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(142, 142, 147, 0.05)',
        padding: 20,
        borderRadius: 20,
    },
    settingInfo: {
        flex: 1,
        marginRight: 15,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    settingSub: {
        fontSize: 12,
        opacity: 0.5,
        marginTop: 2,
    },
});
