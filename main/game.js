const maoDiv = document.getElementById('mao');
const lousaDiv = document.getElementById('lousa');

let pecasMao = [];
let pecasLousa = [];

function iniciarJogo() {
  pecasMao = criarPecasDomino();

  pecasMao.forEach((peca) => {
    adicionarPecaNaMao(peca);
  });

  lousaDiv.addEventListener('dragover', dragOver);
  lousaDiv.addEventListener('drop', dropLousa);

  maoDiv.addEventListener('dragover', dragOver);
  maoDiv.addEventListener('drop', dropMao);
}

function adicionarPecaNaMao(peca) {
  peca.element.style.position = 'relative';
  peca.element.style.left = '';
  peca.element.style.top = '';
  peca.element.classList.remove('rotated');
  peca.rotated = false;

  peca.element.draggable = true;
  peca.element.addEventListener('dragstart', dragStart);

  if (!maoDiv.contains(peca.element)) {
    maoDiv.appendChild(peca.element);
  }
  if (!pecasMao.includes(peca)) pecasMao.push(peca);

  pecasLousa = pecasLousa.filter(p => p !== peca);
}

let dragOffsetX = 0;
let dragOffsetY = 0;

function dragStart(e) {
  const pecaEl = e.target.closest('.peca');
  const rect = pecaEl.getBoundingClientRect();

  dragOffsetX = e.clientX - rect.left;
  dragOffsetY = e.clientY - rect.top;

  let pecaIndex = pecasMao.findIndex(p => p.element === pecaEl);
  let fromArea = 'mao';

  if (pecaIndex === -1) {
    pecaIndex = pecasLousa.findIndex(p => p.element === pecaEl);
    fromArea = 'lousa';
  }

  e.dataTransfer.setData('pecaId', pecaIndex);
  e.dataTransfer.setData('fromArea', fromArea);
  e.dataTransfer.effectAllowed = 'move';
}



function dragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

const CELL_WIDTH = 60;
const CELL_HEIGHT = 60;
const GRID_COLS = 28;
const GRID_ROWS = 28;

const tabuleiroGrid = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(null));

function marcarPecaNoGrid(peca, pos1, pos2) {
  tabuleiroGrid[pos1.row][pos1.col] = peca.id;
  tabuleiroGrid[pos2.row][pos2.col] = peca.id;
  peca.pos1 = pos1;
  peca.pos2 = pos2;
}

function limparPecaDoGrid(peca) {
  if (!peca.pos1 || !peca.pos2) return;
  tabuleiroGrid[peca.pos1.row][peca.pos1.col] = null;
  tabuleiroGrid[peca.pos2.row][peca.pos2.col] = null;
  peca.pos1 = null;
  peca.pos2 = null;
}


function renderLousa() {
  while (lousaDiv.firstChild) {
    lousaDiv.removeChild(lousaDiv.firstChild);
  }

  pecasLousa.forEach(peca => {
    peca.element.style.position = 'absolute';
    peca.element.style.left = (peca.col * CELL_WIDTH) + 'px';
    peca.element.style.top = (peca.row * CELL_HEIGHT) + 'px';

    // Ajuste para o segundo bloco da peça
    if (peca.rotated) {
      // vertical: segunda célula fica uma abaixo
      peca.element.style.width = `${CELL_WIDTH}px`;
      peca.element.style.height = `${CELL_HEIGHT * 2}px`;
    } else {
      // horizontal: segunda célula fica à direita
      peca.element.style.width = `${CELL_WIDTH * 2}px`;
      peca.element.style.height = `${CELL_HEIGHT}px`;
    }

    lousaDiv.appendChild(peca.element);
  });
}




// No dropLousa, ao soltar a peça:
function dropLousa(e) {
  e.preventDefault();

  const pecaId = e.dataTransfer.getData('pecaId');
  const fromArea = e.dataTransfer.getData('fromArea');
  if (pecaId === '') return;

  let peca = null;
  if (fromArea === 'mao') {
    peca = pecasMao[pecaId];
    if (!peca) return;
  } else if (fromArea === 'lousa') {
    peca = pecasLousa[pecaId];
    if (!peca) return;
  } else {
    return;
  }

  const rect = lousaDiv.getBoundingClientRect();
  let x = e.clientX - rect.left + lousaDiv.scrollLeft - dragOffsetX;
  let y = e.clientY - rect.top + lousaDiv.scrollTop - dragOffsetY;

  let col = Math.floor(x / CELL_WIDTH);
  let row = Math.floor(y / CELL_HEIGHT);

  col = Math.max(0, Math.min(col, GRID_COLS - 1));
  row = Math.max(0, Math.min(row, GRID_ROWS - 1));

  // Limpar a peça do grid auxiliar (posição antiga)
  limparPecaDoGrid(peca);

  // Validar a jogada
  const resultado = jogadaValida(peca, col, row);
  if (!resultado.valido) {
    alert('Jogada inválida: ' + resultado.erro);
    // Se a peça estava no grid, remarca posição antiga para evitar "perda"
    if (peca.pos1 && peca.pos2) marcarPecaNoGrid(peca, peca.pos1, peca.pos2);
    return;
  }

  // Marcar nova posição no tabuleiro auxiliar
  const pos1 = { col, row };
  const pos2 = peca.rotated ? { col, row: row + 1 } : { col: col + 1, row };
  marcarPecaNoGrid(peca, pos1, pos2);

  // Atualizar posição da peça
  peca.col = col;
  peca.row = row;

  peca.element.style.position = 'absolute';
  peca.element.style.left = (col * CELL_WIDTH) + 'px';
  peca.element.style.top = (row * CELL_HEIGHT) + 'px';

  if (!pecasLousa.includes(peca)) {
    pecasLousa.push(peca);
  }

  if (fromArea === 'mao') {
    pecasMao.splice(pecaId, 1);
    maoDiv.removeChild(peca.element);
    lousaDiv.appendChild(peca.element);
  }

  verificarVitoria();
}








