import { Modal, View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { X, Save, User, LogOut, Crown } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SettingsModalProps {
  visible: boolean;
  currentTradePercent: number;
  currentCashPercent: number;
  onClose: () => void;
  onSave: (tradePercent: number, cashPercent: number) => void;
}

export const SettingsModal = ({
  visible,
  currentTradePercent,
  currentCashPercent,
  onClose,
  onSave,
}: SettingsModalProps) => {
  const [tradePercent, setTradePercent] = useState(currentTradePercent.toString());
  const [cashPercent, setCashPercent] = useState(currentCashPercent.toString());

  useEffect(() => {
    setTradePercent(currentTradePercent.toString());
    setCashPercent(currentCashPercent.toString());
  }, [currentTradePercent, currentCashPercent, visible]);

  const handleTradePercentChange = (text: string) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    setTradePercent(cleanText);
  };

  const handleCashPercentChange = (text: string) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    setCashPercent(cleanText);
  };

  const handleSave = () => {
    const trade = Math.min(100, Math.max(0, parseInt(tradePercent) || 0));
    const cash = Math.min(100, Math.max(0, parseInt(cashPercent) || 0));
    onSave(trade, cash);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modal}>
            <View style={styles.header}>
              <Text style={styles.title}>Settings</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <X color={Colors.text} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <ProfileSection />

              <View style={styles.content}>
                <Text style={styles.sectionTitle}>Default Percentages</Text>
                <Text style={styles.description}>
                  Set your default trade and cash percentages. These will be applied automatically when you open the app.
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Trade Percentage</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={tradePercent}
                      onChangeText={handleTradePercentChange}
                      keyboardType="number-pad"
                      placeholder="90"
                      placeholderTextColor={Colors.textSecondary}
                      maxLength={3}
                    />
                    <Text style={styles.inputSuffix}>%</Text>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Cash Percentage</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={cashPercent}
                      onChangeText={handleCashPercentChange}
                      keyboardType="number-pad"
                      placeholder="80"
                      placeholderTextColor={Colors.textSecondary}
                      maxLength={3}
                    />
                    <Text style={styles.inputSuffix}>%</Text>
                  </View>
                </View>
              </View>

              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                  activeOpacity={0.8}
                >
                  <Save color={Colors.background} size={20} />
                  <Text style={styles.saveButtonText}>Save Settings</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scrollView: {
    maxHeight: 500,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingRight: 16,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputSuffix: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  footer: {
    padding: 24,
    paddingTop: 0,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: Colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileSection: {
    padding: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  profileIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    gap: 6,
  },
  profileEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  tierText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tierTextPro: {
    color: '#FFD700',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.error,
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.error,
  },
});

function ProfileSection() {
  const { user, profile, isPro, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  if (!user || !profile) return null;

  return (
    <View style={styles.profileSection}>
      <View style={styles.profileHeader}>
        <View style={styles.profileIconContainer}>
          <User color={Colors.background} size={24} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileEmail}>{profile.email}</Text>
          <View style={styles.tierBadge}>
            {isPro && <Crown color="#FFD700" size={14} />}
            <Text style={[styles.tierText, isPro && styles.tierTextPro]}>
              {isPro ? 'PRO' : 'Free'}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleSignOut}
        activeOpacity={0.7}
      >
        <LogOut color={Colors.error} size={18} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}
