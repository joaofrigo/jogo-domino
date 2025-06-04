// grid.js
export const CELL_WIDTH = 60;
export const CELL_HEIGHT = 60;
export const GRID_COLS = 28;
export const GRID_ROWS = 28;

// Matriz auxiliar que guarda o ID da peça em cada célula (ou null)
export const tabuleiroGrid = Array.from(
  { length: GRID_ROWS },
  () => Array(GRID_COLS).fill(null)
);

export function marcarPecaNoGrid(peca, pos1, pos2) {
  tabuleiroGrid[pos1.row][pos1.col] = peca.id;
  tabuleiroGrid[pos2.row][pos2.col] = peca.id;
  peca.pos1 = pos1;
  peca.pos2 = pos2;
}

export function limparPecaDoGrid(peca) {
  if (!peca.pos1 || !peca.pos2) return;
  tabuleiroGrid[peca.pos1.row][peca.pos1.col] = null;
  tabuleiroGrid[peca.pos2.row][peca.pos2.col] = null;
  peca.pos1 = null;
  peca.pos2 = null;
}
