import { CustomerInfo } from 'react-native-purchases';
import { ENTITLEMENT_ID } from '@/lib/revenuecat';

export interface EntitlementStatus {
  isPro: boolean;
  hasUnlimitedScans: boolean;
  canSaveHistory: boolean;
  canUseCustomPercentages: boolean;
  canUseFolders: boolean;
  expirationDate: Date | null;
  willRenew: boolean;
  productIdentifier: string | null;
}

export const getEntitlementStatus = (customerInfo: CustomerInfo | null): EntitlementStatus => {
  if (!customerInfo) {
    return {
      isPro: false,
      hasUnlimitedScans: false,
      canSaveHistory: false,
      canUseCustomPercentages: false,
      canUseFolders: false,
      expirationDate: null,
      willRenew: false,
      productIdentifier: null,
    };
  }

  const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
  const isPro = entitlement !== undefined && entitlement !== null;

  return {
    isPro,
    hasUnlimitedScans: isPro,
    canSaveHistory: isPro,
    canUseCustomPercentages: isPro,
    canUseFolders: isPro,
    expirationDate: entitlement?.expirationDate ? new Date(entitlement.expirationDate) : null,
    willRenew: entitlement?.willRenew ?? false,
    productIdentifier: entitlement?.productIdentifier ?? null,
  };
};

export const checkFeatureAccess = (
  customerInfo: CustomerInfo | null,
  feature: 'scan' | 'history' | 'custom_percent' | 'folder'
): boolean => {
  const status = getEntitlementStatus(customerInfo);

  switch (feature) {
    case 'scan':
      return status.hasUnlimitedScans;
    case 'history':
      return status.canSaveHistory;
    case 'custom_percent':
      return status.canUseCustomPercentages;
    case 'folder':
      return status.canUseFolders;
    default:
      return false;
  }
};

export const getSubscriptionType = (customerInfo: CustomerInfo | null): 'monthly' | 'yearly' | 'none' => {
  if (!customerInfo) return 'none';

  const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
  if (!entitlement) return 'none';

  const productId = entitlement.productIdentifier?.toLowerCase() ?? '';

  if (productId.includes('monthly')) return 'monthly';
  if (productId.includes('yearly') || productId.includes('annual')) return 'yearly';

  return 'none';
};

export const isSubscriptionActive = (customerInfo: CustomerInfo | null): boolean => {
  if (!customerInfo) return false;

  const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
  return entitlement !== undefined && entitlement !== null;
};
