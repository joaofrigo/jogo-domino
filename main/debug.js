// debug.js


export function enableDragDebug(deckContainer) {
  deckContainer.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('deck-piece')) {
      console.log('dragstart fired:', {
        sideA: e.target.dataset.sideA,
        sideB: e.target.dataset.sideB,
      });
      e.dataTransfer.setData('text/plain', '');
    }
  });

  deckContainer.addEventListener('dragend', (e) => {
    if (e.target.classList.contains('deck-piece')) {
      console.log('dragend fired');
    }
  });
}

export function enableDropDebug(gameBoard) {
  gameBoard.addEventListener('dragover', (e) => {
    e.preventDefault();
    console.log('dragover fired on', e.target.className, e.target.dataset);
  });

  gameBoard.addEventListener('drop', (e) => {
    e.preventDefault();
    const cell = e.target.closest('.cell');
    console.log('drop fired on', cell ? `cell at (${cell.dataset.row},${cell.dataset.col})` : 'no cell');
  });
}

export function renderDebugGrid(grid, container) {
  container.innerHTML = '';
  container.style.display = 'grid';
  container.style.gridTemplateRows = `repeat(${grid.rows}, 20px)`;
  container.style.gridTemplateColumns = `repeat(${grid.cols}, 20px)`;
  container.style.gap = '1px';

  for (let y = 0; y < grid.rows; y++) {
    for (let x = 0; x < grid.cols; x++) {
      const cell = document.createElement('div');
      cell.classList.add('debug-cell');
      cell.style.width = '20px';
      cell.style.height = '20px';
      cell.style.border = '1px solid #ccc';

      const cellData = grid.getPieceAt(x, y);
      if (cellData) {
        const img = document.createElement('img');
        const value = cellData.part === 0 ? cellData.piece.sideA : cellData.piece.sideB;
        img.src = `img/${value}.png`;
        img.alt = `${value}`;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';

        cell.appendChild(img);
      }

      container.appendChild(cell);
    }
  }
}