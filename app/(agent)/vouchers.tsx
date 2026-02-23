import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { createVoucher, deleteVoucher, getMyVouchers } from '@/services/agent-service';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function AgentVouchersScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const [vouchers, setVouchers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [newVoucher, setNewVoucher] = useState({
        code: '',
        discountAmount: '',
        discountType: 'flat' as 'flat' | 'percentage',
        minOrderAmount: '',
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });

    useEffect(() => {
        fetchVouchers();
    }, []);

    const fetchVouchers = async () => {
        try {
            const response = await getMyVouchers();
            if (response.data.success) {
                setVouchers(response.data.vouchers);
            }
        } catch (error) {
            console.log('Error fetching vouchers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newVoucher.code || !newVoucher.discountAmount) {
            Alert.alert('Lỗi', 'Vui lòng điền mã và mức giảm');
            return;
        }

        try {
            const response = await createVoucher({
                ...newVoucher,
                discountAmount: Number(newVoucher.discountAmount),
                minOrderAmount: Number(newVoucher.minOrderAmount || 0),
            });
            if (response.data.success) {
                setVouchers([...vouchers, response.data.voucher]);
                setModalVisible(false);
                setNewVoucher({
                    code: '',
                    discountAmount: '',
                    discountType: 'flat',
                    minOrderAmount: '',
                    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                });
            }
        } catch (error: any) {
            Alert.alert('Lỗi', error.response?.data?.message || 'Không thể tạo voucher');
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert('Xác nhận', 'Xóa voucher này?', [
            { text: 'Hủy' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const response = await deleteVoucher(id);
                        if (response.data.success) {
                            setVouchers(vouchers.filter(v => v._id !== id));
                        }
                    } catch (error) {
                        Alert.alert('Lỗi', 'Không thể xóa voucher');
                    }
                }
            }
        ]);
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
            <FlatList
                data={vouchers}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <View style={styles.voucherCard}>
                        <View style={styles.voucherLeft}>
                            <ThemedText style={styles.voucherCode}>{item.code}</ThemedText>
                            <ThemedText style={styles.voucherDesc}>
                                Giảm {item.discountType === 'flat' ? new Intl.NumberFormat('vi-VN').format(item.discountAmount) + 'đ' : item.discountAmount + '%'}
                            </ThemedText>
                            <ThemedText style={styles.voucherExpiry}>Hết hạn: {new Date(item.expiryDate).toLocaleDateString('vi-VN')}</ThemedText>
                        </View>
                        <TouchableOpacity onPress={() => handleDelete(item._id)}>
                            <IconSymbol name="trash.fill" size={20} color="#E74C3C" />
                        </TouchableOpacity>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <IconSymbol name="local-offer" size={60} color={colors.icon} />
                        <ThemedText style={styles.emptyText}>Chưa có mã giảm giá nào</ThemedText>
                    </View>
                }
            />

            <TouchableOpacity
                style={[styles.addBtn, { backgroundColor: colors.tint }]}
                onPress={() => setModalVisible(true)}
            >
                <IconSymbol name="plus.slash.minus.equal" size={24} color="#FFF" />
                <ThemedText style={styles.addBtnText}>Tạo voucher mới</ThemedText>
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <ThemedView style={styles.modalContent}>
                        <ThemedText type="subtitle" style={styles.modalTitle}>Tạo mã giảm giá</ThemedText>

                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Mã (VD: GiamGia10k)"
                            placeholderTextColor="#8e8e93"
                            value={newVoucher.code}
                            onChangeText={(t) => setNewVoucher({ ...newVoucher, code: t.toUpperCase() })}
                        />

                        <View style={styles.row}>
                            <TextInput
                                style={[styles.input, { flex: 1, marginRight: 10, color: colors.text }]}
                                placeholder="Mức giảm"
                                placeholderTextColor="#8e8e93"
                                keyboardType="numeric"
                                value={newVoucher.discountAmount}
                                onChangeText={(t) => setNewVoucher({ ...newVoucher, discountAmount: t })}
                            />
                            <TouchableOpacity
                                style={[styles.typeBtn, { backgroundColor: newVoucher.discountType === 'flat' ? colors.tint : 'rgba(142,142,147,0.1)' }]}
                                onPress={() => setNewVoucher({ ...newVoucher, discountType: 'flat' })}
                            >
                                <ThemedText style={{ color: newVoucher.discountType === 'flat' ? '#FFF' : colors.text }}>VNĐ</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.typeBtn, { backgroundColor: newVoucher.discountType === 'percentage' ? colors.tint : 'rgba(142,142,147,0.1)' }]}
                                onPress={() => setNewVoucher({ ...newVoucher, discountType: 'percentage' })}
                            >
                                <ThemedText style={{ color: newVoucher.discountType === 'percentage' ? '#FFF' : colors.text }}>%</ThemedText>
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Đơn tối thiểu (VNĐ)"
                            placeholderTextColor="#8e8e93"
                            keyboardType="numeric"
                            value={newVoucher.minOrderAmount}
                            onChangeText={(t) => setNewVoucher({ ...newVoucher, minOrderAmount: t })}
                        />

                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Ngày hết hạn (YYYY-MM-DD)"
                            placeholderTextColor="#8e8e93"
                            value={newVoucher.expiryDate}
                            onChangeText={(t) => setNewVoucher({ ...newVoucher, expiryDate: t })}
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                <ThemedText>Hủy</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: colors.tint }]} onPress={handleCreate}>
                                <ThemedText style={{ color: '#FFF', fontWeight: 'bold' }}>Tạo ngay</ThemedText>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 20,
        paddingBottom: 100,
    },
    voucherCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(142, 142, 147, 0.05)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    voucherLeft: {
        flex: 1,
    },
    voucherCode: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#E67E22',
        marginBottom: 4,
    },
    voucherDesc: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    voucherExpiry: {
        fontSize: 12,
        color: '#8e8e93',
    },
    addBtn: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        left: 20,
        height: 60,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    addBtnText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: '#8e8e93',
        marginTop: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        borderRadius: 25,
        padding: 25,
    },
    modalTitle: {
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: 'rgba(142, 142, 147, 0.05)',
        borderRadius: 15,
        padding: 15,
        fontSize: 16,
        marginBottom: 15,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    typeBtn: {
        width: 60,
        height: 50,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 5,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 15,
        marginTop: 10,
    },
    cancelBtn: {
        padding: 15,
    },
    confirmBtn: {
        paddingHorizontal: 25,
        paddingVertical: 15,
        borderRadius: 15,
    },
});
