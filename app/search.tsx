import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLocation } from '@/hooks/use-location';
import { getShops, IShop } from '@/services/shop-service';
import * as Location from 'expo-location';
import { useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Keyboard,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const MOCK_LOCATION = { latitude: 10.7765, longitude: 106.7019 };

// Popular search suggestions (static)
const POPULAR_SUGGESTIONS = [
    'Phở Bò', 'Bún Chả', 'Cơm Tấm', 'Bún Bò Huế', 'Bánh Mì',
    'Lẩu', 'Gỏi Cuốn', 'Bún Riêu', 'Hủ Tiếu', 'Chả Giò',
];

export default function SearchScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const router = useRouter();
    const { location: userLocation } = useLocation();
    const inputRef = useRef<TextInput>(null);
    const isDark = colorScheme === 'dark';

    const navigation = useNavigation();
    const [query, setQuery] = useState('');
    const [shops, setShops] = useState<IShop[]>([]);
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState('Đang xác định...');
    const [suggestions, setSuggestions] = useState<string[]>([]);

    // Hide default header
    useLayoutEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    // Get readable address from coordinates
    useEffect(() => {
        (async () => {
            try {
                const lat = userLocation?.latitude || MOCK_LOCATION.latitude;
                const lng = userLocation?.longitude || MOCK_LOCATION.longitude;
                const [result] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
                if (result) {
                    const parts = [result.streetNumber, result.street, result.district, result.city].filter(Boolean);
                    setAddress(parts.join(', ') || 'Vị trí hiện tại');
                }
            } catch {
                setAddress('Vị trí hiện tại');
            }
        })();
    }, [userLocation]);

    // Auto-focus input on mount
    useEffect(() => {
        const timer = setTimeout(() => inputRef.current?.focus(), 300);
        return () => clearTimeout(timer);
    }, []);

    // Generate suggestions as user types
    useEffect(() => {
        if (!query.trim()) {
            setSuggestions([]);
            return;
        }
        const q = query.toLowerCase();
        const matched = POPULAR_SUGGESTIONS.filter(s => s.toLowerCase().includes(q) && s.toLowerCase() !== q);
        // Also create "auto-complete" style suggestions
        const autoCompletes = POPULAR_SUGGESTIONS
            .filter(s => s.toLowerCase().startsWith(q))
            .map(s => s);
        const unique = [...new Set([...autoCompletes, ...matched])].slice(0, 5);
        setSuggestions(unique);
    }, [query]);

    // Search shops when query changes (debounced)
    useEffect(() => {
        if (!query.trim()) {
            setShops([]);
            return;
        }
        const timer = setTimeout(() => searchShops(query), 400);
        return () => clearTimeout(timer);
    }, [query]);

    const searchShops = useCallback(async (q: string) => {
        if (!q.trim()) return;
        setLoading(true);
        try {
            const lat = userLocation?.latitude || MOCK_LOCATION.latitude;
            const lng = userLocation?.longitude || MOCK_LOCATION.longitude;
            const result = await getShops({ search: q, lat, lng, radius: 50 });
            setShops(result.data || []);
        } catch {
            setShops([]);
        } finally {
            setLoading(false);
        }
    }, [userLocation]);

    const calculateDistance = (shopLocation: { coordinates: number[] }) => {
        const lat1 = userLocation?.latitude || MOCK_LOCATION.latitude;
        const lon1 = userLocation?.longitude || MOCK_LOCATION.longitude;
        const [lon2, lat2] = shopLocation.coordinates;
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c).toFixed(1);
    };

    const onSuggestionPress = (text: string) => {
        setQuery(text);
        Keyboard.dismiss();
    };

    const bgColor = isDark ? '#000' : '#FFF';
    const cardBg = isDark ? '#1c1c1e' : '#FFF';
    const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    const subtextColor = '#8e8e93';
    const inputBg = isDark ? '#1c1c1e' : '#F2F2F7';

    return (
        <ThemedView style={[st.container, { backgroundColor: bgColor }]}>


            {/* ═══ Header: Location + Back ═══ */}
            <View style={[st.header, { backgroundColor: bgColor, borderBottomColor: borderColor }]}>
                <TouchableOpacity onPress={() => router.back()} style={st.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <IconSymbol name="chevron.left" size={22} color={colors.text} />
                </TouchableOpacity>
                <View style={st.locationInfo}>
                    <ThemedText style={st.locationLabel}>Vị trí của bạn</ThemedText>
                    <View style={st.locationRow}>
                        <ThemedText style={st.locationAddress} numberOfLines={1}>{address}</ThemedText>
                        <IconSymbol name="chevron.right" size={12} color={subtextColor} />
                    </View>
                </View>
            </View>

            {/* ═══ Search Input ═══ */}
            <View style={[st.searchSection, { backgroundColor: bgColor }]}>
                <View style={[st.searchBar, { backgroundColor: inputBg }]}>
                    <IconSymbol name="magnifyingglass" size={18} color={subtextColor} />
                    <TextInput
                        ref={inputRef}
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Tìm món ăn, cửa hàng..."
                        placeholderTextColor={subtextColor}
                        style={[st.searchInput, { color: colors.text }]}
                        returnKeyType="search"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => { setQuery(''); inputRef.current?.focus(); }} style={st.clearBtn}>
                            <IconSymbol name="xmark.circle.fill" size={18} color={subtextColor} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* ═══ Results ═══ */}
            <ScrollView style={st.results} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

                {/* Loading */}
                {loading && (
                    <View style={st.loadingContainer}>
                        <ActivityIndicator size="small" color={colors.tint} />
                    </View>
                )}

                {/* Suggestions */}
                {!loading && suggestions.length > 0 && (
                    <View>
                        {suggestions.map((s, i) => (
                            <TouchableOpacity
                                key={`sug-${i}`}
                                style={[st.suggestionItem, { borderBottomColor: borderColor }]}
                                onPress={() => onSuggestionPress(s)}
                            >
                                <IconSymbol name="magnifyingglass" size={16} color={subtextColor} />
                                <ThemedText style={st.suggestionText}>
                                    <ThemedText style={{ fontWeight: 'bold' }}>{query}</ThemedText>
                                    {s.toLowerCase().startsWith(query.toLowerCase())
                                        ? s.slice(query.length)
                                        : ` — ${s}`}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Shop Results */}
                {!loading && shops.length > 0 && (
                    <View style={st.shopResults}>
                        {shops.map(shop => (
                            <TouchableOpacity
                                key={shop._id}
                                style={[st.shopItem, { borderBottomColor: borderColor }]}
                                onPress={() => { router.push(`/(shop)/${shop._id}`); }}
                            >
                                <View style={[st.shopPin, { backgroundColor: colors.tint }]}>
                                    <IconSymbol name="location.fill" size={14} color="#FFF" />
                                </View>
                                <View style={st.shopInfo}>
                                    <ThemedText style={st.shopName} numberOfLines={1}>{shop.name}</ThemedText>
                                    <ThemedText style={st.shopMeta} numberOfLines={1}>
                                        {calculateDistance(shop.location)}km · {shop.address}
                                    </ThemedText>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Empty state when typed but no results */}
                {!loading && query.length > 0 && shops.length === 0 && suggestions.length === 0 && (
                    <View style={st.emptyState}>
                        <IconSymbol name="magnifyingglass" size={48} color={subtextColor} style={{ opacity: 0.3 }} />
                        <ThemedText style={st.emptyText}>Không tìm thấy kết quả cho "{query}"</ThemedText>
                    </View>
                )}

                {/* Popular searches when input is empty */}
                {query.length === 0 && (
                    <View style={st.popularSection}>
                        <ThemedText style={st.popularTitle}>Tìm kiếm phổ biến</ThemedText>
                        <View style={st.popularGrid}>
                            {POPULAR_SUGGESTIONS.map((s, i) => (
                                <TouchableOpacity
                                    key={`pop-${i}`}
                                    style={[st.popularChip, { backgroundColor: inputBg, borderColor }]}
                                    onPress={() => onSuggestionPress(s)}
                                >
                                    <ThemedText style={st.popularChipText}>{s}</ThemedText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </ThemedView>
    );
}

const st = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 50 : 36,
        paddingBottom: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 0.5,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationInfo: {
        flex: 1,
        marginLeft: 4,
    },
    locationLabel: {
        fontSize: 12,
        color: '#8e8e93',
        fontWeight: '500',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationAddress: {
        fontSize: 16,
        fontWeight: 'bold',
        maxWidth: '90%',
    },
    searchSection: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        height: 46,
        borderRadius: 12,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 0,
    },
    clearBtn: {
        padding: 4,
    },
    results: {
        flex: 1,
    },
    loadingContainer: {
        paddingVertical: 30,
        alignItems: 'center',
    },

    // Suggestions
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 14,
        borderBottomWidth: 0.5,
    },
    suggestionText: {
        fontSize: 16,
        flex: 1,
    },

    // Shop Results
    shopResults: {
        marginTop: 4,
    },
    shopItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 14,
        borderBottomWidth: 0.5,
    },
    shopPin: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shopInfo: {
        flex: 1,
    },
    shopName: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 3,
    },
    shopMeta: {
        fontSize: 13,
        color: '#8e8e93',
    },

    // Empty
    emptyState: {
        alignItems: 'center',
        paddingTop: 60,
        gap: 12,
    },
    emptyText: {
        fontSize: 15,
        color: '#8e8e93',
        textAlign: 'center',
    },

    // Popular
    popularSection: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    popularTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 14,
    },
    popularGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    popularChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
    },
    popularChipText: {
        fontSize: 13,
        fontWeight: '500',
    },
});
