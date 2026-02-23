import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol, IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import apiClient from '@/services/api-client';
import { useAuthStore } from '@/store/auth-store';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Modal, Platform, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

// ─── Types & Config ──────────────────────────────────────────
type TabKey = 'overview' | 'orders' | 'users' | 'shops' | 'products' | 'content';

const TABS: { key: TabKey; label: string; icon: IconSymbolName }[] = [
    { key: 'overview', label: 'Tổng quan', icon: 'chart.bar.fill' },
    { key: 'orders', label: 'Đơn hàng', icon: 'bag.fill' },
    { key: 'users', label: 'Khách hàng', icon: 'person.fill' },
    { key: 'shops', label: 'Cửa hàng', icon: 'house.fill' },
    { key: 'products', label: 'Sản phẩm', icon: 'fork.knife' },
    { key: 'content', label: 'Nội dung', icon: 'list.bullet' },
];

const ORDER_STATUSES = ['pending', 'paid', 'shipping', 'completed', 'cancelled'] as const;
const STATUS_COLORS: Record<string, string> = {
    pending: '#F39C12', paid: '#3498DB', shipping: '#9B59B6',
    completed: '#2ECC71', cancelled: '#E74C3C',
    success: '#2ECC71', failed: '#E74C3C',
};
const ROLE_COLORS: Record<string, string> = { admin: '#9B59B6', agent: '#3498DB', user: '#8e8e93' };
const PAGE_SIZE = 10;
const CONTENT_SECTIONS = ['blogs', 'deals', 'vouchers', 'banners', 'clips'] as const;

// ─── Reusable Components ─────────────────────────────────────
const SearchBar = ({ value, onChangeText, placeholder, colors }: { value: string; onChangeText: (t: string) => void; placeholder: string; colors: any }) => (
    <View style={[st.searchBar, { backgroundColor: colors.background, borderColor: 'rgba(142,142,147,0.2)' }]}>
        <IconSymbol name="magnifyingglass" size={16} color="#8e8e93" />
        <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#8e8e93"
            style={[st.searchInput, { color: colors.text }]}
            autoCapitalize="none"
            clearButtonMode="while-editing"
        />
    </View>
);

const FilterChips = ({ filters, active, onSelect, tint }: { filters: string[]; active: string; onSelect: (f: string) => void; tint: string }) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.filterRow} contentContainerStyle={{ gap: 6 }}>
        {filters.map(f => (
            <TouchableOpacity key={f} style={[st.filterChip, active === f && { backgroundColor: tint, borderColor: tint }]} onPress={() => onSelect(f)}>
                <ThemedText style={[st.filterText, active === f && { color: '#FFF' }]}>{f}</ThemedText>
            </TouchableOpacity>
        ))}
    </ScrollView>
);

const Pagination = ({ current, total, onPage, tint }: { current: number; total: number; onPage: (p: number) => void; tint: string }) => {
    if (total <= 1) return null;
    const pages = Array.from({ length: total }, (_, i) => i + 1);
    const visible = pages.filter(p => p === 1 || p === total || Math.abs(p - current) <= 2);
    return (
        <View style={st.pagination}>
            <TouchableOpacity disabled={current === 1} onPress={() => onPage(current - 1)} style={[st.pageBtn, current === 1 && { opacity: 0.3 }]}>
                <ThemedText style={st.pageBtnText}>‹</ThemedText>
            </TouchableOpacity>
            {visible.map((p, i) => {
                const prev = visible[i - 1];
                const showEllipsis = prev && p - prev > 1;
                return (
                    <React.Fragment key={p}>
                        {showEllipsis && <ThemedText style={st.pageEllipsis}>…</ThemedText>}
                        <TouchableOpacity style={[st.pageBtn, p === current && { backgroundColor: tint }]} onPress={() => onPage(p)}>
                            <ThemedText style={[st.pageBtnText, p === current && { color: '#FFF' }]}>{p}</ThemedText>
                        </TouchableOpacity>
                    </React.Fragment>
                );
            })}
            <TouchableOpacity disabled={current === total} onPress={() => onPage(current + 1)} style={[st.pageBtn, current === total && { opacity: 0.3 }]}>
                <ThemedText style={st.pageBtnText}>›</ThemedText>
            </TouchableOpacity>
            <ThemedText style={st.pageInfo}>{current}/{total}</ThemedText>
        </View>
    );
};

const StatusBadge = ({ status }: { status: string }) => (
    <View style={[st.statusBadge, { backgroundColor: (STATUS_COLORS[status] || '#8e8e93') + '20' }]}>
        <View style={[st.statusDot, { backgroundColor: STATUS_COLORS[status] || '#8e8e93' }]} />
        <ThemedText style={[st.statusText, { color: STATUS_COLORS[status] || '#8e8e93' }]}>{status.toUpperCase()}</ThemedText>
    </View>
);

