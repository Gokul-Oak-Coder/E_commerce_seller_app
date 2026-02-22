import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OrdersStackParamList } from '../../../navigation/SellerNavigator';
import { Order, OrderStatus } from '../../../types';
import { COLORS, FONTS, SPACING } from '../../../constants';

type NavigationProp = NativeStackNavigationProp<OrdersStackParamList>;

// Dummy Orders
const DUMMY_ORDERS: Order[] = [
  {
    id: 1, order_number: '#ORD001', customer_name: 'John Doe',
    customer_email: 'john@example.com', status: 'pending', total: 1200,
    items: [{ id: 1, product_id: 1, product_name: 'Blue T-Shirt', quantity: 2, price: 600, image: null }],
    created_at: '2026-02-20T10:00:00Z', updated_at: '2026-02-20T10:00:00Z',
  },
  {
    id: 2, order_number: '#ORD002', customer_name: 'Jane Smith',
    customer_email: 'jane@example.com', status: 'confirmed', total: 850,
    items: [{ id: 2, product_id: 2, product_name: 'Red Sneakers', quantity: 1, price: 850, image: null }],
    created_at: '2026-02-19T14:00:00Z', updated_at: '2026-02-19T14:00:00Z',
  },
  {
    id: 3, order_number: '#ORD003', customer_name: 'Bob Johnson',
    customer_email: 'bob@example.com', status: 'shipped', total: 2100,
    items: [{ id: 3, product_id: 3, product_name: 'Leather Bag', quantity: 1, price: 2100, image: null }],
    created_at: '2026-02-18T09:00:00Z', updated_at: '2026-02-18T09:00:00Z',
  },
  {
    id: 4, order_number: '#ORD004', customer_name: 'Alice Brown',
    customer_email: 'alice@example.com', status: 'delivered', total: 450,
    items: [{ id: 4, product_id: 4, product_name: 'Cotton Cap', quantity: 3, price: 150, image: null }],
    created_at: '2026-02-17T11:00:00Z', updated_at: '2026-02-17T11:00:00Z',
  },
  {
    id: 5, order_number: '#ORD005', customer_name: 'Charlie Wilson',
    customer_email: 'charlie@example.com', status: 'cancelled', total: 750,
    items: [{ id: 5, product_id: 5, product_name: 'Black Jeans', quantity: 1, price: 750, image: null }],
    created_at: '2026-02-16T08:00:00Z', updated_at: '2026-02-16T08:00:00Z',
  },
];

const STATUS_FILTERS: (OrderStatus | 'all')[] = [
  'all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled',
];

const STATUS_COLORS: Record<string, string> = {
  pending: '#FEF3C7',
  confirmed: '#DBEAFE',
  processing: '#EDE9FE',
  shipped: '#E0F2FE',
  delivered: '#D1FAE5',
  cancelled: '#FEE2E2',
};

const OrdersScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  const filtered = filter === 'all'
    ? DUMMY_ORDERS
    : DUMMY_ORDERS.filter((o) => o.status === filter);

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <FlatList
        horizontal
        data={STATUS_FILTERS}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, filter === item && styles.filterChipActive]}
            onPress={() => setFilter(item)}
          >
            <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Orders List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.orderCard}
            onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
          >
            <View style={styles.orderHeader}>
              <Text style={styles.orderNumber}>{item.order_number}</Text>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] }]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>

            <View style={styles.orderBody}>
              <Text style={styles.customerName}>👤 {item.customer_name}</Text>
              <Text style={styles.customerEmail}>{item.customer_email}</Text>
            </View>

            <View style={styles.orderFooter}>
              <Text style={styles.itemCount}>
                {item.items.length} item{item.items.length > 1 ? 's' : ''}
              </Text>
              <Text style={styles.total}>₹{item.total.toLocaleString()}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterList: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 13,
    color: COLORS.gray,
    fontWeight: '500',
  },
  filterTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  list: {
    padding: SPACING.md,
    paddingTop: 0,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    gap: SPACING.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.black,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.black,
    textTransform: 'capitalize',
  },
  orderBody: {
    gap: 2,
  },
  customerName: {
    fontSize: FONTS.regular,
    color: COLORS.black,
    fontWeight: '500',
  },
  customerEmail: {
    fontSize: 12,
    color: COLORS.gray,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: SPACING.sm,
  },
  itemCount: {
    fontSize: 13,
    color: COLORS.gray,
  },
  total: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.primary,
  },
  empty: {
    alignItems: 'center',
    marginTop: 80,
    gap: SPACING.sm,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: FONTS.medium,
    color: COLORS.gray,
  },
});

export default OrdersScreen;