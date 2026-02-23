import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLocation } from '@/hooks/use-location';
import { getShops, IShop } from '@/services/shop-service';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function LocalScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const router = useRouter();
    const { location: userLocation, loading: locationLoading } = useLocation();

    const [shops, setShops] = useState<IShop[]>([]);
    const [loading, setLoading] = useState(true);

    // Mock center if location fails
    const MOCK_LOCATION = {
        latitude: 10.7765,
        longitude: 106.7019,
    };

    useEffect(() => {
        if (!locationLoading) {
            fetchNearbyShops();
        }
    }, [locationLoading, userLocation]);

    const fetchNearbyShops = async () => {
        setLoading(true);
        try {
            const response = await getShops({
                lat: userLocation?.latitude || MOCK_LOCATION.latitude,
                lng: userLocation?.longitude || MOCK_LOCATION.longitude,
                radius: 10 // 10km radius
            });
            setShops(response.data);
        } catch (error) {
            console.error('Error fetching nearby shops:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateDistance = (shopLocation: { coordinates: number[] }) => {
        const lat1 = userLocation?.latitude || MOCK_LOCATION.latitude;
        const lon1 = userLocation?.longitude || MOCK_LOCATION.longitude;
        const [lon2, lat2] = shopLocation.coordinates;

        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;

        const duration = Math.round(d * 2 + 5);
        return `${duration} phút • ${d.toFixed(1)} km`;
    };

    const renderShopSlide = ({ item }: { item: IShop }) => (
        <TouchableOpacity
            style={styles.shopSlideCard}
            onPress={() => router.push(`/(shop)/${item._id}`)}
        >
            <Image source={{ uri: item.image }} style={styles.shopSlideImage} />
            {item.discountLabel && (
                <View style={[styles.slideDiscountBadge, { backgroundColor: colors.tint }]}>
                    <ThemedText style={styles.slideDiscountText}>{item.discountLabel}</ThemedText>
                </View>
            )}
            <View style={styles.shopSlideOverlay}>
                <View style={styles.shopSlideInfo}>
                    <View style={styles.shopNameRow}>
                        <ThemedText style={styles.shopSlideName}>{item.name}</ThemedText>
                        {item.isVerified && (
                            <IconSymbol name="checkmark.seal.fill" size={14} color="#3498DB" />
                        )}
                    </View>
                    <View style={styles.shopSlideMeta}>
                        <View style={styles.slideRatingBadge}>
                            <IconSymbol name="star.fill" size={10} color="#F1C40F" />
                            <ThemedText style={styles.slideRatingText}>{item.rating}</ThemedText>
                        </View>
                        <ThemedText style={styles.slideDistanceText}>{calculateDistance(item.location)}</ThemedText>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                    <ThemedText type="title" style={styles.title}>Gần đây</ThemedText>
                    <TouchableOpacity onPress={fetchNearbyShops} style={styles.refreshBtn}>
                        <IconSymbol name="paperplane.fill" size={18} color={colors.tint} />
                    </TouchableOpacity>
                </View>
                <ThemedText style={styles.subtitle}>Khám phá các cửa hàng thực phẩm quanh bạn</ThemedText>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Horizontal Slide Section */}
                <View style={styles.slideContainer}>
                    <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Cửa hàng lân cận</ThemedText>
                    {loading ? (
                        <ActivityIndicator size="small" color={colors.tint} style={{ marginTop: 20 }} />
                    ) : (
                        <FlatList
                            data={shops}
                            renderItem={renderShopSlide}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item._id}
                            contentContainerStyle={styles.slideList}
                            snapToInterval={width * 0.75 + 20}
                            decelerationRate="fast"
                        />
                    )}
                </View>

                {/* Second Slide Section (e.g. Recommended) */}
                {!loading && shops.length > 3 && (
                    <View style={[styles.slideContainer, { marginTop: 10 }]}>
                        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Đề xuất cho bạn</ThemedText>
                        <FlatList
                            data={[...shops].reverse()}
                            renderItem={renderShopSlide}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => `rec-${item._id}`}
                            contentContainerStyle={styles.slideList}
                            snapToInterval={width * 0.75 + 20}
                            decelerationRate="fast"
                        />
                    </View>
                )}

                <View style={styles.footerSection}>
                    <TouchableOpacity style={[styles.buyTogetherBtn, { backgroundColor: colors.success + '20', borderColor: colors.success }]}>
                        <IconSymbol name="person.3.fill" size={24} color={colors.success} />
                        <ThemedText style={[styles.buyTogetherText, { color: colors.success }]}>Tham gia cộng đồng để nhận ưu đãi nhóm</ThemedText>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ThemedView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 65,
    },
    header: {
        paddingHorizontal: 20,
        marginBottom: 25,
    },
    headerTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    refreshBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(230, 126, 34, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontFamily: Fonts.rounded,
        fontSize: 32,
    },
    subtitle: {
        fontSize: 14,
        opacity: 0.6,
        marginTop: 4,
    },
    slideContainer: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    slideList: {
        paddingHorizontal: 20,
        gap: 20,
    },
    shopSlideCard: {
        width: width * 0.75,
        height: 220,
        borderRadius: 25,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        backgroundColor: '#FFF',
    },
    shopSlideImage: {
        width: '100%',
        height: '100%',
    },
    slideDiscountBadge: {
        position: 'absolute',
        top: 15,
        left: 15,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        zIndex: 2,
    },
    slideDiscountText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    shopSlideOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    shopSlideInfo: {
        padding: 15,
    },
    shopNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    shopSlideName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
    shopSlideMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    slideRatingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    slideRatingText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFF',
    },
    slideDistanceText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
    },
    footerSection: {
        paddingHorizontal: 20,
        marginTop: 10,
    },
    buyTogetherBtn: {
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderStyle: 'dashed',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        marginBottom: 30,
    },
    buyTogetherText: {
        fontWeight: 'bold',
        fontSize: 14,
        flex: 1,
    }
});
