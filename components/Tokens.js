import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  Easing
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop, Ellipse } from 'react-native-svg';
import { COLORS, GLOBAL_PATH, HOME_PATHS, YARD_POSITIONS, BASE_OFFSETS, getCellRect } from '../constants';
import AirSvg from '../assets/air.svg';
import WaterSvg from '../assets/water.svg';
import FireSvg from '../assets/fire.svg';
import EarthSvg from '../assets/earth.svg';

const COIN_THEMES = {
  RED: {
    rimTop: '#FFA4A4',
    rimMid: '#FF2A42',
    rimBot: '#7A0010',
    innerTop: '#E52538',
    innerBot: '#5C0008',
    glow: '#FF2A42',
    symbolColor: '#FFFFFF',
  },
  GREEN: {
    rimTop: '#B9F6CA',
    rimMid: '#00D060',
    rimBot: '#004818',
    innerTop: '#00A344',
    innerBot: '#003810',
    glow: '#00D060',
    symbolColor: '#FFFFFF',
  },
  YELLOW: {
    rimTop: '#FFF59D',
    rimMid: '#FFB300',
    rimBot: '#7C3F00',
    innerTop: '#FFA000',
    innerBot: '#5E2A00',
    glow: '#FFB300',
    symbolColor: '#FFFFFF',
  },
  BLUE: {
    rimTop: '#80D8FF',
    rimMid: '#0099FF',
    rimBot: '#003380',
    innerTop: '#0077E6',
    innerBot: '#002566',
    glow: '#0099FF',
    symbolColor: '#FFFFFF',
  }
};

const getTokenSymbol = (player, color = '#FFFFFF') => {
  const size = "100%";
  switch (player) {
    case 'RED': return <FireSvg width={size} height={size} color={color} fill={color} preserveAspectRatio="xMidYMid meet" />;
    case 'BLUE': return <WaterSvg width={size} height={size} color={color} fill={color} preserveAspectRatio="xMidYMid meet" />;
    case 'GREEN': return <EarthSvg width={size} height={size} color={color} fill={color} preserveAspectRatio="xMidYMid meet" />;
    case 'YELLOW': return <AirSvg width={size} height={size} color={color} fill={color} preserveAspectRatio="xMidYMid meet" />;
    default: return null;
  }
};

const getTileCoords = (player, relativePosition, pieceIndex) => {
  if (relativePosition === -1) {
    const [col, row] = YARD_POSITIONS[player][pieceIndex];
    if (player === 'GREEN') {
      return { left: (col / 6) * 39.55 - 3.3, top: (row / 6) * 40.55 - 3.3 };
    } else if (player === 'YELLOW') {
      return { left: 60.40 + ((col - 9) / 6) * 39.60 - 3.3, top: (row / 6) * 40.55 - 3.3 };
    } else if (player === 'BLUE') {
      return { left: 60.40 + ((col - 9) / 6) * 39.60 - 3.3, top: 60.47 + ((row - 9) / 6) * 39.53 - 3.3 };
    } else {
      return { left: (col / 6) * 39.55 - 3.3, top: 60.47 + ((row - 9) / 6) * 39.53 - 3.3 };
    }
  } else if (relativePosition >= 0 && relativePosition <= 50) {
    const globalPos = (BASE_OFFSETS[player] + relativePosition) % 52;
    const [col, row] = GLOBAL_PATH[globalPos];
    const rect = getCellRect(col, row);
    return { left: rect.left, top: rect.top };
  } else if (relativePosition >= 51 && relativePosition <= 55) {
    const [col, row] = HOME_PATHS[player][relativePosition - 51];
    const rect = getCellRect(col, row);
    return { left: rect.left, top: rect.top };
  } else if (relativePosition === 56) {
    const centerOffsets = {
      GREEN: { left: 43.0, top: 47.19 },
      YELLOW: { left: 46.5, top: 43.8 },
      BLUE: { left: 50.0, top: 47.19 },
      RED: { left: 46.5, top: 50.5 },
    };
    return centerOffsets[player];
  }
  return { left: 0, top: 0 };
};

const getSymbolOffsetStyle = (player) => {
  switch (player) {
    case 'YELLOW': // AIR: little bit right, little bit down (halved)
      return { transform: [{ translateX: 0.75 }, { translateY: 0.75 }] };
    case 'GREEN': // EARTH: little bit above (up) and right (halved, nudged left)
      return { transform: [{ translateX: 0.2 }, { translateY: -1.0 }] };
    case 'RED': // FIRE: little bit right (nudged left)
      return { transform: [{ translateX: 0.4 }] };
    case 'BLUE': // WATER: tiny bit right (halved)
      return { transform: [{ translateX: 0.5 }] };
    default:
      return {};
  }
};

