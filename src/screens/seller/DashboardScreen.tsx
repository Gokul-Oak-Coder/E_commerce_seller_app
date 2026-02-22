import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../hooks/useAuth';
import { useStore } from '../../hooks/useStore';
import { SellerStackParamList } from '../../navigation/SellerNavigator';
import Loader from '../../components/common/Loader';
import { COLORS, FONTS, SPACING } from '../../constants';

type NavigationProp = NativeStackNavigationProp<SellerStackParamList>;

const DashboardScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, logout, loading: authLoading } = useAuth();
  const { store, fetchStore, loading: storeLoading } = useStore();

  useEffect(() => {
    fetchStore();
  }, []);

  if (storeLoading) return <Loader />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Welcome */}
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeText}>👋 Welcome back,</Text>
        <Text style={styles.userName}>{user?.name ?? 'Seller'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Store Status */}
      <View style={styles.statusCard}>
        <Text style={styles.sectionTitle}>Store Status</Text>
        {store ? (
          <View style={styles.storeInfo}>
            <View style={styles.statusRow}>
              <Text style={styles.storeName}>{store.name}</Text>
              <View style={[styles.badge, store.is_active ? styles.activeBadge : styles.inactiveBadge]}>
                <Text style={styles.badgeText}>
                  {store.is_active ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
            {store.address && (
              <Text style={styles.storeDetail}>📍 {store.address}</Text>
            )}
            {store.phone && (
              <Text style={styles.storeDetail}>📞 {store.phone}</Text>
            )}
          </View>
        ) : (
          <View style={styles.noStore}>
            <Text style={styles.noStoreText}>You don't have a store yet.</Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Store')}
        >
          <Text style={styles.actionIcon}>🏪</Text>
          <Text style={styles.actionLabel}>My Store</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Products')}
        >
          <Text style={styles.actionIcon}>📦</Text>
          <Text style={styles.actionLabel}>Products</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('CreateProduct')}
        >
          <Text style={styles.actionIcon}>➕</Text>
          <Text style={styles.actionLabel}>Add Product</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={logout}
        disabled={authLoading}
      >
        <Text style={styles.logoutText}>
          {authLoading ? 'Logging out...' : 'Logout'}
        </Text>
      </TouchableOpacity>
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
  },
  welcomeCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FONTS.regular,
  },
  userName: {
    color: COLORS.white,
    fontSize: FONTS.xl,
    fontWeight: '700',
    marginTop: SPACING.xs,
  },
  email: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginTop: 2,
  },
  statusCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: SPACING.md,
  },
  storeInfo: {
    gap: SPACING.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storeName: {
    fontSize: FONTS.medium,
    fontWeight: '600',
    color: COLORS.black,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: 20,
  },
  activeBadge: {
    backgroundColor: '#D1FAE5',
  },
  inactiveBadge: {
    backgroundColor: '#FEE2E2',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.black,
  },
  storeDetail: {
    fontSize: FONTS.regular,
    color: COLORS.gray,
  },
  noStore: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  noStoreText: {
    color: COLORS.gray,
    fontSize: FONTS.regular,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.black,
    textAlign: 'center',
  },
  logoutButton: {
    padding: SPACING.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.error,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  logoutText: {
    color: COLORS.error,
    fontWeight: '600',
    fontSize: FONTS.regular,
  },
});

export default DashboardScreen;