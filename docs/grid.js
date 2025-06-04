// grid.js

export class Grid {
  constructor(rows = 28, cols = 28) {
    this.rows = rows;
    this.cols = cols;
    this.matrix = this.createMatrix();
  }

  createMatrix() {
    // Inicializa matriz 2D com null (posição vazia)
    return Array.from({ length: this.rows }, () =>
      Array.from({ length: this.cols }, () => null)
    );
  }

  isWithinBounds(x, y) {
    return x >= 0 && x < this.cols && y >= 0 && y < this.rows;
  }

  isEmpty(x, y) {
    if (!this.isWithinBounds(x, y)) return false;
    return this.matrix[y][x] === null;
  }

  canPlacePiece(x, y, piece, length = 2, orientation = 'horizontal') {
    // Verifica se todas as células necessárias estão vazias e dentro dos limites
    console.log(JSON.stringify(this.matrix, null, 2));
    for (let offset = 0; offset < length; offset++) {
      let checkX = x;
      let checkY = y;

      if (orientation === 'horizontal') {
        checkX = x + offset;
      } else if (orientation === 'vertical') {
        checkY = y + offset;
      } else {
        // Futuro suporte para outras orientações
        return false;
      }

      if (!this.isWithinBounds(checkX, checkY) || !this.isEmpty(checkX, checkY)) {
        return false;
      }
    }

    return true;
  }

  placePiece(x, y, piece, length = 2, orientation = 'horizontal') {
    if (!this.canPlacePiece(x, y, piece, length, orientation)) return false;

    // Salva objeto com referência da peça e posição relativa (0 ou 1)
    // Exemplo: armazenar lado da peça em cada célula para facilitar renderização
    for (let offset = 0; offset < length; offset++) {
      let cellX = x;
      let cellY = y;

      if (orientation === 'horizontal') {
        cellX = x + offset;
      } else if (orientation === 'vertical') {
        cellY = y + offset;
      }

      // Objeto salvo: { piece: DominoPiece, part: 0 ou 1 }
      this.matrix[cellY][cellX] = {
        piece,
        part: offset,
        orientation,
      };
    }
    console.log(JSON.stringify(this.matrix, null, 2));

    return true;
  }

  removePiece(x, y) {
    // Remove peça inteira baseada na célula escolhida (remove os 2 espaços)
    const cell = this.getPieceAt(x, y);
    if (!cell) return false;

    const { piece, orientation } = cell;

    // Procura células ocupadas pela mesma peça e limpa
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const c = this.matrix[row][col];
        if (c && c.piece === piece) {
          this.matrix[row][col] = null;
        }
      }
    }

    return true;
  }

  getPieceAt(x, y) {
    if (!this.isWithinBounds(x, y)) return null;
    return this.matrix[y][x];
  }

render(container) {
  container.innerHTML = '';

  for (let i = 0; i < this.rows; i++) {
    for (let j = 0; j < this.cols; j++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = i;
      cell.dataset.col = j;

      const cellData = this.matrix[i][j];
      if (cellData) {
        cell.style.backgroundColor = '#ddd';
        const img = document.createElement('img');

        const { piece, part } = cellData;
        const side = part === 0 ? piece.sideA : piece.sideB;
        const variant = part === 0 ? piece.variantA : piece.variantB;

        img.src = `img/${side}${variant}.png`;
        img.alt = `${side}`;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';

        cell.appendChild(img);
      }

      container.appendChild(cell);
    }
  }
}


}
