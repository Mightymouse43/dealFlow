import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform } from 'react-native';
import { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import {
  initializeRevenueCat,
  identifyUser,
  logoutUser,
  getCustomerInfo,
  getOfferings,
  purchasePackage as purchasePackageLib,
  restorePurchases as restorePurchasesLib,
  Purchases,
} from '@/lib/revenuecat';
import { getEntitlementStatus, EntitlementStatus } from '@/utils/entitlements';

interface RevenueCatContextType {
  customerInfo: CustomerInfo | null;
  entitlements: EntitlementStatus;
  offerings: any;
  loading: boolean;
  isInitialized: boolean;
  refreshCustomerInfo: () => Promise<void>;
  purchasePackage: (packageToPurchase: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  identifyUser: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const RevenueCatContext = createContext<RevenueCatContextType>({
  customerInfo: null,
  entitlements: {
    isPro: false,
    hasUnlimitedScans: false,
    canSaveHistory: false,
    canUseCustomPercentages: false,
    canUseFolders: false,
    expirationDate: null,
    willRenew: false,
    productIdentifier: null,
  },
  offerings: null,
  loading: true,
  isInitialized: false,
  refreshCustomerInfo: async () => {},
  purchasePackage: async () => false,
  restorePurchases: async () => false,
  identifyUser: async () => {},
  logout: async () => {},
});

export const useRevenueCat = () => {
  const context = useContext(RevenueCatContext);
  if (!context) {
    throw new Error('useRevenueCat must be used within a RevenueCatProvider');
  }
  return context;
};

interface RevenueCatProviderProps {
  children: ReactNode;
}

export const RevenueCatProvider = ({ children }: RevenueCatProviderProps) => {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const entitlements = getEntitlementStatus(customerInfo);

  const initialize = async () => {
    if (Platform.OS === 'web') {
      setLoading(false);
      setIsInitialized(false);
      return;
    }

    try {
      await initializeRevenueCat();
      setIsInitialized(true);

      const info = await getCustomerInfo();
      setCustomerInfo(info);

      const availableOfferings = await getOfferings();
      setOfferings(availableOfferings);
    } catch (error) {
      console.error('Error initializing RevenueCat:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (!isInitialized || Platform.OS === 'web') return;

    try {
      Purchases.addCustomerInfoUpdateListener((info) => {
        console.log('Customer info updated:', info);
        setCustomerInfo(info);
      });
    } catch (error) {
      console.error('Error setting up customer info listener:', error);
    }
  }, [isInitialized]);

  const refreshCustomerInfo = async () => {
    if (Platform.OS === 'web') return;

    try {
      const info = await getCustomerInfo();
      setCustomerInfo(info);
    } catch (error) {
      console.error('Error refreshing customer info:', error);
    }
  };

  const purchasePackage = async (packageToPurchase: PurchasesPackage): Promise<boolean> => {
    if (Platform.OS === 'web') {
      console.error('Purchases not available on web');
      return false;
    }

    try {
      const info = await purchasePackageLib(packageToPurchase);
      if (info) {
        setCustomerInfo(info);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error purchasing package:', error);
      return false;
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      console.error('Restore not available on web');
      return false;
    }

    try {
      const info = await restorePurchasesLib();
      setCustomerInfo(info);
      return true;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return false;
    }
  };

  const identifyUserHandler = async (userId: string) => {
    if (Platform.OS === 'web') return;

    try {
      await identifyUser(userId);
      await refreshCustomerInfo();
    } catch (error) {
      console.error('Error identifying user:', error);
    }
  };

  const logout = async () => {
    if (Platform.OS === 'web') return;

    try {
      await logoutUser();
      setCustomerInfo(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <RevenueCatContext.Provider
      value={{
        customerInfo,
        entitlements,
        offerings,
        loading,
        isInitialized,
        refreshCustomerInfo,
        purchasePackage,
        restorePurchases,
        identifyUser: identifyUserHandler,
        logout,
      }}
    >
      {children}
    </RevenueCatContext.Provider>
  );
};
