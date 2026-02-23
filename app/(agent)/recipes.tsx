import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { deleteRecipe, getMyRecipes } from '@/services/agent-service';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function AgentRecipesScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const [recipes, setRecipes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecipes();
    }, []);

    const fetchRecipes = async () => {
        try {
            const response = await getMyRecipes();
            if (response.data.success) {
                setRecipes(response.data.recipes);
            }
        } catch (error) {
            console.log('Error fetching recipes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            'Xác nhận',
            'Bạn có chắc chắn muốn xóa món ăn này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await deleteRecipe(id);
                            if (response.data.success) {
                                setRecipes(recipes.filter(r => r._id !== id));
                            }
                        } catch (error) {
                            Alert.alert('Lỗi', 'Không thể xóa món ăn');
                        }
                    }
                }
            ]
        );
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
                data={recipes}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <View style={styles.recipeCard}>
                        <Image source={{ uri: item.image }} style={styles.recipeImage} />
                        <View style={styles.recipeInfo}>
                            <ThemedText style={styles.recipeTitle}>{item.title}</ThemedText>
                            <ThemedText style={styles.recipeCategory}>{item.category}</ThemedText>
                            <ThemedText style={styles.recipePrice}>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.costEstimate)}
                            </ThemedText>
                        </View>
                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={styles.actionBtn}
                                onPress={() => router.push({ pathname: '/(agent)/recipe-form', params: { id: item._id } })}
                            >
                                <IconSymbol name="paperplane.fill" size={20} color={colors.tint} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.actionBtn}
                                onPress={() => handleDelete(item._id)}
                            >
                                <IconSymbol name="trash.fill" size={20} color="#E74C3C" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <IconSymbol name="bag.fill" size={60} color={colors.icon} />
                        <ThemedText style={styles.emptyText}>Cửa hàng chưa có món ăn nào</ThemedText>
                    </View>
                }
            />

            <TouchableOpacity
                style={[styles.addBtn, { backgroundColor: colors.tint }]}
                onPress={() => router.push('/(agent)/recipe-form')}
            >
                <IconSymbol name="plus.slash.minus.equal" size={24} color="#FFF" />
                <ThemedText style={styles.addBtnText}>Thêm món mới</ThemedText>
            </TouchableOpacity>
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
    recipeCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(142, 142, 147, 0.05)',
        borderRadius: 20,
        padding: 12,
        marginBottom: 15,
        alignItems: 'center',
    },
    recipeImage: {
        width: 70,
        height: 70,
        borderRadius: 15,
        marginRight: 15,
    },
    recipeInfo: {
        flex: 1,
    },
    recipeTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    recipeCategory: {
        fontSize: 12,
        color: '#8e8e93',
        marginBottom: 4,
    },
    recipePrice: {
        fontSize: 14,
        color: '#E67E22',
        fontWeight: '700',
    },
    actions: {
        flexDirection: 'row',
        gap: 10,
    },
    actionBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(142, 142, 147, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
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
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
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
});
