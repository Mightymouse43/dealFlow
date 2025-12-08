import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput, 
  Animated, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard, 
  Image, 
  Vibration,
  Dimensions 
} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Colors } from '@/constants/Colors';
import { DollarSign, Coins, Star, Sparkles, Crown } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import Sound from 'react-native-sound'; // npm install react-native-sound

type Winner = 'vendor' | 'buyer' | null;

const { width: screenWidth } = Dimensions.get('window');
const screenCenter = screenWidth / 2;

export default function CoinFlipScreen() {
  const [basePrice, setBasePrice] = useState('');
  const [winPrice, setWinPrice] = useState('');
  const [losePrice, setLosePrice] = useState('');
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<Winner>(null);
  const [showResult, setShowResult] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  const [casinoMessage, setCasinoMessage] = useState('');

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  // Casino sound effects
  useEffect(() => {
    Sound.setCategory('Playback');
  }, []);

  const playSound = (soundName: string) => {
    const sound = new Sound(soundName, Sound.MAIN_BUNDLE, (error) => {
      if (error) console.log('Sound failed to load', error);
      else {
        sound.play();
        sound.release();
      }
    });
  };

  const casinoMessages = [
    "Place your bet, high roller! 💰",
    "Lady Luck is calling your name... 🎰",
    "Fortune favors the bold! 🔥",
    "All in or nothing! 🤑",
    "The house is watching... 👁️",
    "Big money decisions ahead! 💎"
  ];

  const handlePriceChange = (text: string, setter: (value: string) => void) => {
    let cleanText = text.replace(/[^0-9.]/g, '');
    const parts = cleanText.split('.');
    if (parts.length > 2) {
      cleanText = parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts.length === 2 && parts[1].length > 2) {
      cleanText = parts[0] + '.' + parts[1].substring(0, 2);
    }
    setter(cleanText);
  };

  const formatCurrency = (value: string) => {
    if (!value) return '$0.00';
    const num = parseFloat(value);
    return `$${num.toFixed(2)}`;
  };

  const generateRandomMessage = () => {
    const messages = casinoMessages[Math.floor(Math.random() * casinoMessages.length)];
    setCasinoMessage(messages);
  };

  const flipCoin = () => {
    if (!basePrice || !winPrice || !losePrice) return;

    // Play casino spin sound
    playSound('spin.mp3'); // Add these sound files to your bundle
    Vibration.vibrate(100);

    setIsFlipping(true);
    setShowResult(false);
    setResult(null);
    generateRandomMessage();

    const winner: Winner = Math.random() < 0.5 ? 'buyer' : 'vendor';
    const totalRotations = 8 + Math.random() * 4; // More realistic spins

    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: totalRotations * 360,
        duration: 4000,
        useNativeDriver: true,
      }),
      Animated.sequence([
        // Bounce up and spin
        Animated.parallel([
          Animated.timing(translateYAnim, {
            toValue: -250,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 0.95,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
        ]),
        // Fall back dramatically
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 2800,
          useNativeDriver: true,
        }),
      ]),
    ]).start(async () => {
      // Final landing bounce
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setResult(winner);
        setShowResult(true);
        setIsFlipping(false);
        
        // Winner celebration
        if (winner === 'buyer') {
          playSound('win.mp3');
          Vibration.vibrate([0, 500, 200, 500], true);
          flashScreen('win');
        } else {
          playSound('lose.mp3');
          Vibration.vibrate(800);
          flashScreen('lose');
        }
        
        rotateAnim.setValue(0);
        translateYAnim.setValue(0);
        scaleAnim.setValue(1);

        const finalPrice = winner === 'buyer' ? parseFloat(winPrice) : parseFloat(losePrice);

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase
              .from('coin_flips')
              .insert({
                user_id: user.id,
                base_price: parseFloat(basePrice),
                win_price: parseFloat(winPrice),
                lose_price: parseFloat(losePrice),
                winner: winner,
                final_price: finalPrice,
              });
          }
        } catch (error) {
          console.error('Error saving coin flip:', error);
        }
      });
    });
  };

  const flashScreen = (type: 'win' | 'lose') => {
    const flashColor = type === 'win' ? '#FFD700' : '#FF4444';
    
    Animated.sequence([
      Animated.timing(flashAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(flashAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const resetFlip = () => {
    setResult(null);
    setShowResult(false);
    setBasePrice('');
    setWinPrice('');
    setLosePrice('');
    setCasinoMessage('');
    rotateAnim.setValue(0);
    translateYAnim.setValue(0);
    scaleAnim.setValue(1);
    flashAnim.setValue(0);
    opacityAnim.setValue(1);
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const canFlip = basePrice && winPrice && losePrice && !isFlipping;

  return (
    <View style={styles.container}>
      {/* Flash overlay */}
      <Animated.View
        style={[
          styles.flashOverlay,
          {
            opacity: flashAnim,
            backgroundColor: flashAnim.__getValue() > 0.5 ? '#FFD700' : '#FF4444',
          }
        ]}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.header}>
                <Text style={styles.title}>🎰 COIN FLIP CASINO 🎰</Text>
                <Text style={styles.subtitle}>High Stakes Deal Maker</Text>
                {casinoMessage ? (
                  <Text style={styles.casinoMessage}>{casinoMessage}</Text>
                ) : null}
              </View>

              <View style={styles.content}>
                {!showResult ? (
                  <>
                    <View style={styles.inputSection}>
                      <View style={[styles.basePriceCard, styles.glow]}>
                        <Text style={styles.label}>🏦 BASE PRICE</Text>
                        <View style={styles.inputContainer}>
                          <DollarSign color="#FFD700" size={24} />
                          <TextInput
                            style={styles.input}
                            value={basePrice}
                            onChangeText={(text) => handlePriceChange(text, setBasePrice)}
                            keyboardType="decimal-pad"
                            placeholder="Enter base price"
                            placeholderTextColor="#888"
                            editable={!isFlipping}
                          />
                        </View>
                      </View>

                      <View style={styles.dealSection}>
                        <View style={[styles.dealCard, styles.buyerCard, styles.glow]}>
                          <View style={styles.dealHeader}>
                            <Text style={styles.dealTitle}>👤 BUYER WINS</Text>
                            <Star color="#9c41a1" size={20} />
                          </View>
                          <View style={styles.inputContainer}>
                            <DollarSign color="#9c41a1" size={24} />
                            <TextInput
                              style={styles.input}
                              value={winPrice}
                              onChangeText={(text) => handlePriceChange(text, setWinPrice)}
                              keyboardType="decimal-pad"
                              placeholder="Discount price"
                              placeholderTextColor="#888"
                              editable={!isFlipping}
                            />
                          </View>
                          {basePrice && winPrice && parseFloat(winPrice) < parseFloat(basePrice) && (
                            <Text style={styles.savings}>💰 Save {formatCurrency((parseFloat(basePrice) - parseFloat(winPrice)).toString())}</Text>
                          )}
                        </View>

                        <View style={[styles.dealCard, styles.vendorCard, styles.glow]}>
                          <View style={styles.dealHeader}>
                            <Text style={styles.dealTitle}>🏢 VENDOR WINS</Text>
                            <Crown color="#f17f62" size={20} />
                          </View>
                          <View style={styles.inputContainer}>
                            <DollarSign color="#f17f62" size={24} />
                            <TextInput
                              style={styles.input}
                              value={losePrice}
                              onChangeText={(text) => handlePriceChange(text, setLosePrice)}
                              keyboardType="decimal-pad"
                              placeholder="Premium price"
                              placeholderTextColor="#888"
                              editable={!isFlipping}
                            />
                          </View>
                          {basePrice && losePrice && parseFloat(losePrice) > parseFloat(basePrice) && (
                            <Text style={styles.extra}>💎 +{formatCurrency((parseFloat(losePrice) - parseFloat(basePrice)).toString())}</Text>
                          )}
                        </View>
                      </View>
                    </View>

                    <View style={styles.arena}>
                      <Text style={styles.arenaTitle}>FLIPPING ARENA</Text>
                      <Animated.View
                        style={[
                          styles.coinContainer,
                          {
                            transform: [
                              { translateY: translateYAnim },
                              { rotate: spin },
                              { scale: scaleAnim },
                            ],
                          },
                        ]}
                      >
                        {isFlipping ? (
                          <View style={styles.coinFlipping}>
                            <Text style={styles.coinEmoji}>🪙</Text>
                            <Text style={styles.spinCounter}>{Math.floor(spinCount / 2)} SPINS</Text>
                          </View>
                        ) : (
                          <Image
                            source={{ uri: 'https://res.cloudinary.com/dq6gnzyrn/image/upload/v1764385310/full_background_coin_fgfv51.png' }}
                            style={styles.coinImage}
                            resizeMode="cover"
                          />
                        )}
                      </Animated.View>
                    </View>

                    <TouchableOpacity
                      style={[styles.flipButton, !canFlip && styles.flipButtonDisabled]}
                      onPress={flipCoin}
                      disabled={!canFlip}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.flipButtonText}>
                        {isFlipping ? '🌀 SPINNING...' : '🎰 FLIP FOR FAME & FORTUNE! 🎰'}
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={styles.resultContainer}>
                    <View style={[
                      styles.resultCard,
                      result === 'buyer' ? styles.buyerWin : styles.vendorWin,
                      styles.resultGlow
                    ]}>
                      <Text style={[
                        styles.resultTitle, 
                        { fontSize: result === 'buyer' ? 36 : 34 }
                      ]}>
                        {result === 'buyer' 
                          ? '🎉 JACKPOT! BUYER WINS! 🎉' 
                          : '🏆 VENDOR TAKES ALL! 🏆'
                        }
                      </Text>
                      <Sparkles color="#FFD700" size={40} />
                      <Text style={styles.resultPrice}>
                        {result === 'buyer' ? formatCurrency(winPrice) : formatCurrency(losePrice)}
                      </Text>
                      <Text style={styles.resultSubtext}>
                        {result === 'buyer'
                          ? `💰 MASSIVE SAVINGS! ${formatCurrency((parseFloat(basePrice) - parseFloat(winPrice)).toString())}`
                          : `💎 PREMIUM PAYMENT! +${formatCurrency((parseFloat(losePrice) - parseFloat(basePrice)).toString())}`
                        }
                      </Text>
                    </View>

                    <View style={styles.dealSummary}>
                      <Text style={styles.summaryTitle}>🏛️ OFFICIAL LEDGER</Text>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Original Ask:</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(basePrice)}</Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>FINAL VERDICT:</Text>
                        <Text style={[styles.summaryValue, styles.summaryFinal]}>
                          {result === 'buyer' ? formatCurrency(winPrice) : formatCurrency(losePrice)}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[styles.resetButton, styles.buttonGlow]}
                      onPress={resetFlip}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.resetButtonText}>🔄 NEW HIGH STAKES FLIP</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// Enhanced casino-style styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  safeArea: {
    flex: 1,
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    position: 'absolute',
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 60,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFD700',
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: '700',
    opacity: 0.9,
  },
  casinoMessage: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  content: {
    paddingHorizontal: 20,
    flex: 1,
  },
  inputSection: {
    marginBottom: 40,
  },
  basePriceCard: {
    marginBottom: 24,
  },
  glow: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFD700',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,215,0,0.3)',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  input: {
    flex: 1,
    color: '#FFD700',
    fontSize: 20,
    fontWeight: '800',
    marginLeft: 12,
  },
  dealSection: {
    gap: 20,
  },
  dealCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  buyerCard: {
    borderColor: '#9c41a1',
    backgroundColor: 'rgba(156, 65, 161, 0.15)',
  },
  vendorCard: {
    borderColor: '#f17f62',
    backgroundColor: 'rgba(241, 127, 98, 0.15)',
  },
  dealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dealTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  savings: {
    fontSize: 14,
    color: '#9c41a1',
    fontWeight: '800',
    marginTop: 12,
    textAlign: 'center',
  },
  extra: {
    fontSize: 14,
    color: '#f17f62',
    fontWeight: '800',
    marginTop: 12,
    textAlign: 'center',
  },
  arena: {
    alignItems: 'center',
    marginVertical: 40,
  },
  arenaTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 20,
    letterSpacing: 3,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  coinContainer: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  coinFlipping: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinEmoji: {
    fontSize: 100,
  },
  spinCounter: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginTop: 8,
  },
  coinImage: {
    width: '100%',
    height: '100%',
    borderRadius: 110,
  },
  flipButton: {
    backgroundColor: 'linear-gradient(45deg, #FFD700, #FFA500)',
    paddingVertical: 24,
    paddingHorizontal: 40,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
  },
  flipButtonDisabled: {
    backgroundColor: 'rgba(255,215,0,0.2)',
    shadowOpacity: 0.2,
  },
  flipButtonText: {
    color: '#000',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: 'rgba(255,255,255,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  resultContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  resultCard: {
    padding: 40,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 4,
    minHeight: 220,
    justifyContent: 'center',
  },
  buyerWin: {
    backgroundColor: 'rgba(156, 65, 161, 0.25)',
    borderColor: '#9c41a1',
  },
  vendorWin: {
    backgroundColor: 'rgba(241, 127, 98, 0.25)',
    borderColor: '#f17f62',
  },
  resultGlow: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 25,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 12,
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  resultPrice: {
    fontSize: 56,
    fontWeight: '900',
    color: '#FFD700',
    marginVertical: 12,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  resultSubtext: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  dealSummary: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 28,
    borderRadius: 20,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: 'rgba(255,215,0,0.4)',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFD700',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '700',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFD700',
  },
  summaryFinal: {
    fontSize: 20,
  },
  resetButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  buttonGlow: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 12,
  },
  resetButtonText: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
});
