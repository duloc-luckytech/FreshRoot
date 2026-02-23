import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotificationStore } from '@/store/notification-store';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function NotificationsScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const router = useRouter();

    const { notifications, loading, fetchNotifications, markRead, markAllRead } = useNotificationStore();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'order': return 'bag.fill';
            case 'promotion': return 'local-offer';
            default: return 'info.circle.fill';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'order': return '#3498DB';
            case 'promotion': return '#E67E22';
            default: return '#95A5A6';
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[
                styles.notificationCard,
                { backgroundColor: colorScheme === 'light' ? '#FFF' : '#1C1C1E' },
                !item.isRead && styles.unreadCard
            ]}
            onPress={() => markRead(item._id)}
        >
            <View style={[styles.iconContainer, { backgroundColor: getTypeColor(item.type) + '20' }]}>
                <IconSymbol name={getTypeIcon(item.type) as any} size={24} color={getTypeColor(item.type)} />
            </View>
            <View style={styles.contentContainer}>
                <View style={styles.headerRow}>
                    <ThemedText style={[styles.notiTitle, !item.isRead && styles.unreadText]}>{item.title}</ThemedText>
                    {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: colors.tint }]} />}
                </View>
                <ThemedText style={styles.notiMessage} numberOfLines={2}>{item.message}</ThemedText>
                <ThemedText style={styles.notiDate}>
                    {new Date(item.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                    })}
                </ThemedText>
            </View>
        </TouchableOpacity>
    );

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <IconSymbol name="chevron.left" size={24} color={colors.text} />
                </TouchableOpacity>
                <ThemedText type="subtitle">Thông báo</ThemedText>
                <TouchableOpacity onPress={markAllRead}>
                    <ThemedText style={{ color: colors.tint, fontWeight: '600' }}>Đọc hết</ThemedText>
                </TouchableOpacity>
            </View>

            {loading && notifications.length === 0 ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.tint} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={fetchNotifications} tintColor={colors.tint} />
                    }
                    ListEmptyComponent={
                        <View style={styles.centerContainer}>
                            <IconSymbol name="bell.fill" size={60} color="#8e8e93" />
                            <ThemedText style={styles.emptyText}>Bạn chưa có thông báo nào</ThemedText>
                        </View>
                    }
                />
            )}
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
        marginBottom: 20,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    notificationCard: {
        flexDirection: 'row',
        padding: 15,
        borderRadius: 20,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    unreadCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#E67E22',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    contentContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    notiTitle: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    unreadText: {
        fontWeight: 'bold',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 10,
    },
    notiMessage: {
        fontSize: 14,
        opacity: 0.7,
        marginBottom: 8,
        lineHeight: 20,
    },
    notiDate: {
        fontSize: 12,
        opacity: 0.5,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
        color: '#8e8e93',
    },
});
