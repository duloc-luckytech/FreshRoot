import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getBlogs, IBlog } from '@/services/blog-service';
import { getClips, getRankings, IClip, IRankingUser } from '@/services/community-service';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function CommunityScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const { user } = useAuthStore();

    const [rankings, setRankings] = useState<IRankingUser[]>([]);
    const [clips, setClips] = useState<IClip[]>([]);
    const [blogs, setBlogs] = useState<IBlog[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'rank' | 'clips' | 'blogs'>('rank');

    useEffect(() => {
        fetchCommunityData();
    }, []);

    const fetchCommunityData = async () => {
        setLoading(true);
        try {
            const [rankRes, clipRes, blogRes] = await Promise.all([getRankings(), getClips(), getBlogs()]);
            setRankings(rankRes.data);
            setClips(clipRes.data);
            if (blogRes.data.success) {
                setBlogs(blogRes.data.data);
            }
        } catch (error) {
            console.error('Error fetching community data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText type="title" style={styles.title}>Cộng đồng</ThemedText>
                <ThemedText style={styles.subtitle}>Chia sẻ mẹo nấu ăn & xem bảng xếp hạng</ThemedText>
            </ThemedView>

            <ScrollView showsVerticalScrollIndicator={false}>
                <ThemedView style={styles.tabBar}>
                    <TouchableOpacity
                        style={[activeTab === 'rank' ? styles.activeTab : styles.inactiveTab, { borderBottomColor: colors.tint }]}
                        onPress={() => setActiveTab('rank')}
                    >
                        <ThemedText style={[styles.tabText, activeTab === 'rank' && { color: colors.tint, opacity: 1 }]}>BXH</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[activeTab === 'clips' ? styles.activeTab : styles.inactiveTab, { borderBottomColor: colors.tint }]}
                        onPress={() => setActiveTab('clips')}
                    >
                        <ThemedText style={[styles.tabText, activeTab === 'clips' && { color: colors.tint, opacity: 1 }]}>Clips</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[activeTab === 'blogs' ? styles.activeTab : styles.inactiveTab, { borderBottomColor: colors.tint }]}
                        onPress={() => setActiveTab('blogs')}
                    >
                        <ThemedText style={[styles.tabText, activeTab === 'blogs' && { color: colors.tint, opacity: 1 }]}>Mẹo hay</ThemedText>
                    </TouchableOpacity>
                </ThemedView>

                {loading ? (
                    <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: 40 }} />
                ) : activeTab === 'rank' ? (
                    <>
                        <ThemedView style={[styles.rankCard, { backgroundColor: colorScheme === 'light' ? '#FFF' : '#1C1C1E', borderColor: colors.tabIconDefault }]}>
                            <ThemedText type="defaultSemiBold" style={styles.rankTitle}>Hạng của bạn</ThemedText>
                            <ThemedView style={styles.myRankRow}>
                                <ThemedView style={[styles.rankBadge, { backgroundColor: colors.warning }]}>
                                    <ThemedText style={styles.rankBadgeText}>{user?.rank || 'Sắt V'}</ThemedText>
                                </ThemedView>
                                <ThemedView style={{ flex: 1, marginLeft: 15 }}>
                                    <ThemedText style={{ fontWeight: 'bold', fontSize: 16 }}>{user?.name}</ThemedText>
                                    <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>{user?.points} LP • Top {rankings.findIndex(r => r._id === user?.id) + 1 || '--'}</ThemedText>
                                </ThemedView>
                            </ThemedView>
                        </ThemedView>

                        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Top đầu bếp</ThemedText>
                        {rankings.map((u, index) => (
                            <ThemedView key={u._id} style={styles.leaderboardRow}>
                                <ThemedText style={styles.leaderboardPos}>{index + 1}</ThemedText>
                                <Image source={{ uri: `https://i.pravatar.cc/150?u=${u._id}` }} style={styles.avatar} />
                                <ThemedView style={styles.leaderboardInfo}>
                                    <ThemedText style={styles.userName}>{u.name}</ThemedText>
                                    <ThemedText style={[styles.userRank, { color: colors.tint }]}>{u.rank}</ThemedText>
                                </ThemedView>
                                <ThemedText style={styles.userPoints}>{u.points} LP</ThemedText>
                            </ThemedView>
                        ))}
                    </>
                ) : activeTab === 'clips' ? (
                    <ThemedView style={styles.clipsSection}>
                        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Clip nổi bật</ThemedText>
                        <View style={styles.clipsGrid}>
                            {clips.length > 0 ? (
                                clips.map((clip) => (
                                    <ThemedView key={clip._id} style={[styles.clipCard, { backgroundColor: colorScheme === 'light' ? '#F2F2F7' : '#2C2C2E' }]}>
                                        <IconSymbol name="eye.fill" size={30} color={colors.icon} />
                                        <View style={styles.clipInfo}>
                                            <ThemedText numberOfLines={1} style={styles.clipTitle}>{clip.title}</ThemedText>
                                            <ThemedText style={styles.clipUser}>@{clip.user.name}</ThemedText>
                                        </View>
                                    </ThemedView>
                                ))
                            ) : (
                                <ThemedText style={styles.emptyText}>Chưa có clip nào.</ThemedText>
                            )}
                        </View>
                    </ThemedView>
                ) : (
                    <ThemedView style={styles.blogsSection}>
                        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Mẹo & Kiến thức nấu ăn</ThemedText>
                        {blogs.length > 0 ? (
                            blogs.map((blog) => (
                                <TouchableOpacity
                                    key={blog._id}
                                    style={styles.blogCard}
                                    onPress={() => router.push(`/(blog)/${blog._id}`)}
                                >
                                    <Image source={{ uri: blog.image }} style={styles.blogImage} />
                                    <View style={styles.blogInfo}>
                                        <View style={[styles.blogCategory, { backgroundColor: colors.tint }]}>
                                            <ThemedText style={styles.blogCategoryText}>{blog.category}</ThemedText>
                                        </View>
                                        <ThemedText style={styles.blogTitle}>{blog.title}</ThemedText>
                                        <ThemedText numberOfLines={2} style={styles.blogDesc}>{blog.description}</ThemedText>
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <ThemedText style={styles.emptyText}>Chưa có bài viết nào.</ThemedText>
                        )}
                    </ThemedView>
                )}
                <View style={{ height: 40 }} />
            </ScrollView>

            <TouchableOpacity
                style={[styles.aiFloatingBtn, { backgroundColor: colors.tint }]}
                onPress={() => router.push('/ai-chat')}
            >
                <IconSymbol name="paperplane.fill" size={24} color="#FFF" />
                <ThemedText style={styles.aiBtnText}>Hỏi AI</ThemedText>
            </TouchableOpacity>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontFamily: Fonts.rounded,
        fontSize: 28,
    },
    subtitle: {
        fontSize: 14,
        opacity: 0.7,
    },
    tabBar: {
        flexDirection: 'row',
        marginBottom: 25,
        gap: 30,
    },
    activeTab: {
        paddingBottom: 8,
        borderBottomWidth: 3,
    },
    inactiveTab: {
        paddingBottom: 8,
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    tabText: {
        fontWeight: 'bold',
        fontSize: 16,
        opacity: 0.5,
    },
    rankCard: {
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 30,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    rankTitle: {
        marginBottom: 15,
        fontSize: 12,
        textTransform: 'uppercase',
        opacity: 0.5,
        fontWeight: '700',
    },
    myRankRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rankBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    rankBadgeText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 12,
    },
    sectionTitle: {
        marginBottom: 15,
    },
    leaderboardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(128,128,128,0.1)',
    },
    leaderboardPos: {
        width: 30,
        fontSize: 18,
        fontWeight: 'bold',
        opacity: 0.3,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    leaderboardInfo: {
        flex: 1,
    },
    userName: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    userRank: {
        fontSize: 12,
        fontWeight: '600',
    },
    userPoints: {
        fontWeight: 'bold',
        opacity: 0.7,
    },
    clipsSection: {
        marginTop: 10,
    },
    clipsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
    },
    clipCard: {
        width: '47%',
        height: 220,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    clipInfo: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    clipTitle: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    clipUser: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 10,
    },
    emptyText: {
        textAlign: 'center',
        width: '100%',
        marginTop: 20,
        color: '#8e8e93',
        fontStyle: 'italic',
    },
    blogsSection: {
        marginTop: 10,
    },
    blogCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(142, 142, 147, 0.05)',
        borderRadius: 20,
        padding: 15,
        marginBottom: 15,
        alignItems: 'center',
    },
    blogImage: {
        width: 80,
        height: 80,
        borderRadius: 15,
        marginRight: 15,
    },
    blogInfo: {
        flex: 1,
    },
    blogCategory: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginBottom: 5,
    },
    blogCategoryText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    blogTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    blogDesc: {
        fontSize: 12,
        color: '#8e8e93',
    },
    aiFloatingBtn: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    aiBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    }
});

