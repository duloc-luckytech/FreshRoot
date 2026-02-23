import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol, IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface SettingItemProps {
    icon: IconSymbolName;
    label: string;
    onPress: () => void;
    color?: string;
    badge?: string;
}

const SettingItem = ({ icon, label, onPress, color, badge }: SettingItemProps) => {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    return (
        <TouchableOpacity style={styles.settingItem} onPress={onPress}>
            <View style={[styles.iconContainer, { backgroundColor: color || 'rgba(142, 142, 147, 0.1)' }]}>
                <IconSymbol name={icon} size={22} color={color ? '#FFF' : colors.text} />
            </View>
            <ThemedText style={styles.settingLabel}>{label}</ThemedText>
            <View style={styles.settingRight}>
                {badge && (
                    <View style={styles.badge}>
                        <ThemedText style={styles.badgeText}>{badge}</ThemedText>
                    </View>
                )}
                <IconSymbol name="chevron.right" size={20} color="#8e8e93" />
            </View>
        </TouchableOpacity>
    );
};

export default function AccountScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const { user, logout } = useAuthStore();

    return (
        <ThemedView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={styles.profileInfo}>
                        <Image source={{ uri: user?.avatar || 'https://i.pravatar.cc/150' }} style={styles.avatar} />
                        <View style={styles.nameRow}>
                            <ThemedText type="subtitle" style={styles.userName}>{user?.name}</ThemedText>
                            <TouchableOpacity style={[styles.rankBadge, { backgroundColor: colors.warning }]}>
                                <ThemedText style={styles.rankText}>{user?.rank || 'Sắt V'}</ThemedText>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={() => router.push('/(account)/edit-profile')}>
                            <ThemedText style={{ color: colors.tint, marginTop: 5 }}>Chỉnh sửa hồ sơ</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Tài khoản</ThemedText>
                    <SettingItem
                        icon="person.fill"
                        label="Thông tin cá nhân"
                        onPress={() => router.push('/(account)/edit-profile')}
                    />
                    <SettingItem
                        icon="location.fill"
                        label="Địa chỉ đã lưu"
                        onPress={() => router.push('/(account)/addresses')}
                    />
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Bảo mật & Quyền riêng tư</ThemedText>
                    <SettingItem
                        icon="lock.fill"
                        label="Cài đặt bảo mật"
                        onPress={() => router.push('/(account)/security')}
                        color="#3498DB"
                    />
                    <SettingItem
                        icon="shield.fill"
                        label="Liên hệ khẩn cấp (SOS)"
                        onPress={() => router.push('/(account)/emergency')}
                        color="#E74C3C"
                    />
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}> FRESHROOT AGENT </ThemedText>
                    <SettingItem
                        icon="bag.fill"
                        label="Chế độ người bán"
                        onPress={() => router.push('/(agent)')}
                        color={colors.tint}
                        badge={user?.role === 'agent' ? 'Đang bật' : 'Đăng ký'}
                    />
                </View>

                {user?.role === 'admin' && (
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}> QUẢN TRỊ VIÊN </ThemedText>
                        <SettingItem
                            icon="shield.fill"
                            label="Quản lý CMS"
                            onPress={() => router.push('/(admin)/cms')}
                            color="#9B59B6"
                            badge="Admin"
                        />
                    </View>
                )}

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Cài đặt ứng dụng</ThemedText>
                    <SettingItem
                        icon="bell.fill"
                        label="Thông báo"
                        onPress={() => { }}
                        badge="Mới"
                    />
                    <SettingItem
                        icon="info.circle.fill"
                        label="Về FreshRoot"
                        onPress={() => { }}
                    />
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <IconSymbol name="trash.fill" size={20} color="#E74C3C" />
                    <ThemedText style={styles.logoutText}>Đăng xuất</ThemedText>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
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
        paddingHorizontal: 20,
        marginBottom: 30,
        alignItems: 'center',
    },
    profileInfo: {
        alignItems: 'center',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 15,
        borderWidth: 3,
        borderColor: 'rgba(46, 204, 113, 0.2)',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    rankBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
    },
    rankText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 25,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: '#8e8e93',
        marginBottom: 15,
        marginLeft: 10,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(142, 142, 147, 0.05)',
        padding: 15,
        borderRadius: 20,
        marginBottom: 10,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingLabel: {
        flex: 1,
        marginLeft: 15,
        fontSize: 16,
        fontWeight: '600',
    },
    settingRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    badge: {
        backgroundColor: '#E74C3C',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        marginHorizontal: 20,
        padding: 18,
        borderRadius: 20,
        gap: 10,
    },
    logoutText: {
        color: '#E74C3C',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
