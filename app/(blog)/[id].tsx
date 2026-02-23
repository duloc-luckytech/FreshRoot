import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getBlog, IBlog } from '@/services/blog-service';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function BlogDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const [blog, setBlog] = useState<IBlog | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchBlog();
    }, [id]);

    const fetchBlog = async () => {
        try {
            const response = await getBlog(id as string);
            if (response.data.success) {
                setBlog(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching blog:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.tint} />
            </ThemedView>
        );
    }

    if (!blog) {
        return (
            <ThemedView style={styles.errorContainer}>
                <ThemedText>Không tìm thấy bài viết.</ThemedText>
                <TouchableOpacity onPress={() => router.back()}>
                    <ThemedText style={{ color: colors.tint, marginTop: 10 }}>Quay lại</ThemedText>
                </TouchableOpacity>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.imageContainer}>
                    <Image source={{ uri: blog.image }} style={styles.image} />
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <IconSymbol name="chevron.left" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.contentContainer}>
                    <View style={[styles.categoryBadge, { backgroundColor: colors.tint }]}>
                        <ThemedText style={styles.categoryText}>{blog.category}</ThemedText>
                    </View>

                    <ThemedText type="title" style={styles.title}>{blog.title}</ThemedText>

                    <View style={styles.authorRow}>
                        <Image source={{ uri: blog.author.avatar }} style={styles.avatar} />
                        <View>
                            <ThemedText style={styles.authorName}>{blog.author.name}</ThemedText>
                            <ThemedText style={styles.date}>{new Date(blog.createdAt).toLocaleDateString('vi-VN')}</ThemedText>
                        </View>
                    </View>

                    <ThemedText style={styles.description}>{blog.description}</ThemedText>

                    <View style={styles.divider} />

                    <ThemedText style={styles.content}>{blog.content}</ThemedText>

                    {blog.ingredientInfo && blog.ingredientInfo.length > 0 && (
                        <View style={styles.section}>
                            <ThemedText type="subtitle" style={styles.sectionTitle}>Sàng lọc nguyên liệu</ThemedText>
                            {blog.ingredientInfo.map((info, index) => (
                                <View key={index} style={styles.infoCard}>
                                    <View style={styles.infoRow}>
                                        <ThemedText style={styles.infoName}>{info.name}</ThemedText>
                                        <View style={[
                                            styles.qualityBadge,
                                            { backgroundColor: info.quality === 'Good' ? '#2ECC71' : info.quality === 'Average' ? '#F1C40F' : '#E74C3C' }
                                        ]}>
                                            <ThemedText style={styles.qualityText}>{info.quality}</ThemedText>
                                        </View>
                                    </View>
                                    {info.warning && (
                                        <ThemedText style={styles.infoWarning}>💡 {info.warning}</ThemedText>
                                    )}
                                </View>
                            ))}
                        </View>
                    )}

                    {blog.riskAlerts && blog.riskAlerts.length > 0 && (
                        <View style={[styles.section, styles.riskSection, { backgroundColor: 'rgba(231, 76, 60, 0.1)' }]}>
                            <View style={styles.riskHeader}>
                                <IconSymbol name="exclamationmark.triangle.fill" size={20} color="#E74C3C" />
                                <ThemedText type="subtitle" style={[styles.sectionTitle, { color: '#E74C3C', marginBottom: 0 }]}>Cảnh báo rủi ro</ThemedText>
                            </View>
                            {blog.riskAlerts.map((alert, index) => (
                                <ThemedText key={index} style={styles.riskItem}>• {alert}</ThemedText>
                            ))}
                        </View>
                    )}
                </View>
                <View style={{ height: 40 }} />
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        width: '100%',
        height: 300,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    backBtn: {
        position: 'absolute',
        top: 60,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        padding: 20,
        marginTop: -30,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        backgroundColor: '#FFF', // Will be overridden if needed or use ThemedView properly
    },
    categoryBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        alignSelf: 'flex-start',
        marginBottom: 15,
    },
    categoryText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 24,
        marginBottom: 15,
        fontFamily: Fonts.rounded,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    authorName: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    date: {
        fontSize: 12,
        color: '#8e8e93',
    },
    description: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 22,
        marginBottom: 20,
        opacity: 0.8,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(142,142,147,0.1)',
        marginBottom: 20,
    },
    content: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 30,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        marginBottom: 15,
        fontSize: 18,
    },
    infoCard: {
        backgroundColor: 'rgba(142,142,147,0.05)',
        padding: 15,
        borderRadius: 15,
        marginBottom: 10,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    infoName: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    qualityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    qualityText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    infoWarning: {
        fontSize: 14,
        color: '#8e8e93',
        fontStyle: 'italic',
    },
    riskSection: {
        padding: 20,
        borderRadius: 20,
    },
    riskHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 15,
    },
    riskItem: {
        fontSize: 14,
        color: '#E74C3C',
        marginBottom: 8,
        lineHeight: 20,
    }
});
