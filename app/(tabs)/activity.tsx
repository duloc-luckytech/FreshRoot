import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getMyOrders, IOrder } from '@/services/order-service';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ActivityScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const router = useRouter();

    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrders = async () => {
        try {
            const response = await getMyOrders();
            if (response.data.success) {
                setOrders(response.data.orders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return '#2ECC71';
            case 'shipping': return '#3498DB';
            case 'pending': return '#F1C40F';
            case 'paid': return '#9B59B6';
            case 'cancelled': return '#E74C3C';
            default: return '#95A5A6';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'completed': return 'Đã hoàn thành';
            case 'shipping': return 'Đang giao hàng';
            case 'pending': return 'Chờ xác nhận';
            case 'paid': return 'Đã thanh toán';
            case 'cancelled': return 'Đã hủy';
            default: return status;
        }
    };

    const renderOrderItem = ({ item }: { item: IOrder }) => (
        <TouchableOpacity
            style={[styles.orderCard, { backgroundColor: colorScheme === 'light' ? '#FFF' : '#1C1C1E' }]}
            onPress={() => { }}
        >
            <View style={styles.orderHeader}>
                {item.shopId ? (
                    <>
                        <Image source={{ uri: item.shopId.image }} style={styles.shopImage} />
                        <View style={styles.orderInfo}>
                            <ThemedText style={styles.shopName} numberOfLines={1}>{item.shopId.name}</ThemedText>
                            <ThemedText style={styles.orderDate}>
                                {new Date(item.createdAt).toLocaleDateString('vi-VN', {
                                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                            </ThemedText>
                        </View>
                    </>
                ) : (
                    <View style={styles.orderInfo}>
                        <ThemedText style={styles.shopName}>Cửa hàng không xác định</ThemedText>
                        <ThemedText style={styles.orderDate}>ID: {item._id}</ThemedText>
                    </View>
                )}
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {getStatusText(item.status)}
                    </ThemedText>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.orderDetails}>
                <ThemedText style={styles.itemsSummary}>
                    {item.items?.length > 0
                        ? item.items.map(i => `${i.quantity}x ${i.title || 'Món ăn'}`).join(', ')
                        : 'Không có thông tin món ăn'}
                </ThemedText>
                <View style={styles.priceRow}>
                    <ThemedText style={styles.totalLabel}>Tổng cộng</ThemedText>
                    <ThemedText style={styles.totalAmount}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.totalAmount)}
                    </ThemedText>
                </View>
            </View>

            <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.actionButton, { borderColor: colors.tint }]}>
                    <ThemedText style={{ color: colors.tint, fontWeight: 'bold' }}>Đặt lại</ThemedText>
                </TouchableOpacity>
                {item.status === 'completed' && (
                    <TouchableOpacity style={[styles.actionButton, styles.primaryButton, { backgroundColor: colors.tint }]}>
                        <ThemedText style={{ color: '#FFF', fontWeight: 'bold' }}>Đánh giá</ThemedText>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText type="title" style={styles.title}>Hoạt động</ThemedText>
                <ThemedText style={styles.subtitle}>Theo dõi các đơn hàng của bạn</ThemedText>
            </ThemedView>

            {loading ? (
                <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item._id}
                    renderItem={renderOrderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.tint} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <IconSymbol name="paperplane.fill" size={60} color={colors.tabIconDefault} />
                            <ThemedText style={styles.emptyText}>Bạn chưa có đơn hàng nào.</ThemedText>
                            <TouchableOpacity
                                style={[styles.orderNowBtn, { backgroundColor: colors.tint }]}
                                onPress={() => router.push('/(tabs)')}
                            >
                                <ThemedText style={styles.orderNowText}>Đặt món ngay</ThemedText>
                            </TouchableOpacity>
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
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    title: {
        fontFamily: Fonts.rounded,
        fontSize: 28,
    },
    subtitle: {
        fontSize: 14,
        opacity: 0.7,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    orderCard: {
        borderRadius: 20,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    orderHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    shopImage: {
        width: 50,
        height: 50,
        borderRadius: 12,
    },
    orderInfo: {
        flex: 1,
        marginLeft: 15,
    },
    shopName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    orderDate: {
        fontSize: 12,
        opacity: 0.5,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(128, 128, 128, 0.1)',
        marginVertical: 15,
    },
    orderDetails: {
        marginBottom: 15,
    },
    itemsSummary: {
        fontSize: 14,
        opacity: 0.7,
        marginBottom: 10,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    totalAmount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    actionButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
    },
    primaryButton: {
        borderWidth: 0,
    },
    emptyContainer: {
        marginTop: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
        color: '#8e8e93',
    },
    orderNowBtn: {
        marginTop: 25,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
    },
    orderNowText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
