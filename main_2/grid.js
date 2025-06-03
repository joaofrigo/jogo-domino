// grid.js
export class Grid {
    constructor(rows = 28, cols = 28) {
        this.rows = rows;
        this.cols = cols;
        this.matrix = this.createMatrix();
    }

    createMatrix() {
        const matrix = [];
        for (let i = 0; i < this.rows; i++) {
            const row = [];
            for (let j = 0; j < this.cols; j++) {
                row.push(null); // Célula vazia ou peça de dominó no futuro
            }
            matrix.push(row);
        }
        return matrix;
    }

    render(container) {
        container.innerHTML = ''; // Limpa o grid antes de renderizar
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                // Pode adicionar classes ou estilos dependendo do conteúdo da célula
                container.appendChild(cell);
            }
        }
    }
}
