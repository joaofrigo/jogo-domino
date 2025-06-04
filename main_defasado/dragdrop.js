import {
  CELL_WIDTH,
  CELL_HEIGHT,
  GRID_COLS,
  GRID_ROWS,
  marcarPecaNoGrid,
  limparPecaDoGrid,
} from './grid.js';
import { jogadaValida } from './validator.js';
import { renderLousa } from './render.js';
import { atualizarExtremidadesPorLeituraDeMatriz } from './leitor_de_matriz.js';

let dragOffsetX = 0;
let dragOffsetY = 0;

function calcularCelula(e, lousaDiv) {
  const rect = lousaDiv.getBoundingClientRect();
  const x = e.clientX - rect.left + lousaDiv.scrollLeft - dragOffsetX;
  const y = e.clientY - rect.top  + lousaDiv.scrollTop  - dragOffsetY;
  let col = Math.floor(x / CELL_WIDTH);
  let row = Math.floor(y / CELL_HEIGHT);
  col = Math.max(0, Math.min(col, GRID_COLS - 1));
  row = Math.max(0, Math.min(row, GRID_ROWS - 1));
  return { col, row };
}

function tratarPrimeiraPeca(peca, row, col) {
  return true; // Nada mais a fazer: extremidades agora são lidas da matriz
}

function encaixarEmExtremidade(peca, row, col, extremidades) {
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

  let encontrou = false;
  for (const { valor, pos, dRow, dCol } of pontas) {
    const vizRow = pos.row + dRow;
    const vizCol = pos.col + dCol;
    if (vizRow < 0 || vizRow >= GRID_ROWS || vizCol < 0 || vizCol >= GRID_COLS) continue;

    for (const ext of extremidades) {
      if (ext.row === vizRow && ext.col === vizCol && ext.valor === valor) {
        if (encontrou) return false;  // Não pode encaixar em mais de uma
        encontrou = true;
      }
    }
  }
  return encontrou;
}

export function dragStart(e, pecasMao, pecasLousa) {
  const pecaEl = e.target.closest('.peca');
  const rect = pecaEl.getBoundingClientRect();
  dragOffsetX = e.clientX - rect.left;
  dragOffsetY = e.clientY - rect.top;

  let pecaIndex = pecasMao.findIndex((p) => p.element === pecaEl);
  let fromArea = 'mao';
  if (pecaIndex === -1) {
    pecaIndex = pecasLousa.findIndex((p) => p.element === pecaEl);
    fromArea = 'lousa';
  }
  e.dataTransfer.setData('pecaId', pecaIndex);
  e.dataTransfer.setData('fromArea', fromArea);
  e.dataTransfer.effectAllowed = 'move';
}

export function dragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

export function dropLousa(
  e,
  lousaDiv,
  maoDiv,
  pecasMao,
  pecasLousa,
  verificarVitoria
) {
  e.preventDefault();

  const pecaIdRaw = e.dataTransfer.getData('pecaId');
  if (pecaIdRaw === '') return;
  const pecaId = parseInt(pecaIdRaw, 10);

  const fromArea = e.dataTransfer.getData('fromArea');
  const peca = fromArea === 'mao' ? pecasMao[pecaId] : pecasLousa[pecaId];
  if (!peca) return;

  const { col, row } = calcularCelula(e, lousaDiv);

  limparPecaDoGrid(peca);

  const resultado = jogadaValida(peca, col, row, pecasLousa);
  if (!resultado.valido) {
    alert('Jogada inválida: ' + resultado.erro);
    if (peca.pos1 && peca.pos2) {
      marcarPecaNoGrid(peca, peca.pos1, peca.pos2);
    }
    return;
  }

  const extremidades = atualizarExtremidadesPorLeituraDeMatriz();

  let encaixou = false;

  if (extremidades.length === 0) {
    encaixou = tratarPrimeiraPeca(peca, row, col);
  } else {
    encaixou = encaixarEmExtremidade(peca, row, col, extremidades);
  }

  if (!encaixou && extremidades.length > 0) {
    alert('Peça deve encaixar em uma extremidade disponível.');
    if (peca.pos1 && peca.pos2) {
      marcarPecaNoGrid(peca, peca.pos1, peca.pos2);
    }
    return;
  }

  const pos1 = { row, col };
  const pos2 = peca.rotated
    ? { row: row + 1, col }
    : { row, col: col + 1 };

  marcarPecaNoGrid(peca, pos1, pos2);

  peca.row = row;
  peca.col = col;

  peca.element.style.position = 'absolute';
  peca.element.style.left = `${col * CELL_WIDTH}px`;
  peca.element.style.top = `${row * CELL_HEIGHT}px`;

  if (!pecasLousa.includes(peca)) {
    pecasLousa.push(peca);
  }

  if (fromArea === 'mao') {
    pecasMao.splice(pecaId, 1);
    maoDiv.removeChild(peca.element);
    lousaDiv.appendChild(peca.element);
  }

  renderLousa(lousaDiv, pecasLousa);
  verificarVitoria();
}


export function dropMao(e, maoDiv, pecasMao, pecasLousa) {
  e.preventDefault();
  const pecaId = e.dataTransfer.getData('pecaId');
  const fromArea = e.dataTransfer.getData('fromArea');
  if (pecaId === '') return;

  if (fromArea === 'lousa') {
    const peca = pecasLousa[pecaId];
    if (!peca) return;

    limparPecaDoGrid(peca);
    pecasLousa.splice(pecaId, 1);
    adicionarPecaNaMao(peca, maoDiv, pecasMao, pecasLousa);
  }
}

export function adicionarPecaNaMao(peca, maoDiv, pecasMao, pecasLousa) {
  peca.element.style.position = 'relative';
  peca.element.style.left = '';
  peca.element.style.top = '';
  peca.element.classList.remove('rotated');
  peca.rotated = false;

  peca.element.draggable = true;
  peca.element.addEventListener('dragstart', (e) =>
    dragStart(e, pecasMao, pecasLousa)
  );

  if (!maoDiv.contains(peca.element)) {
    maoDiv.appendChild(peca.element);
  }
  if (!pecasMao.includes(peca)) {
    pecasMao.push(peca);
  }
}
