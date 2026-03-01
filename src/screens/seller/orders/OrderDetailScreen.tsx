import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Animated,
  Image,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { OrdersStackParamList } from '../../../navigation/SellerNavigator';
import { SellerOrder, SubOrderStatus } from '../../../types';
import { sellerOrderService } from '../../../services/sellerOrderService';

type OrderDetailRouteProp = RouteProp<OrdersStackParamList, 'OrderDetail'>;

// ─── Design Tokens (matches OrdersScreen) ────────────────────────────────────
const C = {
  bg:          '#F8FAFC',     // Light screen background
  bgCard:      '#FFFFFF',     // White cards
  bgCardHigh:  '#F1F5F9',     // Soft gray blocks
  bgMuted:     '#F9FAFB',

  primary:     '#0891B2',
  primaryDim:  '#0E7490',
  primaryGlow: 'rgba(8,145,178,0.08)',

  accent:      '#F59E0B',

  onBg:        '#0F172A',     // Dark text
  onBgMuted:   '#64748B',     // Secondary text

  border:      '#E2E8F0',     // Light border
  borderLight: 'rgba(8,145,178,0.25)',

  success:     '#16A34A',
  error:       '#DC2626',
  warning:     '#D97706',
};

const STATUS_FLOW: SubOrderStatus[] = [
  'placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered',
];

const STATUS_META: Record<string, {
  bg: string; text: string; border: string; dot: string;
  icon: string; label: string; description: string;
}> = {
  placed:     { bg: 'rgba(251,191,36,0.1)',  text: '#FBBF24', border: 'rgba(251,191,36,0.3)',  dot: '#FBBF24', icon: 'receipt-long',         label: 'Placed',     description: 'Order received' },
  confirmed:  { bg: 'rgba(59,130,246,0.1)',  text: '#60A5FA', border: 'rgba(59,130,246,0.3)',  dot: '#60A5FA', icon: 'check-circle-outline', label: 'Confirmed',  description: 'Order confirmed' },
  processing: { bg: 'rgba(167,139,250,0.1)', text: '#A78BFA', border: 'rgba(167,139,250,0.3)', dot: '#A78BFA', icon: 'autorenew',            label: 'Processing', description: 'Being prepared' },
  shipped:    { bg: 'rgba(6,182,212,0.1)',   text: '#22D3EE', border: 'rgba(6,182,212,0.3)',   dot: '#22D3EE', icon: 'local-shipping',       label: 'Shipped',    description: 'Out for delivery' },
  out_for_delivery: {
    bg: 'rgba(251,146,60,0.1)', text: '#FB923C',
    border: 'rgba(251,146,60,0.3)', dot: '#FB923C',
    icon: 'delivery-dining', label: 'Out for Delivery',
    description: 'On the way to customer',
  },
  delivered:  { bg: 'rgba(52,211,153,0.1)',  text: '#34D399', border: 'rgba(52,211,153,0.3)',  dot: '#34D399', icon: 'inventory',            label: 'Delivered',  description: 'Delivered successfully' },
  cancelled:  { bg: 'rgba(248,113,113,0.1)', text: '#F87171', border: 'rgba(248,113,113,0.3)', dot: '#F87171', icon: 'cancel',               label: 'Cancelled',  description: 'Order cancelled' },
};

