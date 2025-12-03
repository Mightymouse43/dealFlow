import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '@/constants/Colors';
import { X, Folder, Trash2, Edit2 } from 'lucide-react-native';

interface FolderData {
  id: string;
  name: string;
  color: string;
  tradeCount?: number;
}

interface FolderListModalProps {
  visible: boolean;
  onClose: () => void;
  folders: FolderData[];
  onSelectFolder: (folderId: string | null) => void;
  onDeleteFolder: (folderId: string) => void;
  currentFolderId: string | null;
}

export default function FolderListModal({
  visible,
  onClose,
  folders,
  onSelectFolder,
  onDeleteFolder,
  currentFolderId,
}: FolderListModalProps) {
  const handleSelectFolder = (folderId: string | null) => {
    onSelectFolder(folderId);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
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
            <Text style={styles.title}>Move to Folder</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X color={Colors.textSecondary} size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <TouchableOpacity
              style={[
                styles.folderItem,
                currentFolderId === null && styles.folderItemSelected,
              ]}
              onPress={() => handleSelectFolder(null)}
            >
              <View style={styles.folderInfo}>
                <View style={[styles.folderIcon, { backgroundColor: Colors.textSecondary }]}>
                  <Folder color={Colors.background} size={20} />
                </View>
                <Text style={styles.folderName}>Uncategorized</Text>
              </View>
            </TouchableOpacity>

            {folders.map((folder) => (
              <View key={folder.id} style={styles.folderItemContainer}>
                <TouchableOpacity
                  style={[
                    styles.folderItem,
                    currentFolderId === folder.id && styles.folderItemSelected,
                  ]}
                  onPress={() => handleSelectFolder(folder.id)}
                >
                  <View style={styles.folderInfo}>
                    <View style={[styles.folderIcon, { backgroundColor: folder.color }]}>
                      <Folder color={Colors.background} size={20} />
                    </View>
                    <View style={styles.folderText}>
                      <Text style={styles.folderName}>{folder.name}</Text>
                      {folder.tradeCount !== undefined && (
                        <Text style={styles.folderCount}>
                          {folder.tradeCount} {folder.tradeCount === 1 ? 'trade' : 'trades'}
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => onDeleteFolder(folder.id)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Trash2 color={Colors.textSecondary} size={18} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
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
    maxHeight: '70%',
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
    padding: 12,
  },
  folderItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  folderItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  folderItemSelected: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  folderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  folderIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  folderText: {
    flex: 1,
  },
  folderName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  folderCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  deleteButton: {
    padding: 12,
    marginLeft: 8,
  },
});
