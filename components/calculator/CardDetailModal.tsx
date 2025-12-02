import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import { X, TrendingUp, DollarSign, Award } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { CardData } from '@/types/calculator';

interface CardDetailModalProps {
  visible: boolean;
  cardData: CardData | null;
  onClose: () => void;
  onAddToCalculator: (price: number) => void;
}

export function CardDetailModal({ visible, cardData, onClose, onAddToCalculator }: CardDetailModalProps) {
  if (!cardData) return null;

  console.log('=== CardDetailModal Data ===');
  console.log('Full cardData:', JSON.stringify(cardData, null, 2));
  console.log('Has ebayGraded:', !!cardData.ebayGraded);
  console.log('ebayGraded object:', cardData.ebayGraded);
  console.log('========================');

  const handleAddCard = () => {
    const price = cardData.tcgplayer.marketPrice ?? 0;
    onAddToCalculator(price);
  };

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
  };

  const formatPrice = (price: number | null | undefined): string => {
    return price != null ? `$${price.toFixed(2)}` : 'N/A';
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title} numberOfLines={2}>
                {cardData.cardName}
              </Text>
              <Text style={styles.subtitle}>
                Updated {new Date(cardData.updatedAt).toLocaleDateString()}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X color={Colors.textSecondary} size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.priceSection}>
              <View style={styles.sectionHeader}>
                <TrendingUp color={Colors.primary} size={20} />
                <Text style={styles.sectionTitle}>TCGPlayer Pricing</Text>
              </View>

              <View style={styles.priceGrid}>
                <View style={styles.priceCard}>
                  <Text style={styles.priceLabel}>Market Price</Text>
                  <Text style={styles.priceValue}>
                    ${cardData.tcgplayer.marketPrice.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.priceCard}>
                  <Text style={styles.priceLabel}>Low Listing</Text>
                  <Text style={styles.priceValue}>
                    {formatPrice(cardData.tcgplayer.lowListingPrice)}
                  </Text>
                </View>
              </View>

              <View style={styles.priceGrid}>
                <View style={styles.priceCard}>
                  <Text style={styles.priceLabel}>Latest Sale</Text>
                  <Text style={styles.priceValue}>
                    {formatPrice(cardData.tcgplayer.latestSalePrice)}
                  </Text>
                  {cardData.tcgplayer.latestSaleDate && (
                    <Text style={styles.priceDate}>
                      {formatDate(cardData.tcgplayer.latestSaleDate)}
                    </Text>
                  )}
                </View>

                {cardData.tcgplayer.url ? (
                  <TouchableOpacity
                    style={[styles.priceCard, styles.linkCard]}
                    onPress={() => openUrl(cardData.tcgplayer.url!)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.linkText}>View on TCGPlayer</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.priceCard, styles.disabledCard]}>
                    <Text style={styles.disabledText}>Link Unavailable</Text>
                  </View>
                )}
              </View>
            </View>

            {cardData.ebayGraded && (
              <View style={styles.gradedSection}>
                <View style={styles.sectionHeader}>
                  <Award color={Colors.primary} size={20} />
                  <Text style={styles.sectionTitle}>Graded Cards on eBay</Text>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Found</Text>
                    <Text style={styles.statValue}>
                      {cardData.ebayGraded.totalFound ?? 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Average</Text>
                    <Text style={styles.statValue}>
                      {formatPrice(cardData.ebayGraded.averagePrice)}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Range</Text>
                    <Text style={styles.statValue}>
                      {cardData.ebayGraded.lowestPrice != null && cardData.ebayGraded.highestPrice != null
                        ? `$${cardData.ebayGraded.lowestPrice.toFixed(0)} - $${cardData.ebayGraded.highestPrice.toFixed(0)}`
                        : 'N/A'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.salesHeader}>Recent Sales</Text>
                {cardData.ebayGraded.recentSales && cardData.ebayGraded.recentSales.length > 0 ? (
                  cardData.ebayGraded.recentSales.slice(0, 5).map((sale, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.saleCard}
                      onPress={() => openUrl(sale.url)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.saleHeader}>
                        <Text style={styles.salePrice}>${sale.price.toFixed(2)}</Text>
                        <Text style={styles.saleDate}>{sale.date}</Text>
                      </View>
                      <Text style={styles.saleTitle} numberOfLines={2}>
                        {sale.title}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noDataText}>No graded sales data available</Text>
                )}
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddCard}
              activeOpacity={0.8}
            >
              <DollarSign color={Colors.background} size={20} />
              <Text style={styles.addButtonText}>
                Add at ${cardData.tcgplayer.marketPrice.toFixed(2)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    paddingTop: 20,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    flex: 1,
    flexGrow: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  priceSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  priceGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  priceCard: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  priceDate: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  linkCard: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary + '15',
    borderColor: Colors.primary,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
  },
  disabledCard: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
  },
  disabledText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  gradedSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  salesHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  saleCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  salePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  saleDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  saleTitle: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.background,
  },
});
