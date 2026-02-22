import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import SellerNavigator from './SellerNavigator';
import { useAuthStore } from '../store/authStore';
import Loader from '../components/common/Loader';

const RootNavigator = () => {
  const { isAuthenticated, loadAuth } = useAuthStore();
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const init = async () => {
      await loadAuth();
      setLoading(false);
    };
    init();
  }, []);

  if (loading) return <Loader />;

  return (
    <NavigationContainer>
      {isAuthenticated ? <SellerNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;