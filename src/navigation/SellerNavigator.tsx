import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet, View, Animated, Platform, Pressable } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

import StoreScreen from '../screens/seller/StoreScreen';
import ProductsScreen from '../screens/seller/products/ProductsScreen';
import CreateProductScreen from '../screens/seller/products/CreateProductScreen';
import EditProductScreen from '../screens/seller/products/EditProductScreen';
import HomeScreen from '../screens/seller/HomeScreen';
import OrdersScreen from '../screens/seller/orders/OrdersScreen';
import OrderDetailScreen from '../screens/seller/orders/OrderDetailScreen';
import ProfileScreen from '../screens/seller/ProfileScreen';

// ─── Cyan M3 Tokens ──────────────────────────────────────────────────────────
const M3 = {
  // Backgrounds
  surface:            '#F0FDFD',   // very light cyan tint
  surfaceContainer:   '#E0F7FA',   // cyan-50 equivalent

  // Text
  onSurface:          '#002B2B',   // deep cyan-black
  onSurfaceVariant:   '#4A7072',   // muted cyan-grey

  // Primary — cyan
  primary:            '#00838F',   // cyan-700
  onPrimary:          '#FFFFFF',
  primaryContainer:   '#B2EBF2',   // cyan-100
  onPrimaryContainer: '#00363B',   // very dark cyan
};

// ─── Route Types ──────────────────────────────────────────────────────────────
// Kept for screens that import SellerStackParamList directly (e.g. DashboardScreen)
export type SellerStackParamList = {
  Dashboard: undefined;
  Store: undefined;
  Products: undefined;
  CreateProduct: undefined;
  EditProduct: { productId: number };
};

export type HomeStackParamList     = { Home: undefined };
export type OrdersStackParamList   = { Orders: undefined; OrderDetail: { orderId: number } };
export type ProductsStackParamList = { Products: undefined; CreateProduct: undefined; EditProduct: { productId: number } };
export type StoreStackParamList    = { Store: undefined };
export type ProfileStackParamList  = { Profile: undefined };

// ─── Shared header style ──────────────────────────────────────────────────────
const stackScreenOptions = {
  headerStyle: { backgroundColor: M3.surface },
  headerTintColor: M3.primary,
  headerTitleStyle: { fontWeight: '600' as const, fontSize: 20 },
  headerShadowVisible: false,
};

// ─── Stack Navigators ─────────────────────────────────────────────────────────
const HomeStack     = createNativeStackNavigator<HomeStackParamList>();
const OrdersStack   = createNativeStackNavigator<OrdersStackParamList>();
const ProductsStack = createNativeStackNavigator<ProductsStackParamList>();
const StoreStack    = createNativeStackNavigator<StoreStackParamList>();
const ProfileStack  = createNativeStackNavigator<ProfileStackParamList>();

const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={stackScreenOptions}>
    <HomeStack.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard' }} />
  </HomeStack.Navigator>
);

const OrdersStackNavigator = () => (
  <OrdersStack.Navigator screenOptions={stackScreenOptions}>
    <OrdersStack.Screen name="Orders" component={OrdersScreen} options={{ title: 'Orders' }} />
    <OrdersStack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order Detail' }} />
  </OrdersStack.Navigator>
);

const ProductsStackNavigator = () => (
  <ProductsStack.Navigator screenOptions={stackScreenOptions}>
    <ProductsStack.Screen name="Products" component={ProductsScreen} options={{ title: 'My Products' }} />
    <ProductsStack.Screen name="CreateProduct" component={CreateProductScreen} options={{ title: 'Create Product' }} />
    <ProductsStack.Screen name="EditProduct" component={EditProductScreen} options={{ title: 'Edit Product' }} />
  </ProductsStack.Navigator>
);

const StoreStackNavigator = () => (
  <StoreStack.Navigator screenOptions={stackScreenOptions}>
    <StoreStack.Screen name="Store" component={StoreScreen} options={{ title: 'My Store' }} />
  </StoreStack.Navigator>
);

const ProfileStackNavigator = () => (
  <ProfileStack.Navigator screenOptions={stackScreenOptions}>
    <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
  </ProfileStack.Navigator>
);

// ─── M3 Pill Indicator + Icon ─────────────────────────────────────────────────
// Only renders the icon + pill. Label is handled natively by tabBarLabel.
interface PillIconProps {
  focused: boolean;
  badge?: number;
  renderIcon: (color: string, size: number) => React.ReactNode;
  renderActiveIcon: (color: string, size: number) => React.ReactNode;
}

