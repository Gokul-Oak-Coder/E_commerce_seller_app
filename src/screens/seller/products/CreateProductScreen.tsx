import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useProducts } from '../../../hooks/useProducts';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import ErrorText from '../../../components/common/ErrorText';
import { COLORS, FONTS, SPACING } from '../../../constants';

const CreateProductScreen = () => {
  const navigation = useNavigation();
  const { createProduct, loading, error } = useProducts();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stock, setStock] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      orderedSelection: true,
    });

    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...uris]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name.trim() || !sku.trim() || !price || !stock) {
      Alert.alert('Validation', 'Name, SKU, Price and Stock are required');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('sku', sku);
    formData.append('price', price);
    formData.append('stock', stock);
    if (discountPrice) formData.append('discount_price', discountPrice);

    images.forEach((uri, index) => {
      const filename = uri.split('/').pop()!;
      const ext = filename.split('.').pop();
      formData.append(`images[${index}]`, {
        uri,
        name: filename,
        type: `image/${ext}`,
      } as any);
    });

    const success = await createProduct(formData);
    if (success) {
      Alert.alert('Success', 'Product created!', [
        { text: 'OK', onPress: async () => {navigation.goBack(), await fetchProduct(); }},
        
      ]);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {error && <ErrorText message={error} />}

      {/* Image Picker */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Product Images</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.imagesRow}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImage}
                  onPress={() => removeImage(index)}
                >
                  <Text style={styles.removeImageText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={styles.addImage} onPress={pickImages}>
              <Text style={styles.addImageIcon}>+</Text>
              <Text style={styles.addImageText}>Add</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Input
          label="Product Name *"
          placeholder="e.g. Blue T-Shirt"
          value={name}
          onChangeText={setName}
        />
        <Input
          label="Description"
          placeholder="Describe your product"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={styles.textarea}
        />
        <Input
          label="SKU *"
          placeholder="e.g. TSHIRT-BLUE-M"
          value={sku}
          onChangeText={setSku}
          autoCapitalize="characters"
        />

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Input
              label="Price *"
              placeholder="0.00"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.rowItem}>
            <Input
              label="Discount Price"
              placeholder="0.00"
              value={discountPrice}
              onChangeText={setDiscountPrice}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <Input
          label="Stock *"
          placeholder="0"
          value={stock}
          onChangeText={setStock}
          keyboardType="number-pad"
        />

        <Button
          title="Create Product"
          onPress={handleSubmit}
          loading={loading}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: SPACING.xl,
  },
  section: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: SPACING.md,
  },
  imagesRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 10,
  },
  removeImage: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: COLORS.error,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  addImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  addImageIcon: {
    fontSize: 24,
    color: COLORS.gray,
  },
  addImageText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  form: {
    padding: SPACING.lg,
  },
  textarea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  rowItem: {
    flex: 1,
  },
});

export default CreateProductScreen;

function fetchProduct() {
  throw new Error('Function not implemented.');
}
