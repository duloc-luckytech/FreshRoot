import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLocation } from '@/hooks/use-location';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

export default function DirectionsScreen() {
    const { shopLat, shopLng, shopName, shopAddress } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const { location: userLocation, loading: locationLoading, errorMsg } = useLocation();

    const requestPermission = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Quyền truy cập bị từ chối',
                'Chúng tôi cần quyền truy cập vị trí để chỉ đường cho bạn. Vui lòng bật nó trong cài đặt.'
            );
        } else {
            // Trigger a reload or just let the effect in useLocation handle it (it won't, so we might need a way to refresh)
            // For now, let's just use router.replace to refresh the page
            router.replace({
                pathname: '/(shop)/directions',
                params: { shopLat, shopLng, shopName, shopAddress }
            });
        }
    };

    if (errorMsg) {
        return (
            <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
                <IconSymbol name="location.fill" size={64} color={colors.tint} />
                <ThemedText type="subtitle" style={{ marginTop: 20, textAlign: 'center' }}>
                    Chưa được cấp quyền vị trí
                </ThemedText>
                <ThemedText style={{ marginTop: 10, textAlign: 'center', color: '#8e8e93' }}>
                    Vui lòng cho phép ứng dụng truy cập vị trí để chúng tôi có thể chỉ đường cho bạn.
                </ThemedText>
                <TouchableOpacity
                    style={[styles.orderBtn, { backgroundColor: colors.tint, width: '100%', marginTop: 30 }]}
                    onPress={requestPermission}
                >
                    <ThemedText style={styles.orderBtnText}>Cấp quyền ngay</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <ThemedText style={{ color: '#8e8e93' }}>Quay lại</ThemedText>
                </TouchableOpacity>
            </ThemedView>
        );
    }

    if (locationLoading || !userLocation) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.tint} />
                <ThemedText style={{ marginTop: 10 }}>Đang xác định vị trí...</ThemedText>
            </View>
        );
    }

    const start = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
    };

    const end = {
        latitude: parseFloat(shopLat as string) || 0,
        longitude: parseFloat(shopLng as string) || 0,
    };

    console.log(`[Directions] Start: ${start.latitude}, ${start.longitude}`);
    console.log(`[Directions] End: ${end.latitude}, ${end.longitude}`);

    // Simple Polyline path (straight line for now, mimicking a route)
    const coordinates = [start, end];

    // Calculate distance and duration (Grab-style estimate)
    const calculateStats = () => {
        const R = 6371; // km
        const dLat = (end.latitude - start.latitude) * Math.PI / 180;
        const dLon = (end.longitude - start.longitude) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(start.latitude * Math.PI / 180) * Math.cos(end.latitude * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;
        const duration = Math.round(d * 2 + 5);
        return { distance: d.toFixed(1), duration };
    };

    const stats = calculateStats();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: (start.latitude + end.latitude) / 2,
                    longitude: (start.longitude + end.longitude) / 2,
                    latitudeDelta: Math.min(Math.max(Math.abs(start.latitude - end.latitude) * 2, 0.01), 180),
                    longitudeDelta: Math.min(Math.max(Math.abs(start.longitude - end.longitude) * 2, 0.01), 359),
                }}
            >
                <Marker coordinate={start} title="Vị trí của bạn">
                    <View style={styles.startMarker}>
                        <View style={styles.startMarkerInner} />
                    </View>
                </Marker>
                <Marker coordinate={end} title={shopName as string} description={shopAddress as string}>
                    <IconSymbol name="mappin.and.ellipse" size={32} color={colors.tint} />
                </Marker>
                <Polyline
                    coordinates={coordinates}
                    strokeColor={colors.tint}
                    strokeWidth={4}
                />
            </MapView>

            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <IconSymbol name="chevron.left" size={24} color="#000" />
            </TouchableOpacity>

            <ThemedView style={styles.infoPanel}>
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <ThemedText style={styles.statValue}>{stats.duration} phút</ThemedText>
                        <ThemedText style={styles.statLabel}>Thời gian dự kiến</ThemedText>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <ThemedText style={styles.statValue}>{stats.distance} km</ThemedText>
                        <ThemedText style={styles.statLabel}>Khoảng cách</ThemedText>
                    </View>
                </View>

                <View style={styles.addressSection}>
                    <View style={styles.addressItem}>
                        <View style={[styles.dot, { backgroundColor: '#3498DB' }]} />
                        <ThemedText style={styles.addressText} numberOfLines={1}>Vị trí của bạn</ThemedText>
                    </View>
                    <View style={styles.connector} />
                    <View style={styles.addressItem}>
                        <View style={[styles.dot, { backgroundColor: colors.tint }]} />
                        <ThemedText style={styles.addressText} numberOfLines={1}>{shopName}</ThemedText>
                    </View>
                </View>

                <TouchableOpacity style={[styles.orderBtn, { backgroundColor: colors.tint }]} onPress={() => router.back()}>
                    <ThemedText style={styles.orderBtnText}>Quay lại thực đơn</ThemedText>
                </TouchableOpacity>
            </ThemedView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: width,
        height: height,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    infoPanel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 12,
        color: '#8e8e93',
        marginTop: 4,
    },
    divider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(142, 142, 147, 0.2)',
    },
    addressSection: {
        marginBottom: 25,
    },
    addressItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    addressText: {
        fontSize: 14,
        color: '#8e8e93',
        flex: 1,
    },
    connector: {
        width: 1,
        height: 20,
        backgroundColor: 'rgba(142, 142, 147, 0.2)',
        marginLeft: 4.5,
        marginVertical: 4,
    },
    orderBtn: {
        height: 55,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    orderBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    startMarker: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(52, 152, 219, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    startMarkerInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#3498DB',
        borderWidth: 2,
        borderColor: '#FFF',
    },
});
