import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { OrdersStackParamList } from '../../../navigation/SellerNavigator';
import { Order, OrderStatus } from '../../../types';
import { COLORS, FONTS, SPACING } from '../../../constants';

type OrderDetailRouteProp = RouteProp<OrdersStackParamList, 'OrderDetail'>;

// Same dummy data
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

const STATUS_FLOW: OrderStatus[] = [
  'pending', 'confirmed', 'processing', 'shipped', 'delivered',
];

const STATUS_COLORS: Record<string, string> = {
  pending: '#FEF3C7',
  confirmed: '#DBEAFE',
  processing: '#EDE9FE',
  shipped: '#E0F2FE',
  delivered: '#D1FAE5',
  cancelled: '#FEE2E2',
};

const OrderDetailScreen = () => {
  const route = useRoute<OrderDetailRouteProp>();
  const { orderId } = route.params;

  const found = DUMMY_ORDERS.find((o) => o.id === orderId);
  const [order, setOrder] = useState<Order | undefined>(found);

  if (!order) {
    return (
      <View style={styles.center}>
        <Text>Order not found</Text>
      </View>
    );
  }

  const currentIndex = STATUS_FLOW.indexOf(order.status as OrderStatus);

  const handleUpdateStatus = (newStatus: OrderStatus) => {
    Alert.alert(
      'Update Status',
      `Change order status to "${newStatus}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: () => {
            // When real API is ready replace this with API call
            setOrder({ ...order, status: newStatus });
            Alert.alert('Success', `Order status updated to ${newStatus}`);
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            setOrder({ ...order, status: 'cancelled' });
            Alert.alert('Order cancelled');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Order Header */}
      <View style={styles.card}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderNumber}>{order.order_number}</Text>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[order.status] }]}>
            <Text style={styles.statusText}>{order.status}</Text>
          </View>
        </View>
        <Text style={styles.date}>
          {new Date(order.created_at).toDateString()}
        </Text>
      </View>

      {/* Customer Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Customer</Text>
        <Text style={styles.customerName}>{order.customer_name}</Text>
        <Text style={styles.customerEmail}>{order.customer_email}</Text>
      </View>

      {/* Order Items */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Items</Text>
        {order.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.product_name}</Text>
              <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>
              ₹{(item.price * item.quantity).toLocaleString()}
            </Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{order.total.toLocaleString()}</Text>
        </View>
      </View>

      {/* Status Timeline */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Status Timeline</Text>
        <View style={styles.timeline}>
          {STATUS_FLOW.map((status, index) => {
            const isDone = index <= currentIndex;
            const isCurrent = index === currentIndex;
            return (
              <View key={status} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={[
                    styles.timelineDot,
                    isDone && styles.timelineDotDone,
                    isCurrent && styles.timelineDotCurrent,
                  ]} />
                  {index < STATUS_FLOW.length - 1 && (
                    <View style={[styles.timelineLine, isDone && styles.timelineLineDone]} />
                  )}
                </View>
                <Text style={[
                  styles.timelineLabel,
                  isDone && styles.timelineLabelDone,
                  isCurrent && styles.timelineLabelCurrent,
                ]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Actions */}
      {order.status !== 'delivered' && order.status !== 'cancelled' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Update Status</Text>
          <View style={styles.actionsGrid}>
            {STATUS_FLOW.filter((s) => STATUS_FLOW.indexOf(s) > currentIndex).map((status) => (
              <TouchableOpacity
                key={status}
                style={styles.actionButton}
                onPress={() => handleUpdateStatus(status)}
              >
                <Text style={styles.actionButtonText}>
                  Mark as {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    gap: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    gap: SPACING.sm,
  },
  cardTitle: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: FONTS.large,
    fontWeight: '700',
    color: COLORS.black,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.black,
    textTransform: 'capitalize',
  },
  date: {
    fontSize: 13,
    color: COLORS.gray,
  },
  customerName: {
    fontSize: FONTS.medium,
    fontWeight: '600',
    color: COLORS.black,
  },
  customerEmail: {
    fontSize: 13,
    color: COLORS.gray,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  itemInfo: {
    gap: 2,
  },
  itemName: {
    fontSize: FONTS.regular,
    fontWeight: '500',
    color: COLORS.black,
  },
  itemQty: {
    fontSize: 12,
    color: COLORS.gray,
  },
  itemPrice: {
    fontSize: FONTS.regular,
    fontWeight: '700',
    color: COLORS.black,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.sm,
  },
  totalLabel: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.black,
  },
  totalValue: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.primary,
  },
  timeline: {
    gap: 0,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 16,
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.lightGray,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  timelineDotDone: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timelineDotCurrent: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  timelineLine: {
    width: 2,
    height: 28,
    backgroundColor: COLORS.lightGray,
  },
  timelineLineDone: {
    backgroundColor: COLORS.primary,
  },
  timelineLabel: {
    fontSize: FONTS.regular,
    color: COLORS.gray,
    paddingTop: 0,
    lineHeight: 16,
  },
  timelineLabelDone: {
    color: COLORS.black,
    fontWeight: '500',
  },
  timelineLabelCurrent: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  actionsGrid: {
    gap: SPACING.sm,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: FONTS.regular,
  },
  cancelButton: {
    padding: SPACING.md,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  cancelButtonText: {
    color: COLORS.error,
    fontWeight: '600',
    fontSize: FONTS.regular,
  },
});

export default OrderDetailScreen;