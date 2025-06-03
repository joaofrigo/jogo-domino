import {
  CELL_WIDTH,
  CELL_HEIGHT,
  GRID_COLS,
  GRID_ROWS,
  tabuleiroGrid,
} from './grid.js';

import { atualizarExtremidadesPorLeituraDeMatriz } from './leitor_de_matriz.js';

/**
 * Desenha as peças na lousa e, abaixo, duas tabelas de debug:
 * 1) Estado de tabuleiroGrid (células ocupadas)
 * 2) Extremidades abertas (células vazias onde encaixar peças)
 */
export function renderLousa(lousaDiv, pecasLousa) {
  // 1) Limpa e desenha as peças na lousa
  while (lousaDiv.firstChild) {
    lousaDiv.removeChild(lousaDiv.firstChild);
  }

  pecasLousa.forEach((peca) => {
    peca.element.style.position = 'absolute';
    peca.element.style.left = `${peca.col * CELL_WIDTH}px`;
    peca.element.style.top = `${peca.row * CELL_HEIGHT}px`;

    if (peca.rotated) {
      peca.element.style.width = `${CELL_WIDTH}px`;
      peca.element.style.height = `${CELL_HEIGHT * 2}px`;
    } else {
      peca.element.style.width = `${CELL_WIDTH * 2}px`;
      peca.element.style.height = `${CELL_HEIGHT}px`;
    }

    lousaDiv.appendChild(peca.element);
  });

  // 2) Gere (ou encontre) a DIV de debug para o grid auxiliar
  let debugDiv = document.getElementById('debugGrid');
  if (!debugDiv) {
    debugDiv = document.createElement('div');
    debugDiv.id = 'debugGrid';
    lousaDiv.parentNode.insertBefore(debugDiv, lousaDiv.nextSibling);
  }

  // 3) Limpa conteúdo anterior
  debugDiv.innerHTML = '';

  // 4) Tabela 1: tabuleiroGrid (ID da peça ou '·')
  const gridTable = document.createElement('table');
  gridTable.style.borderCollapse = 'collapse';
  gridTable.style.marginTop = '8px';

  for (let row = 0; row < GRID_ROWS; row++) {
    const tr = document.createElement('tr');
    for (let col = 0; col < GRID_COLS; col++) {
      const td = document.createElement('td');
      td.style.width = '20px';
      td.style.height = '20px';
      td.style.border = '1px solid #ccc';
      td.style.textAlign = 'center';
      td.style.fontSize = '10px';
      td.style.padding = '0';

      const valor = tabuleiroGrid[row][col];
      td.textContent = valor === null ? '·' : String(valor);
      tr.appendChild(td);
    }
    gridTable.appendChild(tr);
  }
  debugDiv.appendChild(gridTable);

  // 5) Tabela 2: extremidades abertas (valor na célula, '·' em outras)
  const extremidades = atualizarExtremidadesPorLeituraDeMatriz();

  const endsTable = document.createElement('table');
  endsTable.style.borderCollapse = 'collapse';
  endsTable.style.marginTop = '8px';

  for (let row = 0; row < GRID_ROWS; row++) {
    const tr = document.createElement('tr');
    for (let col = 0; col < GRID_COLS; col++) {
      const td = document.createElement('td');
      td.style.width = '20px';
      td.style.height = '20px';
      td.style.border = '1px solid #ccc';
      td.style.textAlign = 'center';
      td.style.fontSize = '10px';
      td.style.padding = '0';

      const ext = extremidades.find(e => e.row === row && e.col === col);
      td.textContent = ext ? String(ext.valor) : '·';
      if (ext) {
        td.style.backgroundColor = 'rgba(255, 215, 0, 0.5)';
      }
      tr.appendChild(td);
    }
    endsTable.appendChild(tr);
  }

  const legenda = document.createElement('div');
  legenda.style.marginTop = '4px';
  legenda.style.fontSize = '12px';
  legenda.textContent = 'Tabela de Extremidades: número na célula = valor a encaixar; células sem valor = ·';

  debugDiv.appendChild(legenda);
  debugDiv.appendChild(endsTable);
}
