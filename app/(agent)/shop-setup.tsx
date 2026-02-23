import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getMyShop, upsertShop } from '@/services/agent-service';
import { pickImage, uploadImage } from '@/services/image-upload-service';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function ShopSetupScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const { user, updateUser } = useAuthStore();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: '',
        image: '',
        address: '',
        categories: '',
    });

    useEffect(() => {
        fetchShop();
    }, []);

    const fetchShop = async () => {
        try {
            const response = await getMyShop();
            if (response.data.success && response.data.shop) {
                const s = response.data.shop;
                setForm({
                    name: s.name,
                    image: s.image,
                    address: s.address,
                    categories: s.categories.join(', '),
                });
            }
        } catch (error) {
            console.log('No shop found or error');
        } finally {
            setLoading(false);
        }
    };

    const handleImagePick = async () => {
        const uri = await pickImage();
        if (uri) {
            setSaving(true);
            const uploadedUrl = await uploadImage(uri);
            if (uploadedUrl) {
                setForm({ ...form, image: uploadedUrl });
            } else {
                Alert.alert('Lỗi', 'Không thể tải ảnh lên. Vui lòng thử lại.');
            }
            setSaving(false);
        }
    };

    const handleSave = async () => {
        if (!form.name || !form.image || !form.address) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin cơ bản');
            return;
        }

        setSaving(true);
        try {
            const shopData = {
                ...form,
                categories: form.categories.split(',').map(c => c.trim()).filter(c => c !== ''),
                location: {
                    type: 'Point' as const,
                    coordinates: [106.7019, 10.7765] as [number, number], // Default to center for now
                }
            };

            const response = await upsertShop(shopData);
            if (response.data.success) {
                Alert.alert('Thành công', 'Thông tin cửa hàng đã được cập nhật');
                // Promote user to agent in store if they weren't
                if (user && user.role !== 'agent') {
                    updateUser({ role: 'agent' });
                }
                router.back();
            }
        } catch (error: any) {
            Alert.alert('Lỗi', error.response?.data?.message || 'Không thể lưu thông tin');
        } finally {
            setSaving(false);
        }
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
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.formGroup}>
                    <ThemedText style={styles.label}>Tên cửa hàng</ThemedText>
                    <TextInput
                        style={[styles.input, { color: colors.text, borderColor: 'rgba(142, 142, 147, 0.2)' }]}
                        value={form.name}
                        onChangeText={(t) => setForm({ ...form, name: t })}
                        placeholder="Nhập tên cửa hàng..."
                        placeholderTextColor="#8e8e93"
                    />
                </View>

                <View style={styles.formGroup}>
                    <ThemedText style={styles.label}>Ảnh đại diện cửa hàng</ThemedText>
                    <TouchableOpacity style={styles.imagePicker} onPress={handleImagePick} disabled={saving}>
                        {form.image ? (
                            <Image source={{ uri: form.image }} style={styles.previewImage} />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <IconSymbol name="camera.fill" size={32} color="#8e8e93" />
                                <ThemedText style={styles.placeholderText}>Chạm để chọn ảnh</ThemedText>
                            </View>
                        )}
                        {saving && (
                            <View style={styles.imageLoadingOverlay}>
                                <ActivityIndicator color="#FFF" />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                    <ThemedText style={styles.label}>Địa chỉ</ThemedText>
                    <TextInput
                        style={[styles.input, { color: colors.text, borderColor: 'rgba(142, 142, 147, 0.2)' }]}
                        value={form.address}
                        onChangeText={(t) => setForm({ ...form, address: t })}
                        placeholder="Số nhà, tên đường, quận..."
                        placeholderTextColor="#8e8e93"
                    />
                </View>

                <View style={styles.formGroup}>
                    <ThemedText style={styles.label}>Chuyên mục (cách nhau bởi dấu phẩy)</ThemedText>
                    <TextInput
                        style={[styles.input, { color: colors.text, borderColor: 'rgba(142, 142, 147, 0.2)' }]}
                        value={form.categories}
                        onChangeText={(t) => setForm({ ...form, categories: t })}
                        placeholder="Bữa sáng, Healthy, Ăn vặt..."
                        placeholderTextColor="#8e8e93"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.saveBtn, { backgroundColor: colors.tint }]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <ThemedText style={styles.saveBtnText}>Lưu thông tin</ThemedText>
                    )}
                </TouchableOpacity>
            </ScrollView>
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
    scrollContent: {
        padding: 20,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#8e8e93',
    },
    input: {
        backgroundColor: 'rgba(142, 142, 147, 0.05)',
        borderRadius: 15,
        padding: 15,
        fontSize: 16,
        borderWidth: 1,
    },
    saveBtn: {
        marginVertical: 30,
        padding: 18,
        borderRadius: 20,
        alignItems: 'center',
    },
    saveBtnText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    imagePicker: {
        width: '100%',
        height: 200,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: 'rgba(142, 142, 147, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(142, 142, 147, 0.2)',
        borderStyle: 'dashed',
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderText: {
        color: '#8e8e93',
        fontSize: 14,
    },
    imageLoadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
