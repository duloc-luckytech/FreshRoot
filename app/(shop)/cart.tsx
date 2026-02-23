import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCartStore } from '@/store/cart-store';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function CartScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.cartItem}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
                <ThemedText style={styles.itemTitle}>{item.title}</ThemedText>
                <ThemedText style={styles.itemPrice}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.costEstimate || 0)}
                </ThemedText>
                <View style={styles.quantityContainer}>
                    <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() => updateQuantity(item._id, item.quantity - 1)}
                    >
                        <IconSymbol name="minus" size={16} color={colors.tint} />
                    </TouchableOpacity>
                    <ThemedText style={styles.quantity}>{item.quantity}</ThemedText>
                    <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() => updateQuantity(item._id, item.quantity + 1)}
                    >
                        <IconSymbol name="plus" size={16} color={colors.tint} />
                    </TouchableOpacity>
                </View>
            </View>
            <TouchableOpacity onPress={() => removeItem(item._id)}>
                <IconSymbol name="xmark.circle.fill" size={24} color="#E74C3C" />
            </TouchableOpacity>
        </View>
    );

    if (items.length === 0) {
        return (
            <ThemedView style={styles.emptyContainer}>
                <IconSymbol name="cart.badge.minus" size={80} color="#8e8e93" />
                <ThemedText style={styles.emptyText}>Giỏ hàng của bạn đang trống</ThemedText>
                <TouchableOpacity
                    style={[styles.checkoutButton, { backgroundColor: colors.tint }]}
                    onPress={() => router.back()}
                >
                    <ThemedText style={styles.checkoutText}>Quay lại mua sắm</ThemedText>
                </TouchableOpacity>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <IconSymbol name="chevron.left" size={24} color={colors.text} />
                </TouchableOpacity>
                <ThemedText type="subtitle">Giỏ hàng</ThemedText>
                <TouchableOpacity onPress={clearCart}>
                    <ThemedText style={{ color: '#E74C3C' }}>Xóa hết</ThemedText>
                </TouchableOpacity>
            </View>

            <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.list}
            />

            <View style={styles.footer}>
                <View style={styles.totalRow}>
                    <ThemedText>Tổng cộng</ThemedText>
                    <ThemedText style={styles.totalAmount}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(getTotal())}
                    </ThemedText>
                </View>
                <TouchableOpacity
                    style={[styles.checkoutButton, { backgroundColor: '#2ECC71' }]}
                    onPress={() => router.push('/(shop)/checkout')}
                >
                    <ThemedText style={styles.checkoutText}>Thanh toán ngay</ThemedText>
                </TouchableOpacity>
            </View>
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
    list: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(142, 142, 147, 0.05)',
        borderRadius: 20,
        padding: 15,
        marginBottom: 15,
    },
    itemImage: {
        width: 70,
        height: 70,
        borderRadius: 15,
    },
    itemInfo: {
        flex: 1,
        marginLeft: 15,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    itemPrice: {
        color: '#2ECC71',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    qtyButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(142, 142, 147, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantity: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        padding: 30,
        paddingBottom: 40,
        borderTopWidth: 1,
        borderTopColor: 'rgba(142, 142, 147, 0.1)',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    totalAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2ECC71',
    },
    checkoutButton: {
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkoutText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        color: '#8e8e93',
        marginVertical: 20,
    },
});
