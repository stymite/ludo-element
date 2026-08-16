import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Dimensions, SafeAreaView, Easing } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

// 2D Dice Doodle Component
const DiceDoodle = ({ style, value }) => {
  const dots = [];
  if (value === 1) dots.push({ top: '50%', left: '50%' });
  if (value === 2) dots.push({ top: '20%', left: '20%' }, { top: '80%', left: '80%' });
  if (value === 3) dots.push({ top: '20%', left: '20%' }, { top: '50%', left: '50%' }, { top: '80%', left: '80%' });
  if (value === 4) dots.push({ top: '20%', left: '20%' }, { top: '20%', left: '80%' }, { top: '80%', left: '20%' }, { top: '80%', left: '80%' });
  if (value === 5) dots.push({ top: '20%', left: '20%' }, { top: '20%', left: '80%' }, { top: '50%', left: '50%' }, { top: '80%', left: '20%' }, { top: '80%', left: '80%' });
  if (value === 6) dots.push({ top: '20%', left: '25%' }, { top: '50%', left: '25%' }, { top: '80%', left: '25%' }, { top: '20%', left: '75%' }, { top: '50%', left: '75%' }, { top: '80%', left: '75%' });

  return (
    <View style={[styles.diceDoodle, style]}>
      {dots.map((dot, index) => (
        <View 
          key={index} 
          style={[styles.diceDot, { top: dot.top, left: dot.left, transform: [{ translateX: -3 }, { translateY: -3 }] }]} 
        />
      ))}
    </View>
  );
};

// Animated Floating Dice
const FloatingDice = ({ startX, startY, delay, size, value }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -40,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
          delay: delay
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        })
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [floatAnim, rotateAnim, delay]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <Animated.View style={{
      position: 'absolute',
      left: startX,
      top: startY,
      transform: [
        { translateY: floatAnim },
        { rotate: spin }
      ],
      opacity: 0.2
    }}>
      <DiceDoodle 
        value={value} 
        style={{ width: size, height: size, borderWidth: size * 0.08, borderRadius: size * 0.2 }} 
      />
    </Animated.View>
  );
};

// Animated Button
const MenuButton = ({ title, onPress, primary, disabled }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10
    }).start();
  };

  return (
    <TouchableOpacity 
      activeOpacity={1} 
      onPressIn={handlePressIn} 
      onPressOut={handlePressOut} 
      onPress={onPress}
      style={{ marginBottom: 16 }}
    >
      <Animated.View style={[
        styles.menuBtn, 
        primary ? styles.menuBtnPrimary : styles.menuBtnSecondary,
        { transform: [{ scale: scaleAnim }] },
        disabled && { opacity: 0.5 }
      ]}>
        <Text style={[styles.menuBtnText, primary && styles.menuBtnTextPrimary]}>{title}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function HomeMenu({ onPlayComputer, onPassNPlay }) {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Prism Background Simulation */}
      <View style={styles.prismBg1} />
      <View style={styles.prismBg2} />
      <View style={styles.prismBg3} />
      <View style={styles.prismBg4} />

      {/* Floating Dice Doodles */}
      <FloatingDice startX={width * 0.1} startY={height * 0.15} delay={0} size={70} value={6} />
      <FloatingDice startX={width * 0.75} startY={height * 0.25} delay={1000} size={50} value={3} />
      <FloatingDice startX={width * 0.8} startY={height * 0.7} delay={500} size={90} value={4} />
      <FloatingDice startX={width * 0.2} startY={height * 0.75} delay={1500} size={60} value={1} />
      <FloatingDice startX={width * 0.5} startY={height * 0.45} delay={700} size={40} value={5} />
      <FloatingDice startX={width * -0.05} startY={height * 0.5} delay={300} size={55} value={2} />

      <SafeAreaView style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>LUDO</Text>
          <Text style={styles.subtitle}>CHAMPIONS</Text>
        </View>

        <View style={styles.buttonContainer}>
          <MenuButton 
            title="Pass N Play" 
            primary={true} 
            onPress={onPassNPlay} 
          />
          <MenuButton 
            title="Play vs Computer" 
            primary={false} 
            onPress={onPlayComputer} 
          />
          <MenuButton 
            title="Play Online (Soon)" 
            primary={false} 
            onPress={() => alert('Coming soon!')} 
          />
          <MenuButton 
            title="Play with Friends (Soon)" 
            primary={false} 
            onPress={() => alert('Coming soon!')} 
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090810', // Low brightness dark background
    overflow: 'hidden',
  },
  prismBg1: {
    position: 'absolute',
    top: -height * 0.2,
    right: -width * 0.3,
    width: width * 1.5,
    height: height * 0.6,
    backgroundColor: 'rgba(51, 31, 107, 0.4)', // Purple prism
    transform: [{ rotate: '-15deg' }],
    borderBottomLeftRadius: width * 0.5,
  },
  prismBg2: {
    position: 'absolute',
    bottom: -height * 0.1,
    left: -width * 0.4,
    width: width * 1.2,
    height: height * 0.5,
    backgroundColor: 'rgba(23, 62, 115, 0.4)', // Blue prism
    transform: [{ rotate: '25deg' }],
    borderTopRightRadius: width * 0.4,
  },
  prismBg3: {
    position: 'absolute',
    top: height * 0.3,
    left: -width * 0.2,
    width: width * 1.4,
    height: height * 0.3,
    backgroundColor: 'rgba(15, 102, 102, 0.2)', // Teal/Cyan prism
    transform: [{ rotate: '-35deg' }],
  },
  prismBg4: {
    position: 'absolute',
    top: height * 0.6,
    right: -width * 0.2,
    width: width,
    height: height * 0.4,
    backgroundColor: 'rgba(102, 20, 50, 0.2)', // Pink/Red prism
    transform: [{ rotate: '45deg' }],
    borderRadius: 100,
  },
  diceDoodle: {
    borderColor: '#FFFFFF',
    borderWidth: 4,
    borderRadius: 12,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  diceDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 50,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: height * 0.08,
  },
  title: {
    fontSize: 64,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 8,
    textShadowColor: 'rgba(0, 229, 255, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 15,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00E5FF',
    letterSpacing: 8,
    marginTop: -5,
  },
  buttonContainer: {
    paddingHorizontal: 30,
    marginBottom: height * 0.05,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  menuBtn: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  menuBtnPrimary: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)', // Cyan tint
    borderColor: '#00E5FF',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  menuBtnSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  menuBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#E0E0E0',
    letterSpacing: 1.5,
  },
  menuBtnTextPrimary: {
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 229, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  }
});
