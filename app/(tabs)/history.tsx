import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { Trash2, Folder, FolderPlus, FolderOpen, Settings } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { useTradeHistory } from '@/hooks/useTradeHistory';
import { TradeDetailModal } from '@/components/history/TradeDetailModal';
import { DeleteConfirmModal } from '@/components/history/DeleteConfirmModal';
import CreateFolderModal from '@/components/history/CreateFolderModal';
import FolderListModal from '@/components/history/FolderListModal';
import ManageFoldersModal from '@/components/history/ManageFoldersModal';
import { ProUpgradeModal } from '@/components/calculator/ProUpgradeModal';
import { useAuth } from '@/contexts/AuthContext';
import { SavedTrade } from '@/types/calculator';
import { supabase } from '@/lib/supabase';

interface FolderData {
  id: string;
  name: string;
  color: string;
  tradeCount?: number;
}

export default function HistoryScreen() {
  const { trades, loading, loadTrades, deleteTrade } = useTradeHistory();
  const { isPro } = useAuth();
  const [selectedTrade, setSelectedTrade] = useState<SavedTrade | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [tradeToDelete, setTradeToDelete] = useState<SavedTrade | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showFolderListModal, setShowFolderListModal] = useState(false);
  const [showManageFoldersModal, setShowManageFoldersModal] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [proFeature, setProFeature] = useState<'scan' | 'history' | 'custom_percent' | 'folder'>('folder');
  const [tradeToMove, setTradeToMove] = useState<SavedTrade | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<FolderData | null>(null);
  const [showDeleteFolderModal, setShowDeleteFolderModal] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  const handleTradePress = (trade: SavedTrade) => {
    setSelectedTrade(trade);
    setShowDetailModal(true);
  };

  const handleDeleteTrade = (trade: SavedTrade) => {
    setTradeToDelete(trade);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (tradeToDelete) {
      await deleteTrade(tradeToDelete.id);
      setShowDeleteModal(false);
      setTradeToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setTradeToDelete(null);
  };

  const loadFolders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error('User not authenticated');
        return;
      }

      const { data: foldersData, error: foldersError } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (foldersError) throw foldersError;

      const foldersWithCounts = await Promise.all(
        (foldersData || []).map(async (folder) => {
          const { count } = await supabase
            .from('trades')
            .select('*', { count: 'exact', head: true })
            .eq('folder_id', folder.id)
            .eq('user_id', user.id);

          return {
            id: folder.id,
            name: folder.name,
            color: folder.color,
            tradeCount: count || 0,
          };
        })
      );

      setFolders(foldersWithCounts);
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  };

  useEffect(() => {
    loadFolders();
  }, []);

  const handleCreateFolderClick = () => {
    if (!isPro) {
      setProFeature('folder');
      setShowProModal(true);
      return;
    }
    setShowCreateFolderModal(true);
  };

  const handleCreateFolder = async (name: string, color: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error('User not authenticated');
        return;
      }

      const { error } = await supabase
        .from('folders')
        .insert({ name, color, user_id: user.id });

      if (error) throw error;

      setShowCreateFolderModal(false);
      await loadFolders();
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleDeleteFolderPress = (folder: FolderData) => {
    setFolderToDelete(folder);
    setShowDeleteFolderModal(true);
  };

  const confirmDeleteFolder = async () => {
    if (!folderToDelete) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error('User not authenticated');
        return;
      }

      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', folderToDelete.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      if (selectedFolder === folderToDelete.id) {
        setSelectedFolder(null);
      }

      setShowDeleteFolderModal(false);
      setFolderToDelete(null);
      await loadFolders();
      await loadTrades();
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
  };

  const cancelDeleteFolder = () => {
    setShowDeleteFolderModal(false);
    setFolderToDelete(null);
  };

  const handleDeleteFolderById = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      handleDeleteFolderPress(folder);
    }
  };

  const handleMoveToFolder = (trade: SavedTrade) => {
    setTradeToMove(trade);
    setShowFolderListModal(true);
  };

  const handleSelectFolderForTrade = async (folderId: string | null) => {
    if (!tradeToMove) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error('User not authenticated');
        return;
      }

      const { error } = await supabase
        .from('trades')
        .update({ folder_id: folderId })
        .eq('id', tradeToMove.id)
        .eq('user_id', user.id);

      if (error) throw error;

      await loadTrades();
      await loadFolders();
      setTradeToMove(null);
    } catch (error) {
      console.error('Error moving trade:', error);
    }
  };

  const filteredTrades = selectedFolder
    ? trades.filter((trade) => trade.folderId === selectedFolder)
    : selectedFolder === null
    ? trades.filter((trade) => !trade.folderId)
    : trades;

  const uncategorizedCount = trades.filter((trade) => !trade.folderId).length;

  const renderTradeItem = ({ item }: { item: SavedTrade }) => (
    <TouchableOpacity
      style={styles.tradeCard}
      onPress={() => handleTradePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.tradeHeader}>
        <View style={styles.tradeHeaderLeft}>
          <Text style={styles.tradeDate}>{formatDate(item.date)}</Text>
          <Text style={styles.tradeTime}>{formatTime(item.date)}</Text>
        </View>
        <View style={styles.tradeActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleMoveToFolder(item)}
            activeOpacity={0.7}
          >
            <FolderOpen color={Colors.textSecondary} size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteTrade(item)}
            activeOpacity={0.7}
          >
            <Trash2 color={Colors.error} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardTop}>
        {item.customerName && (
          <Text style={styles.customerName}>{item.customerName}</Text>
        )}
        <View style={[
          styles.transactionTypeBadge,
          item.transactionType === 'cash' ? styles.cashBadge : styles.tradeBadge
        ]}>
          <Text style={[
            styles.transactionTypeText,
            item.transactionType === 'cash' ? styles.cashText : styles.tradeText
          ]}>
            {item.transactionType === 'cash' ? 'Cash' : 'Trade'}
          </Text>
        </View>
      </View>

      <View style={styles.tradeInfo}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Items</Text>
          <Text style={styles.infoValue}>{item.items.length}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Item Total</Text>
          <Text style={styles.infoValue}>{formatCurrency(item.totals.itemTotal)}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>
            {item.transactionType === 'cash' ? 'Cash Value' : 'Trade Value'}
          </Text>
          <Text style={[styles.infoValue, styles.tradeValue]}>
            {formatCurrency(item.transactionType === 'cash' ? item.totals.cashTotal : item.totals.tradeTotal)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>No trades saved yet</Text>
      <Text style={styles.emptySubtext}>Your saved trades will appear here</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Trade History</Text>
            <Text style={styles.headerSubtitle}>{trades.length} trades</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowManageFoldersModal(true)}
            >
              <Settings color={Colors.textSecondary} size={22} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleCreateFolderClick}
            >
              <FolderPlus color={Colors.primary} size={24} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.folderScroll}
        contentContainerStyle={styles.folderScrollContent}
      >
        <TouchableOpacity
          style={[
            styles.folderChip,
            selectedFolder === null && styles.folderChipSelected,
          ]}
          onPress={() => setSelectedFolder(null)}
        >
          <View style={[styles.folderChipIcon, { backgroundColor: Colors.textSecondary }]}>
            <Folder color={Colors.background} size={16} />
          </View>
          <Text style={[
            styles.folderChipText,
            selectedFolder === null && styles.folderChipTextSelected,
          ]}>
            Uncategorized ({uncategorizedCount})
          </Text>
        </TouchableOpacity>

        {folders.map((folder) => (
          <TouchableOpacity
            key={folder.id}
            style={[
              styles.folderChip,
              selectedFolder === folder.id && styles.folderChipSelected,
            ]}
            onPress={() => setSelectedFolder(folder.id)}
          >
            <View style={[styles.folderChipIcon, { backgroundColor: folder.color }]}>
              <Folder color={Colors.background} size={16} />
            </View>
            <Text style={[
              styles.folderChipText,
              selectedFolder === folder.id && styles.folderChipTextSelected,
            ]}>
              {folder.name} ({folder.tradeCount})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredTrades}
        renderItem={renderTradeItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        onRefresh={() => {
          loadTrades();
          loadFolders();
        }}
        refreshing={loading}
      />

      <TradeDetailModal
        visible={showDetailModal}
        trade={selectedTrade}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTrade(null);
        }}
      />

      <DeleteConfirmModal
        visible={showDeleteModal}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <CreateFolderModal
        visible={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        onCreateFolder={handleCreateFolder}
      />

      <FolderListModal
        visible={showFolderListModal}
        onClose={() => {
          setShowFolderListModal(false);
          setTradeToMove(null);
        }}
        folders={folders}
        onSelectFolder={handleSelectFolderForTrade}
        onDeleteFolder={handleDeleteFolderById}
        currentFolderId={tradeToMove?.folderId || null}
      />

      <ManageFoldersModal
        visible={showManageFoldersModal}
        onClose={() => setShowManageFoldersModal(false)}
        folders={folders}
        onDeleteFolder={handleDeleteFolderPress}
      />

      <DeleteConfirmModal
        visible={showDeleteFolderModal}
        onConfirm={confirmDeleteFolder}
        onCancel={cancelDeleteFolder}
        title="Delete Folder?"
        message={
          folderToDelete
            ? `Are you sure you want to delete "${folderToDelete.name}"? All trades in this folder will be moved to Uncategorized.`
            : ''
        }
      />

      <ProUpgradeModal
        visible={showProModal}
        onClose={() => setShowProModal(false)}
        feature={proFeature}
        isPro={isPro}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  folderScroll: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  folderScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  folderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  folderChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  folderChipIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  folderChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  folderChipTextSelected: {
    color: Colors.background,
  },
  listContent: {
    padding: 20,
  },
  tradeCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  tradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tradeHeaderLeft: {
    flex: 1,
  },
  tradeDate: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  tradeTime: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  tradeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    flex: 1,
  },
  transactionTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tradeBadge: {
    backgroundColor: 'rgba(156, 65, 161, 0.15)',
  },
  cashBadge: {
    backgroundColor: 'rgba(241, 127, 98, 0.15)',
  },
  transactionTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tradeText: {
    color: Colors.primary,
  },
  cashText: {
    color: '#f17f62',
  },
  tradeInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  tradeValue: {
    color: Colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
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
});
