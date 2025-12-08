import Purchases, { LOG_LEVEL, PurchasesPackage } from 'react-native-purchases';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const REVENUECAT_API_KEY = 'test_WLrwIsuIizfIaLtpgdNerHerauT';

export const ENTITLEMENT_ID = 'DealFlow Pro';

export const initializeRevenueCat = async () => {
  try {
    if (Platform.OS === 'web') {
      console.log('RevenueCat is not available on web');
      return;
    }

    Purchases.setLogLevel(LOG_LEVEL.DEBUG);

    await Purchases.configure({
      apiKey: REVENUECAT_API_KEY,
    });

    console.log('RevenueCat initialized successfully');
  } catch (error) {
    console.error('Error initializing RevenueCat:', error);
    throw error;
  }
};

export const identifyUser = async (userId: string) => {
  try {
    if (Platform.OS === 'web') {
      return;
    }

    await Purchases.logIn(userId);
    console.log('User identified in RevenueCat:', userId);
  } catch (error) {
    console.error('Error identifying user in RevenueCat:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    if (Platform.OS === 'web') {
      return;
    }

    await Purchases.logOut();
    console.log('User logged out from RevenueCat');
  } catch (error) {
    console.error('Error logging out from RevenueCat:', error);
    throw error;
  }
};

export const getCustomerInfo = async () => {
  try {
    if (Platform.OS === 'web') {
      return null;
    }

    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('Error getting customer info:', error);
    return null;
  }
};

export const checkEntitlement = async (entitlementId: string = ENTITLEMENT_ID) => {
  try {
    if (Platform.OS === 'web') {
      return false;
    }

    const customerInfo = await Purchases.getCustomerInfo();
    const entitlement = customerInfo.entitlements.active[entitlementId];

    return entitlement !== undefined && entitlement !== null;
  } catch (error) {
    console.error('Error checking entitlement:', error);
    return false;
  }
};

export const getOfferings = async () => {
  try {
    if (Platform.OS === 'web') {
      return null;
    }

    const offerings = await Purchases.getOfferings();
    return offerings;
  } catch (error) {
    console.error('Error getting offerings:', error);
    return null;
  }
};

export const purchasePackage = async (packageToPurchase: PurchasesPackage) => {
  try {
    if (Platform.OS === 'web') {
      throw new Error('Purchases not available on web');
    }

    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    return customerInfo;
  } catch (error: any) {
    if (error.userCancelled) {
      console.log('User cancelled the purchase');
      return null;
    }
    console.error('Error purchasing package:', error);
    throw error;
  }
};

export const restorePurchases = async () => {
  try {
    if (Platform.OS === 'web') {
      throw new Error('Restore not available on web');
    }

    const customerInfo = await Purchases.restorePurchases();
    return customerInfo;
  } catch (error) {
    console.error('Error restoring purchases:', error);
    throw error;
  }
};

export { Purchases };
