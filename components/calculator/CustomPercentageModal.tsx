import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { Colors } from '@/constants/Colors';

interface CustomPercentageModalProps {
  visible: boolean;
  tradePercent: number;
  cashPercent: number;
  onClose: () => void;
  onSave: (tradePercent: number, cashPercent: number) => void;
  onClear: () => void;
  hasCustomPercentages: boolean;
}

export const CustomPercentageModal = ({
  visible,
  tradePercent,
  cashPercent,
  onClose,
  onSave,
  onClear,
  hasCustomPercentages,
}: CustomPercentageModalProps) => {
  const [localTrade, setLocalTrade] = useState(tradePercent.toString());
  const [localCash, setLocalCash] = useState(cashPercent.toString());

  useEffect(() => {
    if (visible) {
      setLocalTrade(tradePercent.toString());
      setLocalCash(cashPercent.toString());
    }
  }, [visible, tradePercent, cashPercent]);

  const handleSave = () => {
    const trade = parseFloat(localTrade) || 0;
    const cash = parseFloat(localCash) || 0;

    if (trade >= 0 && trade <= 100 && cash >= 0 && cash <= 100) {
      onSave(trade, cash);
    }
  };

  const handleClear = () => {
    onClear();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.modal}>
            <Text style={styles.title}>Custom Percentages</Text>
            <Text style={styles.subtitle}>Set custom percentages for this item</Text>

            <View style={styles.inputSection}>
              <Text style={styles.label}>Trade %</Text>
              <TextInput
                style={styles.input}
                value={localTrade}
                onChangeText={setLocalTrade}
                keyboardType="decimal-pad"
                placeholder="90"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>Cash %</Text>
              <TextInput
                style={styles.input}
                value={localCash}
                onChangeText={setLocalCash}
                keyboardType="decimal-pad"
                placeholder="80"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              {hasCustomPercentages && (
                <TouchableOpacity
                  style={[styles.button, styles.clearButton]}
                  onPress={handleClear}
                  activeOpacity={0.7}
                >
                  <Text style={styles.clearButtonText}>Reset</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                activeOpacity={0.7}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
  },
  scrollContent: {
    justifyContent: 'flex-end',
    flexGrow: 1,
  },
  modal: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.cardBackground,
    color: Colors.text,
    fontSize: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  clearButtonText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