const PillIcon = ({ focused, badge, renderIcon, renderActiveIcon }: PillIconProps) => {
  const scaleX  = React.useRef(new Animated.Value(focused ? 1 : 0.3)).current;
  const opacity = React.useRef(new Animated.Value(focused ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleX, {
        toValue: focused ? 1 : 0.3,
        useNativeDriver: true,
        damping: 18,
        stiffness: 240,
      }),
      Animated.timing(opacity, {
        toValue: focused ? 1 : 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  const iconColor = focused ? M3.onPrimaryContainer : M3.onSurfaceVariant;

  return (
    <View style={styles.pillIconContainer}>
      {/* Animated pill behind icon */}
      <Animated.View
        style={[styles.pill, { opacity, transform: [{ scaleX }] }]}
      />
      {/* Icon rendered on top */}
      <View style={styles.iconWrapper}>
        {focused
          ? renderActiveIcon(iconColor, 22)
          : renderIcon(iconColor, 22)}
      </View>
      {/* Badge */}
      {!!badge && badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 99 ? '99+' : String(badge)}</Text>
        </View>
      )}
    </View>
  );
};

// ─── Bottom Tab ───────────────────────────────────────────────────────────────
const Tab = createBottomTabNavigator();

const SellerNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarHideOnKeyboard: true,
      tabBarShowLabel: true,
      tabBarIconStyle: styles.tabBarIconStyle,
      tabBarLabelStyle: styles.tabBarLabelStyle,
      tabBarActiveTintColor: M3.onSurface,
      tabBarInactiveTintColor: M3.onSurfaceVariant,
      tabBarItemStyle: styles.tabBarItemStyle,
      tabBarButton: ({ children, onPress, onLongPress, style }) => (
        <Pressable
          onPress={onPress}
          onLongPress={onLongPress}
          android_ripple={null}
          style={[style as any, { opacity: 1 }]}
        >
          {children}
        </Pressable>
      ),
    }}
  >
    <Tab.Screen
      name="HomeTab"
      component={HomeStackNavigator}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ focused }) => (
          <PillIcon
            focused={focused}
            renderIcon={(color, size) => <MaterialIcons name="home-filled" size={size} color={color} />}
            renderActiveIcon={(color, size) => <MaterialIcons name="home-filled" size={size} color={color} />}
          />
        ),
      }}
    />

    <Tab.Screen
      name="OrdersTab"
      component={OrdersStackNavigator}
      options={{
        tabBarLabel: 'Orders',
        tabBarIcon: ({ focused }) => (
          <PillIcon
            focused={focused}
            badge={3}
            renderIcon={(color, size) => <MaterialCommunityIcons name="clipboard-text-outline" size={size} color={color} />}
            renderActiveIcon={(color, size) => <MaterialCommunityIcons name="clipboard-text" size={size} color={color} />}
          />
        ),
      }}
    />

    <Tab.Screen
      name="ProductsTab"
      component={ProductsStackNavigator}
      options={{
        tabBarLabel: 'Products',
        tabBarIcon: ({ focused }) => (
          <PillIcon
            focused={focused}
            renderIcon={(color, size) => <MaterialCommunityIcons name="package-variant-closed" size={size} color={color} />}
            renderActiveIcon={(color, size) => <MaterialCommunityIcons name="package-variant-closed-check" size={size} color={color} />}
          />
        ),
      }}
    />

    <Tab.Screen
      name="StoreTab"
      component={StoreStackNavigator}
      options={{
        tabBarLabel: 'Store',
        tabBarIcon: ({ focused }) => (
          <PillIcon
            focused={focused}
            renderIcon={(color, size) => <MaterialIcons name="storefront" size={size} color={color} />}
            renderActiveIcon={(color, size) => <MaterialIcons name="storefront" size={size} color={color} />}
          />
        ),
      }}
    />

    <Tab.Screen
      name="ProfileTab"
      component={ProfileStackNavigator}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ focused }) => (
          <PillIcon
            focused={focused}
            renderIcon={(color, size) => <MaterialIcons name="person-outline" size={size} color={color} />}
            renderActiveIcon={(color, size) => <MaterialIcons name="person" size={size} color={color} />}
          />
        ),
      }}
    />
  </Tab.Navigator>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: M3.surfaceContainer,
    borderTopWidth: 0,
    height: Platform.OS === 'ios' ? 84 : 68,
    paddingBottom: Platform.OS === 'ios' ? 16 : 4,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 8,
  },
  tabBarItemStyle: {
    paddingVertical: 0,
    gap: 2,
  },
  tabBarIconStyle: {
    // Let icon take only what it needs
    flex: 0,
    height: 34,
  },
  tabBarLabelStyle: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.3,
    marginTop: 0,
  },

  // PillIcon internals
  pillIconContainer: {
    width: 56,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    position: 'absolute',
    width: 56,
    height: 32,
    borderRadius: 16,
    backgroundColor: M3.primaryContainer,
  },
  iconWrapper: {
    zIndex: 1,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: M3.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    zIndex: 2,
  },
  badgeText: {
    color: M3.onPrimary,
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 12,
  },
});

export default SellerNavigator;