function dropMao(e) {
  e.preventDefault();

  const pecaId = e.dataTransfer.getData('pecaId');
  const fromArea = e.dataTransfer.getData('fromArea');
  if (pecaId === '') return;

  if (fromArea === 'lousa') {
    const peca = pecasLousa[pecaId];
    if (!peca) return;

    // Limpar do tabuleiro auxiliar
    limparPecaDoGrid(peca);

    pecasLousa.splice(pecaId, 1);
    adicionarPecaNaMao(peca);
  }
}


function verificarVitoria() {
  if (pecasMao.length === 0) {
    alert('Você venceu! Todas as peças foram usadas.');
  }
}

function jogadaValida(peca, col, row) {
  let erro = '';

  if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) {
    erro = 'Posição inicial fora do grid.';
    return { valido: false, erro };
  }

  const pos1 = { col, row };
  const pos2 = peca.rotated ? { col, row: row + 1 } : { col: col + 1, row };

  if (pos2.col < 0 || pos2.col >= GRID_COLS || pos2.row < 0 || pos2.row >= GRID_ROWS) {
    erro = 'Peça ultrapassa os limites do grid.';
    return { valido: false, erro };
  }

  function posicaoOcupada(pos, peca) {
    const ocupante = tabuleiroGrid[pos.row][pos.col];
    return ocupante !== null && ocupante !== peca.id;
  }

  if (posicaoOcupada(pos1, peca) || posicaoOcupada(pos2, peca)) {
    erro = 'Posição já ocupada por outra peça.';
    return { valido: false, erro };
  }

  if (pecasLousa.length === 0) return { valido: true };

  function valoresBatem(p1, p2, ladoP1, ladoP2) {
    return p1[ladoP1] === p2[ladoP2];
  }

  const adjacentes = pecasLousa.filter(p =>
    (p.col === pos1.col && (p.row === pos1.row - 1 || p.row === pos1.row + 1)) ||
    (p.row === pos1.row && (p.col === pos1.col - 1 || p.col === pos1.col + 1)) ||
    (p.col === pos2.col && (p.row === pos2.row - 1 || p.row === pos2.row + 1)) ||
    (p.row === pos2.row && (p.col === pos2.col - 1 || p.col === pos2.col + 1))
  );

  if (adjacentes.length === 0) {
    erro = 'Peça não está adjacente a nenhuma peça.';
    return { valido: false, erro };
  }

  const posicoes = [pos1, pos2];

  for (let i = 0; i < 2; i++) {
    const pos = posicoes[i];
    const adjs = adjacentes.filter(p =>
      (p.col === pos.col && (p.row === pos.row - 1 || p.row === pos.row + 1)) ||
      (p.row === pos.row && (p.col === pos.col - 1 || p.col === pos.col + 1))
    );

    if (adjs.length === 0) continue;

    for (const adj of adjs) {
      let ladoNovaPeca, ladoAdjPeca;

      if (adj.col === pos.col) {
        if (adj.row === pos.row - 1) {
          ladoNovaPeca = (peca.rotated ? 'valor1' : 'valor2');
          ladoAdjPeca = (adj.rotated ? 'valor2' : 'valor1');
        } else if (adj.row === pos.row + 1) {
          ladoNovaPeca = (peca.rotated ? 'valor2' : 'valor1');
          ladoAdjPeca = (adj.rotated ? 'valor1' : 'valor2');
        }
      } else if (adj.row === pos.row) {
        if (adj.col === pos.col - 1) {
          ladoNovaPeca = (peca.rotated ? 'valor2' : 'valor1');
          ladoAdjPeca = (adj.rotated ? 'valor1' : 'valor2');
        } else if (adj.col === pos.col + 1) {
          ladoNovaPeca = (peca.rotated ? 'valor1' : 'valor2');
          ladoAdjPeca = (adj.rotated ? 'valor2' : 'valor1');
        }
      }

      if (ladoNovaPeca && ladoAdjPeca) {
        if (!valoresBatem(peca, adj, ladoNovaPeca, ladoAdjPeca)) {
          erro = `Valor da peça não bate com peça adjacente na posição (${adj.col}, ${adj.row}).`;
          return { valido: false, erro };
        }
      }
    }
  }

  return { valido: true };
}





window.onload = iniciarJogo;
