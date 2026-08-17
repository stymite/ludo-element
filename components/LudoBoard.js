import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const LudoBoard = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/latest.jpg')}
        style={styles.boardImage}
        resizeMode="contain"
      />
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