const NEXT_ACTIONS: Record<SubOrderStatus, { label: string; next: SubOrderStatus; color: string; icon: string }[]> = {
  placed:     [{ label: 'Confirm Order',   next: 'confirmed',  color: '#60A5FA', icon: 'check-circle' }, { label: 'Cancel Order', next: 'cancelled', color: '#F87171', icon: 'cancel' }],
  confirmed:  [{ label: 'Start Processing',next: 'processing', color: '#A78BFA', icon: 'autorenew'    }, { label: 'Cancel Order', next: 'cancelled', color: '#F87171', icon: 'cancel' }],
  processing: [{ label: 'Mark as Shipped', next: 'shipped',    color: '#22D3EE', icon: 'local-shipping'}],
  shipped:    [{ label: 'Mark Delivered',  next: 'delivered',  color: '#34D399', icon: 'inventory'    }],
  out_for_delivery: [{ label: 'Mark Delivered',   next: 'delivered',        color: '#34D399', icon: 'inventory' }],
  delivered:  [],
  cancelled:  [],
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// ─── Section Card ─────────────────────────────────────────────────────────────
const Section = ({ title, icon, children }: {
  title: string; icon: string; children: React.ReactNode;
}) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <MaterialIcons name={icon as any} size={15} color={C.primary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const OrderDetailScreen = () => {
  const route     = useRoute<OrderDetailRouteProp>();
  const navigation = useNavigation();
  const { orderId } = route.params;

  const [order, setOrder]     = useState<SellerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await sellerOrderService.getOrder(orderId);
      setOrder(res.data);
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (next: SubOrderStatus, label: string) => {
    Alert.alert(
      label,
      `Update this order to "${next}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setUpdating(true);
            try {
              const res = await sellerOrderService.updateStatus(orderId, next);
              setOrder(res.data.sub_order);
            } catch (e: any) {
              Alert.alert('Error', e?.response?.data?.message ?? 'Failed to update');
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={styles.loadingText}>Loading order…</Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <MaterialCommunityIcons name="alert-circle-outline" size={52} color={C.error} />
        <Text style={styles.errorText}>{error ?? 'Order not found'}</Text>
        <Pressable onPress={fetchOrder} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const s         = STATUS_META[order.status] ?? STATUS_META.placed;
  const actions   = NEXT_ACTIONS[order.status as SubOrderStatus] ?? [];
  const currentIdx = STATUS_FLOW.indexOf(order.status as SubOrderStatus);
  const isCancelled = order.status === 'cancelled';

  const subtotal  = order.items.reduce((sum, i) => sum + i.total, 0);

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ── Hero Header ────────────────────────────────────────────────── */}
          <View style={styles.hero}>
            <View style={styles.heroTop}>
              <View>
                <Text style={styles.heroLabel}>ORDER</Text>
                <Text style={styles.heroOrderNum}>{order.order_number}</Text>
                <Text style={styles.heroDate}>{fmt(order.created_at)}</Text>
              </View>
              <View style={[styles.heroBadge, { backgroundColor: s.bg, borderColor: s.border }]}>
                <MaterialIcons name={s.icon as any} size={18} color={s.text} />
                <Text style={[styles.heroBadgeText, { color: s.text }]}>{s.label}</Text>
              </View>
            </View>

            {/* Total highlight */}
            <View style={styles.heroTotal}>
              <Text style={styles.heroTotalLabel}>Order Total</Text>
              <Text style={styles.heroTotalValue}>₹{order.subtotal.toLocaleString()}</Text>
            </View>
          </View>

          {/* ── Status Timeline ─────────────────────────────────────────────── */}
          {!isCancelled ? (
            <Section title="Order Progress" icon="timeline">
              <View style={styles.timeline}>
                {STATUS_FLOW.map((st, i) => {
                  const isDone    = i <= currentIdx;
                  const isCurrent = i === currentIdx;
                  const meta      = STATUS_META[st];
                  const isLast    = i === STATUS_FLOW.length - 1;

                  return (
                    <View key={st} style={styles.timelineRow}>
                      {/* Left: dot + line */}
                      <View style={styles.timelineTrack}>
                        <View style={[
                          styles.timelineDot,
                          isDone    && { backgroundColor: meta.dot, borderColor: meta.dot },
                          isCurrent && { backgroundColor: C.bg, borderColor: meta.dot, borderWidth: 3 },
                          !isDone   && { backgroundColor: '#FFFFFF', borderColor: C.border },
                        ]}>
                          {isCurrent && (
                            <View style={[styles.timelinePulse, { backgroundColor: meta.dot }]} />
                          )}
                          {isDone && !isCurrent && (
                            <MaterialIcons name="check" size={10} color="#fff" />
                          )}
                        </View>
                        {!isLast && (
                          <View style={[
                            styles.timelineLine,
                            { backgroundColor: i < currentIdx ? meta.dot : C.border },
                          ]} />
                        )}
                      </View>

                      {/* Right: label */}
                      <View style={styles.timelineContent}>
                        <Text style={[
                          styles.timelineLabel,
                          isDone && { color: isCurrent ? meta.text : C.onBg },
                          !isDone && { color: C.onBgMuted },
                        ]}>
                          {meta.label}
                        </Text>
                        <Text style={[
                          styles.timelineDesc,
                          { color: isDone ? C.onBgMuted : C.border },
                        ]}>
                          {meta.description}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </Section>
          ) : (
            <View style={[styles.section, styles.cancelledBanner]}>
              <MaterialIcons name="cancel" size={20} color={C.error} />
              <Text style={styles.cancelledText}>This order has been cancelled</Text>
            </View>
          )}

          {/* ── Customer Info ───────────────────────────────────────────────── */}
          <Section title="Customer" icon="person">
            <View style={styles.customerCard}>
              <View style={styles.customerAvatar}>
                <Text style={styles.customerAvatarLetter}>
                  {order.customer_name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.customerName}>{order.customer_name}</Text>
                {order.customer_phone ? (
                  <View style={styles.infoRow}>
                    <MaterialIcons name="phone" size={13} color={C.onBgMuted} />
                    <Text style={styles.infoText}>{order.customer_phone}</Text>
                  </View>
                ) : null}
              </View>
            </View>
            {order.delivery_address ? (
              <View style={styles.addressBox}>
                <MaterialIcons name="location-on" size={14} color={C.primary} style={{ marginTop: 1 }} />
                <Text style={styles.addressText}>{order.delivery_address}</Text>
              </View>
            ) : null}
          </Section>

          {/* ── Order Items ─────────────────────────────────────────────────── */}
          <Section title={`Items (${order.items.length})`} icon="inventory-2">
            <View style={styles.itemsList}>
              {order.items.map((item, i) => (
                <View key={item.id} style={[
                  styles.itemRow,
                  i < order.items.length - 1 && styles.itemRowBorder,
                ]}>
                  {/* Image or placeholder */}
                  <View style={styles.itemThumb}>
                    {item.image ? (
                      <Image source={{ uri: item.image }} style={styles.itemImage} />
                    ) : (
                      <MaterialCommunityIcons name="package-variant" size={22} color={C.onBgMuted} />
                    )}
                  </View>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.product_name}</Text>
                    <View style={styles.itemMeta}>
                      <Text style={styles.itemUnitPrice}>₹{item.price.toLocaleString()}</Text>
                      <Text style={styles.itemMetaDot}>×</Text>
                      <Text style={styles.itemQty}>{item.quantity}</Text>
                    </View>
                  </View>
                  <Text style={styles.itemTotal}>₹{item.total.toLocaleString()}</Text>
                </View>
              ))}
            </View>

            {/* Price breakdown */}
            <View style={styles.priceBreakdown}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Subtotal</Text>
                <Text style={styles.priceValue}>₹{subtotal.toLocaleString()}</Text>
              </View>
              <View style={[styles.priceDivider]} />
              <View style={styles.priceRow}>
                <Text style={styles.priceTotalLabel}>Total</Text>
                <Text style={styles.priceTotalValue}>₹{order.subtotal.toLocaleString()}</Text>
              </View>
            </View>
          </Section>

          {/* ── Payment Info ─────────────────────────────────────────────────── */}
          <Section title="Payment" icon="payments">
            <View style={styles.paymentRow}>
              <View style={styles.paymentIcon}>
                <MaterialIcons name="payments" size={18} color={C.primary} />
              </View>
              <View>
                <Text style={styles.paymentMethod}>{order.payment_method ?? 'Cash on Delivery'}</Text>
                <Text style={styles.paymentSub}>Payment method</Text>
              </View>
            </View>
          </Section>

          {/* ── Action Buttons ──────────────────────────────────────────────── */}
          {actions.length > 0 && (
            <Section title="Update Status" icon="edit">
              {updating ? (
                <View style={styles.updatingRow}>
                  <ActivityIndicator size="small" color={C.primary} />
                  <Text style={styles.updatingText}>Updating order…</Text>
                </View>
              ) : (
                <View style={styles.actionsGrid}>
                  {actions.map((a) => {
                    const isPrimary = a.next !== 'cancelled';
                    return (
                      <Pressable
                        key={a.next}
                        onPress={() => handleStatusChange(a.next, a.label)}
                        android_ripple={{ color: 'rgba(255,255,255,0.1)' }}
                        style={({ pressed }) => [
                          styles.actionBtn,
                          isPrimary
                            ? { backgroundColor: a.color + '18', borderColor: a.color + '50' }
                            : styles.actionBtnDanger,
                          pressed && { opacity: 0.8 },
                        ]}
                      >
                        <MaterialIcons name={a.icon as any} size={18} color={a.color} />
                        <Text style={[styles.actionBtnText, { color: a.color }]}>{a.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </Section>
          )}

          <View style={{ height: 16 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen:      { flex: 1, backgroundColor: C.bg },
  centered:    { alignItems: 'center', justifyContent: 'center', gap: 12 },
  scrollContent:{ padding: 14, gap: 12 },
  loadingText: { color: C.onBgMuted, fontSize: 14, marginTop: 8 },
  errorText:   { color: C.onBg, fontSize: 15, fontWeight: '600', textAlign: 'center', paddingHorizontal: 32 },
  retryBtn:    { backgroundColor: C.primaryGlow, borderWidth: 1, borderColor: C.borderLight, paddingHorizontal: 28, paddingVertical: 11, borderRadius: 100, marginTop: 4 },
  retryText:   { color: C.primary, fontWeight: '700', fontSize: 14 },

  // Hero
 hero: {
  backgroundColor: C.bgCard,
  borderRadius: 20,
  padding: 20,
  borderWidth: 1,
  borderColor: C.border,
  gap: 16,
  marginBottom: 2,

  shadowColor: '#000',
  shadowOpacity: 0.04,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
},
  heroTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroLabel:      { fontSize: 10, letterSpacing: 2, color: C.onBgMuted, fontWeight: '700', marginBottom: 4 },
  heroOrderNum:   { fontSize: 22, fontWeight: '900', color: C.onBg, letterSpacing: -0.3 },
  heroDate:       { fontSize: 12, color: C.onBgMuted, marginTop: 3 },
  heroBadge:      { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 100, borderWidth: 1 },
  heroBadgeText:  { fontSize: 13, fontWeight: '700' },
  heroTotal:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.bgMuted, borderRadius: 12, padding: 14 },
  heroTotalLabel: { fontSize: 13, color: C.onBgMuted, fontWeight: '600' },
  heroTotalValue: { fontSize: 24, fontWeight: '900', color: C.accent, letterSpacing: -0.5 },

  // Section
section: {
  backgroundColor: C.bgCard,
  borderRadius: 16,
  padding: 16,
  borderWidth: 1,
  borderColor: C.border,
  gap: 12,

  shadowColor: '#000',
  shadowOpacity: 0.03,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
},
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle:  { fontSize: 12, fontWeight: '700', color: C.onBgMuted, letterSpacing: 1, textTransform: 'uppercase' },

  // Cancelled
  cancelledBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.2)' },
  cancelledText:   { color: C.error, fontSize: 14, fontWeight: '600' },

  // Timeline
  timeline:       { gap: 0 },
  timelineRow:    { flexDirection: 'row', gap: 14 },
  timelineTrack:  { alignItems: 'center', width: 20 },
  timelineDot:    { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  timelinePulse:  { width: 8, height: 8, borderRadius: 4 },
  timelineLine:   { width: 2, flex: 1, minHeight: 28, marginTop: 2, marginBottom: 2 },
  timelineContent:{ flex: 1, paddingBottom: 20, paddingTop: 1 },
  timelineLabel:  { fontSize: 14, fontWeight: '700' },
  timelineDesc:   { fontSize: 11, marginTop: 2 },

  // Customer
  customerCard:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  customerAvatar:   { width: 44, height: 44, borderRadius: 22, backgroundColor: C.primaryGlow, borderWidth: 1, borderColor: C.borderLight, alignItems: 'center', justifyContent: 'center' },
  customerAvatarLetter:{ fontSize: 18, fontWeight: '800', color: C.primary },
  customerName:     { fontSize: 15, fontWeight: '700', color: C.onBg },
  infoRow:          { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText:         { fontSize: 13, color: C.onBgMuted },
  addressBox:       { flexDirection: 'row', gap: 6, backgroundColor: C.bgCardHigh, borderRadius: 10, padding: 12 },
  addressText:      { flex: 1, fontSize: 13, color: C.onBgMuted, lineHeight: 18 },

  // Items
  itemsList:      { gap: 0 },
  itemRow:        { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  itemRowBorder:  { borderBottomWidth: 1, borderBottomColor: C.border },
  itemThumb:      { width: 48, height: 48, borderRadius: 10, backgroundColor: C.bgCardHigh, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  itemImage:      { width: 48, height: 48 },
  itemName:       { fontSize: 13, fontWeight: '600', color: C.onBg, lineHeight: 18 },
  itemMeta:       { flexDirection: 'row', alignItems: 'center', gap: 4 },
  itemUnitPrice:  { fontSize: 12, color: C.onBgMuted },
  itemMetaDot:    { fontSize: 12, color: C.onBgMuted },
  itemQty:        { fontSize: 12, color: C.onBgMuted },
  itemTotal:      { fontSize: 15, fontWeight: '800', color: C.onBg },

  priceBreakdown: { backgroundColor: C.bgCardHigh, borderRadius: 12, padding: 14, gap: 8 },
  priceRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel:     { fontSize: 13, color: C.onBgMuted },
  priceValue:     { fontSize: 13, color: C.onBg, fontWeight: '600' },
  priceDivider:   { height: 1, backgroundColor: C.border },
  priceTotalLabel:{ fontSize: 14, color: C.onBg, fontWeight: '700' },
  priceTotalValue:{ fontSize: 18, color: C.accent, fontWeight: '900' },

  // Payment
  paymentRow:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  paymentIcon:  { width: 40, height: 40, borderRadius: 10, backgroundColor: C.primaryGlow, borderWidth: 1, borderColor: C.borderLight, alignItems: 'center', justifyContent: 'center' },
  paymentMethod:{ fontSize: 14, fontWeight: '700', color: C.onBg },
  paymentSub:   { fontSize: 12, color: C.onBgMuted, marginTop: 2 },

  // Actions
  actionsGrid:  { gap: 10 },
  actionBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 12, borderWidth: 1 },
  actionBtnDanger:{ backgroundColor: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.25)' },
  actionBtnText:{ fontSize: 14, fontWeight: '700' },

  updatingRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 10 },
  updatingText: { color: C.onBgMuted, fontSize: 14 },
});

export default OrderDetailScreen;