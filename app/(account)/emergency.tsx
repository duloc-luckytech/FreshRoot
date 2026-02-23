import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { updateEmergencyContacts } from '@/services/profile-service';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function EmergencyScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    // Mock user data for emergency contacts if not in store
    const [contacts, setContacts] = useState<any[]>([]);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [relationship, setRelationship] = useState('');
    const [loading, setLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const handleAddContact = async () => {
        if (!name || !phone || !relationship) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.');
            return;
        }

        const newContacts = [...contacts, { name, phone, relationship }];
        setLoading(true);
        try {
            await updateEmergencyContacts(newContacts);
            setContacts(newContacts);
            setName('');
            setPhone('');
            setRelationship('');
            setIsAdding(false);
            Alert.alert('Thành công', 'Đã thêm liên hệ khẩn cấp.');
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể cập nhật liên hệ.');
        } finally {
            setLoading(false);
        }
    };

    const removeContact = async (index: number) => {
        const newContacts = contacts.filter((_, i) => i !== index);
        try {
            await updateEmergencyContacts(newContacts);
            setContacts(newContacts);
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể xóa liên hệ.');
        }
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <IconSymbol name="chevron.left" size={24} color={colors.text} />
                </TouchableOpacity>
                <ThemedText type="subtitle">Liên hệ khẩn cấp</ThemedText>
                <TouchableOpacity onPress={() => setIsAdding(!isAdding)}>
                    <IconSymbol name={isAdding ? 'xmark.circle.fill' : 'plus'} size={24} color={colors.tint} />
                </TouchableOpacity>
            </View>

            <View style={styles.sosBanner}>
                <View style={[styles.sosIcon, { backgroundColor: '#E74C3C' }]}>
                    <IconSymbol name="shield.fill" size={30} color="#FFF" />
                </View>
                <View style={styles.sosTextContainer}>
                    <ThemedText style={styles.sosTitle}>Chia sẻ hành trình</ThemedText>
                    <ThemedText style={styles.sosSub}>Tự động gửi vị trí của bạn cho người thân khi có sự cố.</ThemedText>
                </View>
            </View>

            {isAdding && (
                <View style={styles.addForm}>
                    <ThemedText style={styles.formTitle}>Thêm người thân</ThemedText>
                    <TextInput
                        style={[styles.input, { backgroundColor: 'rgba(142, 142, 147, 0.1)', color: colors.text }]}
                        value={name}
                        onChangeText={setName}
                        placeholder="Họ và tên"
                        placeholderTextColor="#8e8e93"
                    />
                    <TextInput
                        style={[styles.input, { backgroundColor: 'rgba(142, 142, 147, 0.1)', color: colors.text }]}
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="Số điện thoại"
                        placeholderTextColor="#8e8e93"
                        keyboardType="phone-pad"
                    />
                    <TextInput
                        style={[styles.input, { backgroundColor: 'rgba(142, 142, 147, 0.1)', color: colors.text }]}
                        value={relationship}
                        onChangeText={setRelationship}
                        placeholder="Mối quan hệ (VD: Bố, Mẹ, Bạn...)"
                        placeholderTextColor="#8e8e93"
                    />
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: colors.tint }]}
                        onPress={handleAddContact}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#FFF" /> : <ThemedText style={styles.addButtonText}>Xác nhận thêm</ThemedText>}
                    </TouchableOpacity>
                </View>
            )}

            <FlatList
                data={contacts}
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={styles.list}
                renderItem={({ item, index }) => (
                    <View style={styles.contactItem}>
                        <View style={[styles.contactAvatar, { backgroundColor: colors.tint }]}>
                            <ThemedText style={styles.contactInitial}>{item.name[0]}</ThemedText>
                        </View>
                        <View style={styles.contactInfo}>
                            <ThemedText style={styles.contactName}>{item.name}</ThemedText>
                            <ThemedText style={styles.contactPhone}>{item.phone} • {item.relationship}</ThemedText>
                        </View>
                        <TouchableOpacity onPress={() => removeContact(index)}>
                            <IconSymbol name="trash.fill" size={20} color="#E74C3C" />
                        </TouchableOpacity>
                    </View>
                )}
                ListEmptyComponent={
                    !isAdding && (
                        <View style={styles.empty}>
                            <IconSymbol name="person.fill" size={60} color="#8e8e93" />
                            <ThemedText style={styles.emptyText}>Chưa có liên hệ khẩn cấp nào.</ThemedText>
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
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    sosBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        marginHorizontal: 20,
        padding: 20,
        borderRadius: 20,
        marginBottom: 20,
    },
    sosIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sosTextContainer: {
        flex: 1,
        marginLeft: 15,
    },
    sosTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#E74C3C',
    },
    sosSub: {
        fontSize: 12,
        opacity: 0.7,
        marginTop: 2,
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
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(142, 142, 147, 0.05)',
        padding: 15,
        borderRadius: 20,
        marginBottom: 12,
    },
    contactAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactInitial: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 18,
    },
    contactInfo: {
        flex: 1,
        marginLeft: 15,
    },
    contactName: {
        fontSize: 16,
        fontWeight: '600',
    },
    contactPhone: {
        fontSize: 12,
        opacity: 0.5,
        marginTop: 2,
    },
    empty: {
        alignItems: 'center',
        marginTop: 60,
        opacity: 0.5,
    },
    emptyText: {
        marginTop: 15,
        fontSize: 14,
    },
});
