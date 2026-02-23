import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLocation } from '@/hooks/use-location';
import { getRecipes, IRecipe } from '@/services/recipe-service';
import { getShops, IShop } from '@/services/shop-service';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

// Mock location for "Nearby" calculation (HCMC Center)
const MOCK_LOCATION = {
    latitude: 10.7765,
    longitude: 106.7019,
};

export default function SearchScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const router = useRouter();
    const params = useLocalSearchParams();
    const { location: userLocation, loading: locationLoading } = useLocation();

    const [searchQuery, setSearchQuery] = useState((params.q as string) || '');
    const [selectedCategory, setSelectedCategory] = useState((params.category as string) || '');
    const [selectedFoodGroup, setSelectedFoodGroup] = useState('');
    const [onSaleOnly, setOnSaleOnly] = useState(params.discount === 'true');
    const [nearbyOnly, setNearbyOnly] = useState(params.nearby === 'true');

    const [recipes, setRecipes] = useState<IRecipe[]>([]);
    const [shops, setShops] = useState<IShop[]>([]);
    const [loading, setLoading] = useState(true);

    const categories = [
        { id: 0, name: 'Tất cả', value: '' },
        { id: 1, name: 'Bữa sáng', value: 'Bữa sáng' },
        { id: 2, name: 'Bữa trưa', value: 'Bữa trưa' },
        { id: 3, name: 'Bữa tối', value: 'Bữa tối' },
        { id: 4, name: 'Ăn vặt', value: 'Ăn vặt' },
    ];

    const foodGroups = [
        { id: 0, name: 'Món ăn', value: '' },
        { id: 1, name: 'Cơm', value: 'Cơm' },
        { id: 2, name: 'Phở', value: 'Phở' },
        { id: 3, name: 'Bún', value: 'Bún' },
        { id: 4, name: 'Mì', value: 'Mì' },
        { id: 5, name: 'Lẩu', value: 'Lẩu' },
        { id: 6, name: 'Salad', value: 'Salad' },
        { id: 7, name: 'Đồ uống', value: 'Đồ uống' },
    ];

    useEffect(() => {
        performSearch();
    }, [selectedCategory, selectedFoodGroup, onSaleOnly, nearbyOnly]);

    const performSearch = async () => {
        setLoading(true);
        try {
            // Fetch Recipes
            const recipeData = await getRecipes(
                selectedCategory || undefined,
                undefined,
                searchQuery || undefined,
                selectedFoodGroup || undefined
            );
            setRecipes(recipeData.data);

            // Fetch Shops
            const shopParams: any = {
                search: searchQuery || undefined,
            };
            if (onSaleOnly) shopParams.onSale = true;
            if (nearbyOnly) {
                shopParams.lat = userLocation?.latitude || MOCK_LOCATION.latitude;
                shopParams.lng = userLocation?.longitude || MOCK_LOCATION.longitude;
                shopParams.radius = 5;
            }

            const shopData = await getShops(shopParams);
            setShops(shopData.data);

        } catch (error) {
            console.error('Search error:', error);
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

        // Grab-style: Duration estimate (assume 2 mins per km + 5 min base)
        const duration = Math.round(d * 2 + 5);
        return `${duration} phút • ${d.toFixed(1)} km`;
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.searchRow}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <IconSymbol name="chevron.left" size={24} color={colors.text} />
                </TouchableOpacity>
                <ThemedView style={[styles.searchContainer, { backgroundColor: colorScheme === 'light' ? '#F0F0F0' : '#2A2A2A' }]}>
                    <IconSymbol name="magnifyingglass" size={20} color={colors.icon} />
                    <TextInput
                        placeholder="Tìm món ăn, cửa hàng..."
                        placeholderTextColor={colors.icon}
                        style={[styles.searchInput, { color: colors.text }]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={performSearch}
                        autoFocus={!params.category}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => { setSearchQuery(''); performSearch(); }}>
                            <IconSymbol name="xmark.circle.fill" size={18} color={colors.icon} />
                        </TouchableOpacity>
                    )}
                </ThemedView>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow} style={{ marginBottom: 8 }}>
                {categories.map((cat) => (
                    <TouchableOpacity
                        key={cat.id}
                        style={[
                            styles.filterChip,
                            selectedCategory === cat.value && { backgroundColor: colors.tint, borderColor: colors.tint }
                        ]}
                        onPress={() => setSelectedCategory(cat.value)}
                    >
                        <ThemedText style={[styles.filterChipText, selectedCategory === cat.value && { color: '#FFF' }]}>
                            {cat.name}
                        </ThemedText>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow} style={{ marginBottom: 10 }}>
                {foodGroups.map((group) => (
                    <TouchableOpacity
                        key={group.id}
                        style={[
                            styles.filterChip,
                            { borderRadius: 10, paddingHorizontal: 12 },
                            selectedFoodGroup === group.value && { backgroundColor: colors.tint + '20', borderColor: colors.tint }
                        ]}
                        onPress={() => setSelectedFoodGroup(group.value)}
                    >
                        <ThemedText style={[styles.filterChipText, { fontSize: 13 }, selectedFoodGroup === group.value && { color: colors.tint, fontWeight: 'bold' }]}>
                            {group.name}
                        </ThemedText>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.quickFilters}>
                <TouchableOpacity
                    style={[styles.quickFilterBtn, onSaleOnly && { backgroundColor: '#E74C3C20' }]}
                    onPress={() => setOnSaleOnly(!onSaleOnly)}
                >
                    <IconSymbol name="tag.fill" size={14} color={onSaleOnly ? '#E74C3C' : colors.icon} />
                    <ThemedText style={[styles.quickFilterText, onSaleOnly && { color: '#E74C3C', fontWeight: 'bold' }]}>
                        Giảm giá
                    </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.quickFilterBtn, nearbyOnly && { backgroundColor: colors.tint + '20' }]}
                    onPress={() => setNearbyOnly(!nearbyOnly)}
                >
                    <IconSymbol name="location.fill" size={14} color={nearbyOnly ? colors.tint : colors.icon} />
                    <ThemedText style={[styles.quickFilterText, nearbyOnly && { color: colors.tint, fontWeight: 'bold' }]}>
                        Gần đây
                    </ThemedText>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        if (item.type === 'shop') {
            const shop = item.data as IShop;
            return (
                <TouchableOpacity
                    style={styles.shopCard}
                    onPress={() => router.push(`/(shop)/${shop._id}`)}
                >
                    <Image source={{ uri: shop.image }} style={styles.shopImage} />
                    <View style={styles.shopInfo}>
                        <View style={styles.shopNameRow}>
                            <ThemedText style={styles.shopName}>{shop.name}</ThemedText>
                            {shop.isVerified && <IconSymbol name="checkmark.seal.fill" size={16} color="#3498DB" />}
                        </View>
                        <View style={styles.shopMeta}>
                            <View style={styles.ratingRow}>
                                <IconSymbol name="star.fill" size={12} color="#F1C40F" />
                                <ThemedText style={styles.ratingText}>{shop.rating}</ThemedText>
                                <ThemedText style={styles.distanceText}> • {calculateDistance(shop.location)}</ThemedText>
                            </View>
                        </View>
                        {shop.discountLabel && (
                            <View style={styles.discountBadge}>
                                <ThemedText style={styles.discountText}>{shop.discountLabel}</ThemedText>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            );
        } else {
            const recipe = item.data as IRecipe;
            return (
                <TouchableOpacity
                    style={styles.recipeCard}
                    onPress={() => router.push(`/(tabs)`)} // Temporary link back to home or detail
                >
                    <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
                    <View style={styles.recipeInfo}>
                        <ThemedText style={styles.recipeTitle} numberOfLines={1}>{recipe.title}</ThemedText>
                        <ThemedText style={styles.recipeCategory}>{recipe.category}</ThemedText>
                        <ThemedText style={styles.recipePrice}>
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(recipe.costEstimate || 0)}
                        </ThemedText>
                    </View>
                </TouchableOpacity>
            );
        }
    };

    const combinedData = [
        ...shops.map(s => ({ id: `shop-${s._id}`, type: 'shop', data: s })),
        ...recipes.map(r => ({ id: `recipe-${r._id}`, type: 'recipe', data: r })),
    ];

    return (
        <ThemedView style={styles.container}>
            {renderHeader()}

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.tint} />
                </View>
            ) : combinedData.length > 0 ? (
                <FlatList
                    data={combinedData}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.center}>
                    <IconSymbol name="magnifyingglass" size={60} color={colors.icon} style={{ opacity: 0.3 }} />
                    <ThemedText style={styles.emptyText}>Không tìm thấy kết quả phù hợp</ThemedText>
                </View>
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
        backgroundColor: 'transparent',
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 15,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 15,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
    },
    filterRow: {
        gap: 10,
        paddingBottom: 5,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(142, 142, 147, 0.2)',
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: '600',
    },
    quickFilters: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    quickFilterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(142, 142, 147, 0.05)',
    },
    quickFilterText: {
        fontSize: 12,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    shopCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(142, 142, 147, 0.05)',
        borderRadius: 20,
        marginBottom: 16,
        padding: 12,
        alignItems: 'center',
    },
    shopImage: {
        width: 80,
        height: 80,
        borderRadius: 15,
    },
    shopInfo: {
        flex: 1,
        marginLeft: 15,
    },
    shopNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    shopName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    shopMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 12,
        color: '#8e8e93',
    },
    distanceText: {
        fontSize: 12,
        color: '#8e8e93',
    },
    discountBadge: {
        marginTop: 6,
        backgroundColor: '#E74C3C',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    discountText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    recipeCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(142, 142, 147, 0.05)',
        borderRadius: 20,
        marginBottom: 16,
        padding: 12,
        alignItems: 'center',
    },
    recipeImage: {
        width: 80,
        height: 80,
        borderRadius: 40, // Different style for recipes
    },
    recipeInfo: {
        flex: 1,
        marginLeft: 15,
    },
    recipeTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    recipeCategory: {
        fontSize: 12,
        color: '#8e8e93',
        marginBottom: 4,
    },
    recipePrice: {
        fontSize: 14,
        color: '#E67E22',
        fontWeight: 'bold',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
        color: '#8e8e93',
    },
});
