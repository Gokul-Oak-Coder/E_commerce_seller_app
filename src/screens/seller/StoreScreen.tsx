import React, { useEffect, useState } from 'react';
import { getImageUrl } from '../../utils';
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
import { useStore } from '../../hooks/useStore';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ErrorText from '../../components/common/ErrorText';
import Loader from '../../components/common/Loader';
import { COLORS, FONTS, SPACING } from '../../constants';

const StoreScreen = () => {
  const { store, loading, error, fetchStore, createStore, updateStore } = useStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  // Populate form if store exists
  useEffect(() => {
    if (store) {
      setName(store.name ?? '');
      setDescription(store.description ?? '');
      setPhone(store.phone ?? '');
      setAddress(store.address ?? '');
    }
  }, [store]);

  useEffect(() => {
    fetchStore();
  }, []);

  const pickImage = async (type: 'logo' | 'banner') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      aspect: type === 'logo' ? [1, 1] : [16, 9],
    });

    if (!result.canceled) {
      if (type === 'logo') setLogo(result.assets[0].uri);
      else setBanner(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Store name is required');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('phone', phone);
    formData.append('address', address);

    if (logo && !logo.startsWith('http')) {
      const filename = logo.split('/').pop()!;
      const ext = filename.split('.').pop();
      formData.append('logo', {
        uri: logo,
        name: filename,
        type: `image/${ext}`,
      } as any);
    }

    if (banner && !banner.startsWith('http')) {
      const filename = banner.split('/').pop()!;
      const ext = filename.split('.').pop();
      formData.append('banner', {
        uri: banner,
        name: filename,
        type: `image/${ext}`,
      } as any);
    }

    let success = false;
    if (store) {
      success = await updateStore(store.id, formData);
    } else {
      success = await createStore(formData);
    }

    if (success) {
      Alert.alert('Success', store ? 'Store updated!' : 'Store created!');
    }
  };

  if (loading && !store) return <Loader />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {error && <ErrorText message={error} />}

      {/* Banner */}
      <TouchableOpacity
        style={styles.bannerContainer}
        onPress={() => pickImage('banner')}
      >
        {banner || store?.banner ? (
          <Image
            source={{ uri: banner || getImageUrl(store?.banner!) || ''}}
            style={styles.bannerImage}
          />
        ) : (
          <View style={styles.bannerPlaceholder}>
            <Text style={styles.placeholderIcon}>🖼️</Text>
            <Text style={styles.placeholderText}>Tap to upload banner</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Logo */}
      <View style={styles.logoWrapper}>
        <TouchableOpacity
          style={styles.logoContainer}
          onPress={() => pickImage('logo')}
        >
          {logo || store?.logo ? (
            <Image
              source={{ uri: logo || getImageUrl(store?.logo!)||'' }}
              style={styles.logoImage}
            />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.placeholderIcon}>🏪</Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.logoHint}>Tap to change logo</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Input
          label="Store Name *"
          placeholder="My Awesome Store"
          value={name}
          onChangeText={setName}
        />
        <Input
          label="Description"
          placeholder="Tell customers about your store"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={styles.textarea}
        />
        <Input
          label="Phone"
          placeholder="+1 234 567 8900"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <Input
          label="Address"
          placeholder="123 Main St, City"
          value={address}
          onChangeText={setAddress}
        />

        <Button
          title={store ? 'Update Store' : 'Create Store'}
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
  bannerContainer: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.lightGray,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  placeholderIcon: {
    fontSize: 32,
  },
  placeholderText: {
    color: COLORS.gray,
    fontSize: FONTS.regular,
  },
  logoWrapper: {
    alignItems: 'center',
    marginTop: -40,
    marginBottom: SPACING.md,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: COLORS.white,
    overflow: 'hidden',
    backgroundColor: COLORS.lightGray,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  logoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoHint: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: SPACING.xs,
  },
  form: {
    padding: SPACING.lg,
  },
  textarea: {
    height: 80,
    textAlignVertical: 'top',
  },
});

export default StoreScreen;