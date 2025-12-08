import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Linking, Alert, Platform } from 'react-native';
import { useState } from 'react';
import { Colors } from '@/constants/Colors';
import { Star, CheckCircle2, X } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRevenueCat } from '@/contexts/RevenueCatContext';
import { RevenueCatPaywall } from '@/components/subscription/RevenueCatPaywall';

interface ProUpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  feature?: 'scan' | 'history' | 'custom_percent' | 'folder';
  scansRemaining?: number;
  isPro?: boolean;
}

export const ProUpgradeModal = ({ visible, onClose, feature = 'scan', scansRemaining = 0, isPro = false }: ProUpgradeModalProps) => {
  const { activateFreeTrial, isOnTrial } = useAuth();
  const { restorePurchases: restoreRevenueCatPurchases } = useRevenueCat();
  const [activatingTrial, setActivatingTrial] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [showPaywall, setShowPaywall] = useState(false);

  const handleUpgrade = () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Not Available',
        'Subscriptions are not available on web. Please use the iOS or Android app.',
        [{ text: 'OK' }]
      );
      return;
    }
    setShowPaywall(true);
  };

  const handleRestorePurchases = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Not Available',
        'Restore purchases is not available on web. Please use the iOS or Android app.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const success = await restoreRevenueCatPurchases();
      if (success) {
        Alert.alert(
          'Success',
          'Your purchases have been restored!',
          [{ text: 'Great!', onPress: onClose }]
        );
      } else {
        Alert.alert(
          'No Purchases Found',
          'We could not find any previous purchases to restore.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to restore purchases. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleStartTrial = async () => {
    setActivatingTrial(true);
    try {
      const result = await activateFreeTrial();

      if (result.success) {
        Alert.alert(
          'Trial Activated!',
          '�� You now have 7 days of PRO access with all premium features!',
          [{ text: 'Start Using PRO', onPress: onClose }]
        );
      } else {
        Alert.alert(
          'Trial Unavailable',
          result.message,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to activate trial. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setActivatingTrial(false);
    }
  };

  const getFeatureMessage = () => {
    switch (feature) {
      case 'scan':
        return `You have ${scansRemaining} scan${scansRemaining === 1 ? '' : 's'} remaining today. Upgrade to PRO for unlimited scans!`;
      case 'history':
        return 'Upgrade to PRO to save and manage your trade history!';
      case 'custom_percent':
        return 'Upgrade to PRO to customize percentages for individual items!';
      case 'folder':
        return 'Upgrade to PRO to create and organize trades in custom folders!';
      default:
        return 'Upgrade to PRO to unlock all features!';
    }
  };

  const openTerms = () => {
    Linking.openURL('https://example.com/terms');
  };

  const openPrivacy = () => {
    Linking.openURL('https://example.com/privacy');
  };

  if (isPro) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <X color={Colors.textSecondary} size={24} />
              </TouchableOpacity>

              <View style={styles.header}>
                <Star color={Colors.secondary} size={32} fill={Colors.secondary} />
                <Text style={styles.title}>You're a PRO Dealer</Text>
                <Text style={styles.featureMessage}>
                  You have access to all premium features
                </Text>
              </View>

              <View style={styles.featuresContainer}>
                <View style={styles.featureItem}>
                  <CheckCircle2 color={Colors.primary} size={24} fill={Colors.primary} />
                  <Text style={styles.featureText}>Unlimited scans</Text>
                </View>

                <View style={styles.featureItem}>
                  <CheckCircle2 color={Colors.primary} size={24} fill={Colors.primary} />
                  <Text style={styles.featureText}>Individual item price %</Text>
                </View>

                <View style={styles.featureItem}>
                  <CheckCircle2 color={Colors.primary} size={24} fill={Colors.primary} />
                  <Text style={styles.featureText}>Save trades and store them in folders</Text>
                </View>
              </View>

              <View style={styles.subscriptionBox}>
                <Text style={styles.subscriptionTitle}>Current Subscription:</Text>

                <View style={styles.detailsContainer}>
                  <Text style={styles.detailText}>• Monthly PRO subscription</Text>
                  <Text style={styles.detailText}>
                    • Subscription automatically renews unless canceled 24 hours before period ends
                  </Text>
                </View>
              </View>

              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Close</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={handleUpgrade}
                  activeOpacity={0.7}
                >
                  <Text style={styles.upgradeButtonText}>Upgrade to Yearly Subscription</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X color={Colors.textSecondary} size={24} />
            </TouchableOpacity>

            <View style={styles.header}>
              <Star color={Colors.secondary} size={32} fill={Colors.secondary} />
              <Text style={styles.title}>Upgrade to Pro</Text>
              <Text style={styles.featureMessage}>{getFeatureMessage()}</Text>
            </View>

            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <CheckCircle2 color={Colors.primary} size={24} fill={Colors.primary} />
                <Text style={styles.featureText}>Unlimited AI card scanning</Text>
              </View>

              <View style={styles.featureItem}>
                <CheckCircle2 color={Colors.primary} size={24} fill={Colors.primary} />
                <Text style={styles.featureText}>Save your trade history</Text>
              </View>

              <View style={styles.featureItem}>
                <CheckCircle2 color={Colors.primary} size={24} fill={Colors.primary} />
                <Text style={styles.featureText}>Change % on any individual item</Text>
              </View>
            </View>

            <View style={styles.pricingContainer}>
              <Text style={styles.subscriptionTitle}>Choose Your Plan:</Text>

              <View style={styles.pricingOptions}>
                <TouchableOpacity
                  style={[
                    styles.pricingOption,
                    selectedPlan === 'monthly' && styles.pricingOptionSelected,
                  ]}
                  onPress={() => setSelectedPlan('monthly')}
                  activeOpacity={0.7}
                >
                  <View style={styles.pricingOptionHeader}>
                    <Text style={styles.pricingOptionTitle}>Monthly</Text>
                    <View style={styles.radioButton}>
                      {selectedPlan === 'monthly' && <View style={styles.radioButtonInner} />}
                    </View>
                  </View>
                  <Text style={styles.pricingOptionPrice}>$4.99/month</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.pricingOption,
                    selectedPlan === 'yearly' && styles.pricingOptionSelected,
                  ]}
                  onPress={() => setSelectedPlan('yearly')}
                  activeOpacity={0.7}
                >
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsBadgeText}>SAVE 30%</Text>
                  </View>
                  <View style={styles.pricingOptionHeader}>
                    <Text style={styles.pricingOptionTitle}>Yearly</Text>
                    <View style={styles.radioButton}>
                      {selectedPlan === 'yearly' && <View style={styles.radioButtonInner} />}
                    </View>
                  </View>
                  <Text style={styles.pricingOptionPrice}>$42/year</Text>
                  <Text style={styles.pricingOptionDetails}>$3.50/month</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.subscriptionBox}>
              <View style={styles.detailsContainer}>
                <Text style={styles.detailText}>
                  • Subscription automatically renews unless canceled 24 hours before period ends
                </Text>
                <Text style={styles.detailText}>
                  • By placing this order, you agree to the Terms of Service and Privacy Policy
                </Text>
              </View>

              <View style={styles.linksContainer}>
                <TouchableOpacity onPress={openTerms}>
                  <Text style={styles.link}>Terms of Use</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={openPrivacy}>
                  <Text style={styles.link}>Privacy Policy</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[styles.upgradeButton, activatingTrial && styles.upgradeButtonDisabled]}
                onPress={handleStartTrial}
                activeOpacity={0.7}
                disabled={activatingTrial}
              >
                <Text style={styles.upgradeButtonText}>
                  {activatingTrial ? 'Activating...' : 'Start 7 Day FREE Trial'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.upgradeNowButton}
                onPress={handleUpgrade}
                activeOpacity={0.7}
              >
                <Text style={styles.upgradeNowButtonText}>
                  Subscribe - {selectedPlan === 'monthly' ? '$4.99/mo' : '$42/year'}
                </Text>
              </TouchableOpacity>

              <View style={styles.secondaryButtonsRow}>
                <TouchableOpacity
                  style={styles.restorePurchasesButton}
                  onPress={handleRestorePurchases}
                  activeOpacity={0.7}
                >
                  <Text style={styles.restorePurchasesText}>Restore Purchases</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
      <RevenueCatPaywall
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchaseSuccess={onClose}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  scrollContent: {
    padding: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 12,
  },
  featureMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  featuresContainer: {
    marginBottom: 24,
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  subscriptionBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  detailsContainer: {
    gap: 8,
    marginBottom: 16,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  linksContainer: {
    gap: 8,
  },
  link: {
    fontSize: 14,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  pricingContainer: {
    marginBottom: 20,
  },
  pricingOptions: {
    gap: 12,
    marginTop: 12,
  },
  pricingOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    position: 'relative',
  },
  pricingOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  pricingOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pricingOptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  pricingOptionPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  pricingOptionDetails: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  savingsBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  savingsBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.background,
  },
  buttonsContainer: {
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  upgradeButtonsColumn: {
    gap: 8,
  },
  upgradeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeButtonDisabled: {
    opacity: 0.6,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  upgradeNowButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeNowButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.background,
    textAlign: 'center',
  },
  secondaryButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  restorePurchasesButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restorePurchasesText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
});
