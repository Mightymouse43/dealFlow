import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Animated, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Image } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Colors } from '@/constants/Colors';
import { DollarSign, Coins, Sparkles } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import * as Haptics from 'expo-haptics';

type Winner = 'vendor' | 'buyer' | null;

export default function CoinFlipScreen() {
const [basePrice, setBasePrice] = useState('');
const [winPrice, setWinPrice] = useState('');
const [losePrice, setLosePrice] = useState('');
const [isFlipping, setIsFlipping] = useState(false);
const [result, setResult] = useState<Winner>(null);
const [showResult, setShowResult] = useState(false);

const rotateAnim = useRef(new Animated.Value(0)).current;
const translateYAnim = useRef(new Animated.Value(0)).current;
const opacityAnim = useRef(new Animated.Value(1)).current;
const scaleAnim = useRef(new Animated.Value(1)).current;
const flashAnim = useRef(new Animated.Value(0)).current;
const resultScaleAnim = useRef(new Animated.Value(0)).current;
const shakeAnim = useRef(new Animated.Value(0)).current;
const glowAnim = useRef(new Animated.Value(0)).current;

const particleAnims = useRef(
  Array.from({ length: 8 }, () => ({
    x: new Animated.Value(0),
    y: new Animated.Value(0),
    opacity: new Animated.Value(0),
    scale: new Animated.Value(0),
  }))
).current;

const handlePriceChange = (text: string, setter: (value: string) => void) => {
// Remove any non-numeric characters except decimal point
let cleanText = text.replace(/[^0-9.]/g, '');

// Ensure only one decimal point
const parts = cleanText.split('.');
if (parts.length > 2) {
cleanText = parts[0] + '.' + parts.slice(1).join('');
}

// Limit to 2 decimal places
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

const flipCoin = () => {
if (!basePrice || !winPrice || !losePrice) return;

setIsFlipping(true);
setShowResult(false);
setResult(null);

if (Platform.OS !== 'web') {
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

const winner: Winner = Math.random() < 0.5 ? 'buyer' : 'vendor';

Animated.sequence([
Animated.parallel([
Animated.timing(rotateAnim, {
toValue: 20,
duration: 2500,
useNativeDriver: true,
}),
Animated.sequence([
Animated.timing(translateYAnim, {
toValue: -250,
duration: 800,
useNativeDriver: true,
}),
Animated.spring(translateYAnim, {
toValue: 0,
friction: 4,
tension: 40,
useNativeDriver: true,
}),
]),
Animated.sequence([
Animated.timing(scaleAnim, {
toValue: 1.3,
duration: 800,
useNativeDriver: true,
}),
Animated.timing(scaleAnim, {
toValue: 1,
duration: 1700,
useNativeDriver: true,
}),
]),
]),
]).start(async () => {
if (Platform.OS !== 'web') {
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

Animated.sequence([
Animated.timing(flashAnim, {
toValue: 1,
duration: 100,
useNativeDriver: false,
}),
Animated.timing(flashAnim, {
toValue: 0,
duration: 300,
useNativeDriver: false,
}),
]).start();

Animated.sequence([
Animated.timing(shakeAnim, {
toValue: 10,
duration: 50,
useNativeDriver: true,
}),
Animated.timing(shakeAnim, {
toValue: -10,
duration: 50,
useNativeDriver: true,
}),
Animated.timing(shakeAnim, {
toValue: 10,
duration: 50,
useNativeDriver: true,
}),
Animated.timing(shakeAnim, {
toValue: 0,
duration: 50,
useNativeDriver: true,
}),
]).start();

Animated.spring(resultScaleAnim, {
toValue: 1,
friction: 5,
tension: 50,
useNativeDriver: true,
}).start();

particleAnims.forEach((particle, index) => {
const angle = (index / particleAnims.length) * Math.PI * 2;
const distance = 150;

Animated.parallel([
Animated.timing(particle.x, {
toValue: Math.cos(angle) * distance,
duration: 1000,
useNativeDriver: true,
}),
Animated.timing(particle.y, {
toValue: Math.sin(angle) * distance,
duration: 1000,
useNativeDriver: true,
}),
Animated.sequence([
Animated.timing(particle.opacity, {
toValue: 1,
duration: 200,
useNativeDriver: true,
}),
Animated.timing(particle.opacity, {
toValue: 0,
duration: 800,
delay: 200,
useNativeDriver: true,
}),
]),
Animated.sequence([
Animated.timing(particle.scale, {
toValue: 1,
duration: 200,
useNativeDriver: true,
}),
Animated.timing(particle.scale, {
toValue: 0,
duration: 800,
delay: 200,
useNativeDriver: true,
}),
]),
]).start();
});

setResult(winner);
setShowResult(true);
setIsFlipping(false);
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
};

useEffect(() => {
const pulse = Animated.loop(
Animated.sequence([
Animated.timing(glowAnim, {
toValue: 1,
duration: 1500,
useNativeDriver: false,
}),
Animated.timing(glowAnim, {
toValue: 0,
duration: 1500,
useNativeDriver: false,
}),
])
);

if (showResult) {
pulse.start();
} else {
pulse.stop();
glowAnim.setValue(0);
}

return () => pulse.stop();
}, [showResult]);

const resetFlip = () => {
setResult(null);
setShowResult(false);
setBasePrice('');
setWinPrice('');
setLosePrice('');
rotateAnim.setValue(0);
translateYAnim.setValue(0);
opacityAnim.setValue(1);
scaleAnim.setValue(1);
flashAnim.setValue(0);
resultScaleAnim.setValue(0);
shakeAnim.setValue(0);
glowAnim.setValue(0);
particleAnims.forEach(particle => {
particle.x.setValue(0);
particle.y.setValue(0);
particle.opacity.setValue(0);
particle.scale.setValue(0);
});
};

const spin = rotateAnim.interpolate({
inputRange: [0, 1],
outputRange: ['0deg', '360deg'],
});

const canFlip = basePrice && winPrice && losePrice && !isFlipping;

const flashColor = flashAnim.interpolate({
inputRange: [0, 1],
outputRange: ['rgba(0, 0, 0, 0)', result === 'buyer' ? 'rgba(156, 65, 161, 0.3)' : 'rgba(241, 127, 98, 0.3)'],
});

const glowIntensity = glowAnim.interpolate({
inputRange: [0, 1],
outputRange: [0, 8],
});

return (
<SafeAreaView style={styles.container}>
<Animated.View
style={[
styles.flashOverlay,
{ backgroundColor: flashColor }
]}
pointerEvents="none"
/>
<KeyboardAvoidingView
behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
style={styles.flex}
>
<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
<ScrollView
style={styles.scrollView}
contentContainerStyle={styles.scrollContent}
keyboardShouldPersistTaps="handled"
scrollEnabled={!isFlipping}
>
<Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
<View style={styles.header}>
<Text style={styles.title}>Coin Flip Gamble</Text>
<Text style={styles.subtitle}>Make a deal with a flip of a coin</Text>
</View>

<View style={styles.content}>
{!showResult ? (
<>
<View style={styles.inputSection}>
<View style={styles.inputGroup}>
<Text style={styles.label}>Base Price</Text>
<View style={styles.inputContainer}>
<DollarSign color={Colors.textSecondary} size={20} />
<TextInput
style={styles.input}
value={basePrice}
onChangeText={(text) => handlePriceChange(text, setBasePrice)}
keyboardType="decimal-pad"
placeholder="100.00"
placeholderTextColor={Colors.textSecondary}
editable={!isFlipping}
/>
</View>
</View>

<View style={styles.dealSection}>
<View style={[styles.dealCard, styles.buyerCard]}>
<Text style={styles.dealTitle}>If Buyer Wins</Text>
<View style={styles.inputContainer}>
<DollarSign color={Colors.textSecondary} size={20} />
<TextInput
style={styles.input}
value={winPrice}
onChangeText={(text) => handlePriceChange(text, setWinPrice)}
keyboardType="decimal-pad"
placeholder="80.00"
placeholderTextColor={Colors.textSecondary}
editable={!isFlipping}
/>
</View>
{basePrice && winPrice && parseFloat(winPrice) < parseFloat(basePrice) && (
<Text style={styles.savings}>
Save {formatCurrency((parseFloat(basePrice) - parseFloat(winPrice)).toString())}
</Text>
)}
</View>

<View style={[styles.dealCard, styles.vendorCard]}>
<Text style={styles.dealTitle}>If Vendor Wins</Text>
<View style={styles.inputContainer}>
<DollarSign color={Colors.textSecondary} size={20} />
<TextInput
style={styles.input}
value={losePrice}
onChangeText={(text) => handlePriceChange(text, setLosePrice)}
keyboardType="decimal-pad"
placeholder="120.00"
placeholderTextColor={Colors.textSecondary}
editable={!isFlipping}
/>
</View>
{basePrice && losePrice && parseFloat(losePrice) > parseFloat(basePrice) && (
<Text style={styles.extra}>
+{formatCurrency((parseFloat(losePrice) - parseFloat(basePrice)).toString())}
</Text>
)}
</View>
</View>
</View>

<View style={styles.coinContainer}>
{particleAnims.map((particle, index) => (
<Animated.View
key={index}
style={[
styles.particle,
{
transform: [
{ translateX: particle.x },
{ translateY: particle.y },
{ scale: particle.scale },
],
opacity: particle.opacity,
},
]}
>
<Sparkles
color={result === 'buyer' ? '#9c41a1' : '#f17f62'}
size={24}
/>
</Animated.View>
))}
<Animated.View
style={[
styles.coin,
{
transform: [
{ translateY: translateYAnim },
{ rotate: spin },
{ scale: scaleAnim },
],
opacity: opacityAnim,
},
isFlipping && styles.coinFlippingGlow,
]}
>
{isFlipping ? (
<View style={styles.coinFlipping}>
<Text style={styles.coinText}>😲</Text>
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
activeOpacity={0.8}
>
<View style={styles.flipButtonContent}>
<Coins color={Colors.background} size={24} />
<Text style={styles.flipButtonText}>
{isFlipping ? 'Flipping...' : 'Flip Coin'}
</Text>
</View>
</TouchableOpacity>
</>
) : (
<Animated.View
style={[
styles.resultContainer,
{
transform: [{ scale: resultScaleAnim }],
},
]}
>
<Animated.View style={[
styles.resultCard,
result === 'buyer' ? styles.buyerWin : styles.vendorWin,
{
shadowRadius: glowIntensity,
shadowOpacity: glowAnim.interpolate({
inputRange: [0, 1],
outputRange: [0.3, 0.6],
}),
},
]}>
<Text style={styles.resultTitle}>
{result === 'buyer' ? '🎉 Buyer Wins!' : '🏆 Vendor Wins!'}
</Text>
<Text style={styles.resultPrice}>
{result === 'buyer' ? formatCurrency(winPrice) : formatCurrency(losePrice)}
</Text>
<Text style={styles.resultSubtext}>
{result === 'buyer'
? `You saved ${formatCurrency((parseFloat(basePrice) - parseFloat(winPrice)).toString())}`
: `Pay ${formatCurrency((parseFloat(losePrice) - parseFloat(basePrice)).toString())} more`
}
</Text>
</Animated.View>

<View style={styles.dealSummary}>
<Text style={styles.summaryTitle}>Deal Summary</Text>
<View style={styles.summaryRow}>
<Text style={styles.summaryLabel}>Base Price:</Text>
<Text style={styles.summaryValue}>{formatCurrency(basePrice)}</Text>
</View>
<View style={styles.summaryRow}>
<Text style={styles.summaryLabel}>Final Price:</Text>
<Text style={[styles.summaryValue, styles.summaryFinal]}>
{result === 'buyer' ? formatCurrency(winPrice) : formatCurrency(losePrice)}
</Text>
</View>
</View>

<TouchableOpacity
style={styles.resetButton}
onPress={resetFlip}
activeOpacity={0.8}
>
<Text style={styles.resetButtonText}>New Flip</Text>
</TouchableOpacity>
</Animated.View>
)}
</View>
</Animated.View>
</ScrollView>
</TouchableWithoutFeedback>
</KeyboardAvoidingView>
</SafeAreaView>
);
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: Colors.background,
},
flashOverlay: {
position: 'absolute',
top: 0,
left: 0,
right: 0,
bottom: 0,
zIndex: 1000,
},
flex: {
flex: 1,
},
scrollView: {
flex: 1,
},
scrollContent: {
flexGrow: 1,
paddingBottom: 40,
},
header: {
paddingHorizontal: 20,
paddingTop: 16,
paddingBottom: 24,
alignItems: 'center',
},
title: {
fontSize: 28,
fontWeight: 'bold',
color: Colors.text,
marginBottom: 8,
},
subtitle: {
fontSize: 14,
color: Colors.textSecondary,
},
content: {
paddingHorizontal: 20,
},
inputSection: {
marginBottom: 32,
},
inputGroup: {
marginBottom: 24,
},
label: {
fontSize: 16,
fontWeight: '600',
color: Colors.text,
marginBottom: 8,
},
inputContainer: {
flexDirection: 'row',
alignItems: 'center',
backgroundColor: Colors.cardBackground,
borderRadius: 12,
borderWidth: 1,
borderColor: Colors.border,
paddingHorizontal: 16,
paddingVertical: 14,
},
input: {
flex: 1,
color: Colors.text,
fontSize: 18,
fontWeight: '600',
marginLeft: 8,
},
dealSection: {
gap: 16,
},
dealCard: {
backgroundColor: Colors.cardBackground,
borderRadius: 12,
padding: 16,
borderWidth: 2,
},
buyerCard: {
borderColor: '#9c41a1',
},
vendorCard: {
borderColor: '#f17f62',
},
dealTitle: {
fontSize: 14,
fontWeight: '600',
color: Colors.text,
marginBottom: 12,
},
savings: {
fontSize: 12,
color: '#9c41a1',
fontWeight: '600',
marginTop: 8,
},
extra: {
fontSize: 12,
color: '#f17f62',
fontWeight: '600',
marginTop: 8,
},
coinContainer: {
alignItems: 'center',
justifyContent: 'center',
marginVertical: 32,
position: 'relative',
},
particle: {
position: 'absolute',
zIndex: 10,
},
coin: {
width: 180,
height: 180,
borderRadius: 90,
backgroundColor: Colors.cardBackground,
alignItems: 'center',
justifyContent: 'center',
borderWidth: 4,
borderColor: Colors.primary,
},
coinFlippingGlow: {
shadowColor: Colors.primary,
shadowOffset: { width: 0, height: 0 },
shadowOpacity: 0.8,
shadowRadius: 20,
elevation: 10,
},
coinFlipping: {
alignItems: 'center',
justifyContent: 'center',
},
coinText: {
fontSize: 72,
},
coinImage: {
width: '100%',
height: '100%',
borderRadius: 90,
},
flipButton: {
backgroundColor: Colors.primary,
paddingVertical: 18,
paddingHorizontal: 32,
borderRadius: 12,
alignItems: 'center',
marginTop: 16,
shadowColor: Colors.primary,
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.3,
shadowRadius: 8,
elevation: 5,
},
flipButtonDisabled: {
backgroundColor: Colors.textSecondary,
opacity: 0.5,
shadowOpacity: 0,
},
flipButtonContent: {
flexDirection: 'row',
alignItems: 'center',
gap: 8,
},
flipButtonText: {
color: Colors.background,
fontSize: 20,
fontWeight: 'bold',
},
resultContainer: {
paddingVertical: 20,
},
resultCard: {
padding: 32,
borderRadius: 20,
alignItems: 'center',
marginBottom: 32,
borderWidth: 3,
shadowOffset: { width: 0, height: 0 },
elevation: 8,
},
buyerWin: {
backgroundColor: 'rgba(156, 65, 161, 0.15)',
borderColor: '#9c41a1',
shadowColor: '#9c41a1',
},
vendorWin: {
backgroundColor: 'rgba(241, 127, 98, 0.15)',
borderColor: '#f17f62',
shadowColor: '#f17f62',
},
resultTitle: {
fontSize: 32,
fontWeight: 'bold',
color: Colors.text,
marginBottom: 16,
},
resultPrice: {
fontSize: 48,
fontWeight: 'bold',
color: Colors.primary,
marginBottom: 8,
},
resultSubtext: {
fontSize: 16,
color: Colors.textSecondary,
fontWeight: '600',
},
dealSummary: {
backgroundColor: Colors.cardBackground,
padding: 20,
borderRadius: 12,
marginBottom: 24,
},
summaryTitle: {
fontSize: 16,
fontWeight: '600',
color: Colors.text,
marginBottom: 12,
},
summaryRow: {
flexDirection: 'row',
justifyContent: 'space-between',
marginBottom: 8,
},
summaryLabel: {
fontSize: 14,
color: Colors.textSecondary,
},
summaryValue: {
fontSize: 14,
fontWeight: '600',
color: Colors.text,
},
summaryFinal: {
fontSize: 16,
color: Colors.primary,
},
resetButton: {
backgroundColor: Colors.cardBackground,
paddingVertical: 16,
paddingHorizontal: 32,
borderRadius: 12,
alignItems: 'center',
borderWidth: 2,
borderColor: Colors.primary,
},
resetButtonText: {
color: Colors.primary,
fontSize: 18,
fontWeight: 'bold',
},
});