const CoinMedallion = ({ player }) => {
  const theme = COIN_THEMES[player] || COIN_THEMES.RED;
  const rimGradId = `rim_${player}`;
  const innerGradId = `inner_${player}`;
  const glossGradId = `gloss_${player}`;

  return (
    <View style={styles.coinWrapper}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100">
        <Defs>
          {/* Metallic Rim Gradient */}
          <LinearGradient id={rimGradId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={theme.rimTop} />
            <Stop offset="35%" stopColor={theme.rimMid} />
            <Stop offset="100%" stopColor={theme.rimBot} />
          </LinearGradient>

          {/* Inner Glossy Glass Disc Gradient */}
          <LinearGradient id={innerGradId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={theme.innerTop} />
            <Stop offset="100%" stopColor={theme.innerBot} />
          </LinearGradient>

          {/* Top Glass Specular Arc Reflection */}
          <LinearGradient id={glossGradId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Outer Metallic Bezel */}
        <Circle cx="50" cy="50" r="48" fill={`url(#${rimGradId})`} />

        {/* Specular Edge Highlight */}
        <Circle cx="50" cy="50" r="47.5" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="1" />

        {/* Inner Groove Drop Shadow */}
        <Circle cx="50" cy="50" r="38" fill="rgba(0,0,0,0.4)" />

        {/* Inner Colored Glass Disc */}
        <Circle cx="50" cy="50" r="36.5" fill={`url(#${innerGradId})`} />

        {/* Top Gloss Arc Sheen */}
        <Ellipse cx="50" cy="27" rx="27" ry="14" fill={`url(#${glossGradId})`} />
      </Svg>

      {/* Center White Element Emblem */}
      <View style={[styles.symbolOverlay, getSymbolOffsetStyle(player)]}>
        {getTokenSymbol(player, theme.symbolColor)}
      </View>
    </View>
  );
};

const Token = ({ piece, eligible, onPress, stackOffset }) => {
  const pieceIndex = parseInt(piece.id.split('_')[1]);
  const currentCoords = getTileCoords(piece.player, piece.relativePosition, pieceIndex);

  const left = useSharedValue(currentCoords.left);
  const top = useSharedValue(currentCoords.top);
  const scale = useSharedValue(1);
  const pulse = useSharedValue(1);
  const prevPosition = useRef(piece.relativePosition);

  useEffect(() => {
    if (eligible) {
      pulse.value = withRepeat(
        withTiming(1.2, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      pulse.value = withTiming(1);
    }
  }, [eligible]);

  useEffect(() => {
    if (prevPosition.current !== piece.relativePosition) {
      const oldPos = prevPosition.current;
      const newPos = piece.relativePosition;

      if (newPos === -1) {
        const target = getTileCoords(piece.player, -1, pieceIndex);
        left.value = withTiming(target.left, { duration: 400 });
        top.value = withTiming(target.top, { duration: 400 });
      } else {
        let steps = [];
        let start = oldPos === -1 ? 0 : oldPos + 1;

        for (let pos = start; pos <= newPos; pos++) {
          const coords = getTileCoords(piece.player, pos, pieceIndex);
          steps.push({
            left: coords.left,
            top: coords.top
          });
        }

        const runSequence = async () => {
          for (let i = 0; i < steps.length; i++) {
            left.value = withTiming(steps[i].left, { duration: 150 });
            top.value = withTiming(steps[i].top, { duration: 150 });
            scale.value = withSequence(
              withTiming(1.3, { duration: 75 }),
              withTiming(1, { duration: 75 })
            );
            await new Promise(resolve => setTimeout(resolve, 150));
          }
        };
        runSequence();
      }
      prevPosition.current = piece.relativePosition;
    }
  }, [piece.relativePosition]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      left: `${left.value}%`,
      top: `${top.value}%`,
      transform: [
        { scale: scale.value },
        { scale: pulse.value },
        { translateX: stackOffset.dx },
        { translateY: stackOffset.dy }
      ]
    };
  });

  const theme = COIN_THEMES[piece.player] || COIN_THEMES.RED;

  return (
    <Animated.View style={[styles.tokenContainer, animatedStyle]}>
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={!eligible}
        onPress={() => onPress(piece.id)}
        style={styles.tokenTouchable}
      >
        {eligible && (
          <View
            style={[
              styles.glowRing,
              {
                borderColor: theme.glow,
                shadowColor: theme.glow,
              }
            ]}
          />
        )}
        <CoinMedallion player={piece.player} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const Tokens = ({ pieces, eligiblePieces, onPiecePress }) => {
  const tileGroups = {};

  pieces.forEach(piece => {
    if (piece.relativePosition === -1 || piece.relativePosition === 56) return;
    const pieceIndex = parseInt(piece.id.split('_')[1]);
    const { left, top } = getTileCoords(piece.player, piece.relativePosition, pieceIndex);
    const key = `${left.toFixed(1)},${top.toFixed(1)}`;
    if (!tileGroups[key]) tileGroups[key] = [];
    tileGroups[key].push(piece.id);
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {pieces.map((piece) => {
        const isEligible = eligiblePieces.includes(piece.id);

        let stackOffset = { dx: 0, dy: 0 };
        if (piece.relativePosition >= 0 && piece.relativePosition < 56) {
          const pieceIndex = parseInt(piece.id.split('_')[1]);
          const { left, top } = getTileCoords(piece.player, piece.relativePosition, pieceIndex);
          const key = `${left.toFixed(1)},${top.toFixed(1)}`;
          const group = tileGroups[key];

          if (group && group.length > 1) {
            const index = group.indexOf(piece.id);
            const offsetAmt = 4;
            if (index === 0) stackOffset = { dx: -offsetAmt, dy: -offsetAmt };
            if (index === 1) stackOffset = { dx: offsetAmt, dy: -offsetAmt };
            if (index === 2) stackOffset = { dx: -offsetAmt, dy: offsetAmt };
            if (index === 3) stackOffset = { dx: offsetAmt, dy: offsetAmt };
          }
        }

        return (
          <Token
            key={piece.id}
            piece={piece}
            eligible={isEligible}
            onPress={onPiecePress}
            stackOffset={stackOffset}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tokenContainer: {
    position: 'absolute',
    width: '6.6%',
    height: '6.6%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  tokenTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 9999,
  },
  glowRing: {
    position: 'absolute',
    width: '118%',
    aspectRatio: 1,
    borderRadius: 9999,
    borderWidth: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },
  coinWrapper: {
    width: '94%',
    aspectRatio: 1,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 3.5,
    elevation: 6,
  },
  symbolOverlay: {
    position: 'absolute',
    width: '54%',
    height: '54%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 9999,
  }
});

export default Tokens;
