export const CELL_SIZE = 40;
export const BOARD_SIZE = CELL_SIZE * 15; // 600

export const COLORS = {
  RED: '#E53935',
  GREEN: '#2E7D32',
  YELLOW: '#F59E0B',
  BLUE: '#1E88E5',
  BOARD_BG: '#FFFFFF',
  PATH_BG: '#F5F5F5',
  SAFE_SPOT: '#E0E0E0',
  BORDER: '#BDBDBD',
  TEXT: '#212121',
};

// Map global relative positions (0-51) to [col, row]
export const GLOBAL_PATH = [
  // RED start to GREEN start (0 - 12)
  [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
  [6, 5], [6, 4], [6, 3], [6, 2], [6, 1], [6, 0],
  [7, 0], [8, 0],
  // GREEN start to YELLOW start (13 - 25)
  [8, 1], [8, 2], [8, 3], [8, 4], [8, 5],
  [9, 6], [10, 6], [11, 6], [12, 6], [13, 6], [14, 6],
  [14, 7], [14, 8],
  // YELLOW start to BLUE start (26 - 38)
  [13, 8], [12, 8], [11, 8], [10, 8], [9, 8],
  [8, 9], [8, 10], [8, 11], [8, 12], [8, 13], [8, 14],
  [7, 14], [6, 14],
  // BLUE start back to RED start (39 - 51)
  [6, 13], [6, 12], [6, 11], [6, 10], [6, 9],
  [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
  [0, 7], [0, 6]
];

// Map private home stretches (relative positions 51-55)
export const HOME_PATHS = {
  RED: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],
  GREEN: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]],
  YELLOW: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]],
  BLUE: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]],
};

// Yard positions for tokens that haven't entered the board
export const YARD_POSITIONS = {
  RED: [[1.5, 1.5], [3.5, 1.5], [1.5, 3.5], [3.5, 3.5]],
  GREEN: [[10.5, 1.5], [12.5, 1.5], [10.5, 3.5], [12.5, 3.5]],
  YELLOW: [[10.5, 10.5], [12.5, 10.5], [10.5, 12.5], [12.5, 12.5]],
  BLUE: [[1.5, 10.5], [3.5, 10.5], [1.5, 12.5], [3.5, 12.5]],
};

export const BASE_OFFSETS = {
  RED: 0,
  GREEN: 13,
  YELLOW: 26,
  BLUE: 39,
};

export const SAFE_TILES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

// Helper to get [x, y] coordinates for a token given its player and relative position
export const getPixelCoordinates = (player, relativePosition) => {
  let col, row;

  if (relativePosition === -1) {
    // Yard
    // We need to know WHICH token in the yard it is to spread them out. 
    // This will be handled in the Tokens component using the piece's index.
    // For now, return a placeholder or we can pass index to this func.
    return [0, 0];
  } else if (relativePosition >= 0 && relativePosition <= 50) {
    // Global path
    const globalPos = (BASE_OFFSETS[player] + relativePosition) % 52;
    [col, row] = GLOBAL_PATH[globalPos];
  } else if (relativePosition >= 51 && relativePosition <= 55) {
    // Home track
    [col, row] = HOME_PATHS[player][relativePosition - 51];
  } else if (relativePosition === 56) {
    // Center Destination (approximate depending on player)
    if (player === 'RED') return [6.5 * CELL_SIZE, 7 * CELL_SIZE];
    if (player === 'GREEN') return [7 * CELL_SIZE, 6.5 * CELL_SIZE];
    if (player === 'YELLOW') return [7.5 * CELL_SIZE, 7 * CELL_SIZE];
    if (player === 'BLUE') return [7 * CELL_SIZE, 7.5 * CELL_SIZE];
  } else {
    // Fallback
    [col, row] = [0, 0];
  }

  return [col * CELL_SIZE, row * CELL_SIZE];
};
