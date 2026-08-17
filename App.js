import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, SafeAreaView, useWindowDimensions, TouchableOpacity, Text, Image } from 'react-native';
import { createGame, rollDice, getLegalMoves, movePiece } from './engine';
import LudoBoard from './components/LudoBoard';
import Tokens from './components/Tokens';
import Dice from './components/Dice';
import { WinnerModal, MenuModal } from './components/Modals';
import { getBestBotMove } from './botEngine';
import HomeMenu from './components/HomeMenu';

export default function App() {
  const [appState, setAppState] = useState('HOME'); // 'SPLASH', 'HOME', 'GAME'
  const [gameMode, setGameMode] = useState('PASS_N_PLAY'); // 'PASS_N_PLAY', 'VS_COMPUTER'
  const [gameState, setGameState] = useState(() => createGame(4));
  const [eligiblePieces, setEligiblePieces] = useState([]);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const boardSize = Math.max(260, Math.min(width - 24, height - (isLandscape ? 140 : 210), 540));

  // Update eligible pieces whenever state changes
  useEffect(() => {
    if (gameState.turnPhase === 'WAITING_FOR_MOVE') {
      const moves = getLegalMoves(gameState);
      setEligiblePieces(moves.map(p => p.id));
      
      const isBot = gameState.players[gameState.activePlayer]?.isBot;
      if (moves.length === 1 && !isBot) {
        setTimeout(() => {
          handlePiecePress(moves[0].id);
        }, 500);
      }
    } else {
      setEligiblePieces([]);
    }
  }, [gameState]);

  // Handle Bot Turns
  useEffect(() => {
    if (gameState.gameOver || appState !== 'GAME') return;

    const activePlayerId = gameState.activePlayer;
    const isBot = gameState.players[activePlayerId]?.isBot;

    if (isBot) {
      if (gameState.turnPhase === 'WAITING_FOR_ROLL') {
        const timerId = setTimeout(() => {
          handleRollDice();
        }, 600);
        return () => clearTimeout(timerId);
      } else if (gameState.turnPhase === 'WAITING_FOR_MOVE') {
        const bestMoveId = getBestBotMove(gameState);
        if (bestMoveId) {
          const timerId = setTimeout(() => {
            handlePiecePress(bestMoveId);
          }, 600);
          return () => clearTimeout(timerId);
        }
      }
    }
  }, [gameState, appState]);

  const handleRollDice = () => {
    if (gameState.turnPhase !== 'WAITING_FOR_ROLL' || gameState.gameOver) return;
    
    const nextState = rollDice({ ...gameState });
    nextState.pieces = [...nextState.pieces.map(p => ({...p}))];
    nextState.players = JSON.parse(JSON.stringify(nextState.players));
    setGameState(nextState);
  };

  const handlePiecePress = (pieceId) => {
    if (gameState.turnPhase !== 'WAITING_FOR_MOVE' || gameState.gameOver) return;
    
    const legalMoves = getLegalMoves(gameState);
    if (!legalMoves.some(p => p.id === pieceId)) return;
    
    const nextState = movePiece({ ...gameState }, pieceId);
    nextState.pieces = [...nextState.pieces.map(p => ({...p}))];
    nextState.players = JSON.parse(JSON.stringify(nextState.players));
    setGameState(nextState);
  };

  const handleNewGame = () => {
    if (gameMode === 'VS_COMPUTER') {
      setGameState(createGame(4, ['YELLOW', 'BLUE', 'RED']));
    } else {
      setGameState(createGame(4));
    }
    setIsMenuVisible(false);
  };

  const handleExitToHome = () => {
    setIsMenuVisible(false);
    setAppState('HOME');
  };

  if (appState === 'SPLASH') {
    return (
      <TouchableOpacity 
        style={styles.splashContainer} 
        activeOpacity={1} 
        onPress={() => setAppState('HOME')}
      >
        <StatusBar style="light" />
        <Image 
          source={require('./assets/Splash_Screen.png')} 
          style={{ width: '100%', height: '100%' }} 
          resizeMode="cover" 
        />
        <View style={styles.playNowOverlay}>
          <Text style={styles.playNowText}>Tap anywhere to Play Now!</Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (appState === 'HOME') {
    return (
      <HomeMenu
        onPassNPlay={() => {
          setGameMode('PASS_N_PLAY');
          setGameState(createGame(4));
          setAppState('GAME');
        }}
        onPlayComputer={() => {
          setGameMode('VS_COMPUTER');
          setGameState(createGame(4, ['YELLOW', 'BLUE', 'RED']));
          setAppState('GAME');
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>LUDO</Text>
        <TouchableOpacity style={styles.menuBtn} onPress={() => setIsMenuVisible(true)}>
          <Text style={styles.menuBtnText}>Menu</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.gameArea}>
        {/* Top Row Dice */}
        <View style={[styles.diceRow, { width: boardSize }]}>
          <Dice 
            value={gameState.diceValue}
            isActive={gameState.activePlayer === 'GREEN'}
            onRoll={handleRollDice}
            disabled={gameState.turnPhase !== 'WAITING_FOR_ROLL' || gameState.gameOver || gameState.activePlayer !== 'GREEN' || gameState.players['GREEN']?.isBot}
          />
          <Dice 
            value={gameState.diceValue}
            isActive={gameState.activePlayer === 'YELLOW'}
            onRoll={handleRollDice}
            disabled={gameState.turnPhase !== 'WAITING_FOR_ROLL' || gameState.gameOver || gameState.activePlayer !== 'YELLOW' || gameState.players['YELLOW']?.isBot}
          />
        </View>

        <View style={[styles.boardContainer, { width: boardSize, height: boardSize }]}>
          <LudoBoard />
          <Tokens 
            pieces={gameState.pieces} 
            eligiblePieces={
              gameState.players[gameState.activePlayer]?.isBot ? [] : eligiblePieces
            }
            onPiecePress={handlePiecePress} 
            boardSize={boardSize}
          />
        </View>

        {/* Bottom Row Dice */}
        <View style={[styles.diceRow, { width: boardSize }]}>
          <Dice 
            value={gameState.diceValue}
            isActive={gameState.activePlayer === 'RED'}
            onRoll={handleRollDice}
            disabled={gameState.turnPhase !== 'WAITING_FOR_ROLL' || gameState.gameOver || gameState.activePlayer !== 'RED' || gameState.players['RED']?.isBot}
          />
          <Dice 
            value={gameState.diceValue}
            isActive={gameState.activePlayer === 'BLUE'}
            onRoll={handleRollDice}
            disabled={gameState.turnPhase !== 'WAITING_FOR_ROLL' || gameState.gameOver || gameState.activePlayer !== 'BLUE' || gameState.players['BLUE']?.isBot}
          />
        </View>
      </View>

      <WinnerModal 
        visible={gameState.gameOver} 
        ranks={
          Object.fromEntries(
            Object.entries(gameState.players).map(([player, data]) => [player, data.rank])
          )
        }
        onNewGame={handleNewGame}
      />

      <MenuModal 
        visible={isMenuVisible}
        onResume={() => setIsMenuVisible(false)}
        onNewGame={handleNewGame}
        onExitToHome={handleExitToHome}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#212121',
  },
  menuBtn: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  menuBtnText: {
    fontWeight: 'bold',
    color: '#424242',
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },
  playNowOverlay: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  playNowText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  diceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  boardContainer: {
    alignSelf: 'center',
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  }
});
