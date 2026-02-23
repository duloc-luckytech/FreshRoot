import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import apiClient from '@/services/api-client';
import { useCartStore } from '@/store/cart-store';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function CheckoutScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const { items, getTotal, clearCart, shopId } = useCartStore();

    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'momo'>('momo');
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const orderData = {
                shopId,
                items: items.map(item => ({
                    recipeId: item._id,
                    title: item.title,
                    quantity: item.quantity,
                    price: item.costEstimate,
                    image: item.image
                })),
                totalAmount: getTotal(),
                paymentMethod
            };

            const response = await apiClient.post('/orders', orderData);

            if (response.data.success) {
                setShowSuccess(true);
            }
        } catch (error: any) {
            console.error('Checkout error:', error);
            Alert.alert('Lỗi', 'Không thể hoàn tất đơn hàng. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>

            <View style={styles.content}>
                <ThemedText style={styles.sectionTitle}>Phương thức thanh toán</ThemedText>

                <TouchableOpacity
                    style={[styles.paymentOption, paymentMethod === 'momo' && styles.selectedOption]}
                    onPress={() => setPaymentMethod('momo')}
                >
                    <Image
                        source={{ uri: 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png' }}
                        style={styles.paymentLogo}
                    />
                    <ThemedText style={styles.paymentLabel}>Ví MoMo</ThemedText>
                    <View style={[styles.radio, paymentMethod === 'momo' && styles.radioSelected]}>
                        {paymentMethod === 'momo' && <View style={styles.radioInner} />}
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.paymentOption, paymentMethod === 'cod' && styles.selectedOption]}
                    onPress={() => setPaymentMethod('cod')}
                >
                    <IconSymbol name="local-offer" size={30} color={colors.tint} />
                    <ThemedText style={[styles.paymentLabel, { marginLeft: 10 }]}>Thanh toán khi nhận hàng (COD)</ThemedText>
                    <View style={[styles.radio, paymentMethod === 'cod' && styles.radioSelected]}>
                        {paymentMethod === 'cod' && <View style={styles.radioInner} />}
                    </View>
                </TouchableOpacity>

                <View style={styles.summaryBox}>
                    <ThemedText style={styles.summaryTitle}>Tóm tắt đơn hàng</ThemedText>
                    <View style={styles.summaryRow}>
                        <ThemedText>Tạm tính</ThemedText>
                        <ThemedText>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(getTotal())}</ThemedText>
                    </View>
                    <View style={styles.summaryRow}>
                        <ThemedText>Phí giao hàng</ThemedText>
                        <ThemedText>Miễn phí</ThemedText>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <ThemedText style={styles.totalText}>Tổng cộng</ThemedText>
                        <ThemedText style={styles.totalAmount}>
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(getTotal())}
                        </ThemedText>
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.payButton, { backgroundColor: paymentMethod === 'momo' ? '#A50064' : '#2ECC71' }]}
                    onPress={handleCheckout}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <ThemedText style={styles.payButtonText}>
                            {paymentMethod === 'momo' ? 'Thanh toán bằng MoMo' : 'Đặt hàng (COD)'}
                        </ThemedText>
                    )}
                </TouchableOpacity>
            </View>

            {/* Success Modal */}
            <Modal
                visible={showSuccess}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <ThemedView style={styles.modalContent}>
                        <View style={[styles.successIconContainer, { backgroundColor: '#2ECC71' }]}>
                            <IconSymbol name="checkmark.circle.fill" size={60} color="#FFF" />
                        </View>

                        <ThemedText style={styles.successTitle}>Đặt hàng thành công!</ThemedText>
                        <ThemedText style={styles.successSubtitle}>
                            Cảm ơn bạn đã sử dụng dịch vụ. Đơn hàng của bạn đang được xử lý.
                        </ThemedText>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.secondaryButton]}
                                onPress={() => {
                                    setShowSuccess(false);
                                    clearCart();
                                    router.dismissAll();
                                    router.navigate('/(tabs)/activity');
                                }}
                            >
                                <ThemedText style={styles.secondaryButtonText}>Xem đơn hàng</ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: colors.tint }]}
                                onPress={() => {
                                    setShowSuccess(false);
                                    clearCart();
                                    router.dismissAll();
                                    router.navigate('/(tabs)');
                                }}
                            >
                                <ThemedText style={styles.primaryButtonText}>Về trang chủ</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </ThemedView>
                </View>
            </Modal>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(142, 142, 147, 0.05)',
        padding: 20,
        borderRadius: 20,
        marginBottom: 15,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedOption: {
        borderColor: '#2ECC71',
        backgroundColor: 'rgba(46, 204, 113, 0.05)',
    },
    paymentLogo: {
        width: 40,
        height: 40,
        borderRadius: 8,
    },
    paymentLabel: {
        flex: 1,
        marginLeft: 15,
        fontSize: 16,
        fontWeight: '600',
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#8e8e93',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioSelected: {
        borderColor: '#2ECC71',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#2ECC71',
    },
    summaryBox: {
        marginTop: 30,
        padding: 25,
        backgroundColor: 'rgba(142, 142, 147, 0.05)',
        borderRadius: 20,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    totalRow: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(142, 142, 147, 0.1)',
        marginBottom: 0,
    },
    totalText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    totalAmount: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2ECC71',
    },
    footer: {
        padding: 30,
        paddingBottom: 40,
    },
    payButton: {
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    payButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        backgroundColor: '#FFF',
        borderRadius: 30,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    successIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    successSubtitle: {
        fontSize: 14,
        opacity: 0.6,
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 20,
    },
    modalButtons: {
        width: '100%',
        gap: 15,
    },
    modalButton: {
        height: 55,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    primaryButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    secondaryButton: {
        backgroundColor: 'rgba(142, 142, 147, 0.1)',
    },
    secondaryButtonText: {
        fontWeight: '600',
        fontSize: 16,
    },
});
