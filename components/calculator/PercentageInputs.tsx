import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface PercentageInputsProps {
  tradePercent: number;
  cashPercent: number;
  onTradePercentChange: (value: number) => void;
  onCashPercentChange: (value: number) => void;
}

export const PercentageInputs = ({
  tradePercent,
  cashPercent,
  onTradePercentChange,
  onCashPercentChange,
}: PercentageInputsProps) => {
  const handleTradeChange = (text: string) => {
    const value = parseFloat(text) || 0;
    onTradePercentChange(value);
  };

  const handleCashChange = (text: string) => {
    const value = parseFloat(text) || 0;
    onCashPercentChange(value);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Trade %</Text>
        <TextInput
          style={styles.input}
          value={tradePercent.toString()}
          onChangeText={handleTradeChange}
          keyboardType="numeric"
          maxLength={3}
          placeholder="90"
          placeholderTextColor={Colors.textSecondary}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Cash %</Text>
        <TextInput
          style={styles.input}
          value={cashPercent.toString()}
          onChangeText={handleCashChange}
          keyboardType="numeric"
          maxLength={3}
          placeholder="80"
          placeholderTextColor={Colors.textSecondary}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: Colors.cardBackground,
    color: Colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    textAlign: 'center',
  },
});
