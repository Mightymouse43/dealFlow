import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Plus } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { CardItem } from '@/types/calculator';
import { ItemCard } from './ItemCard';

interface ItemListProps {
  items: CardItem[];
  onAddItem: () => void;
  onPriceChange: (id: string, price: number) => void;
  onNameChange: (id: string, name: string) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  onUpdatePercentages: (id: string, tradePercent?: number, cashPercent?: number) => void;
  globalTradePercent: number;
  globalCashPercent: number;
  onSaveTrade: () => void;
  onOpenScan?: () => void;
  isPro?: boolean;
}

export const ItemList = ({
  items,
  onAddItem,
  onPriceChange,
  onNameChange,
  onDeleteItem,
  onClearAll,
  onUpdatePercentages,
  globalTradePercent,
  globalCashPercent,
  onSaveTrade,
  onOpenScan,
  isPro = false,
}: ItemListProps) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No items added yet</Text>
          <Text style={styles.emptySubtext}>Tap the button below to add your first card</Text>
        </View>
      ) : (
        items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onPriceChange={onPriceChange}
            onNameChange={onNameChange}
            onDelete={onDeleteItem}
            onUpdatePercentages={onUpdatePercentages}
            globalTradePercent={globalTradePercent}
            globalCashPercent={globalCashPercent}
          />
        ))
      )}
      <TouchableOpacity
        style={styles.addButton}
        onPress={onAddItem}
        activeOpacity={0.8}
      >
        <Plus color={Colors.primary} size={24} />
        <Text style={styles.addButtonText}>Add Item</Text>
      </TouchableOpacity>
      {items.length > 0 && (
        <>
          <TouchableOpacity
            style={styles.saveTradeButton}
            onPress={onSaveTrade}
            activeOpacity={0.8}
          >
            <Text style={styles.saveTradeButtonText}>Save Trade</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={onClearAll}
            activeOpacity={0.8}
          >
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  addButton: {
    backgroundColor: Colors.cardBackground,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginTop: 8,
  },
  addButtonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  saveTradeButton: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
  },
  saveTradeButtonText: {
    color: Colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 12,
  },
  clearButtonText: {
    color: Colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
