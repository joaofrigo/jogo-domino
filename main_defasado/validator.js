import { GRID_COLS, GRID_ROWS, tabuleiroGrid } from './grid.js';
import { atualizarExtremidadesPorLeituraDeMatriz } from './leitor_de_matriz.js';

/**
 * Verifica se (row, col) está dentro do grid.
 */
function dentroDoGrid(row, col) {
  return row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS;
}

/**
 * Verifica se a célula pos está ocupada por outra peça.
 */
function posicaoOcupada(pos, peca) {
  const ocupante = tabuleiroGrid[pos.row][pos.col];
  return ocupante !== null && ocupante !== peca.id;
}

/**
 * Determina se a peça encaixa em exatamente uma extremidade disponível.
 */
function encaixaEmAlgumaExtremidade(peca, col, row) {
  const extremidades = atualizarExtremidadesPorLeituraDeMatriz();

  const pos1 = { row, col };
  const pos2 = peca.rotated
    ? { row: row + 1, col }
    : { row, col: col + 1 };

  const pontas = [];
  if (peca.rotated) {
    pontas.push({ valor: peca.valor1, pos: pos1, dRow: -1, dCol: 0 });
    pontas.push({ valor: peca.valor2, pos: pos2, dRow: 1,  dCol: 0 });
  } else {
    pontas.push({ valor: peca.valor1, pos: pos1, dRow: 0, dCol: -1 });
    pontas.push({ valor: peca.valor2, pos: pos2, dRow: 0, dCol: 1  });
  }

  let count = 0;
  for (const { valor, pos, dRow, dCol } of pontas) {
    const vizRow = pos.row + dRow;
    const vizCol = pos.col + dCol;
    if (!dentroDoGrid(vizRow, vizCol)) continue;

    for (const ext of extremidades) {
      if (ext.row === vizRow && ext.col === vizCol && ext.valor === valor) {
        count++;
        if (count > 1) return false;
      }
    }
  }
  return count === 1;
}

export function jogadaValida(peca, col, row, pecasLousa) {
  let erro = '';

  // 1) Limites para pos1
  if (!dentroDoGrid(row, col)) {
    erro = 'Posição inicial fora do grid.';
    return { valido: false, erro };
  }

  // 2) Calcula pos2 e verifica limites
  const pos1 = { row, col };
  const pos2 = peca.rotated
    ? { row: row + 1, col }
    : { row, col: col + 1 };

  if (!dentroDoGrid(pos2.row, pos2.col)) {
    erro = 'Peça ultrapassa os limites do grid.';
    return { valido: false, erro };
  }

  // 3) Sobreposição
  if (posicaoOcupada(pos1, peca) || posicaoOcupada(pos2, peca)) {
    erro = 'Posição já ocupada por outra peça.';
    return { valido: false, erro };
  }

  // 4) Se não há peças na lousa, aceita
  if (pecasLousa.length === 0) {
    return { valido: true };
  }

  // 5) Verifica encaixe em extremidade
  if (!encaixaEmAlgumaExtremidade(peca, col, row)) {
    erro = 'Peça deve encaixar em uma extremidade disponível.';
    return { valido: false, erro };
  }

  return { valido: true };
}