// ─── Main Component ──────────────────────────────────────────
export default function CmsDashboard() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const { logout } = useAuthStore();
    const cardBg = colorScheme === 'dark' ? '#1c1c1e' : '#F8F9FA';
    const tint = colors.tint;

    const [activeTab, setActiveTab] = useState<TabKey>('overview');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Search & Filter state
    const [search, setSearch] = useState('');
    const [orderFilter, setOrderFilter] = useState('Tất cả');
    const [userFilter, setUserFilter] = useState('Tất cả');
    const [shopFilter, setShopFilter] = useState('Tất cả');
    const [contentSection, setContentSection] = useState<typeof CONTENT_SECTIONS[number]>('blogs');

    // Pagination state
    const [pages, setPages] = useState<Record<string, number>>({ orders: 1, users: 1, shops: 1, products: 1, blogs: 1, deals: 1, vouchers: 1, banners: 1, clips: 1 });

    // Data
    const [stats, setStats] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [shops, setShops] = useState<any[]>([]);
    const [recipes, setRecipes] = useState<any[]>([]);
    const [blogs, setBlogs] = useState<any[]>([]);
    const [deals, setDeals] = useState<any[]>([]);
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [banners, setBanners] = useState<any[]>([]);
    const [clips, setClips] = useState<any[]>([]);

    // Add Shop Modal State
    const [isAddShopVisible, setIsAddShopVisible] = useState(false);
    const [newShop, setNewShop] = useState({
        name: '',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop', // default placeholder
        address: '',
        lng: '',
        lat: '',
        categories: '',
        ownerId: '',
        ownerName: '' // For display
    });
    const [userSearchText, setUserSearchText] = useState('');

    useEffect(() => { fetchAll(); }, []);
    // Reset search & page when switching tabs
    useEffect(() => { setSearch(''); }, [activeTab]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [statsR, ordersR, usersR, shopsR, recipesR, blogsR, dealsR, vouchersR, bannersR, clipsR] = await Promise.all([
                apiClient.get('/admin/stats'), apiClient.get('/admin/orders'), apiClient.get('/admin/users'),
                apiClient.get('/admin/shops'), apiClient.get('/admin/recipes'), apiClient.get('/admin/blogs'),
                apiClient.get('/admin/deals'), apiClient.get('/admin/vouchers'), apiClient.get('/admin/banners'),
                apiClient.get('/admin/clips'),
            ]);
            setStats(statsR.data.data);
            setOrders(ordersR.data.data || []);
            setUsers(usersR.data.data || []);
            setShops(shopsR.data.data || []);
            setRecipes(recipesR.data.data || []);
            setBlogs(blogsR.data.data || []);
            setDeals(dealsR.data.data || []);
            setVouchers(vouchersR.data.data || []);
            setBanners(bannersR.data.data || []);
            setClips(clipsR.data.data || []);
        } catch (e) { console.error('CMS fetch:', e); }
        finally { setLoading(false); }
    };

    const onRefresh = React.useCallback(() => { setRefreshing(true); fetchAll().then(() => setRefreshing(false)); }, []);
    const fmt = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
    const fmtDate = (d: string) => new Date(d).toLocaleDateString('vi-VN');
    const setPage = (key: string, p: number) => setPages(prev => ({ ...prev, [key]: p }));

    // ─── Filtered + Paginated Data ───────────────
    const filteredOrders = useMemo(() => {
        let d = orders;
        if (orderFilter !== 'Tất cả') d = d.filter(o => o.status === orderFilter);
        if (search) { const q = search.toLowerCase(); d = d.filter(o => o._id?.includes(q) || o.userId?.name?.toLowerCase().includes(q) || o.shopId?.name?.toLowerCase().includes(q)); }
        return d;
    }, [orders, orderFilter, search]);

    const filteredUsers = useMemo(() => {
        let d = users;
        if (userFilter !== 'Tất cả') d = d.filter(u => u.role === userFilter.toLowerCase());
        if (search) { const q = search.toLowerCase(); d = d.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)); }
        return d;
    }, [users, userFilter, search]);

    const filteredShops = useMemo(() => {
        let d = shops;
        if (shopFilter === 'Chờ duyệt') d = d.filter(s => !s.isVerified);
        else if (shopFilter === 'Hoạt động') d = d.filter(s => s.isVerified);
        else if (shopFilter === 'Nổi bật') d = d.filter(s => s.isFeatured);
        if (search) { const q = search.toLowerCase(); d = d.filter(s => s.name?.toLowerCase().includes(q) || s.address?.toLowerCase().includes(q)); }
        return d;
    }, [shops, shopFilter, search]);

    const filteredRecipes = useMemo(() => {
        let d = recipes;
        if (search) { const q = search.toLowerCase(); d = d.filter(r => r.title?.toLowerCase().includes(q) || r.category?.toLowerCase().includes(q)); }
        return d;
    }, [recipes, search]);

    const filteredContent = useMemo(() => {
        const src: Record<string, any[]> = { blogs, deals, vouchers, banners, clips };
        let d = src[contentSection] || [];
        if (search) {
            const q = search.toLowerCase();
            d = d.filter(item => item.title?.toLowerCase().includes(q) || item.name?.toLowerCase().includes(q) || item.code?.toLowerCase().includes(q));
        }
        return d;
    }, [contentSection, blogs, deals, vouchers, banners, clips, search]);

    const paginate = <T,>(data: T[], key: string): { items: T[]; totalPages: number; currentPage: number } => {
        const total = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
        const current = Math.min(pages[key] || 1, total);
        return { items: data.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE), totalPages: total, currentPage: current };
    };

    // ─── Actions ─────────────────────────────────
    const updateOrderStatus = async (id: string, status: string) => {
        try { await apiClient.put(`/admin/orders/${id}/status`, { status }); Alert.alert('✅', `Trạng thái → ${status}`); fetchAll(); }
        catch { Alert.alert('Lỗi', 'Không thể cập nhật'); }
    };
    const changeUserRole = async (id: string, role: string) => {
        try { await apiClient.put(`/admin/users/${id}/role`, { role }); Alert.alert('✅', `Vai trò → ${role}`); fetchAll(); }
        catch { Alert.alert('Lỗi', 'Không thể đổi vai trò'); }
    };
    const approveShop = async (id: string) => {
        try { await apiClient.put(`/admin/shops/${id}`, { isVerified: true }); Alert.alert('✅', 'Đã duyệt'); fetchAll(); }
        catch { Alert.alert('Lỗi', 'Không thể duyệt'); }
    };
    const toggleFeatureShop = async (id: string, cur: boolean) => {
        try { await apiClient.put(`/admin/shops/${id}`, { isFeatured: !cur }); fetchAll(); }
        catch { Alert.alert('Lỗi', 'Không thể cập nhật'); }
    };
    const deleteEntity = (type: string, id: string, label: string) => {
        Alert.alert('Xác nhận', `Xóa "${label}"?`, [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Xóa', style: 'destructive', onPress: async () => { try { await apiClient.delete(`/admin/${type}/${id}`); fetchAll(); } catch { Alert.alert('Lỗi', 'Không thể xóa'); } } }
        ]);
    };
    const toggleVoucher = async (id: string) => { try { await apiClient.put(`/admin/vouchers/${id}/toggle`); fetchAll(); } catch { } };
    const toggleBanner = async (id: string) => { try { await apiClient.put(`/admin/banners/${id}/toggle`); fetchAll(); } catch { } };

    const handleCreateShop = async () => {
        if (!newShop.name || !newShop.address || !newShop.ownerId) {
            Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên, địa chỉ và chọn chủ shop');
            return;
        }

        try {
            const shopData = {
                name: newShop.name,
                image: newShop.image,
                address: newShop.address,
                location: {
                    type: 'Point',
                    coordinates: [Number(newShop.lng) || 106.660172, Number(newShop.lat) || 10.762622]
                },
                ownerId: newShop.ownerId,
                categories: newShop.categories.split(',').map(c => c.trim()).filter(c => c),
                isVerified: true
            };

            await apiClient.post('/admin/shops', shopData);
            Alert.alert('Thành công', 'Đã thêm cửa hàng mới');
            setIsAddShopVisible(false);
            setNewShop({
                name: '',
                image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop',
                address: '',
                lng: '',
                lat: '',
                categories: '',
                ownerId: '',
                ownerName: ''
            });
            fetchAll();
        } catch (error: any) {
            Alert.alert('Lỗi', error.response?.data?.message || 'Không thể tạo cửa hàng');
        }
    };

    const searchUsers = useMemo(() => {
        if (!userSearchText) return [];
        const q = userSearchText.toLowerCase();
        return users.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)).slice(0, 5);
    }, [users, userSearchText]);

    // ─── Render Helpers ──────────────────────────
    const StatCard = ({ icon, label, value, color }: { icon: IconSymbolName; label: string; value: string | number; color: string }) => (
        <View style={[st.statCard, { backgroundColor: cardBg }]}>
            <View style={[st.statIconWrap, { backgroundColor: color + '15' }]}>
                <IconSymbol name={icon} size={20} color={color} />
            </View>
            <ThemedText style={st.statLabel}>{label}</ThemedText>
            <ThemedText style={[st.statValue, { color }]}>{value}</ThemedText>
        </View>
    );

    const SectionHeader = ({ title, count }: { title: string; count?: number }) => (
        <View style={st.sectionHeader}>
            <ThemedText type="subtitle" style={st.sectionTitle}>{title}</ThemedText>
            {count !== undefined && <View style={st.countBadge}><ThemedText style={st.countText}>{count}</ThemedText></View>}
        </View>
    );

    if (loading && !refreshing) return <ThemedView style={[st.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color={tint} /></ThemedView>;

    return (
        <ThemedView style={st.container}>
            {/* Header */}
            <View style={[st.header, { backgroundColor: tint }]}>
                <View>
                    <ThemedText style={st.headerTitle}>Admin CMS</ThemedText>
                    <ThemedText style={st.headerSub}>QUẢN LÝ HỆ THỐNG FRESHROOT</ThemedText>
                </View>
                <TouchableOpacity onPress={logout} style={st.logoutBtn}>
                    <IconSymbol name="power" size={18} color="#FFF" />
                </TouchableOpacity>
            </View>

            {/* Tab Bar */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.tabBar} contentContainerStyle={st.tabBarContent}>
                {TABS.map(tab => (
                    <TouchableOpacity key={tab.key} style={[st.tab, activeTab === tab.key && { backgroundColor: tint + '15', borderColor: tint }]} onPress={() => setActiveTab(tab.key)}>
                        <IconSymbol name={tab.icon} size={16} color={activeTab === tab.key ? tint : '#8e8e93'} />
                        <ThemedText style={[st.tabLabel, activeTab === tab.key && { color: tint, fontWeight: '700' }]}>{tab.label}</ThemedText>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Content */}
            <ScrollView style={st.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                <Animated.View entering={FadeInDown.duration(300)} key={activeTab}>

                    {/* ══════════════ OVERVIEW ══════════════ */}
                    {activeTab === 'overview' && stats && (
                        <>
                            <View style={st.statsRow}>
                                <StatCard icon="chart.bar.fill" label="Tổng doanh thu" value={fmt(stats.totalRevenue)} color={tint} />
                                <StatCard icon="bag.fill" label="Đơn hàng" value={stats.orderCount} color="#3498DB" />
                            </View>
                            <View style={st.statsRow}>
                                <StatCard icon="person.fill" label="Người dùng" value={stats.userCount} color="#9B59B6" />
                                <StatCard icon="house.fill" label="Cửa hàng" value={stats.shopCount} color="#E67E22" />
                            </View>
                            <View style={[st.summaryCard, { backgroundColor: cardBg }]}>
                                <ThemedText style={st.summaryTitle}>Chi tiết hệ thống</ThemedText>
                                {[
                                    ['Shop hoạt động', stats.activeShops, '#2ECC71'], ['Shop chờ duyệt', stats.pendingShops, '#F39C12'],
                                    ['Đơn chờ xử lý', stats.pendingOrders, '#F39C12'], ['Đơn hoàn thành', stats.completedOrders, '#2ECC71'],
                                    ['Sản phẩm', stats.recipeCount, '#3498DB'], ['Blog', stats.blogCount, '#9B59B6'],
                                    ['Ưu đãi', stats.dealCount, '#E67E22'], ['Voucher', stats.voucherCount, '#1ABC9C'],
                                    ['Banner', stats.bannerCount, '#E74C3C'], ['Clip', stats.clipCount, '#3498DB'],
                                ].map(([label, val, color], i) => (
                                    <View key={i} style={st.summaryRow}>
                                        <ThemedText style={st.summaryLabel}>{label as string}</ThemedText>
                                        <ThemedText style={[st.summaryVal, { color: color as string }]}>{val as number}</ThemedText>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}

                    {/* ══════════════ ORDERS ══════════════ */}
                    {activeTab === 'orders' && (() => {
                        const pg = paginate(filteredOrders, 'orders');
                        return (
                            <>
                                <SearchBar value={search} onChangeText={setSearch} placeholder="Tìm mã đơn, khách hàng, shop..." colors={colors} />
                                <FilterChips filters={['Tất cả', ...ORDER_STATUSES]} active={orderFilter} onSelect={setOrderFilter} tint={tint} />
                                <SectionHeader title="Đơn hàng" count={filteredOrders.length} />
                                {pg.items.map(order => (
                                    <View key={order._id} style={[st.card, { backgroundColor: cardBg }]}>
                                        <View style={st.cardHeader}>
                                            <ThemedText style={st.cardTitle}>#{order._id?.slice(-6)}</ThemedText>
                                            <StatusBadge status={order.status} />
                                        </View>
                                        <View style={st.cardBody}>
                                            <ThemedText style={st.cardSub}>👤 {order.userId?.name || 'N/A'}</ThemedText>
                                            <ThemedText style={st.cardSub}>🏪 {order.shopId?.name || 'N/A'}</ThemedText>
                                            <ThemedText style={st.cardSub}>💰 {fmt(order.totalAmount)} • {order.paymentMethod?.toUpperCase()}</ThemedText>
                                            <ThemedText style={st.cardSub}>📅 {fmtDate(order.createdAt)} • 🧾 {order.items?.length || 0} sản phẩm</ThemedText>
                                        </View>
                                        <View style={st.cardActions}>
                                            <ThemedText style={st.actionLabel}>Chuyển trạng thái:</ThemedText>
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                {ORDER_STATUSES.map(s => (
                                                    <TouchableOpacity key={s} style={[st.miniBtn, { backgroundColor: s === order.status ? STATUS_COLORS[s] : '#e0e0e0' }]} onPress={() => updateOrderStatus(order._id, s)} disabled={s === order.status}>
                                                        <ThemedText style={[st.miniBtnText, { color: s === order.status ? '#FFF' : '#333' }]}>{s}</ThemedText>
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    </View>
                                ))}
                                <Pagination current={pg.currentPage} total={pg.totalPages} onPage={(p) => setPage('orders', p)} tint={tint} />
                            </>
                        );
                    })()}

                    {/* ══════════════ USERS ══════════════ */}
                    {activeTab === 'users' && (() => {
                        const pg = paginate(filteredUsers, 'users');
                        return (
                            <>
                                <SearchBar value={search} onChangeText={setSearch} placeholder="Tìm tên, email..." colors={colors} />
                                <FilterChips filters={['Tất cả', 'User', 'Agent', 'Admin']} active={userFilter} onSelect={setUserFilter} tint={tint} />
                                <SectionHeader title="Người dùng" count={filteredUsers.length} />
                                {pg.items.map(u => (
                                    <View key={u._id} style={[st.card, { backgroundColor: cardBg }]}>
                                        <View style={st.userRow}>
                                            <Image source={{ uri: u.avatar || 'https://i.pravatar.cc/150' }} style={st.avatar} />
                                            <View style={{ flex: 1 }}>
                                                <ThemedText style={st.cardTitle}>{u.name}</ThemedText>
                                                <ThemedText style={st.cardSub}>{u.email}</ThemedText>
                                                <ThemedText style={st.cardSub}>🏆 {u.rank || 'N/A'} • ⭐ {u.points || 0} điểm</ThemedText>
                                            </View>
                                            <View style={[st.roleBadge, { backgroundColor: ROLE_COLORS[u.role] || '#8e8e93' }]}>
                                                <ThemedText style={st.roleText}>{u.role}</ThemedText>
                                            </View>
                                        </View>
                                        <View style={st.cardActions}>
                                            <ThemedText style={st.actionLabel}>Đổi vai trò:</ThemedText>
                                            <View style={st.actionRow}>
                                                {['user', 'agent', 'admin'].map(r => (
                                                    <TouchableOpacity key={r} style={[st.miniBtn, { backgroundColor: r === u.role ? ROLE_COLORS[r] : '#e0e0e0' }]} onPress={() => changeUserRole(u._id, r)} disabled={r === u.role}>
                                                        <ThemedText style={[st.miniBtnText, { color: r === u.role ? '#FFF' : '#333' }]}>{r}</ThemedText>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>
                                    </View>
                                ))}
                                <Pagination current={pg.currentPage} total={pg.totalPages} onPage={(p) => setPage('users', p)} tint={tint} />
                            </>
                        );
                    })()}

                    {/* ══════════════ SHOPS ══════════════ */}
                    {activeTab === 'shops' && (() => {
                        const pg = paginate(filteredShops, 'shops');
                        return (
                            <>
                                <SearchBar value={search} onChangeText={setSearch} placeholder="Tìm tên shop, địa chỉ..." colors={colors} />
                                <FilterChips filters={['Tất cả', 'Chờ duyệt', 'Hoạt động', 'Nổi bật']} active={shopFilter} onSelect={setShopFilter} tint={tint} />
                                <TouchableOpacity style={[st.actionBtn, { backgroundColor: tint, marginBottom: 15, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6 }]} onPress={() => setIsAddShopVisible(true)}>
                                    <IconSymbol name="plus" size={16} color="#FFF" />
                                    <ThemedText style={st.actionBtnText}>Thêm Cửa Hàng</ThemedText>
                                </TouchableOpacity>
                                <SectionHeader title="Cửa hàng" count={filteredShops.length} />
                                {pg.items.map(shop => (
                                    <View key={shop._id} style={[st.card, { backgroundColor: cardBg, borderLeftWidth: !shop.isVerified ? 4 : 0, borderLeftColor: '#F39C12' }]}>
                                        <View style={st.cardHeader}>
                                            <ThemedText style={[st.cardTitle, { flex: 1 }]}>{shop.name}</ThemedText>
                                            {shop.isFeatured && <View style={[st.statusBadge, { backgroundColor: '#F39C1220' }]}><ThemedText style={{ color: '#F39C12', fontSize: 10, fontWeight: 'bold' }}>⭐ NỔI BẬT</ThemedText></View>}
                                            {!shop.isVerified && <View style={[st.statusBadge, { backgroundColor: '#F39C1220' }]}><ThemedText style={{ color: '#F39C12', fontSize: 10, fontWeight: 'bold' }}>CHỜ DUYỆT</ThemedText></View>}
                                        </View>
                                        <ThemedText style={st.cardSub}>📍 {shop.address}</ThemedText>
                                        <ThemedText style={st.cardSub}>⭐ {shop.rating} • 👤 {shop.ownerId?.name || 'N/A'}</ThemedText>
                                        <View style={st.actionRow}>
                                            {!shop.isVerified && (
                                                <TouchableOpacity style={[st.actionBtn, { backgroundColor: tint }]} onPress={() => approveShop(shop._id)}>
                                                    <ThemedText style={st.actionBtnText}>✅ Duyệt</ThemedText>
                                                </TouchableOpacity>
                                            )}
                                            <TouchableOpacity style={[st.actionBtn, { backgroundColor: shop.isFeatured ? '#8e8e93' : '#F39C12' }]} onPress={() => toggleFeatureShop(shop._id, shop.isFeatured)}>
                                                <ThemedText style={st.actionBtnText}>{shop.isFeatured ? 'Bỏ nổi bật' : '⭐ Nổi bật'}</ThemedText>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={[st.actionBtn, { backgroundColor: '#E74C3C' }]} onPress={() => deleteEntity('shops', shop._id, shop.name)}>
                                                <ThemedText style={st.actionBtnText}>🗑 Xóa</ThemedText>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                                <Pagination current={pg.currentPage} total={pg.totalPages} onPage={(p) => setPage('shops', p)} tint={tint} />
                            </>
                        );
                    })()}

                    {/* ══════════════ PRODUCTS ══════════════ */}
                    {activeTab === 'products' && (() => {
                        const pg = paginate(filteredRecipes, 'products');
                        return (
                            <>
                                <SearchBar value={search} onChangeText={setSearch} placeholder="Tìm tên, danh mục sản phẩm..." colors={colors} />
                                <SectionHeader title="Sản phẩm" count={filteredRecipes.length} />
                                {pg.items.map(r => (
                                    <View key={r._id} style={[st.card, { backgroundColor: cardBg }]}>
                                        <View style={st.cardHeader}>
                                            <View style={{ flex: 1 }}>
                                                <ThemedText style={st.cardTitle}>{r.title}</ThemedText>
                                                <ThemedText style={st.cardSub}>📂 {r.category} • 🏪 {r.shopId?.name || 'N/A'}</ThemedText>
                                                {r.costEstimate && <ThemedText style={st.cardSub}>💰 {fmt(r.costEstimate)}</ThemedText>}
                                            </View>
                                            {r.image && <Image source={{ uri: r.image }} style={st.thumbImg} />}
                                        </View>
                                        <View style={st.actionRow}>
                                            <TouchableOpacity style={[st.actionBtn, { backgroundColor: '#E74C3C' }]} onPress={() => deleteEntity('recipes', r._id, r.title)}>
                                                <ThemedText style={st.actionBtnText}>🗑 Xóa</ThemedText>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                                <Pagination current={pg.currentPage} total={pg.totalPages} onPage={(p) => setPage('products', p)} tint={tint} />
                            </>
                        );
                    })()}

                    {/* ══════════════ CONTENT ══════════════ */}
                    {activeTab === 'content' && (() => {
                        const pg = paginate(filteredContent, contentSection);
                        return (
                            <>
                                <SearchBar value={search} onChangeText={setSearch} placeholder="Tìm nội dung..." colors={colors} />
                                <FilterChips filters={['blogs', 'deals', 'vouchers', 'banners', 'clips']} active={contentSection} onSelect={(f) => { setContentSection(f as any); setPage(f, 1); }} tint={tint} />
                                <SectionHeader title={contentSection.charAt(0).toUpperCase() + contentSection.slice(1)} count={filteredContent.length} />

                                {pg.items.map((item: any) => (
                                    <View key={item._id} style={[st.card, { backgroundColor: cardBg }]}>
                                        {contentSection === 'blogs' && (
                                            <>
                                                <ThemedText style={st.cardTitle}>{item.title}</ThemedText>
                                                <ThemedText style={st.cardSub}>📂 {item.category} • ✍️ {item.author?.name || 'N/A'}</ThemedText>
                                            </>
                                        )}
                                        {contentSection === 'deals' && (
                                            <>
                                                <ThemedText style={st.cardTitle}>{item.title}</ThemedText>
                                                <ThemedText style={st.cardSub}>🏪 {item.shopName} • 🏷 {item.tag} • 💸 {item.discountPercentage || 0}%</ThemedText>
                                            </>
                                        )}
                                        {contentSection === 'vouchers' && (
                                            <>
                                                <View style={st.cardHeader}>
                                                    <View style={{ flex: 1 }}>
                                                        <ThemedText style={st.cardTitle}>{item.code}</ThemedText>
                                                        <ThemedText style={st.cardSub}>💸 {item.discountType === 'percentage' ? `${item.discountAmount}%` : fmt(item.discountAmount)} • Min: {fmt(item.minOrderAmount)}</ThemedText>
                                                        <ThemedText style={st.cardSub}>📅 HSD: {fmtDate(item.expiryDate)}</ThemedText>
                                                    </View>
                                                    <StatusBadge status={item.isActive ? 'completed' : 'cancelled'} />
                                                </View>
                                            </>
                                        )}
                                        {contentSection === 'banners' && (
                                            <>
                                                <View style={st.cardHeader}>
                                                    <ThemedText style={[st.cardTitle, { flex: 1 }]}>{item.title}</ThemedText>
                                                    <StatusBadge status={item.active ? 'completed' : 'cancelled'} />
                                                </View>
                                                {item.image && <Image source={{ uri: item.image }} style={st.bannerImg} />}
                                            </>
                                        )}
                                        {contentSection === 'clips' && (
                                            <>
                                                <ThemedText style={st.cardTitle}>{item.title}</ThemedText>
                                                <ThemedText style={st.cardSub}>👤 {item.user?.name || 'N/A'} • ❤️ {item.likes} • 💬 {item.comments?.length || 0}</ThemedText>
                                            </>
                                        )}
                                        <View style={st.actionRow}>
                                            {contentSection === 'vouchers' && (
                                                <TouchableOpacity style={[st.actionBtn, { backgroundColor: item.isActive ? '#8e8e93' : '#2ECC71' }]} onPress={() => toggleVoucher(item._id)}>
                                                    <ThemedText style={st.actionBtnText}>{item.isActive ? '⏸ Tạm dừng' : '▶️ Kích hoạt'}</ThemedText>
                                                </TouchableOpacity>
                                            )}
                                            {contentSection === 'banners' && (
                                                <TouchableOpacity style={[st.actionBtn, { backgroundColor: item.active ? '#8e8e93' : '#2ECC71' }]} onPress={() => toggleBanner(item._id)}>
                                                    <ThemedText style={st.actionBtnText}>{item.active ? '⏸ Ẩn' : '▶️ Hiện'}</ThemedText>
                                                </TouchableOpacity>
                                            )}
                                            <TouchableOpacity style={[st.actionBtn, { backgroundColor: '#E74C3C' }]} onPress={() => deleteEntity(contentSection, item._id, item.title || item.code)}>
                                                <ThemedText style={st.actionBtnText}>🗑 Xóa</ThemedText>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                                <Pagination current={pg.currentPage} total={pg.totalPages} onPage={(p) => setPage(contentSection, p)} tint={tint} />
                            </>
                        );
                    })()}

                </Animated.View>
                <View style={{ height: 120 }} />
            </ScrollView>
            {renderAddShopModal()}
        </ThemedView>
    );

    function renderAddShopModal() {
        return (
            <Modal visible={isAddShopVisible} animationType="slide" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <View style={st.modalOverlay}>
                        <View style={[st.modalContent, { backgroundColor: colors.background }]}>
                            <View style={st.modalHeader}>
                                <ThemedText type="subtitle">Thêm mới Cửa hàng</ThemedText>
                                <TouchableOpacity onPress={() => setIsAddShopVisible(false)}>
                                    <IconSymbol name="xmark.circle.fill" size={20} color="#8e8e93" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={st.modalBody} showsVerticalScrollIndicator={false}>
                                <View style={st.inputGroup}>
                                    <ThemedText style={st.inputLabel}>Tên cửa hàng *</ThemedText>
                                    <TextInput style={[st.input, { color: colors.text, borderColor: 'rgba(142,142,147,0.2)' }]} value={newShop.name} onChangeText={t => setNewShop({ ...newShop, name: t })} placeholder="Ví dụ: Fresh Food Deli" placeholderTextColor="#8e8e93" />
                                </View>

                                <View style={st.inputGroup}>
                                    <ThemedText style={st.inputLabel}>Địa chỉ *</ThemedText>
                                    <TextInput style={[st.input, { color: colors.text, borderColor: 'rgba(142,142,147,0.2)' }]} value={newShop.address} onChangeText={t => setNewShop({ ...newShop, address: t })} placeholder="Ví dụ: 123 Lê Lợi, Q.1" placeholderTextColor="#8e8e93" />
                                </View>

                                <View style={st.row}>
                                    <View style={[st.inputGroup, { flex: 1 }]}>
                                        <ThemedText style={st.inputLabel}>Kinh độ (Lng)</ThemedText>
                                        <TextInput style={[st.input, { color: colors.text, borderColor: 'rgba(142,142,147,0.2)' }]} value={newShop.lng} onChangeText={t => setNewShop({ ...newShop, lng: t })} placeholder="106.66..." keyboardType="numeric" />
                                    </View>
                                    <View style={[st.inputGroup, { flex: 1, marginLeft: 10 }]}>
                                        <ThemedText style={st.inputLabel}>Vĩ độ (Lat)</ThemedText>
                                        <TextInput style={[st.input, { color: colors.text, borderColor: 'rgba(142,142,147,0.2)' }]} value={newShop.lat} onChangeText={t => setNewShop({ ...newShop, lat: t })} placeholder="10.76..." keyboardType="numeric" />
                                    </View>
                                </View>

                                <View style={st.inputGroup}>
                                    <ThemedText style={st.inputLabel}>URL Hình ảnh</ThemedText>
                                    <TextInput style={[st.input, { color: colors.text, borderColor: 'rgba(142,142,147,0.2)' }]} value={newShop.image} onChangeText={t => setNewShop({ ...newShop, image: t })} />
                                </View>

                                <View style={st.inputGroup}>
                                    <ThemedText style={st.inputLabel}>Danh mục (cách nhau bằng dấu phẩy)</ThemedText>
                                    <TextInput style={[st.input, { color: colors.text, borderColor: 'rgba(142,142,147,0.2)' }]} value={newShop.categories} onChangeText={t => setNewShop({ ...newShop, categories: t })} placeholder="Organic, Meat, Fruit" />
                                </View>

                                <View style={st.inputGroup}>
                                    <ThemedText style={st.inputLabel}>Chủ sở hữu (Tìm theo tên/email) *</ThemedText>
                                    <View style={[st.searchBar, { marginBottom: 5 }]}>
                                        <TextInput style={[st.searchInput, { color: colors.text }]} placeholder="Tìm người dùng..." value={userSearchText} onChangeText={setUserSearchText} />
                                    </View>
                                    {newShop.ownerName ? (
                                        <View style={st.selectedOwner}>
                                            <ThemedText style={{ color: tint, fontWeight: 'bold' }}>📍 Đã chọn: {newShop.ownerName}</ThemedText>
                                        </View>
                                    ) : null}
                                    {searchUsers.length > 0 && (
                                        <View style={st.userSearchResults}>
                                            {searchUsers.map(u => (
                                                <TouchableOpacity key={u._id} style={st.userSearchResultItem} onPress={() => { setNewShop({ ...newShop, ownerId: u._id, ownerName: u.name }); setUserSearchText(''); }}>
                                                    <ThemedText style={{ fontSize: 13 }}>{u.name} ({u.email})</ThemedText>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            </ScrollView>

                            <View style={st.modalFooter}>
                                <TouchableOpacity style={[st.modalBtn, { backgroundColor: '#8e8e93' }]} onPress={() => setIsAddShopVisible(false)}>
                                    <ThemedText style={st.modalBtnText}>Hủy</ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity style={[st.modalBtn, { backgroundColor: tint, flex: 1, marginLeft: 10 }]} onPress={handleCreateShop}>
                                    <ThemedText style={st.modalBtnText}>Tạo Cửa Hàng</ThemedText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        );
    }
}

// ─── Styles ──────────────────────────────────────────────────
const st = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFF' },
    headerSub: { fontSize: 10, color: 'rgba(255,255,255,0.75)', marginTop: 3, fontWeight: '600', letterSpacing: 1 },
    logoutBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },

    tabBar: { maxHeight: 50, marginTop: 8 },
    tabBarContent: { paddingHorizontal: 12, gap: 8 },
    tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: 'transparent' },
    tabLabel: { fontSize: 12, color: '#8e8e93', fontWeight: '500' },

    content: { flex: 1, padding: 16 },

    // Search
    searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
    searchInput: { flex: 1, fontSize: 14, padding: 0 },

    // Filter
    filterRow: { maxHeight: 40, marginBottom: 12 },
    filterChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(142,142,147,0.3)' },
    filterText: { fontSize: 12, color: '#8e8e93', fontWeight: '500' },

    // Pagination
    pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 16, marginBottom: 10 },
    pageBtn: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(142,142,147,0.08)' },
    pageBtnText: { fontSize: 13, fontWeight: '600' },
    pageEllipsis: { fontSize: 13, color: '#8e8e93', marginHorizontal: 2 },
    pageInfo: { fontSize: 11, color: '#8e8e93', marginLeft: 8 },

    // Stats
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    statCard: { flex: 1, padding: 16, borderRadius: 18, gap: 6 },
    statIconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    statLabel: { fontSize: 11, color: '#8e8e93', fontWeight: '500' },
    statValue: { fontSize: 16, fontWeight: 'bold' },

    summaryCard: { padding: 18, borderRadius: 18, marginTop: 4 },
    summaryTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 14 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: 'rgba(142,142,147,0.1)' },
    summaryLabel: { fontSize: 14, color: '#8e8e93' },
    summaryVal: { fontSize: 14, fontWeight: 'bold' },

    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 8 },
    sectionTitle: { fontSize: 17 },
    countBadge: { backgroundColor: '#8e8e9320', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    countText: { fontSize: 12, fontWeight: 'bold', color: '#8e8e93' },

    // Cards
    card: { padding: 16, borderRadius: 16, marginBottom: 12 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    cardBody: { gap: 3, marginBottom: 8 },
    cardTitle: { fontSize: 15, fontWeight: 'bold' },
    cardSub: { fontSize: 12, color: '#8e8e93', marginTop: 2 },
    cardActions: { marginTop: 10, borderTopWidth: 0.5, borderTopColor: 'rgba(142,142,147,0.15)', paddingTop: 10 },

    userRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: { width: 44, height: 44, borderRadius: 22 },
    roleBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    roleText: { color: '#FFF', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },

    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 9, fontWeight: 'bold' },

    actionLabel: { fontSize: 11, color: '#8e8e93', marginBottom: 6, fontWeight: '500' },
    actionRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 6 },
    actionBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
    actionBtnText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
    miniBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, marginRight: 6 },
    miniBtnText: { fontSize: 10, fontWeight: '600' },

    thumbImg: { width: 50, height: 50, borderRadius: 10 },
    bannerImg: { width: '100%', height: 100, borderRadius: 10, marginTop: 8 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalBody: { marginBottom: 20 },
    modalFooter: { flexDirection: 'row', marginBottom: Platform.OS === 'ios' ? 20 : 0 },
    modalBtn: { height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    modalBtnText: { color: '#FFF', fontWeight: 'bold' },
    inputGroup: { marginBottom: 15 },
    inputLabel: { fontSize: 13, color: '#8e8e93', marginBottom: 6, fontWeight: '600' },
    input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14 },
    row: { flexDirection: 'row' },
    selectedOwner: { backgroundColor: 'rgba(52, 199, 89, 0.1)', padding: 10, borderRadius: 8, marginBottom: 10 },
    userSearchResults: { backgroundColor: 'rgba(142,142,147,0.05)', borderRadius: 8, overflow: 'hidden' },
    userSearchResultItem: { padding: 12, borderBottomWidth: 0.5, borderBottomColor: 'rgba(142,142,147,0.1)' },
});
