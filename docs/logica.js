// logica.js

export const extremities = [];

/**
 * Adiciona as extremidades iniciais após a primeira peça ser inserida.
 *
 * @param {number} x - Coluna da peça.
 * @param {number} y - Linha da peça.
 * @param {DominoPiece} piece - Peça de dominó.
 * @param {'horizontal'|'vertical'} orientation - Orientação da peça.
 */
export function addInitialExtremities(x, y, piece, orientation) {
  extremities.length = 0;

  if (orientation === 'horizontal') {
    extremities.push({
      x: x - 1,
      y,
      expectedValue: piece.sideA,
      direction: 'W'
    });
    extremities.push({
      x: x + 2,
      y,
      expectedValue: piece.sideB,
      direction: 'E'
    });
  } else {
    extremities.push({
      x,
      y: y - 1,
      expectedValue: piece.sideA,
      direction: 'N'
    });
    extremities.push({
      x,
      y: y + 2,
      expectedValue: piece.sideB,
      direction: 'S'
    });
  }
}

/**
 * Atualiza extremidades após uma inserção de peça no tabuleiro.
 *
 * @param {number} x - Coluna da peça.
 * @param {number} y - Linha da peça.
 * @param {DominoPiece} piece - Peça de dominó.
 * @param {'horizontal'|'vertical'} orientation - Orientação da peça.
 */
export function updateExtremitiesAfterInsertion(x, y, piece, orientation) {
  // Remove a extremidade utilizada
  const usedExtremityIndex = extremities.findIndex(ext =>
    Math.abs(ext.x - x) <= 1 && Math.abs(ext.y - y) <= 1
  );

  if (usedExtremityIndex >= 0) {
    extremities.splice(usedExtremityIndex, 1);
  }

  // Adiciona nova extremidade conforme orientação
  if (orientation === 'horizontal') {
    const newX = (x > extremities[0]?.x) ? x + 2 : x - 1;
    const newSide = (x > extremities[0]?.x) ? piece.sideB : piece.sideA;
    const newDir = (x > extremities[0]?.x) ? 'E' : 'W';

    extremities.push({
      x: newX,
      y,
      expectedValue: newSide,
      direction: newDir
    });
  } else {
    const newY = (y > extremities[0]?.y) ? y + 2 : y - 1;
    const newSide = (y > extremities[0]?.y) ? piece.sideB : piece.sideA;
    const newDir = (y > extremities[0]?.y) ? 'S' : 'N';

    extremities.push({
      x,
      y: newY,
      expectedValue: newSide,
      direction: newDir
    });
  }
}

/**
 * Verifica se o tabuleiro está completamente vazio.
 *
 * @param {Grid} grid - Instância da grade.
 * @returns {boolean} True se não houver peças no tabuleiro.
 */
export function isBoardEmpty(grid) {
  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      if (!grid.isEmpty(col, row)) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Gerencia as extremidades após uma inserção de peça.
 *
 * @param {number} x - Coluna da peça.
 * @param {number} y - Linha da peça.
 * @param {DominoPiece} piece - Peça de dominó.
 * @param {'horizontal'|'vertical'} orientation - Orientação da peça.
 * @param {Grid} grid - Instância da grade.
 */
export function handlePieceInsertion(x, y, piece, orientation, grid) {
  if (isBoardEmpty(grid)) {
    addInitialExtremities(x, y, piece, orientation);
  } else {
    updateExtremitiesAfterInsertion(x, y, piece, orientation);
  }
}
