import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { GLOBAL_PATH, HOME_PATHS, YARD_POSITIONS, YARD_PIXEL_POSITIONS, getCellRect } from '../constants';

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
    YARD_POSITIONS[player].forEach((_, idx) => {
      const pos = YARD_PIXEL_POSITIONS[player][idx];
      tiles.push({
        key: `yard_${player}_${idx}`,
        left: pos.left - 3.3,
        top: pos.top - 3.3,
        width: 6.6,
        height: 6.6,
        label: `Y`
      });
    });
  });

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/updated.jpg')}
        style={styles.boardImage}
        resizeMode="contain"
      />
      {/* 4 Base Palace Cover Placeholders (Exact fit covering full inner palace box and borders) */}
      <View
        style={{
          position: 'absolute',
          left: '5.4%',
          top: '6.6%',
          width: '28.3%',
          height: '28.6%',
          backgroundColor: '#000000',
          borderRadius: 18,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: '66.3%',
          top: '6.6%',
          width: '28.3%',
          height: '28.6%',
          backgroundColor: '#000000',
          borderRadius: 18,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: '66.3%',
          top: '66.0%',
          width: '28.3%',
          height: '28.6%',
          backgroundColor: '#000000',
          borderRadius: 18,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: '5.4%',
          top: '66.0%',
          width: '28.3%',
          height: '28.6%',
          backgroundColor: '#000000',
          borderRadius: 18,
        }}
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
