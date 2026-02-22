import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useProducts } from '../../../hooks/useProducts';
import ProductCard from '../../../components/products/ProductCard';
import Loader from '../../../components/common/Loader';
import ErrorText from '../../../components/common/ErrorText';
import { SellerStackParamList } from '/Users/apple/E-CommerceSellerApp/src/navigation/SellerNavigator';
import { COLORS, FONTS, SPACING } from '../../../constants';

type NavigationProp = NativeStackNavigationProp<SellerStackParamList>;

const ProductsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { products, loading, error, fetchProducts, deleteProduct } = useProducts();

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteProduct(id);
          },
        },
      ]
    );
  };

  if (loading && products.length === 0) return <Loader />;

  return (
    <View style={styles.container}>
      {error && <ErrorText message={error} />}

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigation.navigate('EditProduct', { productId: item.id })}
            onDelete={() => handleDelete(item.id, item.name)}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>No products yet</Text>
            <Text style={styles.emptySubText}>Tap + to add your first product</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateProduct')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: SPACING.lg,
    paddingBottom: 100,
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
    fontSize: FONTS.large,
    fontWeight: '700',
    color: COLORS.black,
  },
  emptySubText: {
    fontSize: FONTS.regular,
    color: COLORS.gray,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '300',
  },
});

export default ProductsScreen;