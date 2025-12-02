import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { Colors } from '@/constants/Colors';
import { TransactionType } from '@/types/calculator';
import { supabase } from '@/lib/supabase';
import { Folder, ChevronDown } from 'lucide-react-native';

interface FolderOption {
  id: string;
  name: string;
  color: string;
}

interface SaveTradeModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (customerName?: string, transactionType?: TransactionType, folderId?: string) => void;
}

export const SaveTradeModal = ({
  visible,
  onClose,
  onSave,
}: SaveTradeModalProps) => {
  const [customerName, setCustomerName] = useState('');
  const [transactionType, setTransactionType] = useState<TransactionType>('trade');
  const [folders, setFolders] = useState<FolderOption[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(undefined);
  const [showFolderPicker, setShowFolderPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      setCustomerName('');
      setTransactionType('trade');
      setSelectedFolderId(undefined);
      loadFolders();
    }
  }, [visible]);

  const loadFolders = async () => {
    try {
      const { data, error } = await supabase
        .from('folders')
        .select('id, name, color')
        .order('name', { ascending: true });

      if (error) throw error;

      setFolders(data || []);
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  };

  const handleSave = () => {
    onSave(customerName.trim() || undefined, transactionType, selectedFolderId);
    setCustomerName('');
    setTransactionType('trade');
    setSelectedFolderId(undefined);
  };

  const getSelectedFolderName = () => {
    if (!selectedFolderId) return 'None';
    const folder = folders.find(f => f.id === selectedFolderId);
    return folder ? folder.name : 'None';
  };

  const getSelectedFolderColor = () => {
    if (!selectedFolderId) return Colors.textSecondary;
    const folder = folders.find(f => f.id === selectedFolderId);
    return folder ? folder.color : Colors.textSecondary;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Save Trade</Text>
          <Text style={styles.subtitle}>Add customer name (optional)</Text>

          <View style={styles.inputSection}>
            <TextInput
              style={styles.input}
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="Customer name"
              placeholderTextColor={Colors.textSecondary}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.folderSection}>
            <Text style={styles.sectionLabel}>Folder (optional)</Text>
            <TouchableOpacity
              style={styles.folderSelector}
              onPress={() => setShowFolderPicker(!showFolderPicker)}
              activeOpacity={0.7}
            >
              <View style={styles.folderSelectorLeft}>
                <View style={[styles.folderIcon, { backgroundColor: getSelectedFolderColor() }]}>
                  <Folder color={Colors.background} size={18} />
                </View>
                <Text style={styles.folderSelectorText}>{getSelectedFolderName()}</Text>
              </View>
              <ChevronDown
                color={Colors.textSecondary}
                size={20}
                style={{
                  transform: [{ rotate: showFolderPicker ? '180deg' : '0deg' }],
                }}
              />
            </TouchableOpacity>

            {showFolderPicker && (
              <View style={styles.folderPicker}>
                <ScrollView style={styles.folderList} nestedScrollEnabled>
                  <TouchableOpacity
                    style={[
                      styles.folderOption,
                      !selectedFolderId && styles.folderOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedFolderId(undefined);
                      setShowFolderPicker(false);
                    }}
                  >
                    <View style={[styles.folderIcon, { backgroundColor: Colors.textSecondary }]}>
                      <Folder color={Colors.background} size={18} />
                    </View>
                    <Text style={styles.folderOptionText}>None</Text>
                  </TouchableOpacity>

                  {folders.map((folder) => (
                    <TouchableOpacity
                      key={folder.id}
                      style={[
                        styles.folderOption,
                        selectedFolderId === folder.id && styles.folderOptionSelected,
                      ]}
                      onPress={() => {
                        setSelectedFolderId(folder.id);
                        setShowFolderPicker(false);
                      }}
                    >
                      <View style={[styles.folderIcon, { backgroundColor: folder.color }]}>
                        <Folder color={Colors.background} size={18} />
                      </View>
                      <Text style={styles.folderOptionText}>{folder.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.transactionTypeSection}>
            <Text style={styles.sectionLabel}>Transaction Type</Text>
            <View style={styles.typeButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  transactionType === 'trade' && styles.typeButtonActive,
                ]}
                onPress={() => setTransactionType('trade')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    transactionType === 'trade' && styles.typeButtonTextActive,
                  ]}
                >
                  Trade
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeButton,
                  transactionType === 'cash' && styles.typeButtonActive,
                ]}
                onPress={() => setTransactionType('cash')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    transactionType === 'cash' && styles.typeButtonTextActive,
                  ]}
                >
                  Cash
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              activeOpacity={0.7}
            >
              <Text style={styles.saveButtonText}>Save Trade</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  inputSection: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: Colors.cardBackground,
    color: Colors.text,
    fontSize: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  folderSection: {
    marginBottom: 16,
  },
  folderSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  folderSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  folderIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  folderSelectorText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  folderPicker: {
    marginTop: 8,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 200,
  },
  folderList: {
    padding: 4,
  },
  folderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  folderOptionSelected: {
    backgroundColor: Colors.background,
  },
  folderOptionText: {
    fontSize: 16,
    color: Colors.text,
  },
  transactionTypeSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  typeButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  typeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  typeButtonTextActive: {
    color: Colors.background,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
