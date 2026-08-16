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
import { COLORS, GLOBAL_PATH, HOME_PATHS, YARD_POSITIONS, BASE_OFFSETS, CELL_SIZE } from '../constants';
import AirSvg from '../assets/air.svg';
import WaterSvg from '../assets/water.svg';
import FireSvg from '../assets/fire.svg';
import EarthSvg from '../assets/earth.svg';

const SHINY_THEMES = {
  RED: {
    color: '#FF4D4D',       // Lighter, luminous ruby
    topGleam: '#FFA3A3',    // Specular top highlight
  },
  GREEN: {
    color: '#34D399',       // Lighter, radiant emerald
    topGleam: '#A7F3D0',    // Specular top highlight
  },
  YELLOW: {
    color: '#FBBF24',       // Lighter, sparkling gold
    topGleam: '#FDE68A',    // Specular top highlight
  },
  BLUE: {
    color: '#38BDF8',       // Lighter, brilliant electric sky-blue
    topGleam: '#BAE6FD',    // Specular top highlight
  }
};

const getTokenSymbol = (player, color) => {
  const size = "100%";
  switch (player) {
    case 'RED': return <FireSvg width={size} height={size} color={color} fill={color} preserveAspectRatio="xMidYMid meet" />;
    case 'BLUE': return <WaterSvg width={size} height={size} color={color} fill={color} preserveAspectRatio="xMidYMid meet" />;
    case 'GREEN': return <EarthSvg width={size} height={size} color={color} fill={color} preserveAspectRatio="xMidYMid meet" />;
    case 'YELLOW': return <AirSvg width={size} height={size} color={color} fill={color} preserveAspectRatio="xMidYMid meet" />;
    default: return null;
  }
};

const CELL_PCT = 100 / 15; // 6.666%

const getTileCoords = (player, relativePosition, pieceIndex) => {
  let col, row;
  if (relativePosition === -1) {
    [col, row] = YARD_POSITIONS[player][pieceIndex];
  } else if (relativePosition >= 0 && relativePosition <= 50) {
    const globalPos = (BASE_OFFSETS[player] + relativePosition) % 52;
    [col, row] = GLOBAL_PATH[globalPos];
  } else if (relativePosition >= 51 && relativePosition <= 55) {
    [col, row] = HOME_PATHS[player][relativePosition - 51];
  } else if (relativePosition === 56) {
    const offsets = { RED: [6.5, 7], GREEN: [7, 6.5], YELLOW: [7.5, 7], BLUE: [7, 7.5] };
    [col, row] = offsets[player];
  }
  return { col, row };
};

const Token = ({ piece, eligible, onPress, stackOffset }) => {
  const pieceIndex = parseInt(piece.id.split('_')[1]);
  const currentCoords = getTileCoords(piece.player, piece.relativePosition, pieceIndex);

  const left = useSharedValue(currentCoords.col * CELL_PCT);
  const top = useSharedValue(currentCoords.row * CELL_PCT);
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
        left.value = withTiming(target.col * CELL_PCT, { duration: 400 });
        top.value = withTiming(target.row * CELL_PCT, { duration: 400 });
      } else {
        let steps = [];
        let start = oldPos === -1 ? 0 : oldPos + 1;

        for (let pos = start; pos <= newPos; pos++) {
          const coords = getTileCoords(piece.player, pos, pieceIndex);
          steps.push({
            left: coords.col * CELL_PCT,
            top: coords.row * CELL_PCT
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

  const theme = SHINY_THEMES[piece.player] || { color: COLORS[piece.player], topGleam: '#FFFFFF' };

  return (
    <Animated.View style={[styles.tokenContainer, animatedStyle]}>
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={!eligible}
        onPress={() => onPress(piece.id)}
        style={styles.tokenTouchable}
      >
        {eligible && <View style={styles.glowRing} />}
        <View style={[
          styles.tokenDisc,
          {
            borderColor: theme.color,
            borderTopColor: theme.topGleam,
            borderLeftColor: theme.topGleam,
            shadowColor: theme.color,
          }
        ]}>
          <View style={styles.symbolContainer}>
            {getTokenSymbol(piece.player, theme.color)}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const Tokens = ({ pieces, eligiblePieces, onPiecePress }) => {
  const tileGroups = {};

  pieces.forEach(piece => {
    if (piece.relativePosition === -1 || piece.relativePosition === 56) return;
    const pieceIndex = parseInt(piece.id.split('_')[1]);
    const { col, row } = getTileCoords(piece.player, piece.relativePosition, pieceIndex);
    const key = `${col},${row}`;
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
          const { col, row } = getTileCoords(piece.player, piece.relativePosition, pieceIndex);
          const key = `${col},${row}`;
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
    width: `${100 / 15}%`,
    height: `${100 / 15}%`,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  tokenTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: '116%',
    aspectRatio: 1,
    borderRadius: 9999,
    backgroundColor: 'rgba(34, 197, 94, 0.35)',
    borderWidth: 2.5,
    borderColor: '#22C55E',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
  },
  tokenDisc: {
    width: '94%',
    aspectRatio: 1,
    borderRadius: 9999,
    backgroundColor: '#F8F9FA', // Clean off-white surface
    borderWidth: 2.8, // Crisp shiny outline
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 5,
  },
  symbolContainer: {
    width: '78%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  }
});

export default Tokens;
