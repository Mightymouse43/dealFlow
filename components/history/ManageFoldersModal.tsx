import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '@/constants/Colors';
import { X, Folder, Trash2 } from 'lucide-react-native';
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

  const handleDeletePress = (folder: FolderData) => {
    setFolderToDelete(folder);
  };

  const handleConfirmDelete = () => {
    if (folderToDelete) {
      onDeleteFolder(folderToDelete.id);
      setFolderToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setFolderToDelete(null);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* BACKDROP */}
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>

        {/* INNER CONTAINER - prevents onClose from firing when touching inside */}
        <TouchableOpacity activeOpacity={1} style={styles.modal}>
          
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

        </TouchableOpacity>
      </TouchableOpacity>

      {/* INLINE CONFIRMATION DIALOG */}
      {folderToDelete && (
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Delete Folder?</Text>
            <Text style={styles.confirmMessage}>
              Are you sure you want to delete "{folderToDelete.name}"? All trades
              from this folder will be moved to Uncategorized.
            </Text>

            <View style={styles.confirmButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelDelete}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.deleteBtn} onPress={handleConfirmDelete}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

    </Modal>
  );
}


const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
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
  closeButton: { padding: 4 },

  content: { padding: 16 },

  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 18, fontWeight: '600', color: Colors.text, marginTop: 16 },
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

  folderInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },

  folderIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  folderDetails: { flex: 1 },
  folderName: { fontSize: 16, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  folderCount: { fontSize: 13, color: Colors.textSecondary },

  deleteButton: {
    padding: 12,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },

  footer: { padding: 16, borderTopWidth: 1, borderTopColor: Colors.border },
  footerNote: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center' },

  confirmOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  confirmBox: {
    width: '80%',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 20,
  },
  confirmTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  confirmMessage: {
    marginTop: 12,
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  cancelBtn: { marginRight: 20 },
  cancelText: { color: Colors.textSecondary, fontSize: 15 },

  deleteBtn: {},
  deleteText: { color: Colors.error, fontWeight: 'bold', fontSize: 16 },
});
