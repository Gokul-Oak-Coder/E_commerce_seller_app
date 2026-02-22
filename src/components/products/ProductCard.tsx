import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Product } from '../../types';
import { getImageUrl } from '../../utils';
import { COLORS, FONTS, SPACING } from '../../constants';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onDelete: () => void;
}

const ProductCard = ({ product, onPress, onDelete }: ProductCardProps) => {
  const primaryImage = product.images?.[0];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Image */}
      <View style={styles.imageContainer}>
        {primaryImage ? (
          <Image
            source={{ uri: getImageUrl(primaryImage.image_path) || '' }}
            style={styles.image}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderIcon}>📦</Text>
          </View>
        )}
        {/* Active badge */}
        <View style={[styles.badge, product.is_active ? styles.activeBadge : styles.inactiveBadge]}>
          <Text style={styles.badgeText}>
            {product.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.sku}>SKU: {product.sku}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{product.price}</Text>
          {product.discount_price && (
            <Text style={styles.discountPrice}>₹{product.discount_price}</Text>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.stock}>Stock: {product.stock}</Text>
          <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 40,
  },
  badge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
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
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.black,
  },
  info: {
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  name: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.black,
  },
  sku: {
    fontSize: 12,
    color: COLORS.gray,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  price: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.primary,
  },
  discountPrice: {
    fontSize: FONTS.regular,
    color: COLORS.gray,
    textDecorationLine: 'line-through',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  stock: {
    fontSize: FONTS.regular,
    color: COLORS.gray,
  },
  deleteButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  deleteText: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ProductCard;