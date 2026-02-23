import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IAddress, updateAddresses } from '@/services/profile-service';
import { useNavigation, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function AddressesScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const [addresses, setAddresses] = useState<IAddress[]>([]);
    const [label, setLabel] = useState('');
    const [detail, setDetail] = useState('');
    const [loading, setLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const handleAddAddress = async () => {
        if (!label || !detail) {
            Alert.alert('Lỗi', 'Vui lòng nhập nhãn (VD: Nhà) và địa chỉ chi tiết.');
            return;
        }

        const newAddresses = [...addresses, { label, detail }];
        setLoading(true);
        try {
            await updateAddresses(newAddresses);
            setAddresses(newAddresses);
            setLabel('');
            setDetail('');
            setIsAdding(false);
            Alert.alert('Thành công', 'Đã lưu địa chỉ mới.');
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể lưu địa chỉ.');
        } finally {
            setLoading(false);
        }
    };

    const removeAddress = async (index: number) => {
        const newAddresses = addresses.filter((_, i) => i !== index);
        try {
            await updateAddresses(newAddresses);
            setAddresses(newAddresses);
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể xóa địa chỉ.');
        }
    };

    const navigation = useNavigation();

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={() => setIsAdding(!isAdding)} style={{ marginRight: 10 }}>
                    <IconSymbol name={isAdding ? 'xmark.circle.fill' : 'plus'} size={24} color={colors.tint} />
                </TouchableOpacity>
            ),
        });
    }, [navigation, isAdding]);

    return (
        <ThemedView style={styles.container}>

            {isAdding && (
                <View style={styles.addForm}>
                    <ThemedText style={styles.formTitle}>Thêm địa chỉ mới</ThemedText>
                    <TextInput
                        style={[styles.input, { backgroundColor: 'rgba(142, 142, 147, 0.1)', color: colors.text }]}
                        value={label}
                        onChangeText={setLabel}
                        placeholder="Nhãn (VD: Nhà riêng, Công ty...)"
                        placeholderTextColor="#8e8e93"
                    />
                    <TextInput
                        style={[styles.input, styles.detailInput, { backgroundColor: 'rgba(142, 142, 147, 0.1)', color: colors.text }]}
                        value={detail}
                        onChangeText={setDetail}
                        placeholder="Địa chỉ chi tiết (Số nhà, tên đường...)"
                        placeholderTextColor="#8e8e93"
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: colors.tint }]}
                        onPress={handleAddAddress}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#FFF" /> : <ThemedText style={styles.addButtonText}>Lưu địa chỉ</ThemedText>}
                    </TouchableOpacity>
                </View>
            )}

            <FlatList
                data={addresses}
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={styles.list}
                renderItem={({ item, index }) => (
                    <View style={styles.addressCard}>
                        <View style={[styles.addressIcon, { backgroundColor: 'rgba(46, 204, 113, 0.1)' }]}>
                            <IconSymbol name="location.fill" size={20} color={colors.tint} />
                        </View>
                        <View style={styles.addressInfo}>
                            <ThemedText style={styles.addressLabel}>{item.label}</ThemedText>
                            <ThemedText style={styles.addressDetail}>{item.detail}</ThemedText>
                        </View>
                        <TouchableOpacity onPress={() => removeAddress(index)}>
                            <IconSymbol name="trash.fill" size={20} color="#E74C3C" />
                        </TouchableOpacity>
                    </View>
                )}
                ListEmptyComponent={
                    isAdding ? null : (
                        <View style={styles.empty}>
                            <IconSymbol name="location.fill" size={60} color="#8e8e93" />
                            <ThemedText style={styles.emptyText}>Chưa có địa chỉ nào được lưu.</ThemedText>
                        </View>
                    )
                }
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 10,
    },
    list: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    addForm: {
        backgroundColor: 'rgba(142, 142, 147, 0.05)',
        marginHorizontal: 20,
        padding: 20,
        borderRadius: 20,
        marginBottom: 20,
        gap: 12,
    },
    formTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    input: {
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    detailInput: {
        height: 80,
        paddingTop: 15,
        textAlignVertical: 'top',
    },
    addButton: {
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5,
    },
    addButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    addressCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(142, 142, 147, 0.05)',
        padding: 20,
        borderRadius: 20,
        marginBottom: 12,
    },
    addressIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addressInfo: {
        flex: 1,
        marginLeft: 15,
        marginRight: 10,
    },
    addressLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    addressDetail: {
        fontSize: 13,
        opacity: 0.6,
        marginTop: 4,
    },
    empty: {
        alignItems: 'center',
        marginTop: 100,
        opacity: 0.5,
    },
    emptyText: {
        marginTop: 15,
        fontSize: 14,
    },
});
