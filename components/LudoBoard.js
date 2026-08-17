import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { GLOBAL_PATH, HOME_PATHS, YARD_POSITIONS, getCellRect } from '../constants';

const LudoBoard = () => {
  const tiles = [];

  // 1. Global Path (0 - 51)
  GLOBAL_PATH.forEach(([col, row], idx) => {
    const rect = getCellRect(col, row);
    tiles.push({ key: `global_${idx}`, ...rect, label: `${idx}` });
  });

  // 2. Home Paths (51 - 55)
  ['GREEN', 'YELLOW', 'BLUE', 'RED'].forEach(player => {
    HOME_PATHS[player].forEach(([col, row], idx) => {
      const rect = getCellRect(col, row);
      tiles.push({ key: `home_${player}_${idx}`, ...rect, label: `H${idx + 1}` });
    });
  });

  // 3. Yard Positions
  ['GREEN', 'YELLOW', 'BLUE', 'RED'].forEach(player => {
    YARD_POSITIONS[player].forEach(([col, row], idx) => {
      const rect = getCellRect(Math.floor(col), Math.floor(row));
      tiles.push({ key: `yard_${player}_${idx}`, ...rect, label: `Y` });
    });
  });

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/latest.jpg')}
        style={styles.boardImage}
        resizeMode="contain"
      />
      {/* Temporary Debug Path Overlay */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {tiles.map(({ key, left, top, width, height, label }) => (
          <View
            key={key}
            style={{
              position: 'absolute',
              left: `${left}%`,
              top: `${top}%`,
              width: `${width}%`,
              height: `${height}%`,
              backgroundColor: 'rgba(255, 0, 0, 0.20)', // Pure RED 20% opacity
              borderWidth: 1,
              borderColor: 'rgba(255, 0, 0, 0.8)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'rgba(255, 0, 0, 0.95)', fontSize: 7, fontWeight: '900' }}>
              {label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  boardImage: {
    width: '100%',
    height: '100%',
  }
});

export default LudoBoard;
