import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { Settings, Camera, Lock } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { TransactionType, CardData } from '@/types/calculator';
import { useCalculator } from '@/hooks/useCalculator';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/contexts/AuthContext';
import { useScanLimit } from '@/hooks/useScanLimit';
import { RunningTotals } from '@/components/calculator/RunningTotals';
import { PercentageInputs } from '@/components/calculator/PercentageInputs';
import { ItemList } from '@/components/calculator/ItemList';
import { SaveTradeModal } from '@/components/calculator/SaveTradeModal';
import { CameraScanModal } from '@/components/calculator/CameraScanModal';
import { CardDetailModal } from '@/components/calculator/CardDetailModal';
import { SettingsModal } from '@/components/calculator/SettingsModal';
import { ProUpgradeModal } from '@/components/calculator/ProUpgradeModal';
import { TrialExpiredModal } from '@/components/calculator/TrialExpiredModal';

export default function CalculatorScreen() {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showCardDetailModal, setShowCardDetailModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [showTrialExpiredModal, setShowTrialExpiredModal] = useState(false);
  const [proFeature, setProFeature] = useState<'scan' | 'history' | 'custom_percent'>('scan');
  const [scansRemaining, setScansRemaining] = useState(0);
  const [scannedCardData, setScannedCardData] = useState<CardData | null>(null);
  const { isPro, isOnTrial, trialEndDate, profile } = useAuth();
  const { checkScanLimit, incrementScanCount } = useScanLimit();

  useEffect(() => {
    if (profile && profile.trial_end_date) {
      const trialEnd = new Date(profile.trial_end_date);
      const now = new Date();
      if (trialEnd < now && !isPro && profile.subscription_tier === 'free') {
        setShowTrialExpiredModal(true);
      }
    }
  }, [profile, isPro]);

  const {
    tradePercent: savedTradePercent,
    cashPercent: savedCashPercent,
    isLoading: settingsLoading,
    saveSettings,
  } = useSettings();

  const {
    items,
    tradePercent,
    cashPercent,
    totals,
    addItem,
    removeItem,
    updateItemPrice,
    updateItemName,
    updateItemPercentages,
    updateTradePercent,
    updateCashPercent,
    clearAll,
    saveTrade,
  } = useCalculator();

  const handleOpenScan = async () => {
    const scanCheck = await checkScanLimit();

    if (!scanCheck.canScan) {
      setProFeature('scan');
      setScansRemaining(scanCheck.remaining);
      setShowProModal(true);
      return;
    }

    setScansRemaining(scanCheck.remaining);
    setShowCameraModal(true);
  };

  const handleSaveTrade = async (customerName?: string, transactionType?: TransactionType, folderId?: string) => {
    if (!isPro) {
      setProFeature('history');
      setShowProModal(true);
      return;
    }

    const success = await saveTrade(customerName, transactionType, folderId);
    setShowSaveModal(false);
  };

  const handleCardRecognized = async (cardData: CardData) => {
    await incrementScanCount();
    setScannedCardData(cardData);
    setShowCardDetailModal(true);
    setShowCameraModal(false);
  };

  const handleAddToCalculator = (price: number) => {
    if (scannedCardData) {
      const safePrice = price ?? 0;
      addItem(scannedCardData.cardName, safePrice);
      setShowCardDetailModal(false);
      setScannedCardData(null);
    }
  };

  const handleCloseCardDetail = () => {
    setShowCardDetailModal(false);
    setScannedCardData(null);
  };

  const handleSaveSettings = async (newTradePercent: number, newCashPercent: number) => {
    const success = await saveSettings(newTradePercent, newCashPercent);
    if (success) {
      updateTradePercent(newTradePercent);
      updateCashPercent(newCashPercent);
      setShowSettingsModal(false);
    }
  };

  useEffect(() => {
    if (!settingsLoading) {
      updateTradePercent(savedTradePercent);
      updateCashPercent(savedCashPercent);
    }
  }, [savedTradePercent, savedCashPercent, settingsLoading]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.settingsButton}
          activeOpacity={0.7}
          onPress={() => setShowSettingsModal(true)}
        >
          <Settings color={Colors.text} size={24} />
        </TouchableOpacity>
        <Image
          source={{ uri: 'https://res.cloudinary.com/dq6gnzyrn/image/upload/v1764375611/no_background_kerptj.png' }}
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity
          style={styles.proBadge}
          activeOpacity={0.7}
          onPress={() => setShowProModal(true)}
        >
          <Text style={styles.proText}>PRO</Text>
          <Lock color={Colors.background} size={14} />
        </TouchableOpacity>
      </View>

      <RunningTotals totals={totals} />

      <PercentageInputs
        tradePercent={tradePercent}
        cashPercent={cashPercent}
        onTradePercentChange={updateTradePercent}
        onCashPercentChange={updateCashPercent}
      />

      <ItemList
        items={items}
        onAddItem={() => addItem()}
        onPriceChange={updateItemPrice}
        onNameChange={updateItemName}
        onDeleteItem={removeItem}
        onClearAll={clearAll}
        onUpdatePercentages={(id, customTradePercent, customCashPercent) => {
          if (!isPro) {
            setProFeature('custom_percent');
            setShowProModal(true);
            return;
          }
          updateItemPercentages(id, customTradePercent, customCashPercent);
        }}
        globalTradePercent={tradePercent}
        globalCashPercent={cashPercent}
        onSaveTrade={() => {
          if (!isPro) {
            setProFeature('history');
            setShowProModal(true);
            return;
          }
          setShowSaveModal(true);
        }}
        onOpenScan={handleOpenScan}
        isPro={isPro}
      />

      <SaveTradeModal
        visible={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveTrade}
      />

      <CameraScanModal
        visible={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onCardRecognized={handleCardRecognized}
      />

      <CardDetailModal
        visible={showCardDetailModal}
        cardData={scannedCardData}
        onClose={handleCloseCardDetail}
        onAddToCalculator={handleAddToCalculator}
      />

      <SettingsModal
        visible={showSettingsModal}
        currentTradePercent={tradePercent}
        currentCashPercent={cashPercent}
        onClose={() => setShowSettingsModal(false)}
        onSave={handleSaveSettings}
      />

      <ProUpgradeModal
        visible={showProModal}
        onClose={() => setShowProModal(false)}
        feature={proFeature}
        scansRemaining={scansRemaining}
        isPro={isPro}
      />

      <TrialExpiredModal
        visible={showTrialExpiredModal}
        onClose={() => setShowTrialExpiredModal(false)}
        onUpgrade={() => {
          setShowTrialExpiredModal(false);
          setShowProModal(true);
        }}
      />

      <TouchableOpacity
        style={styles.cameraButton}
        onPress={handleOpenScan}
        activeOpacity={0.8}
      >
        <Camera color={Colors.background} size={28} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  settingsButton: {
    padding: 8,
  },
  logo: {
    width: 240,
    height: 80,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  proText: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
