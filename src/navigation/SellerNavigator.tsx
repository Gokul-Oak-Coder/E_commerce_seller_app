import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/seller/DashboardScreen';
import StoreScreen from '../screens/seller/StoreScreen';
import ProductsScreen from '../screens/seller/products/ProductsScreen';
import CreateProductScreen from '../screens/seller/products/CreateProductScreen';
import EditProductScreen from '../screens/seller/products/EditProductScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet, View } from 'react-native';
import { COLORS } from '../constants';

import HomeScreen from '../screens/seller/HomeScreen';
import OrdersScreen from '../screens/seller/orders/OrdersScreen';
import OrderDetailScreen from '../screens/seller/orders/OrderDetailScreen';
import ProfileScreen from '../screens/seller/ProfileScreen';


export type SellerStackParamList = {
  Dashboard: undefined;
  Store: undefined;
  Products: undefined;
  CreateProduct: undefined;
  EditProduct: { productId: number };
};
export type HomeStackParamList = {
  Home: undefined;
};

export type OrdersStackParamList = {
  Orders: undefined;
  OrderDetail: { orderId: number };
};

export type ProductsStackParamList = {
  Products: undefined;
  CreateProduct: undefined;
  EditProduct: { productId: number };
};

export type StoreStackParamList = {
  Store: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
};

const Stack = createNativeStackNavigator<SellerStackParamList>();
// ---------- Individual Stacks ----------
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const OrdersStack = createNativeStackNavigator<OrdersStackParamList>();
const ProductsStack = createNativeStackNavigator<ProductsStackParamList>();
const StoreStack = createNativeStackNavigator<StoreStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const screenOptions = {
  headerStyle: { backgroundColor: COLORS.white },
  headerTintColor: COLORS.black,
  headerTitleStyle: { fontWeight: '600' as const },
  headerShadowVisible: false,
};

const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={screenOptions}>
    <HomeStack.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard' }} />
  </HomeStack.Navigator>
);

const OrdersStackNavigator = () => (
  <OrdersStack.Navigator screenOptions={screenOptions}>
    <OrdersStack.Screen name="Orders" component={OrdersScreen} options={{ title: 'Orders' }} />
    <OrdersStack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order Detail' }} />
  </OrdersStack.Navigator>
);

const ProductsStackNavigator = () => (
  <ProductsStack.Navigator screenOptions={screenOptions}>
    <ProductsStack.Screen name="Products" component={ProductsScreen} options={{ title: 'My Products' }} />
    <ProductsStack.Screen name="CreateProduct" component={CreateProductScreen} options={{ title: 'Create Product' }} />
    <ProductsStack.Screen name="EditProduct" component={EditProductScreen} options={{ title: 'Edit Product' }} />
  </ProductsStack.Navigator>
);

const StoreStackNavigator = () => (
  <StoreStack.Navigator screenOptions={screenOptions}>
    <StoreStack.Screen name="Store" component={StoreScreen} options={{ title: 'My Store' }} />
  </StoreStack.Navigator>
);

const ProfileStackNavigator = () => (
  <ProfileStack.Navigator screenOptions={screenOptions}>
    <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
  </ProfileStack.Navigator>
);

// ---------- Tab Icon ----------
const TabIcon = ({ icon, label, focused }: { icon: string; label: string; focused: boolean }) => (
  <View style={styles.tabItem}>
    <Text style={styles.tabIcon}>{icon}</Text>
    <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
  </View>
);

// ---------- Bottom Tab ----------
const Tab = createBottomTabNavigator();


const SellerNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏠" label="Home" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📋" label="Orders" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ProductsTab"
        component={ProductsStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📦" label="Products" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="StoreTab"
        component={StoreStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏪" label="Store" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="👤" label="Profile" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    height: 70,
    paddingBottom: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabIcon: {
    fontSize: 22,
  },
  tabLabel: {
    fontSize: 11,
    color: COLORS.gray,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});

export default SellerNavigator;