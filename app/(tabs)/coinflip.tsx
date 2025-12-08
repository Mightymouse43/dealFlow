import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Animated, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Image } from 'react-native';
import { useState, useRef } from 'react';
import { Colors } from '@/constants/Colors';
import { DollarSign, Coins } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

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

const winner: Winner = Math.random() < 0.5 ? 'buyer' : 'vendor';

Animated.sequence([
Animated.parallel([
Animated.timing(rotateAnim, {
toValue: 15,
duration: 3000,
useNativeDriver: true,
}),
Animated.sequence([
Animated.timing(translateYAnim, {
toValue: -200,
duration: 1000,
useNativeDriver: true,
}),
Animated.timing(translateYAnim, {
toValue: 0,
duration: 2000,
useNativeDriver: true,
}),
]),
]),
]).start(async () => {
setResult(winner);
setShowResult(true);
setIsFlipping(false);
rotateAnim.setValue(0);
translateYAnim.setValue(0);

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

const resetFlip = () => {
setResult(null);
setShowResult(false);
setBasePrice('');
setWinPrice('');
setLosePrice('');
rotateAnim.setValue(0);
translateYAnim.setValue(0);
opacityAnim.setValue(1);
};

const spin = rotateAnim.interpolate({
inputRange: [0, 1],
outputRange: ['0deg', '360deg'],
});

const canFlip = basePrice && winPrice && losePrice && !isFlipping;

return (
<SafeAreaView style={styles.container}>
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
<Animated.View
style={[
styles.coin,
{
transform: [
{ translateY: translateYAnim },
{ rotate: spin },
],
opacity: opacityAnim,
},
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
<Text style={styles.flipButtonText}>
{isFlipping ? 'Flipping...' : 'Flip Coin'}
</Text>
</TouchableOpacity>
</>
) : (
<View style={styles.resultContainer}>
<View style={[
styles.resultCard,
result === 'buyer' ? styles.buyerWin : styles.vendorWin
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
</View>

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
</View>
)}
</View>
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
},
flipButtonDisabled: {
backgroundColor: Colors.textSecondary,
opacity: 0.5,
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
},
buyerWin: {
backgroundColor: 'rgba(156, 65, 161, 0.15)',
borderColor: '#9c41a1',
},
vendorWin: {
backgroundColor: 'rgba(241, 127, 98, 0.15)',
borderColor: '#f17f62',
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