import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol, IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getMyShop } from '@/services/agent-service';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface DashboardCardProps {
    icon: IconSymbolName;
    title: string;
    subtitle: string;
    onPress: () => void;
    color: string;
}

const DashboardCard = ({ icon, title, subtitle, onPress, color }: DashboardCardProps) => {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={[styles.cardIcon, { backgroundColor: color }]}>
                <IconSymbol name={icon} size={28} color="#FFF" />
            </View>
            <View style={styles.cardContent}>
                <ThemedText style={styles.cardTitle}>{title}</ThemedText>
                <ThemedText style={styles.cardSubtitle}>{subtitle}</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#8e8e93" />
        </TouchableOpacity>
    );
};

export default function AgentDashboard() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const { user } = useAuthStore();
    const [shop, setShop] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchShop();
    }, []);

    const fetchShop = async () => {
        try {
            const response = await getMyShop();
            if (response.data.success) {
                setShop(response.data.shop);
            }
        } catch (error) {
            console.log('Error fetching shop:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.tint} />
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <IconSymbol name="chevron.left" size={24} color={colors.text} />
                </TouchableOpacity>
                <ThemedText type="subtitle" style={styles.headerTitle}>Cổng thông tin người bán</ThemedText>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.shopOverview}>
                    {shop ? (
                        <>
                            <Image source={{ uri: shop.image }} style={styles.shopImage} />
                            <View style={styles.shopInfo}>
                                <ThemedText type="subtitle" style={styles.shopName}>{shop.name}</ThemedText>
                                <View style={styles.statusRow}>
                                    <View style={[styles.statusDot, { backgroundColor: '#2ECC71' }]} />
                                    <ThemedText style={styles.statusText}>Đang hoạt động</ThemedText>
                                </View>
                            </View>
                        </>
                    ) : (
                        <View style={styles.noShopContainer}>
                            <IconSymbol name="house.fill" size={50} color={colors.icon} />
                            <ThemedText style={styles.noShopText}>Bạn chưa thiết lập cửa hàng</ThemedText>
                            <TouchableOpacity
                                style={[styles.setupBtn, { backgroundColor: colors.tint }]}
                                onPress={() => router.push('/(agent)/shop-setup')}
                            >
                                <ThemedText style={styles.setupBtnText}>Thiết lập ngay</ThemedText>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {shop && (
                    <View style={styles.grid}>
                        <DashboardCard
                            icon="house.fill"
                            title="Thông tin cửa hàng"
                            subtitle="Cập nhật tên, ảnh, địa chỉ"
                            color="#3498DB"
                            onPress={() => router.push('/(agent)/shop-setup')}
                        />
                        <DashboardCard
                            icon="bag.fill"
                            title="Quản lý món ăn"
                            subtitle="Thêm, sửa, xóa món ăn"
                            color="#E67E22"
                            onPress={() => router.push('/(agent)/recipes')}
                        />
                        <DashboardCard
                            icon="local-offer"
                            title="Mã giảm giá"
                            subtitle="Tạo voucher cho khách"
                            color="#E74C3C"
                            onPress={() => router.push('/(agent)/vouchers')}
                        />
                        <DashboardCard
                            icon="paperplane.fill"
                            title="Thống kê đơn hàng"
                            subtitle="Theo dõi doanh thu"
                            color="#2ECC71"
                            onPress={() => { }}
                        />
                    </View>
                )}
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(142, 142, 147, 0.1)',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: Fonts.rounded,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    shopOverview: {
        backgroundColor: 'rgba(142, 142, 147, 0.05)',
        borderRadius: 25,
        padding: 20,
        marginBottom: 30,
        flexDirection: 'row',
        alignItems: 'center',
    },
    shopImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 15,
    },
    shopInfo: {
        flex: 1,
    },
    shopName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 14,
        color: '#8e8e93',
    },
    noShopContainer: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 20,
    },
    noShopText: {
        fontSize: 16,
        color: '#8e8e93',
        marginTop: 15,
        marginBottom: 20,
    },
    setupBtn: {
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 15,
    },
    setupBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    grid: {
        gap: 15,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(142, 142, 147, 0.05)',
        padding: 20,
        borderRadius: 20,
    },
    cardIcon: {
        width: 50,
        height: 50,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 12,
        color: '#8e8e93',
    },
});
