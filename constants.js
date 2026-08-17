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
  // GREEN start (Top-Left) to YELLOW start (0 - 12)
  [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
  [6, 5], [6, 4], [6, 3], [6, 2], [6, 1], [6, 0],
  [7, 0], [8, 0],
  // YELLOW start (Top-Right) to BLUE start (13 - 25)
  [8, 1], [8, 2], [8, 3], [8, 4], [8, 5],
  [9, 6], [10, 6], [11, 6], [12, 6], [13, 6], [14, 6],
  [14, 7], [14, 8],
  // BLUE start (Bottom-Right) to RED start (26 - 38)
  [13, 8], [12, 8], [11, 8], [10, 8], [9, 8],
  [8, 9], [8, 10], [8, 11], [8, 12], [8, 13], [8, 14],
  [7, 14], [6, 14],
  // RED start (Bottom-Left) back to GREEN start (39 - 51)
  [6, 13], [6, 12], [6, 11], [6, 10], [6, 9],
  [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
  [0, 7], [0, 6]
];

// Map private home stretches (relative positions 51-55)
export const HOME_PATHS = {
  GREEN: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],
  YELLOW: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]],
  BLUE: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]],
  RED: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]],
};

// Yard positions for tokens that haven't entered the board
export const YARD_POSITIONS = {
  GREEN: [[1.5, 1.5], [3.5, 1.5], [1.5, 3.5], [3.5, 3.5]], // Top-Left (Earth Kingdom)
  YELLOW: [[10.5, 1.5], [12.5, 1.5], [10.5, 3.5], [12.5, 3.5]], // Top-Right (Air Temple)
  BLUE: [[10.5, 10.5], [12.5, 10.5], [10.5, 12.5], [12.5, 12.5]], // Bottom-Right (Water Tribe)
  RED: [[1.5, 10.5], [3.5, 10.5], [1.5, 12.5], [3.5, 12.5]], // Bottom-Left (Fire Nation)
};

export const BASE_OFFSETS = {
  GREEN: 0,
  YELLOW: 13,
  BLUE: 26,
  RED: 39,
};

export const SAFE_TILES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

// Helper to get [x, y] coordinates for a token given its player and relative position
export const getPixelCoordinates = (player, relativePosition) => {
  let col, row;

  if (relativePosition === -1) {
    return [0, 0];
  } else if (relativePosition >= 0 && relativePosition <= 50) {
    const globalPos = (BASE_OFFSETS[player] + relativePosition) % 52;
    [col, row] = GLOBAL_PATH[globalPos];
  } else if (relativePosition >= 51 && relativePosition <= 55) {
    [col, row] = HOME_PATHS[player][relativePosition - 51];
  } else if (relativePosition === 56) {
    if (player === 'GREEN') return [6.5 * CELL_SIZE, 7 * CELL_SIZE];
    if (player === 'YELLOW') return [7 * CELL_SIZE, 6.5 * CELL_SIZE];
    if (player === 'BLUE') return [7.5 * CELL_SIZE, 7 * CELL_SIZE];
    if (player === 'RED') return [7 * CELL_SIZE, 7.5 * CELL_SIZE];
  } else {
    [col, row] = [0, 0];
  }

  return [col * CELL_SIZE, row * CELL_SIZE];
};
