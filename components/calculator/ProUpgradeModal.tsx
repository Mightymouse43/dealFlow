import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { useState } from 'react';
import { Colors } from '@/constants/Colors';
import { Star, CheckCircle2, X } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

interface ProUpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  feature?: 'scan' | 'history' | 'custom_percent' | 'folder';
  scansRemaining?: number;
  isPro?: boolean;
}

export const ProUpgradeModal = ({ visible, onClose, feature = 'scan', scansRemaining = 0, isPro = false }: ProUpgradeModalProps) => {
  const { activateFreeTrial, isOnTrial } = useAuth();
  const [activatingTrial, setActivatingTrial] = useState(false);

  const handleUpgrade = () => {
    console.log('Upgrade to Pro/Yearly clicked');
    onClose();
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

            <View style={styles.subscriptionBox}>
              <Text style={styles.subscriptionTitle}>Subscription Details:</Text>

              <View style={styles.detailsContainer}>
                <Text style={styles.detailText}>• Price: $3.99 USD per month</Text>
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
                style={styles.cancelButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <View style={styles.upgradeButtonsColumn}>
                <TouchableOpacity
                  style={[styles.upgradeButton, activatingTrial && styles.upgradeButtonDisabled]}
                  onPress={handleStartTrial}
                  activeOpacity={0.7}
                  disabled={activatingTrial}
                >
                  <Text style={styles.upgradeButtonText}>
                    {activatingTrial ? 'Activating...' : '7 Day FREE Trial'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.upgradeNowButton}
                  onPress={handleUpgrade}
                  activeOpacity={0.7}
                >
                  <Text style={styles.upgradeNowButtonText}>Upgrade Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
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
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.secondary,
  },
  upgradeButtonsColumn: {
    flex: 2,
    gap: 8,
  },
  upgradeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeButtonDisabled: {
    opacity: 0.6,
  },
  upgradeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  upgradeNowButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeNowButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.background,
    textAlign: 'center',
  },
});
