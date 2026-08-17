const PLAYERS = ['GREEN', 'YELLOW', 'BLUE', 'RED'];
const BASE_OFFSETS = { GREEN: 0, YELLOW: 13, BLUE: 26, RED: 39 };
const SAFE_TILES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

function createGame(numPlayers = 4, bots = []) {
  const activePlayers = PLAYERS.slice(0, Math.max(2, Math.min(4, numPlayers)));
  const pieces = [];
  const players = {};

  activePlayers.forEach(player => {
    players[player] = { status: 'PLAYING', rank: null, completedPieces: 0, isBot: bots.includes(player) };
    for (let i = 0; i < 4; i++) {
      pieces.push({ id: `${player}_${i}`, player, relativePosition: -1 });
    }
  });

  return {
    gameId: Math.random().toString(36).substring(2, 9),
    turnOrder: activePlayers,
    activePlayer: activePlayers[0],
    turnPhase: 'WAITING_FOR_ROLL',
    diceValue: null,
    consecutiveSixes: 0,
    pieces,
    players,
    gameOver: false,
    nextRank: 1
  };
}

function rollDice(state, fixedValue = null) {
  if (state.turnPhase !== 'WAITING_FOR_ROLL' || state.gameOver) return state;

  state.diceValue = null;
  const roll = fixedValue || Math.floor(Math.random() * 6) + 1;
  state.diceValue = roll;

  if (roll === 6) {
    state.consecutiveSixes += 1;
    if (state.consecutiveSixes === 3) {
      passTurn(state);
      return state;
    }
  } else {
    state.consecutiveSixes = 0;
  }

  const legalMoves = getLegalMoves(state);
  
  if (legalMoves.length === 0) {
    passTurn(state);
  } else {
    state.turnPhase = 'WAITING_FOR_MOVE';
  }

  return state;
}

function getLegalMoves(state) {
  const { activePlayer, diceValue, pieces } = state;
  return pieces.filter(p => {
    if (p.player !== activePlayer) return false;
    if (p.relativePosition === 56) return false;

    if (p.relativePosition === -1) {
      return diceValue === 6;
    } else {
      return p.relativePosition + diceValue <= 56;
    }
  });
}

function movePiece(state, pieceId) {
  if (state.turnPhase !== 'WAITING_FOR_MOVE' || state.gameOver) return state;

  const piece = state.pieces.find(p => p.id === pieceId);
  if (!piece || piece.player !== state.activePlayer) return state;

  const legalMoves = getLegalMoves(state);
  if (!legalMoves.some(p => p.id === pieceId)) return state;

  let extraRoll = state.diceValue === 6;

  if (piece.relativePosition === -1) {
    piece.relativePosition = 0;
  } else {
    piece.relativePosition += state.diceValue;
  }

  if (piece.relativePosition >= 0 && piece.relativePosition <= 50) {
    const globalPos = (BASE_OFFSETS[piece.player] + piece.relativePosition) % 52;
    if (!SAFE_TILES.has(globalPos)) {
      const enemies = state.pieces.filter(p => {
        if (p.player === piece.player) return false;
        if (p.relativePosition < 0 || p.relativePosition > 50) return false;
        const enemyGlobalPos = (BASE_OFFSETS[p.player] + p.relativePosition) % 52;
        return enemyGlobalPos === globalPos;
      });

      if (enemies.length > 0) {
        enemies.forEach(e => { e.relativePosition = -1; });
        extraRoll = true;
      }
    }
  }

  if (piece.relativePosition === 56) {
    state.players[piece.player].completedPieces += 1;
    extraRoll = true;
    
    if (state.players[piece.player].completedPieces === 4) {
      state.players[piece.player].status = 'FINISHED';
      state.players[piece.player].rank = state.nextRank++;
      extraRoll = false;
    }
    checkGameOver(state);
  }

  if (state.gameOver) {
    return state;
  }

  if (extraRoll) {
    state.turnPhase = 'WAITING_FOR_ROLL';
    state.diceValue = null;
  } else {
    passTurn(state);
  }

  return state;
}

function checkGameOver(state) {
  const playingCount = state.turnOrder.filter(p => state.players[p].status === 'PLAYING').length;
  if (playingCount <= 1) {
    state.gameOver = true;
    const lastPlayer = state.turnOrder.find(p => state.players[p].status === 'PLAYING');
    if (lastPlayer) {
      state.players[lastPlayer].status = 'FINISHED';
      state.players[lastPlayer].rank = state.nextRank;
    }
    state.turnPhase = 'GAME_OVER';
  }
}

function passTurn(state) {
  state.consecutiveSixes = 0;
  state.turnPhase = 'WAITING_FOR_ROLL';

  let currentIndex = state.turnOrder.indexOf(state.activePlayer);
  for (let i = 1; i <= state.turnOrder.length; i++) {
    const nextIndex = (currentIndex + i) % state.turnOrder.length;
    const nextPlayer = state.turnOrder[nextIndex];
    if (state.players[nextPlayer].status === 'PLAYING') {
      state.activePlayer = nextPlayer;
      break;
    }
  }
}

module.exports = {
  createGame,
  rollDice,
  getLegalMoves,
  movePiece
};
