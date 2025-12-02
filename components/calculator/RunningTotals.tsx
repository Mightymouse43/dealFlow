import { View, Text, StyleSheet } from 'react-native';
import { CalculatedTotals } from '@/types/calculator';
import { Colors } from '@/constants/Colors';

interface RunningTotalsProps {
  totals: CalculatedTotals;
}

export const RunningTotals = ({ totals }: RunningTotalsProps) => {
  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.totalRow}>
        <Text style={styles.label}>Item Total:</Text>
        <Text style={styles.itemTotal}>{formatCurrency(totals.itemTotal)}</Text>
      </View>
      <View style={styles.totalRow}>
        <Text style={styles.label}>Trade Total:</Text>
        <Text style={styles.tradeTotal}>{formatCurrency(totals.tradeTotal)}</Text>
      </View>
      <View style={styles.totalRow}>
        <Text style={styles.label}>Cash Total:</Text>
        <Text style={styles.cashTotal}>{formatCurrency(totals.cashTotal)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 18,
    color: Colors.text,
    fontWeight: '500',
  },
  itemTotal: {
    fontSize: 28,
    color: Colors.text,
    fontWeight: 'bold',
  },
  tradeTotal: {
    fontSize: 28,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  cashTotal: {
    fontSize: 28,
    color: Colors.primary,
    fontWeight: 'bold',
  },
});
