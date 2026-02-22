import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useStore } from '../../hooks/useStore';
import { COLORS, FONTS, SPACING } from '../../constants';

const ProfileRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <View style={styles.profileRow}>
    <Text style={styles.rowIcon}>{icon}</Text>
    <View style={styles.rowInfo}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  </View>
);

const ProfileScreen = () => {
  const { user, logout, loading } = useAuth();
  const { store } = useStore();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() ?? 'S'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.role}>Seller</Text>
      </View>

      {/* Account Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account Info</Text>
        <ProfileRow icon="👤" label="Name" value={user?.name ?? '-'} />
        <ProfileRow icon="📧" label="Email" value={user?.email ?? '-'} />
        <ProfileRow icon="🔑" label="Role" value={user?.role ?? '-'} />
      </View>

      {/* Store Info */}
      {store && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Store Info</Text>
          <ProfileRow icon="🏪" label="Store Name" value={store.name} />
          <ProfileRow icon="📍" label="Address" value={store.address ?? 'Not set'} />
          <ProfileRow icon="📞" label="Phone" value={store.phone ?? 'Not set'} />
          <ProfileRow
            icon="✅"
            label="Status"
            value={store.is_active ? 'Active' : 'Inactive'}
          />
        </View>
      )}

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={logout}
        disabled={loading}
      >
        <Text style={styles.logoutText}>
          {loading ? 'Logging out...' : '🚪 Logout'}
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
    gap: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: '700',
  },
  name: {
    fontSize: FONTS.xl,
    fontWeight: '700',
    color: COLORS.black,
  },
  role: {
    fontSize: FONTS.regular,
    color: COLORS.gray,
    textTransform: 'capitalize',
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
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  rowIcon: {
    fontSize: 20,
  },
  rowInfo: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: 12,
    color: COLORS.gray,
  },
  rowValue: {
    fontSize: FONTS.regular,
    color: COLORS.black,
    fontWeight: '500',
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

export default ProfileScreen;