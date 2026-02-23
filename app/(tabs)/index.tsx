import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLocation } from '@/hooks/use-location';
import { getBanners, IBanner } from '@/services/banner-service';
import { getBlogs, IBlog } from '@/services/blog-service';
import { getMyOrders } from '@/services/order-service';
import { getShops, IShop } from '@/services/shop-service';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { useNotificationStore } from '@/store/notification-store';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

// Mock location for "Nearby" shops (HCMC Center)
const MOCK_LOCATION = {
  latitude: 10.7765,
  longitude: 106.7019,
};

export default function MenuScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user, logout } = useAuthStore();
  const { maxPrice: externalMaxPrice } = useLocalSearchParams();
  const router = useRouter();
  const { location: userLocation, loading: locationLoading } = useLocation();

  const [banners, setBanners] = React.useState<IBanner[]>([]);
  const [nearbyShops, setNearbyShops] = React.useState<IShop[]>([]);
  const [featuredShops, setFeaturedShops] = React.useState<IShop[]>([]);
  const [recentShops, setRecentShops] = React.useState<IShop[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [bannersLoading, setBannersLoading] = React.useState(true);
  const [shopsLoading, setShopsLoading] = React.useState(true);
  const [recentLoading, setRecentLoading] = React.useState(false);
  const [blogsLoading, setBlogsLoading] = React.useState(true);
  const [cookingBlogs, setCookingBlogs] = React.useState<IBlog[]>([]);
  const [screeningBlogs, setScreeningBlogs] = React.useState<IBlog[]>([]);
  const [riskBlogs, setRiskBlogs] = React.useState<IBlog[]>([]);
  const [search, setSearch] = React.useState('');
  const [activeBannerIndex, setActiveBannerIndex] = React.useState(0);
  const [featuredSectionY, setFeaturedSectionY] = React.useState(0);
  const scrollRef = React.useRef<ScrollView>(null);
  const { items, getTotal } = useCartStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();

  const categories = [
    { id: 1, name: 'Bữa sáng', value: 'Bữa sáng' },
    { id: 2, name: 'Bữa trưa', value: 'Bữa trưa' },
    { id: 3, name: 'Bữa tối', value: 'Bữa tối' },
    { id: 4, name: 'Ăn vặt', value: 'Ăn vặt' },
  ];

  React.useEffect(() => {
    fetchBanners();
    fetchNotifications();
    fetchRecentShops();
    fetchHomeBlogs();
    if (!locationLoading) {
      fetchShops();
    }
  }, [locationLoading, userLocation]);

  const fetchBanners = async () => {
    setBannersLoading(true);
    try {
      const response = await getBanners();
      setBanners(response.data);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setBannersLoading(false);
    }
  };

  const fetchShops = async () => {
    setShopsLoading(true);
    try {
      // Fetch Featured
      const featuredRes = await getShops({ isFeatured: true });
      setFeaturedShops(featuredRes.data);

      // Fetch Nearby
      const nearbyRes = await getShops({
        lat: userLocation?.latitude || MOCK_LOCATION.latitude,
        lng: userLocation?.longitude || MOCK_LOCATION.longitude,
        radius: 10
      });
      setNearbyShops(nearbyRes.data);
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setShopsLoading(false);
    }
  };

  const fetchRecentShops = async () => {
    setRecentLoading(true);
    try {
      const response = await getMyOrders();
      if (response.data.success) {
        // Extract unique shops from orders
        const orders = response.data.orders;
        const uniqueShopIds = new Set();
        const uniqueShops: IShop[] = [];

        orders.forEach(order => {
          if (order.shopId && !uniqueShopIds.has(order.shopId._id)) {
            uniqueShopIds.add(order.shopId._id);
            uniqueShops.push(order.shopId as any);
          }
        });

        setRecentShops(uniqueShops.slice(0, 5)); // Show top 5 recent unique shops
      }
    } catch (error) {
      console.error('Error fetching recent shops:', error);
    } finally {
      setRecentLoading(false);
    }
  };

  const fetchHomeBlogs = async () => {
    setBlogsLoading(true);
    try {
      const response = await getBlogs();
      if (response.data.success) {
        const allBlogs: IBlog[] = response.data.data;
        setCookingBlogs(allBlogs.filter(b => b.category === 'Cooking Guide'));
        setScreeningBlogs(allBlogs.filter(b => b.category === 'Ingredient Screening'));
        setRiskBlogs(allBlogs.filter(b => b.category === 'Risk Warning'));
      }
    } catch (error) {
      console.error('Error fetching home blogs:', error);
    } finally {
      setBlogsLoading(false);
    }
  };

  const calculateDistance = (shopLocation: { coordinates: number[] }) => {
    const lat1 = userLocation?.latitude || MOCK_LOCATION.latitude;
    const lon1 = userLocation?.longitude || MOCK_LOCATION.longitude;
    const [lon2, lat2] = shopLocation.coordinates;

    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;

    // Grab-style: Duration estimate (assume 2 mins per km + 5 min base for prep/traffic)
    const duration = Math.round(d * 2 + 5);
    return `${duration} phút • ${d.toFixed(1)} km`;
  };

  const onBannerScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActiveBannerIndex(Math.round(index));
  };

  const navIcons = [
    { id: 'diet', name: 'Đồ ăn', icon: 'star.fill', action: () => scrollRef.current?.scrollTo({ y: featuredSectionY - 20, animated: true }) },
    { id: 'fav', name: 'Yêu thích', icon: 'heart.fill', action: () => { /* Add favorite navigation logic */ } },
    { id: 'rank', name: 'Xếp hạng', icon: 'checkmark.seal.fill', action: () => { router.push({ pathname: '/(tabs)/community', params: { tab: 'rank' } as any }) } },
    { id: 'comm', name: 'Nhóm món', icon: 'person.3.fill', action: () => router.push('/(tabs)/community') },
    { id: 'acc', name: 'Tài khoản', icon: 'person.fill', action: () => router.push('/(tabs)/account') },
    { id: 'voucher', name: 'Voucher', icon: 'local-offer', action: () => { /* Logic to open vouchers or navigate */ } },
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Top Section Card (Merged Header Design) */}
        <ThemedView style={styles.topSectionCard}>
          {/* Header Row (Solid Vivid Orange) */}
          <View style={[styles.vividHeader, { backgroundColor: colors.tint }]}>
            <View style={styles.vividHeaderContent}>
              <TouchableOpacity style={styles.userSection} onPress={() => router.push('/(tabs)/account')}>
                <View style={[styles.avatarPlaceholder, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <ThemedText style={[styles.avatarText, { color: '#FFF' }]}>{(user?.name || 'U').charAt(0).toUpperCase()}</ThemedText>
                </View>
              </TouchableOpacity>

              <View style={[styles.headerSearchContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <IconSymbol name="magnifyingglass" size={16} color="#FFF" />
                <TextInput
                  placeholder="Tìm món ăn, cửa hàng..."
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  style={[styles.headerSearchInput, { color: '#FFF' }]}
                  onFocus={() => router.push('/search')}
                />
              </View>

              <View style={styles.headerRight}>
                <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.actionBtn}>
                  <IconSymbol name="bell.fill" size={20} color="#FFF" />
                  {unreadCount > 0 && (
                    <View style={[styles.unreadBadge, { backgroundColor: '#FFF' }]}>
                      <ThemedText style={[styles.unreadBadgeText, { color: colors.tint }]}>{unreadCount > 9 ? '9+' : unreadCount}</ThemedText>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={logout} style={styles.actionBtn}>
                  <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Clean Nav Grid (Minimalist) */}
          <View style={styles.navGrid}>
            {navIcons.map((item) => (
              <TouchableOpacity key={item.id} style={styles.navItem} onPress={item.action}>
                <View style={styles.navIconContainer}>
                  <IconSymbol name={item.icon as any} size={22} color={colors.text} />
                </View>
                <ThemedText style={styles.navText}>{item.name}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </ThemedView>
        {/* Diet Categories */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Chế độ ăn</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            <TouchableOpacity
              style={[
                styles.categoryCard,
                { backgroundColor: colors.background, borderColor: colors.tint }
              ]}
              onPress={() => router.push({ pathname: '/search', params: { category: '' } })}
            >
              <ThemedText style={[styles.categoryName, { color: colors.text }]}>Tất cả</ThemedText>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryCard,
                  { backgroundColor: colors.background, borderColor: colors.tint }
                ]}
                onPress={() => router.push({ pathname: '/search', params: { category: cat.value } })}
              >
                <ThemedText style={[styles.categoryName, { color: colors.text }]}>{cat.name}</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ThemedView>

        {/* Banner Carousel */}
        {!bannersLoading && banners.length > 0 && (
          <ThemedView style={styles.bannerContainer}>
            <FlatList
              data={banners}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onBannerScroll}
              scrollEventThrottle={16}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity activeOpacity={0.9} style={styles.bannerItem}>
                  <Image source={{ uri: item.image }} style={styles.bannerImage} />
                  <View style={styles.bannerOverlay}>
                    <ThemedText style={styles.bannerTitle}>{item.title}</ThemedText>
                  </View>
                </TouchableOpacity>
              )}
            />
            <View style={styles.pagination}>
              {banners.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    { backgroundColor: index === activeBannerIndex ? colors.tint : colors.tabIconDefault + '50' },
                    index === activeBannerIndex && { width: 20 }
                  ]}
                />
              ))}
            </View>
          </ThemedView>
        )}

        {/* Nearby Shops */}
        {!shopsLoading && nearbyShops.length > 0 && (
          <ThemedView style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Cửa hàng gần bạn</ThemedText>
              <TouchableOpacity>
                <ThemedText style={{ color: colors.tint, fontWeight: '600' }}>Tất cả</ThemedText>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shopScroll}>
              {nearbyShops.map((shop) => (
                <TouchableOpacity
                  key={shop._id}
                  style={styles.shopCardHorizontal}
                  onPress={() => router.push(`/(shop)/${shop._id}`)}
                >
                  <Image source={{ uri: shop.image }} style={styles.shopImageHorizontal} />
                  <View style={styles.shopInfoHorizontal}>
                    <ThemedText style={styles.shopNameHorizontal} numberOfLines={1}>{shop.name}</ThemedText>
                    <View style={styles.shopMetaHorizontal}>
                      <View style={styles.ratingContainer}>
                        <IconSymbol name="star.fill" size={12} color="#F1C40F" />
                        <ThemedText style={styles.ratingText}>{shop.rating}</ThemedText>
                      </View>
                      <ThemedText style={styles.distanceText}>{calculateDistance(shop.location)}</ThemedText>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ThemedView>
        )}

        {/* Recently Ordered Shops */}
        {!recentLoading && recentShops.length > 0 && (
          <ThemedView style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Đặt lại gần đây</ThemedText>
              <TouchableOpacity onPress={() => router.push('/(tabs)/activity')}>
                <ThemedText style={{ color: colors.tint, fontWeight: '600' }}>Lịch sử</ThemedText>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shopScroll}>
              {recentShops.map((shop) => (
                <TouchableOpacity
                  key={`recent-${shop._id}`}
                  style={styles.recentShopCard}
                  onPress={() => router.push(`/(shop)/${shop._id}`)}
                >
                  <Image source={{ uri: shop.image }} style={styles.recentShopImage} />
                  <View style={styles.recentShopInfo}>
                    <ThemedText style={styles.recentShopName} numberOfLines={1}>{shop.name}</ThemedText>
                    <TouchableOpacity
                      style={[styles.reorderBtn, { backgroundColor: colors.tint }]}
                      onPress={() => router.push(`/(shop)/${shop._id}`)}
                    >
                      <ThemedText style={styles.reorderBtnText}>Đặt lại</ThemedText>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ThemedView>
        )}

        {/* Featured Shops */}
        {!shopsLoading && featuredShops.length > 0 && (
          <ThemedView
            style={styles.section}
            onLayout={(e: LayoutChangeEvent) => setFeaturedSectionY(e.nativeEvent.layout.y)}
          >
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Cửa hàng yêu thích</ThemedText>
              <TouchableOpacity>
                <ThemedText style={{ color: colors.tint, fontWeight: '600' }}>Tất cả</ThemedText>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shopScroll}>
              {featuredShops.map((shop) => (
                <TouchableOpacity
                  key={shop._id}
                  style={styles.featuredShopCard}
                  onPress={() => router.push(`/(shop)/${shop._id}`)}
                >
                  <Image source={{ uri: shop.image }} style={styles.featuredShopImage} />
                  {shop.discountLabel && (
                    <View style={styles.discountBadge}>
                      <ThemedText style={styles.discountText}>{shop.discountLabel}</ThemedText>
                    </View>
                  )}
                  <View style={styles.featuredShopOverlay}>
                    <View style={styles.featuredShopNameRow}>
                      <ThemedText style={styles.featuredShopName}>{shop.name}</ThemedText>
                      {shop.isVerified && (
                        <IconSymbol name="checkmark.seal.fill" size={16} color="#3498DB" />
                      )}
                    </View>
                    <View style={styles.featuredShopMetaRow}>
                      <View style={styles.ratingBadge}>
                        <IconSymbol name="star.fill" size={10} color="#FFF" />
                        <ThemedText style={styles.ratingBadgeText}>{shop.rating}</ThemedText>
                      </View>
                      <View style={styles.distanceBadge}>
                        <ThemedText style={styles.distanceBadgeText}>{calculateDistance(shop.location)}</ThemedText>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ThemedView>
        )}

        {/* Blog Carousels */}
        {blogsLoading ? (
          <ActivityIndicator size="small" color={colors.tint} style={{ marginBottom: 20 }} />
        ) : (
          <>
            {/* Học nấu ăn */}
            {cookingBlogs.length > 0 && (
              <ThemedView style={styles.section}>
                <View style={styles.sectionHeader}>
                  <ThemedText type="subtitle" style={styles.sectionTitle}>Học nấu ăn</ThemedText>
                  <TouchableOpacity onPress={() => router.push('/(tabs)/community')}>
                    <ThemedText style={{ color: colors.tint, fontWeight: '600' }}>Tất cả</ThemedText>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.blogScroll}>
                  {cookingBlogs.map((blog) => (
                    <TouchableOpacity
                      key={blog._id}
                      style={styles.homeBlogCard}
                      onPress={() => router.push(`/(blog)/${blog._id}`)}
                    >
                      <Image source={{ uri: blog.image }} style={styles.homeBlogImage} />
                      <View style={styles.homeBlogInfo}>
                        <ThemedText style={styles.homeBlogTitle} numberOfLines={2}>{blog.title}</ThemedText>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </ThemedView>
            )}

            {/* Mẹo hay */}
            {screeningBlogs.length > 0 && (
              <ThemedView style={styles.section}>
                <View style={styles.sectionHeader}>
                  <ThemedText type="subtitle" style={styles.sectionTitle}>Mẹo hay</ThemedText>
                  <TouchableOpacity onPress={() => router.push('/(tabs)/community')}>
                    <ThemedText style={{ color: colors.tint, fontWeight: '600' }}>Tất cả</ThemedText>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.blogScroll}>
                  {screeningBlogs.map((blog) => (
                    <TouchableOpacity
                      key={blog._id}
                      style={styles.homeBlogCard}
                      onPress={() => router.push(`/(blog)/${blog._id}`)}
                    >
                      <Image source={{ uri: blog.image }} style={styles.homeBlogImage} />
                      <View style={styles.homeBlogInfo}>
                        <ThemedText style={styles.homeBlogTitle} numberOfLines={2}>{blog.title}</ThemedText>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </ThemedView>
            )}

            {/* Rủi ro độc hại */}
            {riskBlogs.length > 0 && (
              <ThemedView style={styles.section}>
                <View style={styles.sectionHeader}>
                  <ThemedText type="subtitle" style={styles.sectionTitle}>Rủi ro độc hại</ThemedText>
                  <TouchableOpacity onPress={() => router.push('/(tabs)/community')}>
                    <ThemedText style={{ color: colors.tint, fontWeight: '600' }}>Tất cả</ThemedText>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.blogScroll}>
                  {riskBlogs.map((blog) => (
                    <TouchableOpacity
                      key={blog._id}
                      style={[styles.homeBlogCard, { borderColor: '#E74C3C', borderWidth: 0.5 }]}
                      onPress={() => router.push(`/(blog)/${blog._id}`)}
                    >
                      <Image source={{ uri: blog.image }} style={styles.homeBlogImage} />
                      <View style={styles.homeBlogInfo}>
                        <ThemedText style={[styles.homeBlogTitle, { color: '#E74C3C' }]} numberOfLines={2}>{blog.title}</ThemedText>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </ThemedView>
            )}
          </>
        )}

        {/* Featured Card */}
        <ThemedView style={styles.featuredContainer}>
          <ThemedView style={[styles.featuredCard, { backgroundColor: colors.tint }]}>
            <ThemedText style={styles.featuredTitle}>Bạn muốn nấu gì?</ThemedText>
            <ThemedText style={styles.featuredSubtitle}>Dựa trên ngân sách & nguyên liệu sẵn có</ThemedText>
            <TouchableOpacity style={styles.featuredButton}>
              <ThemedText style={styles.featuredButtonText}>Bắt đầu tính toán</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ScrollView>

      {/* AI Assistant FAB */}
      <TouchableOpacity
        style={[
          styles.aiFAB,
          { bottom: items.length > 0 ? 100 : 30 }
        ]}
        onPress={() => router.push('/ai-chat')}
      >
        <View style={[styles.aiFABContent, { backgroundColor: colors.tint }]}>
          <IconSymbol name="sparkles" size={24} color="#FFF" />
        </View>
      </TouchableOpacity>

      {/* Floating Cart Button */}
      {
        items.length > 0 && (
          <TouchableOpacity
            style={styles.floatingCart}
            onPress={() => router.push('/(shop)/cart')}
          >
            <View style={styles.cartInfo}>
              <View style={styles.badge}>
                <ThemedText style={styles.badgeText}>{items.length}</ThemedText>
              </View>
              <ThemedText style={styles.cartText}>Xem giỏ hàng</ThemedText>
            </View>
            <ThemedText style={styles.cartTotal}>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(getTotal())}
            </ThemedText>
          </TouchableOpacity>
        )
      }
    </ThemedView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  topSectionCard: {
    width: width,
    paddingBottom: 20,
    marginBottom: 20,
  },
  vividHeader: {
    width: width,
    paddingTop: 65,
    paddingBottom: 15,
  },
  vividHeaderContent: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userSection: {
    width: 36,
    height: 36,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '800',
  },
  headerSearchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
  },
  headerSearchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  unreadBadgeText: {
    fontSize: 7,
    fontWeight: 'bold',
  },
  recentShopCard: {
    width: 140,
    marginRight: 12,
    alignItems: 'center',
  },
  recentShopImage: {
    width: 120,
    height: 120,
    borderRadius: 60, // Circular for "Recent" feel
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'rgba(142, 142, 147, 0.1)',
  },
  recentShopInfo: {
    alignItems: 'center',
    width: '100%',
  },
  recentShopName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  reorderBtn: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
  },
  reorderBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  greeting: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 4,
  },
  title: {
    fontFamily: Fonts.rounded,
    fontSize: 28,
  },
  navGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    marginTop: 20,
  },
  navItem: {
    width: (width - 80) / 3,
    alignItems: 'center',
    gap: 8,
    marginBottom: 15,
  },
  navIconContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navText: {
    fontSize: 10,
    fontWeight: '600',
    opacity: 0.7,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 15,
    fontFamily: Fonts.rounded,
    paddingHorizontal: 20,
  },
  categoryScroll: {
    gap: 12,
    paddingHorizontal: 20,
  },
  categoryCard: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontWeight: '600',
  },
  recipeList: {
    marginBottom: 30,
  },
  recipeCard: {
    flexDirection: 'row',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recipeImage: {
    width: 100,
    height: 100,
  },
  recipeInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recipeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recipePrice: {
    fontSize: 14,
    color: '#E67E22',
    fontWeight: '700',
  },
  categoryBadge: {
    backgroundColor: 'rgba(230, 126, 34, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 10,
    color: '#E67E22',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#8e8e93',
    fontStyle: 'italic',
  },
  featuredContainer: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  featuredCard: {
    padding: 25,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  featuredTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  featuredSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 20,
  },
  featuredButton: {
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  featuredButtonText: {
    color: '#E67E22',
    fontWeight: '700',
  },
  bannerContainer: {
    marginVertical: 20,
    marginHorizontal: 20,
    height: 180,
    width: width - 40,
  },
  bannerItem: {
    width: width - 40,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
    padding: 20,
  },
  bannerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    gap: 8,
  },
  paginationDot: {
    height: 6,
    width: 6,
    borderRadius: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  shopScroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  shopCardHorizontal: {
    width: 200,
    backgroundColor: 'rgba(142, 142, 147, 0.05)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  shopImageHorizontal: {
    width: '100%',
    height: 120,
  },
  shopInfoHorizontal: {
    padding: 12,
  },
  shopNameHorizontal: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  shopMetaHorizontal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8e8e93',
  },
  distanceText: {
    fontSize: 12,
    color: '#8e8e93',
  },
  featuredShopCard: {
    width: 280,
    height: 160,
    borderRadius: 25,
    overflow: 'hidden',
  },
  featuredShopImage: {
    width: '100%',
    height: '100%',
  },
  featuredShopOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    padding: 15,
  },
  featuredShopName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(241, 196, 15, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 4,
  },
  ratingBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  discountBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: '#E74C3C',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    zIndex: 1,
  },
  discountText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  featuredShopNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 5,
  },
  featuredShopMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  distanceBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  distanceBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  blogScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  homeBlogCard: {
    width: 160,
    backgroundColor: 'rgba(142, 142, 147, 0.05)',
    borderRadius: 15,
    overflow: 'hidden',
  },
  homeBlogImage: {
    width: '100%',
    height: 100,
  },
  homeBlogInfo: {
    padding: 10,
  },
  homeBlogTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  floatingCart: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#2ECC71',
    height: 60,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cartInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  badge: {
    backgroundColor: '#FFF',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  badgeText: {
    color: '#2ECC71',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cartText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cartTotal: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  aiFAB: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  aiFABContent: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
