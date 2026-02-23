import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getRecipes, IRecipe } from '@/services/recipe-service';
import { getShopById, IShop } from '@/services/shop-service';
import { useCartStore } from '@/store/cart-store';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const { width } = Dimensions.get('window');

export default function ShopDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const [shop, setShop] = useState<IShop | null>(null);
    const [menu, setMenu] = useState<IRecipe[]>([]);
    const [loading, setLoading] = useState(true);
    const { addItem, items, getTotal } = useCartStore();

    useEffect(() => {
        if (id) {
            fetchShopDetails();
        }
    }, [id]);

    const openMap = async () => {
        if (!shop?.location) return;
        const [lng, lat] = shop.location.coordinates;
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        try {
            // First check if the URL can be opened
            const supported = await Linking.canOpenURL(url).catch(() => false);
            if (supported) {
                await Linking.openURL(url).catch(err => {
                    console.error('Failed to open URL:', err);
                    // Fallback to alert or something if needed
                });
            } else {
                console.warn("Don't know how to open URI: " + url);
                // Fallback: try opening as a regular web link if it's not already
                if (!url.startsWith('http')) {
                    const webUrl = `https://maps.google.com/?q=${lat},${lng}`;
                    Linking.openURL(webUrl).catch(() => { });
                }
            }
        } catch (error) {
            console.error('Error in openMap:', error);
        }
    };

    const fetchShopDetails = async () => {
        setLoading(true);
        console.log(`[ShopDetail] Fetching shop with ID: ${id}`);
        try {
            const shopRes = await getShopById(id as string);
            console.log(`[ShopDetail] Response:`, JSON.stringify(shopRes).substring(0, 100));
            if (shopRes.success) {
                setShop(shopRes.data);
                const recipeRes = await getRecipes(undefined, undefined, undefined, undefined, id as string);
                setMenu(recipeRes.data);
            } else {
                console.error('[ShopDetail] Shop not found in resonance');
            }
        } catch (error) {
            console.error('[ShopDetail] Error fetching shop details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.tint} />
            </View>
        );
    }

    if (!shop) {
        return (
            <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
                <ThemedText>Không tìm thấy cửa hàng.</ThemedText>
                <TouchableOpacity onPress={() => router.back()}>
                    <ThemedText style={{ color: colors.tint, marginTop: 10 }}>Quay lại</ThemedText>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                {/* Header Image */}
                <View style={styles.imageContainer}>
                    <Image source={{ uri: shop.image }} style={styles.image} />
                </View>

                {/* Shop Info */}
                <ThemedView style={styles.infoContainer}>
                    <View style={styles.titleRow}>
                        <ThemedText type="title" style={styles.name}>{shop.name}</ThemedText>
                        {shop.isVerified && (
                            <IconSymbol name="checkmark.seal.fill" size={24} color="#3498DB" />
                        )}
                    </View>

                    <View style={styles.metaRow}>
                        <View style={styles.ratingBox}>
                            <IconSymbol name="star.fill" size={16} color="#F1C40F" />
                            <ThemedText style={styles.ratingText}>{shop.rating}</ThemedText>
                        </View>
                        <ThemedText style={styles.dot}>•</ThemedText>
                        <TouchableOpacity style={styles.addressRow} onPress={openMap}>
                            <ThemedText style={styles.address} numberOfLines={1}>{shop.address}</ThemedText>
                            <IconSymbol name="mappin.and.ellipse" size={14} color={colors.tint} />
                            <ThemedText style={[styles.mapLink, { color: colors.tint }]}>Bản đồ</ThemedText>
                        </TouchableOpacity>
                    </View>

                    {shop.discountLabel && (
                        <View style={styles.discountBanner}>
                            <IconSymbol name="local-offer" size={16} color="#FFF" />
                            <ThemedText style={styles.discountBannerText}>Đang ưu đãi: {shop.discountLabel}</ThemedText>
                        </View>
                    )}

                    <ThemedText style={styles.description}>
                        Cung cấp thực phẩm sạch và các món ăn dinh dưỡng mỗi ngày. Hân hạnh phục vụ quý khách!
                    </ThemedText>

                    {/* Integrated Map View */}
                    {shop.location && (
                        <View style={styles.mapContainer}>
                            <MapView
                                style={styles.map}
                                initialRegion={{
                                    latitude: shop.location.coordinates[1],
                                    longitude: shop.location.coordinates[0],
                                    latitudeDelta: 0.005,
                                    longitudeDelta: 0.005,
                                }}
                                scrollEnabled={false}
                                zoomEnabled={false}
                                rotateEnabled={false}
                                pitchEnabled={false}
                            >
                                <Marker
                                    coordinate={{
                                        latitude: shop.location.coordinates[1],
                                        longitude: shop.location.coordinates[0],
                                    }}
                                    title={shop.name}
                                    description={shop.address}
                                />
                            </MapView>
                            <TouchableOpacity
                                style={styles.mapOverlay}
                                onPress={() => router.push({
                                    pathname: '/(shop)/directions',
                                    params: {
                                        shopLat: shop.location.coordinates[1],
                                        shopLng: shop.location.coordinates[0],
                                        shopName: shop.name,
                                        shopAddress: shop.address,
                                    }
                                })}
                            >
                                <View style={styles.fullMapBtn}>
                                    <IconSymbol name="mappin.and.ellipse" size={14} color="#FFF" />
                                    <ThemedText style={styles.fullMapBtnText}>Mở bản đồ</ThemedText>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}
                </ThemedView>

                {/* Main Menu Section */}
                <ThemedView style={styles.menuSection}>
                    <View style={styles.sectionHeader}>
                        <IconSymbol name="fork.knife" size={20} color={colors.tint} />
                        <ThemedText type="subtitle" style={styles.sectionTitle}>Thực đơn hôm nay</ThemedText>
                    </View>
                    {menu.filter(i => i.foodGroup !== 'Món thêm' && i.foodGroup !== 'Đồ uống').length > 0 ? (
                        menu.filter(i => i.foodGroup !== 'Món thêm' && i.foodGroup !== 'Đồ uống').map((item: IRecipe) => (
                            <TouchableOpacity key={item._id} style={styles.menuItem}>
                                <Image source={{ uri: item.image }} style={styles.menuItemImage} />
                                <View style={styles.menuItemInfo}>
                                    <ThemedText style={styles.menuItemTitle}>{item.title}</ThemedText>
                                    <ThemedText style={styles.menuItemDesc} numberOfLines={2}>{item.description}</ThemedText>
                                    <ThemedText style={styles.menuItemPrice}>
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.costEstimate || 0)}
                                    </ThemedText>
                                </View>
                                <TouchableOpacity
                                    style={styles.addButton}
                                    onPress={() => addItem(item, id as string)}
                                >
                                    <IconSymbol name="plus" size={20} color="#FFF" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <ThemedText style={styles.emptyText}>Cửa hàng này chưa cập nhật thực đơn chính.</ThemedText>
                    )}
                </ThemedView>

                {/* Sides Section (Horizontal) */}
                {menu.some(i => i.foodGroup === 'Món thêm') && (
                    <ThemedView style={styles.sidesSection}>
                        <View style={styles.sectionHeader}>
                            <IconSymbol name="leaf.fill" size={20} color="#2ECC71" />
                            <ThemedText type="subtitle" style={styles.sectionTitle}>Món thêm</ThemedText>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                            {menu.filter(i => i.foodGroup === 'Món thêm').map((item: IRecipe) => (
                                <View key={item._id} style={styles.sideCard}>
                                    <Image source={{ uri: item.image }} style={styles.sideImage} />
                                    <ThemedText style={styles.sideTitle} numberOfLines={1}>{item.title}</ThemedText>
                                    <View style={styles.sideBottom}>
                                        <ThemedText style={styles.sidePrice}>
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.costEstimate || 0)}
                                        </ThemedText>
                                        <TouchableOpacity
                                            style={styles.smallAddBtn}
                                            onPress={() => addItem(item, id as string)}
                                        >
                                            <IconSymbol name="plus" size={14} color="#FFF" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    </ThemedView>
                )}

                {/* Drinks Section (Horizontal) */}
                {menu.some(i => i.foodGroup === 'Đồ uống') && (
                    <ThemedView style={[styles.sidesSection, { marginBottom: 100 }]}>
                        <View style={styles.sectionHeader}>
                            <IconSymbol name="cup.and.saucer.fill" size={20} color="#3498DB" />
                            <ThemedText type="subtitle" style={styles.sectionTitle}>Đồ uống</ThemedText>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                            {menu.filter(i => i.foodGroup === 'Đồ uống').map((item: IRecipe) => (
                                <View key={item._id} style={styles.sideCard}>
                                    <Image source={{ uri: item.image }} style={[styles.sideImage, { borderRadius: 40 }]} />
                                    <ThemedText style={styles.sideTitle} numberOfLines={1}>{item.title}</ThemedText>
                                    <View style={styles.sideBottom}>
                                        <ThemedText style={styles.sidePrice}>
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.costEstimate || 0)}
                                        </ThemedText>
                                        <TouchableOpacity
                                            style={[styles.smallAddBtn, { backgroundColor: '#3498DB' }]}
                                            onPress={() => addItem(item, id as string)}
                                        >
                                            <IconSymbol name="plus" size={14} color="#FFF" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    </ThemedView>
                )}
            </ScrollView>

            {/* Floating Cart Button */}
            {items.length > 0 && (
                <TouchableOpacity
                    style={styles.floatingCart}
                    onPress={() => router.push('/(shop)/cart')}
                >
                    <View style={styles.cartInfo}>
                        <View style={styles.badge}>
                            <ThemedText style={styles.badgeText}>{items.length}</ThemedText>
                        </View>
                        <ThemedText style={styles.cartText}>Xem giỏ hàng</ThemedText>
                    </View>
                    <ThemedText style={styles.cartTotal}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(getTotal())}
                    </ThemedText>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    imageContainer: {
        position: 'relative',
        height: 300,
        width: '100%',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    infoContainer: {
        padding: 20,
        marginTop: -30,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    dot: {
        marginHorizontal: 10,
        color: '#8e8e93',
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
    },
    address: {
        color: '#8e8e93',
        fontSize: 14,
    },
    mapLink: {
        fontSize: 14,
        fontWeight: '600',
    },
    discountBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E74C3C',
        padding: 12,
        borderRadius: 15,
        gap: 10,
        marginBottom: 20,
    },
    discountBannerText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    description: {
        color: '#8e8e93',
        lineHeight: 20,
        marginBottom: 20,
    },
    mapContainer: {
        height: 150,
        width: '100%',
        borderRadius: 20,
        overflow: 'hidden',
        marginTop: 10,
        position: 'relative',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    mapOverlay: {
        position: 'absolute',
        bottom: 10,
        right: 10,
    },
    fullMapBtn: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    fullMapBtnText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    menuSection: {
        padding: 20,
    },
    menuItem: {
        flexDirection: 'row',
        marginBottom: 16,
        backgroundColor: 'rgba(142, 142, 147, 0.05)',
        borderRadius: 20,
        padding: 12,
        alignItems: 'center',
    },
    menuItemImage: {
        width: 80,
        height: 80,
        borderRadius: 15,
    },
    menuItemInfo: {
        flex: 1,
        marginLeft: 15,
        marginRight: 10,
    },
    menuItemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    menuItemDesc: {
        fontSize: 12,
        color: '#8e8e93',
        marginBottom: 8,
    },
    menuItemPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2ECC71',
    },
    addButton: {
        backgroundColor: '#2ECC71',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sidesSection: {
        paddingVertical: 10,
        paddingLeft: 20,
        marginBottom: 20,
    },
    horizontalScroll: {
        paddingRight: 20,
        gap: 15,
    },
    sideCard: {
        width: 130,
        backgroundColor: 'rgba(142, 142, 147, 0.05)',
        borderRadius: 20,
        padding: 10,
    },
    sideImage: {
        width: '100%',
        height: 80,
        borderRadius: 12,
        marginBottom: 8,
    },
    sideTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    sideBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sidePrice: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2ECC71',
    },
    smallAddBtn: {
        backgroundColor: '#2ECC71',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        color: '#8e8e93',
        marginTop: 20,
    },
    floatingCart: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        backgroundColor: '#2ECC71',
        height: 60,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 25,
        shadowColor: '#2ECC71',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    cartInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    badge: {
        backgroundColor: '#FFF',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#2ECC71',
        fontWeight: 'bold',
        fontSize: 12,
    },
    cartText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cartTotal: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
