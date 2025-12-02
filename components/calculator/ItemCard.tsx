import { View, TextInput, TouchableOpacity, StyleSheet, Text, Pressable } from 'react-native';
import { Trash2, Percent } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { CardItem } from '@/types/calculator';
import { useState } from 'react';
import { CustomPercentageModal } from './CustomPercentageModal';

interface ItemCardProps {
  item: CardItem;
  onPriceChange: (id: string, price: number) => void;
  onNameChange: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onUpdatePercentages: (id: string, tradePercent?: number, cashPercent?: number) => void;
  globalTradePercent: number;
  globalCashPercent: number;
}

export const ItemCard = ({ item, onPriceChange, onNameChange, onDelete, onUpdatePercentages, globalTradePercent, globalCashPercent }: ItemCardProps) => {
  const [showModal, setShowModal] = useState(false);

  const hasCustomPercentages = item.customTradePercent !== undefined || item.customCashPercent !== undefined;
  const currentTradePercent = item.customTradePercent ?? globalTradePercent;
  const currentCashPercent = item.customCashPercent ?? globalCashPercent;
  const handlePriceChange = (text: string) => {
    // Remove any non-numeric characters except decimal point
    let cleanText = text.replace(/[^0-9.]/g, '');

    // Ensure only one decimal point
    const parts = cleanText.split('.');
    if (parts.length > 2) {
      cleanText = parts[0] + '.' + parts.slice(1).join('');
    }

    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      cleanText = parts[0] + '.' + parts[1].substring(0, 2);
    }

    const price = parseFloat(cleanText) || 0;
    onPriceChange(item.id, price);
  };

  const handleNameChange = (text: string) => {
    onNameChange(item.id, text);
  };

  const formatDisplayValue = () => {
    if (item.price === 0) return '';
    return item.price.toString();
  };

  const handleSavePercentages = (tradePercent: number, cashPercent: number) => {
    onUpdatePercentages(item.id, tradePercent, cashPercent);
    setShowModal(false);
  };

  const handleClearPercentages = () => {
    onUpdatePercentages(item.id, undefined, undefined);
    setShowModal(false);
  };

  return (
    <>
      <Pressable
        style={styles.container}
        onLongPress={() => setShowModal(true)}
        delayLongPress={500}
      >
        {hasCustomPercentages && (
          <View style={styles.badge}>
            <Percent color={Colors.background} size={12} />
            <Text style={styles.badgeText}>Custom</Text>
          </View>
        )}
        <View style={styles.content}>
          <TextInput
            style={styles.nameInput}
            value={item.cardName || ''}
            onChangeText={handleNameChange}
            placeholder="Item name (optional)"
            placeholderTextColor={Colors.textSecondary}
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={formatDisplayValue()}
              onChangeText={handlePriceChange}
              keyboardType="decimal-pad"
              placeholder="$0.00"
              placeholderTextColor={Colors.textSecondary}
            />
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(item.id)}
          activeOpacity={0.7}
        >
          <Trash2 color={Colors.error} size={24} />
        </TouchableOpacity>
      </Pressable>

      <CustomPercentageModal
        visible={showModal}
        tradePercent={currentTradePercent}
        cashPercent={currentCashPercent}
        onClose={() => setShowModal(false)}
        onSave={handleSavePercentages}
        onClear={handleClearPercentages}
        hasCustomPercentages={hasCustomPercentages}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  content: {
    flex: 1,
  },
  nameInput: {
    backgroundColor: Colors.background,
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    backgroundColor: Colors.background,
    color: Colors.text,
    fontSize: 32,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  deleteButton: {
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    zIndex: 10,
  },
  badgeText: {
    color: Colors.background,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
