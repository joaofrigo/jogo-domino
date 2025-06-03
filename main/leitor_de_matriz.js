import { GRID_ROWS, GRID_COLS, tabuleiroGrid } from './grid.js';

/**
 * Verifica se uma posição está dentro dos limites do grid.
 */
function dentroDoGrid(row, col) {
  return row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS;
}

/**
 * Percorre a matriz tabuleiroGrid e identifica todas as extremidades válidas.
 * Retorna uma lista única de extremidades no formato:
 * [{ row, col, valor }]
 */
export function atualizarExtremidadesPorLeituraDeMatriz() {
  const novasExtremidades = [];

  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const peca = tabuleiroGrid[row][col];
      if (!peca) continue;

      // Só processa a célula pos1 da peça para evitar duplicação
      if (peca.pos1.row === row && peca.pos1.col === col) {
        const deltaRow = peca.orientacao === 'vertical' ? 1 : 0;
        const deltaCol = peca.orientacao === 'horizontal' ? 1 : 0;

        const posExt1 = {
          row: peca.pos1.row - deltaRow,
          col: peca.pos1.col - deltaCol,
          valor: peca.valor1
        };

        const posExt2 = {
          row: peca.pos2.row + deltaRow,
          col: peca.pos2.col + deltaCol,
          valor: peca.valor2
        };

        // Verifica se as extremidades estão dentro do grid e se estão vazias
        if (dentroDoGrid(posExt1.row, posExt1.col) &&
            !tabuleiroGrid[posExt1.row][posExt1.col]) {
          novasExtremidades.push(posExt1);
        }

        if (dentroDoGrid(posExt2.row, posExt2.col) &&
            !tabuleiroGrid[posExt2.row][posExt2.col]) {
          novasExtremidades.push(posExt2);
        }
      }
    }
  }

  // Remove duplicatas
  const extremidadesUnicas = [];
  const seen = new Set();

  for (const ext of novasExtremidades) {
    const key = `${ext.row},${ext.col},${ext.valor}`;
    if (!seen.has(key)) {
      seen.add(key);
      extremidadesUnicas.push(ext);
    }
  }

  return extremidadesUnicas;
}
