import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { OrdersStackParamList } from '../../../navigation/SellerNavigator';
import { SellerOrder, SubOrderStatus } from '../../../types';
import { sellerOrderService } from '../../../services/sellerOrderService';
import { RealtimeService } from '/Users/apple/E-CommerceSellerApp/src/services/RealtimeService';
import { useAuthStore } from '../../../store/authStore';
import { useStoreStore } from '../../../store/storeStore';

type NavigationProp = NativeStackNavigationProp<OrdersStackParamList>;

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg:          '#F8FAFC',      // light background
  bgCard:      '#FFFFFF',      // white cards
  bgCardHigh:  '#F1F5F9',      // subtle gray
  bgMuted:     '#F9FAFB',

  primary:     '#0891B2',      // slightly deeper cyan
  primaryDim:  '#0E7490',
  primaryGlow: 'rgba(8,145,178,0.08)',

  accent:      '#F59E0B',

  onBg:        '#0F172A',      // dark text
  onBgMuted:   '#64748B',      // gray text

  border:      '#E2E8F0',      // light border
  borderLight: 'rgba(8,145,178,0.25)',
};

const STATUS: Record<string, {
  bg: string; text: string; border: string;
  icon: string; label: string; dot: string;
}> = {
  placed:     { bg: 'rgba(251,191,36,0.1)',  text: '#FBBF24', border: 'rgba(251,191,36,0.3)',  icon: 'receipt-long',         label: 'Placed',     dot: '#FBBF24' },
  confirmed:  { bg: 'rgba(59,130,246,0.1)',  text: '#60A5FA', border: 'rgba(59,130,246,0.3)',  icon: 'check-circle-outline', label: 'Confirmed',  dot: '#60A5FA' },
  processing: { bg: 'rgba(167,139,250,0.1)', text: '#A78BFA', border: 'rgba(167,139,250,0.3)', icon: 'autorenew',            label: 'Processing', dot: '#A78BFA' },
  shipped:    { bg: 'rgba(6,182,212,0.1)',   text: '#22D3EE', border: 'rgba(6,182,212,0.3)',   icon: 'local-shipping',       label: 'Shipped',    dot: '#22D3EE' },
  out_for_delivery: {
    bg: 'rgba(251,146,60,0.1)', text: '#FB923C',
    border: 'rgba(251,146,60,0.3)', dot: '#FB923C',
    icon: 'delivery-dining', label: 'Out for Delivery',
  },
  delivered:  { bg: 'rgba(52,211,153,0.1)',  text: '#34D399', border: 'rgba(52,211,153,0.3)',  icon: 'inventory',            label: 'Delivered',  dot: '#34D399' },
  cancelled:  { bg: 'rgba(248,113,113,0.1)', text: '#F87171', border: 'rgba(248,113,113,0.3)', icon: 'cancel',               label: 'Cancelled',  dot: '#F87171' },
};

const NEXT_ACTIONS: Record<SubOrderStatus, { label: string; next: SubOrderStatus; color: string; icon: string; }[]> = {
  placed:           [{ label: 'Confirm Order',    next: 'confirmed',        color: '#60A5FA', icon: 'check-circle' },
                     { label: 'Cancel',           next: 'cancelled',        color: '#F87171', icon: 'cancel' }],
  confirmed:        [{ label: 'Start Processing', next: 'processing',       color: '#A78BFA', icon: 'autorenew' },
                     { label: 'Cancel',           next: 'cancelled',        color: '#F87171', icon: 'cancel' }],
  processing:       [{ label: 'Mark as Shipped',  next: 'shipped',          color: '#22D3EE', icon: 'local-shipping' }],
  shipped:          [{ label: 'Out for Delivery', next: 'out_for_delivery', color: '#FB923C', icon: 'delivery-dining' }],
  out_for_delivery: [{ label: 'Mark Delivered',   next: 'delivered',        color: '#34D399', icon: 'inventory' }],
  delivered:        [],
  cancelled:        [],
};

