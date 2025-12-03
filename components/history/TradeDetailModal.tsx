import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { SavedTrade } from '@/types/calculator';

interface TradeDetailModalProps {
  visible: boolean;
  trade: SavedTrade | null;
  onClose: () => void;
}

export const TradeDetailModal = ({
  visible,
  trade,
  onClose,
}: TradeDetailModalProps) => {
  if (!trade) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modal}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Trade Details</Text>
              <Text style={styles.date}>{formatDate(trade.date)}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X color={Colors.text} size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.infoSection}>
            {trade.customerName && (
              <View style={styles.infoItem}>
                <Text style={styles.label}>Customer</Text>
                <Text style={styles.customerName}>{trade.customerName}</Text>
              </View>
            )}
            <View style={styles.infoItem}>
              <Text style={styles.label}>Transaction Type</Text>
              <View style={[
                styles.transactionTypeBadge,
                trade.transactionType === 'cash' ? styles.cashBadge : styles.tradeBadge
              ]}>
                <Text style={[
                  styles.transactionTypeText,
                  trade.transactionType === 'cash' ? styles.cashText : styles.tradeText
                ]}>
                  {trade.transactionType === 'cash' ? 'Cash' : 'Trade'}
                </Text>
              </View>
            </View>
          </View>

          <ScrollView style={styles.scrollView}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Items ({trade.items.length})</Text>
              {trade.items.map((item, index) => (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemNumber}>#{index + 1}</Text>
                    {item.cardName && (
                      <Text style={styles.itemName}>{item.cardName}</Text>
                    )}
                  </View>
                  <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
                  {(item.customTradePercent !== undefined || item.customCashPercent !== undefined) && (
                    <View style={styles.customBadge}>
                      <Text style={styles.customBadgeText}>Custom %</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Totals</Text>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Item Total</Text>
                <Text style={styles.totalValue}>{formatCurrency(trade.totals.itemTotal)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Trade Value ({trade.tradePercent}%)</Text>
                <Text style={[styles.totalValue, styles.tradeValue]}>
                  {formatCurrency(trade.totals.tradeTotal)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Cash Value ({trade.cashPercent}%)</Text>
                <Text style={styles.totalValue}>{formatCurrency(trade.totals.cashTotal)}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '85%',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  closeButton: {
    padding: 4,
  },
  infoSection: {
    padding: 24,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 16,
  },
  infoItem: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  transactionTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  tradeBadge: {
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
  },
  cashBadge: {
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
  },
  transactionTypeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tradeText: {
    color: Colors.primary,
  },
  cashText: {
    color: Colors.secondary,
  },
  scrollView: {
    flex: 1,
    flexGrow: 1,
  },
  section: {
    padding: 24,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  itemNumber: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  itemName: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
    flex: 1,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  customBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  customBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.background,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  totalLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  tradeValue: {
    color: Colors.primary,
  },
});
