import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { createRecipe, getMyRecipes, updateRecipe } from '@/services/agent-service';
import { pickImage, uploadImage } from '@/services/image-upload-service';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function RecipeFormScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        image: '',
        costEstimate: '',
        category: '',
        ingredients: '', // Will be parsed to array
    });

    useEffect(() => {
        if (id) {
            fetchRecipe();
        }
    }, [id]);

    const fetchRecipe = async () => {
        setLoading(true);
        try {
            const response = await getMyRecipes();
            if (response.data.success) {
                const recipe = response.data.recipes.find((r: any) => r._id === id);
                if (recipe) {
                    setForm({
                        title: recipe.title,
                        description: recipe.description,
                        image: recipe.image,
                        costEstimate: String(recipe.costEstimate),
                        category: recipe.category,
                        ingredients: recipe.ingredients.map((i: any) => `${i.name}: ${i.amount}${i.unit}`).join(', '),
                    });
                }
            }
        } catch (error) {
            console.log('Error fetching recipe:', error);
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
        if (!form.title || !form.costEstimate || !form.category) {
            Alert.alert('Lỗi', 'Vui lòng điền các thông tin bắt buộc');
            return;
        }

        setSaving(true);
        try {
            // Parse ingredients: "Tôm: 200g, Rau: 1 bó" -> [{name: "Tôm", amount: "200", unit: "g"}, ...]
            // Simple parsing logic for prototype
            const ingredients = form.ingredients.split(',').map(item => {
                const parts = item.trim().split(':');
                const name = parts[0] || '';
                const rest = parts[1] || '';
                const match = rest.trim().match(/^(\d+)(.*)$/);
                return {
                    name,
                    amount: match ? match[1] : rest.trim(),
                    unit: match ? match[2].trim() : '',
                };
            }).filter(i => i.name !== '');

            const recipeData = {
                title: form.title,
                description: form.description,
                image: form.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop',
                costEstimate: Number(form.costEstimate),
                category: form.category,
                ingredients,
                instructions: ['Nấu món ăn này theo công thức của bạn'], // Default
            };

            const response = id
                ? await updateRecipe(id as string, recipeData)
                : await createRecipe(recipeData);

            if (response.data.success) {
                Alert.alert('Thành công', 'Thông tin món ăn đã được lưu');
                router.back();
            }
        } catch (error: any) {
            Alert.alert('Lỗi', error.response?.data?.message || 'Không thể lưu món ăn');
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
                    <ThemedText style={styles.label}>Tên món ăn *</ThemedText>
                    <TextInput
                        style={[styles.input, { color: colors.text, borderColor: 'rgba(142, 142, 147, 0.2)' }]}
                        value={form.title}
                        onChangeText={(t) => setForm({ ...form, title: t })}
                        placeholder="Nhập tên món ăn..."
                        placeholderTextColor="#8e8e93"
                    />
                </View>

                <View style={styles.formGroup}>
                    <ThemedText style={styles.label}>Mô tả</ThemedText>
                    <TextInput
                        style={[styles.input, styles.textArea, { color: colors.text, borderColor: 'rgba(142, 142, 147, 0.2)' }]}
                        value={form.description}
                        onChangeText={(t) => setForm({ ...form, description: t })}
                        placeholder="Nhập mô tả món ăn..."
                        placeholderTextColor="#8e8e93"
                        multiline
                        numberOfLines={4}
                    />
                </View>

                <View style={styles.formGroup}>
                    <ThemedText style={styles.label}>Ảnh món ăn</ThemedText>
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

                <View style={styles.row}>
                    <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                        <ThemedText style={styles.label}>Giá ước tính *</ThemedText>
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: 'rgba(142, 142, 147, 0.2)' }]}
                            value={form.costEstimate}
                            onChangeText={(t) => setForm({ ...form, costEstimate: t })}
                            placeholder="50000"
                            placeholderTextColor="#8e8e93"
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                        <ThemedText style={styles.label}>Chuyên mục *</ThemedText>
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: 'rgba(142, 142, 147, 0.2)' }]}
                            value={form.category}
                            onChangeText={(t) => setForm({ ...form, category: t })}
                            placeholder="Bữa sáng, Healthy..."
                            placeholderTextColor="#8e8e93"
                        />
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <ThemedText style={styles.label}>Nguyên liệu (Tên: Số lượngĐơn vị, ...)</ThemedText>
                    <TextInput
                        style={[styles.input, { color: colors.text, borderColor: 'rgba(142, 142, 147, 0.2)' }]}
                        value={form.ingredients}
                        onChangeText={(t) => setForm({ ...form, ingredients: t })}
                        placeholder="Tôm: 200g, Cà chua: 1 quả..."
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
                        <ThemedText style={styles.saveBtnText}>{id ? 'Cập nhật món ăn' : 'Thêm món ăn'}</ThemedText>
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
    row: {
        flexDirection: 'row',
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
    textArea: {
        height: 100,
        textAlignVertical: 'top',
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
