import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '@/constants/Colors';
import { X, Folder, Trash2 } from 'lucide-react-native';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { useState } from 'react';

interface FolderData {
  id: string;
  name: string;
  color: string;
  tradeCount?: number;
}

interface ManageFoldersModalProps {
  visible: boolean;
  onClose: () => void;
  folders: FolderData[];
  onDeleteFolder: (folderId: string) => void;
}

export default function ManageFoldersModal({
  visible,
  onClose,
  folders,
  onDeleteFolder,
}: ManageFoldersModalProps) {
  const [folderToDelete, setFolderToDelete] = useState<FolderData | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeletePress = (folder: FolderData) => {
    setFolderToDelete(folder);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (folderToDelete) {
      onDeleteFolder(folderToDelete.id);
      setShowDeleteConfirm(false);
      setFolderToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setFolderToDelete(null);
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.header}>
              <Text style={styles.title}>Manage Folders</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X color={Colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
              {folders.length === 0 ? (
                <View style={styles.emptyState}>
                  <Folder color={Colors.textSecondary} size={48} />
                  <Text style={styles.emptyText}>No folders yet</Text>
                  <Text style={styles.emptySubtext}>
                    Create folders to organize your trades
                  </Text>
                </View>
              ) : (
                folders.map((folder) => (
                  <View key={folder.id} style={styles.folderCard}>
                    <View style={styles.folderInfo}>
                      <View style={[styles.folderIcon, { backgroundColor: folder.color }]}>
                        <Folder color={Colors.background} size={20} />
                      </View>
                      <View style={styles.folderDetails}>
                        <Text style={styles.folderName}>{folder.name}</Text>
                        {folder.tradeCount !== undefined && (
                          <Text style={styles.folderCount}>
                            {folder.tradeCount} {folder.tradeCount === 1 ? 'trade' : 'trades'}
                          </Text>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeletePress(folder)}
                      activeOpacity={0.6}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Trash2 color={Colors.error} size={20} />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>

            {folders.length > 0 && (
              <View style={styles.footer}>
                <Text style={styles.footerNote}>
                  Deleting a folder will move all its trades to Uncategorized
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <DeleteConfirmModal
        visible={showDeleteConfirm}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        title="Delete Folder?"
        message={
          folderToDelete
            ? `Are you sure you want to delete "${folderToDelete.name}"? All trades in this folder will be moved to Uncategorized.`
            : ''
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
    maxHeight: 500,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  folderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  folderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  folderIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  folderDetails: {
    flex: 1,
  },
  folderName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  folderCount: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  deleteButton: {
    padding: 12,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
