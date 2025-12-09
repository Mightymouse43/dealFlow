import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, Image } from 'react-native';
import { useState, useRef } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { X, Camera } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { CardData } from '@/types/calculator';

interface CameraScanModalProps {
  visible: boolean;
  onClose: () => void;
  onCardRecognized: (cardData: CardData) => void;
}

export function CameraScanModal({ visible, onClose, onCardRecognized }: CameraScanModalProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isIdentifying, setIsIdentifying] = useState(false);
  const cameraRef = useRef<CameraView>(null);


  const handleCapture = async () => {
    if (!cameraRef.current) return;

    setIsIdentifying(true);

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 30000);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.8,
      });

      if (!photo || !photo.base64) {
        throw new Error('Failed to capture image');
      }

      const webhookUrl = process.env.EXPO_PUBLIC_N8N_WEBHOOK_URL;
      if (!webhookUrl) {
        throw new Error('Webhook URL not configured');
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: photo.base64,
        }),
        signal: abortController.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP Error:', response.status, errorText);
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const responseText = await response.text();
      console.log('Image webhook response:', responseText);

      if (!responseText || responseText.trim() === '') {
        console.error('Empty response from server');
        throw new Error('Server returned empty response');
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response:', data);

        if (Array.isArray(data) && data.length > 0) {
          data = data[0];
          console.log('Extracted first item from array:', data);
        }
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Response text:', responseText);
        throw new Error('Server returned invalid JSON');
      }

      if (data.cardName && data.tcgplayer?.marketPrice != null) {
        console.log('Card recognized:', data.cardName);
        onCardRecognized(data as CardData);
        setIsIdentifying(false);
        onClose();
      } else {
        setIsIdentifying(false);
        console.warn('Card not recognized. Response:', data);
        alert('Card not recognized. Missing required fields: cardName or marketPrice');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      setIsIdentifying(false);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error('Request timeout');
          alert('Request timed out. Please try again.');
        } else {
          console.error('Card analysis error:', error.message);
          alert(`Failed to analyze card: ${error.message}`);
        }
      } else {
        console.error('Card analysis error:', error);
        alert('Failed to analyze card. Please try again.');
      }
    }
  };

  const handleClose = () => {
    setIsIdentifying(false);
    onClose();
  };

  if (!visible) return null;

  if (!permission) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </Modal>
    );
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.permissionContainer}>
          <View style={styles.permissionContent}>
            <Text style={styles.permissionTitle}>Camera Permission Required</Text>
            <Text style={styles.permissionText}>
              We need your permission to use the camera for card scanning
            </Text>
            <View style={styles.permissionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={requestPermission}
                activeOpacity={0.7}
              >
                <Text style={styles.primaryButtonText}>Grant Permission</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.permissionContainer}>
          <View style={styles.permissionContent}>
            <Text style={styles.permissionTitle}>Camera Not Available</Text>
            <Text style={styles.permissionText}>
              Camera scanning is not available on web. Please use the mobile app.
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Text style={styles.primaryButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          facing="back"
          ref={cameraRef}
        >
          <View style={styles.overlay}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <X color="#FFFFFF" size={28} />
              </TouchableOpacity>
              <Image
                source={{ uri: 'https://res.cloudinary.com/dq6gnzyrn/image/upload/v1764899630/Deal_flow_200x50_rrqwrs.png' }}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <View style={styles.scanArea}>
              <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
              <Text style={styles.instructionText}>
                Take a photo of the card
              </Text>
            </View>

            <View style={styles.footer}>
              {isIdentifying ? (
                <View style={styles.identifyingContainer}>
                  <ActivityIndicator size="large" color="#FFFFFF" />
                  <Text style={styles.identifyingText}>
                    Analyzing card...
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={handleCapture}
                  activeOpacity={0.7}
                >
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </CameraView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  header: {
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 20,
  },
  logo: {
    width: 150,
    height: 38,
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  scanFrame: {
    width: '100%',
    aspectRatio: 0.7,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#FFFFFF',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 24,
    textAlign: 'center',
  },
  footer: {
    paddingBottom: 60,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
  },
  identifyingContainer: {
    alignItems: 'center',
    gap: 16,
  },
  identifyingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionContent: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  permissionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.border,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.background,
  },
});
