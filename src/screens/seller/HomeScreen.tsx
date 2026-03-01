import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useStore } from '../../hooks/useStore';
import { useAuthStore } from '../../store/authStore';
import Loader from '../../components/common/Loader';
import { COLORS, FONTS, SPACING } from '../../constants';
import { sellerOrderService } from '/Users/apple/E-CommerceSellerApp/src/services/sellerOrderService';
import { productService } from '../../services/productService';
import { SellerOrder, Product } from '../../types';

const { width } = Dimensions.get('window');

const STATUS_COLORS: Record<string, string> = {
  pending: '#FEF3C7',
  confirmed: '#DBEAFE',
  processing: '#EDE9FE',
  shipped: '#E0F2FE',
  delivered: '#D1FAE5',
  cancelled: '#FEE2E2',
};

const HomeScreen = () => {
  const { user } = useAuthStore();
  const { store, fetchStore, loading } = useStore();

  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [screenLoading, setScreenLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setScreenLoading(true);
      await fetchStore();

      const [ordersRes, productsRes] = await Promise.all([
        sellerOrderService.getOrders(),
        productService.getProducts(),
      ]);

      setOrders(ordersRes.data);
      setProducts(productsRes);
    } catch (error) {
      console.log('Dashboard load error:', error);
    } finally {
      setScreenLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totalOrders = orders.length;
const pendingOrders = orders.filter(o => ['placed', 'confirmed', 'processing'].includes(o.status)).length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.subtotal, 0);
    const totalProducts = products.length;

    return {
      totalOrders,
      pendingOrders,
      totalRevenue,
      totalProducts,
    };
  }, [orders, products]);

  const weeklyGraph = useMemo(() => {
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const revenueByDay = Array(7).fill(0);

    orders.forEach(order => {
      const date = new Date(order.created_at);
      const day = date.getDay();
      revenueByDay[day] += order.subtotal;
    });

    return {
      labels: days,
      datasets: [{ data: revenueByDay }],
    };
  }, [orders]);

  const recentOrders = orders.slice(0, 5);

  if ((loading && !store) || screenLoading) return <Loader />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      {/* Welcome */}
      <View style={styles.welcomeCard}>
        <View>
          <Text style={styles.welcomeText}>👋 Welcome back,</Text>
          <Text style={styles.userName}>{user?.name ?? 'Seller'}</Text>
        </View>
        <View style={[styles.badge, store?.is_active ? styles.activeBadge : styles.inactiveBadge]}>
          <Text style={styles.badgeText}>
            {store?.is_active ? '● Active' : '● Inactive'}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.statsGrid}>
        <StatCard icon="📋" label="Total Orders" value={stats.totalOrders} color={COLORS.primary}/>
        <StatCard icon="⏳" label="Pending" value={stats.pendingOrders} color="#F59E0B"/>
        <StatCard icon="💰" label="Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} color={COLORS.success}/>
        <StatCard icon="📦" label="Products" value={stats.totalProducts} color="#8B5CF6"/>
      </View>

      {/* Graph */}
      <Text style={styles.sectionTitle}>Sales This Week</Text>
      <View style={styles.chartCard}>
        <LineChart
          data={weeklyGraph}
          width={width - SPACING.lg * 2 - SPACING.md * 2}
          height={200}
          yAxisLabel="₹"
          chartConfig={{
            backgroundColor: COLORS.white,
            backgroundGradientFrom: COLORS.white,
            backgroundGradientTo: COLORS.white,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(108, 71, 255, ${opacity})`,
            labelColor: () => COLORS.gray,
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Recent Orders */}
      <Text style={styles.sectionTitle}>Recent Orders</Text>
      <View style={styles.recentOrders}>
        {recentOrders.map((order) => (
          <View key={order.id} style={styles.recentOrderRow}>
            <View>
              <Text style={styles.orderNumber}>#{order.order_number}</Text>
              <Text style={styles.customerName}>{order.customer_name}</Text>
            </View>
            <View style={styles.recentOrderRight}>
              <Text style={styles.orderAmount}>₹{order.subtotal}</Text>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[order.status] }]}>
                <Text style={styles.statusText}>{order.status}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const StatCard = ({ icon, label, value, color }: any) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  welcomeCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FONTS.regular,
  },
  userName: {
    color: COLORS.white,
    fontSize: FONTS.xl,
    fontWeight: '700',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  activeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  inactiveBadge: {
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    width: (width - SPACING.lg * 2 - SPACING.md) / 2,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: FONTS.xl,
    fontWeight: '700',
    color: COLORS.black,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  chartCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  chart: {
    borderRadius: 10,
  },
  recentOrders: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    gap: SPACING.md,
  },
  recentOrderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  orderNumber: {
    fontSize: FONTS.regular,
    fontWeight: '700',
    color: COLORS.black,
  },
  customerName: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  recentOrderRight: {
    alignItems: 'flex-end',
    gap: SPACING.xs,
  },
  orderAmount: {
    fontSize: FONTS.regular,
    fontWeight: '700',
    color: COLORS.black,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.black,
    textTransform: 'capitalize',
  },
  pending: { backgroundColor: '#FEF3C7' },
  confirmed: { backgroundColor: '#DBEAFE' },
  processing: { backgroundColor: '#EDE9FE' },
  shipped: { backgroundColor: '#E0F2FE' },
  delivered: { backgroundColor: '#D1FAE5' },
  cancelled: { backgroundColor: '#FEE2E2' },
});

export default HomeScreen;