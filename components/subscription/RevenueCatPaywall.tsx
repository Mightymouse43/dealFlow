import { useEffect, useState } from 'react';
import { Platform, Alert } from 'react-native';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { useRevenueCat } from '@/contexts/RevenueCatContext';

interface RevenueCatPaywallProps {
  visible: boolean;
  onClose: () => void;
  onPurchaseSuccess?: () => void;
  onPurchaseError?: (error: Error) => void;
}

export const RevenueCatPaywall = ({
  visible,
  onClose,
  onPurchaseSuccess,
  onPurchaseError,
}: RevenueCatPaywallProps) => {
  const { refreshCustomerInfo } = useRevenueCat();
  const [isPresenting, setIsPresenting] = useState(false);

  useEffect(() => {
    if (visible && !isPresenting && Platform.OS !== 'web') {
      presentPaywall();
    }
  }, [visible]);

  const presentPaywall = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Not Available',
        'Subscriptions are not available on web. Please use the iOS or Android app.',
        [{ text: 'OK', onPress: onClose }]
      );
      return;
    }

    setIsPresenting(true);

    try {
      const paywallResult = await RevenueCatUI.presentPaywall();

      console.log('Paywall result:', paywallResult);

      switch (paywallResult) {
        case PAYWALL_RESULT.PURCHASED:
        case PAYWALL_RESULT.RESTORED:
          await refreshCustomerInfo();
          onPurchaseSuccess?.();
          Alert.alert(
            'Success!',
            'Welcome to DealFlow Pro! You now have access to all premium features.',
            [{ text: 'Great!', onPress: onClose }]
          );
          break;

        case PAYWALL_RESULT.CANCELLED:
          console.log('User cancelled paywall');
          onClose();
          break;

        case PAYWALL_RESULT.ERROR:
          console.error('Paywall error');
          onPurchaseError?.(new Error('Purchase failed'));
          Alert.alert(
            'Error',
            'Something went wrong. Please try again.',
            [{ text: 'OK', onPress: onClose }]
          );
          break;

        default:
          onClose();
      }
    } catch (error: any) {
      console.error('Error presenting paywall:', error);
      onPurchaseError?.(error);
      Alert.alert(
        'Error',
        error.message || 'Failed to load subscription options.',
        [{ text: 'OK', onPress: onClose }]
      );
    } finally {
      setIsPresenting(false);
    }
  };

  return null;
};

export const presentPaywallIfNeeded = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    Alert.alert(
      'Not Available',
      'Subscriptions are not available on web. Please use the iOS or Android app.'
    );
    return false;
  }

  try {
    const paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: 'DealFlow Pro',
    });

    console.log('Paywall if needed result:', paywallResult);

    return paywallResult === PAYWALL_RESULT.PURCHASED || paywallResult === PAYWALL_RESULT.RESTORED;
  } catch (error) {
    console.error('Error presenting paywall if needed:', error);
    return false;
  }
};
