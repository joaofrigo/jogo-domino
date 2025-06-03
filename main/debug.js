// debug.js
import { CELL_WIDTH, CELL_HEIGHT, GRID_COLS, GRID_ROWS } from './grid.js';

window.addEventListener('DOMContentLoaded', () => {
  const lousaDiv = document.getElementById('lousa');
  const posicaoMouseDiv = document.getElementById('posicaoMouse');

  lousaDiv.addEventListener('mousemove', (e) => {
    const rect = lousaDiv.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const col = Math.floor(x / CELL_WIDTH);
    const row = Math.floor(y / CELL_HEIGHT);

    if (col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS) {
      posicaoMouseDiv.textContent = `Linha: ${row}, Coluna: ${col}`;
    } else {
      posicaoMouseDiv.textContent = `Fora do grid`;
    }
  });
});
