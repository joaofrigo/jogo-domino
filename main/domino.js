class Peca {
  constructor(valor1, valor2) {
    this.valor1 = valor1;
    this.valor2 = valor2;

    this.orientacao = 'horizontal';  // Padrão: horizontal
    this.rotated = false;

    this.pos1 = null;  // { row, col }
    this.pos2 = null;

    this.element = this.criarElemento();
  }

  /**
   * Define a posição da peça no grid e calcula pos2 com base na orientação.
   * Também deve ser usado ao mover a peça.
   */
  posicionarNoGrid(row, col, tabuleiroGrid, GRID_ROWS, GRID_COLS) {
    this.pos1 = { row, col };

    let row2 = row;
    let col2 = col;

    if (this.orientacao === 'horizontal') {
      col2 = col + 1;
    } else {
      row2 = row + 1;
    }

    // Validação: não pode ultrapassar os limites do grid
    if (row2 >= GRID_ROWS || col2 >= GRID_COLS) {
      throw new Error('Posição inválida: a peça ultrapassa os limites do grid.');
    }

    this.pos2 = { row: row2, col: col2 };

    // Posiciona a peça no grid
    tabuleiroGrid[this.pos1.row][this.pos1.col] = this;
    tabuleiroGrid[this.pos2.row][this.pos2.col] = this;
  }

  /**
   * Altera a orientação com base na rotação e atualiza a classe CSS.
   */
  rotacionar() {
    this.rotated = !this.rotated;
    this.orientacao = this.rotated ? 'vertical' : 'horizontal';

    if (this.rotated) {
      this.element.classList.add('rotated');
    } else {
      this.element.classList.remove('rotated');
    }
  }

  /**
   * Cria o elemento visual da peça com dois lados.
   */
  criarElemento() {
    const peca = document.createElement('div');
    peca.className = 'peca';

    const lado1 = document.createElement('img');
    lado1.src = `img/${this.valor1}.png`;
    lado1.alt = this.valor1;
    lado1.style.width = '50px';
    lado1.style.height = '50px';
    lado1.draggable = false;

    const lado2 = document.createElement('img');
    lado2.src = `img/${this.valor2}.png`;
    lado2.alt = this.valor2;
    lado2.style.width = '50px';
    lado2.style.height = '50px';
    lado2.draggable = false;

    peca.appendChild(lado1);
    peca.appendChild(lado2);

    // Rotacionar ao duplo clique
    peca.ondblclick = () => this.rotacionar();

    return peca;
  }
}