const STATUS_FILTERS: (SubOrderStatus | 'all')[] = [
  'all', 'placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled',
];

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// ─── Animated Card ────────────────────────────────────────────────────────────
const OrderCard = ({
  item, index, onPress, onStatusChange, updating,
}: {
  item: SellerOrder; index: number;
  onPress: () => void;
  onStatusChange: (id: number, status: SubOrderStatus) => void;
  updating: boolean;
}) => {
  const s = STATUS[item.status] ?? STATUS.placed;
  const actions = NEXT_ACTIONS[item.status] ?? [];
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 380,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0, duration: 380,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleAction = (next: SubOrderStatus, label: string) => {
    Alert.alert(
      label,
      `Update order ${item.order_number} to "${next}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => onStatusChange(item.id, next) },
      ]
    );
  };

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <Pressable
        onPress={onPress}
        android_ripple={{ color: C.primaryGlow }}
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
      >
        {/* Left glow strip */}
        <View style={[styles.cardStrip, { backgroundColor: s.dot }]} />

        <View style={styles.cardInner}>
          {/* Top row */}
          <View style={styles.cardTop}>
            <View style={styles.cardTopLeft}>
              <Text style={styles.orderNum}>{item.order_number}</Text>
              <Text style={styles.orderDate}>{fmt(item.created_at)}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: s.bg, borderColor: s.border }]}>
              <View style={[styles.badgeDot, { backgroundColor: s.dot }]} />
              <Text style={[styles.badgeText, { color: s.text }]}>{s.label}</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.hairline} />

          {/* Customer row */}
          <View style={styles.customerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarLetter}>
                {item.customer_name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.customerName}>{item.customer_name}</Text>
              <Text style={styles.customerPhone} numberOfLines={1}>{item.customer_phone}</Text>
            </View>
            <View style={styles.totalChip}>
              <Text style={styles.totalChipLabel}>Total</Text>
              <Text style={styles.totalChipValue}>₹{item.subtotal.toLocaleString()}</Text>
            </View>
          </View>

          {/* Meta row */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="package-variant" size={12} color={C.onBgMuted} />
              <Text style={styles.metaText}>{item.items.length} item{item.items.length > 1 ? 's' : ''}</Text>
            </View>
            <View style={styles.metaDot} />
            <View style={styles.metaItem}>
              <MaterialIcons name="payments" size={12} color={C.onBgMuted} />
              <Text style={styles.metaText}>{item.payment_method ?? 'COD'}</Text>
            </View>
            <View style={{ flex: 1 }} />
            <MaterialIcons name="chevron-right" size={18} color={C.onBgMuted} />
          </View>

          {/* Action buttons */}
          {actions.length > 0 && (
            <View style={styles.actionRow}>
              {updating ? (
                <ActivityIndicator size="small" color={C.primary} style={{ marginVertical: 6 }} />
              ) : (
                actions.map((a) => (
                  <Pressable
                    key={a.next}
                    onPress={() => handleAction(a.next, a.label)}
                    android_ripple={{ color: 'rgba(255,255,255,0.1)' }}
                    style={[
                      styles.actionBtn,
                      a.next === 'cancelled'
                        ? styles.actionBtnOutline
                        : { backgroundColor: a.color + '22', borderColor: a.color + '55' },
                    ]}
                  >
                    <Text style={[
                      styles.actionBtnText,
                      { color: a.next === 'cancelled' ? '#F87171' : a.color },
                    ]}>
                      {a.label}
                    </Text>
                  </Pressable>
                ))
              )}
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

// ─── Filter Chip ──────────────────────────────────────────────────────────────
const FilterChip = ({ label, active, count, onPress }: {
  label: string; active: boolean; count?: number; onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    android_ripple={{ color: C.primaryGlow }}
    style={[styles.chip, active && styles.chipActive]}
  >
    <Text style={[styles.chipText, active && styles.chipTextActive]}>
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </Text>
    {count !== undefined && count > 0 && (
      <View style={[styles.chipBadge, active && styles.chipBadgeActive]}>
        <Text style={[styles.chipBadgeText, active && styles.chipBadgeTextActive]}>
          {count}
        </Text>
      </View>
    )}
  </Pressable>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const OrdersScreen = () => {
  const navigation = useNavigation<NavigationProp>();
    const token = useAuthStore((s) => s.token);
  const store = useStoreStore((s) => s.store);
  const [filter, setFilter]       = useState<SubOrderStatus | 'all'>('all');
  const [orders, setOrders]       = useState<SellerOrder[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError]         = useState<string | null>(null);

  const fetchOrders = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const res = await sellerOrderService.getOrders();
      setOrders(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

useEffect(() => {
  fetchOrders();

  if (!token || !store?.id) return;

  // ✅ Connect to Reverb with seller's token
  RealtimeService.connect(token);

  // ✅ Listen to this seller's store channel
  RealtimeService.listenToStoreOrders(
    store.id,

    // New order placed by customer
    (data: any) => {
      fetchOrders();
      Alert.alert(
        '🛍️ New Order!',
        `Order ${data.order_number} from ${data.customer_name}\n₹${data.subtotal}`,
      );
    },

    // Order cancelled by customer
    (data: any) => {
      fetchOrders();
      Alert.alert(
        '❌ Order Cancelled',
        `Order ${data.order_number} was cancelled by ${data.customer_name}`,
      );
    },
  );

  return () => RealtimeService.disconnect();
}, [token, store?.id]);


  const handleStatusChange = async (id: number, status: SubOrderStatus) => {
    setUpdatingId(id);
    try {
      const res = await sellerOrderService.updateStatus(id, status);
      setOrders(prev => prev.map(o => o.id === id ? res.data.sub_order : o));
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const countOf = (s: SubOrderStatus) => orders.filter(o => o.status === s).length;
  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  if (loading) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={styles.loadingText}>Loading orders…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <MaterialCommunityIcons name="wifi-off" size={52} color={C.onBgMuted} />
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={() => fetchOrders()} style={styles.retryBtn}>
          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  const Header = () => (
    <>
      {/* Stats bar */}
      <View style={styles.statsBar}>
        {[
          { label: 'Total',     value: orders.length,          color: C.primary },
          { label: 'Pending',   value: countOf('placed'),      color: '#FBBF24' },
          { label: 'Shipped',   value: countOf('shipped'),     color: '#22D3EE' },
          { label: 'Delivered', value: countOf('delivered'),   color: '#34D399' },
        ].map((s, i) => (
          <View key={s.label} style={styles.statItem}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        keyboardShouldPersistTaps="handled"
      >
        {STATUS_FILTERS.map((s) => (
          <FilterChip
            key={s}
            label={s}
            active={filter === s}
            count={s !== 'all' ? countOf(s as SubOrderStatus) : undefined}
            onPress={() => setFilter(s)}
          />
        ))}
      </ScrollView>

      {/* Section header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {filter === 'all' ? 'All Orders' : STATUS[filter]?.label ?? filter}
        </Text>
        <Text style={styles.sectionCount}>{filtered.length}</Text>
      </View>
    </>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={filtered}
        keyExtractor={(o) => o.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<Header />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchOrders(true)}
            tintColor={C.primary}
            colors={[C.primary]}
          />
        }
        renderItem={({ item, index }) => (
          <OrderCard
            item={item}
            index={index}
            onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
            onStatusChange={handleStatusChange}
            updating={updatingId === item.id}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons name="clipboard-text-off-outline" size={40} color={C.onBgMuted} />
            </View>
            <Text style={styles.emptyTitle}>No orders here</Text>
            <Text style={styles.emptySubtitle}>Try switching filters</Text>
          </View>
        }
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen:   { flex: 1, backgroundColor: C.bg },
  centered: { alignItems: 'center', justifyContent: 'center', gap: 12 },
  list:     { paddingHorizontal: 14, paddingBottom: 32, paddingTop: 4 },

  // Stats bar
  statsBar: {
  flexDirection: 'row',
  backgroundColor: '#FFFFFF',
  marginHorizontal: -14,
  paddingVertical: 18,
  paddingHorizontal: 14,
  marginBottom: 14,
  borderBottomWidth: 1,
  borderBottomColor: '#E2E8F0',
},
  statItem:  { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  statLabel: { fontSize: 11, color: C.onBgMuted, marginTop: 2, letterSpacing: 0.5 },

  // Filter chips
  chipRow: { paddingBottom: 14, gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 100, backgroundColor: C.bgCard,
    borderWidth: 1, borderColor: C.border,
  },
  chipActive:     { backgroundColor: C.primaryGlow, borderColor: C.borderLight },
  chipText:       { fontSize: 13, color: C.onBgMuted, fontWeight: '500' },
  chipTextActive: { color: C.primary, fontWeight: '700' },
  chipBadge: {
    minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: C.bgCardHigh,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4,
  },
  chipBadgeActive:     { backgroundColor: C.primaryDim },
  chipBadgeText:       { fontSize: 10, color: C.onBgMuted, fontWeight: '700' },
  chipBadgeTextActive: { color: '#fff' },

  // Section header
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 12, gap: 8,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: C.onBgMuted, letterSpacing: 1, textTransform: 'uppercase' },
  sectionCount: { fontSize: 12, color: C.primary, fontWeight: '700',
    backgroundColor: C.primaryGlow, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },

  // Card
  card: {
  backgroundColor: C.bgCard,
  borderRadius: 16,
  flexDirection: 'row',
  borderWidth: 1,
  borderColor: C.border,
  overflow: 'hidden',

  // Shadow
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
},
  cardStrip: { width: 3 },
  cardInner: { flex: 1, padding: 14, gap: 10 },

  cardTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTopLeft:{ gap: 2 },
  orderNum:   { fontSize: 15, fontWeight: '800', color: C.onBg, letterSpacing: 0.3 },
  orderDate:  { fontSize: 11, color: C.onBgMuted },

  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 100, borderWidth: 1,
  },
  badgeDot:  { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },

  hairline: { height: 1, backgroundColor: C.border },

  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: C.primaryGlow,
    borderWidth: 1, borderColor: C.borderLight,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarLetter: { fontSize: 16, fontWeight: '800', color: C.primary },
  customerName: { fontSize: 14, fontWeight: '600', color: C.onBg },
  customerPhone:{ fontSize: 12, color: C.onBgMuted },

  totalChip: { alignItems: 'flex-end' },
  totalChipLabel:{ fontSize: 10, color: C.onBgMuted, letterSpacing: 0.5 },
  totalChipValue:{ fontSize: 16, fontWeight: '800', color: C.accent },

  metaRow:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: C.onBgMuted },
  metaDot:  { width: 3, height: 3, borderRadius: 2, backgroundColor: C.onBgMuted },

  actionRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', paddingTop: 2 },
  actionBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 100, borderWidth: 1,
  },
  actionBtnOutline: {
    backgroundColor: 'rgba(248,113,113,0.08)',
    borderColor: 'rgba(248,113,113,0.3)',
  },
  actionBtnText: { fontSize: 12, fontWeight: '700' },

  loadingText: { color: C.onBgMuted, marginTop: 8, fontSize: 14 },
  errorText:   { color: C.onBg, fontSize: 15, fontWeight: '600', textAlign: 'center', paddingHorizontal: 32 },
  retryBtn: {
    backgroundColor: C.primaryGlow, borderWidth: 1, borderColor: C.borderLight,
    paddingHorizontal: 28, paddingVertical: 11, borderRadius: 100, marginTop: 4,
  },
  retryText: { color: C.primary, fontWeight: '700', fontSize: 14 },

  empty:        { alignItems: 'center', marginTop: 64, gap: 10 },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  emptyTitle:    { fontSize: 16, fontWeight: '700', color: C.onBg },
  emptySubtitle: { fontSize: 13, color: C.onBgMuted },
});

export default OrdersScreen;