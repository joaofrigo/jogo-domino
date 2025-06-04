/**
 * Classe que representa uma peça de dominó.
 * Cada lado possui um valor e uma variante de imagem.
 */
export class DominoPiece {
    /**
     * @param {number} sideA - Valor do lado A.
     * @param {number} sideB - Valor do lado B.
     * @param {string} variantA - Variante de imagem de A: '' ou 'a'.
     * @param {string} variantB - Variante de imagem de B: '' ou 'a'.
     */
    constructor(sideA, sideB, variantA = '', variantB = '') {
        this.sideA = sideA;
        this.variantA = variantA;

        this.sideB = sideB;
        this.variantB = variantB;

        this.orientation = 'horizontal';
        this.rotationCount = 0;
        this.played = false;
    }

    /**
     * Rotaciona a peça 90° no sentido horário.
     */
    rotate90() {
        this.rotationCount = (this.rotationCount + 1) % 4;
        this.orientation = (this.rotationCount % 2 === 1) ? 'vertical' : 'horizontal';
        if (this.rotationCount === 1 || this.rotationCount === 3) {
            this.swapSides();
        }
    }

    /**
     * Inverte os lados e as variantes.
     */
    swapSides() {
        [this.sideA, this.sideB] = [this.sideB, this.sideA];
        [this.variantA, this.variantB] = [this.variantB, this.variantA];
    }
}

/**
 * Classe que representa um baralho de peças de dominó.
 */
export class Deck {
    /**
     * Cria um baralho com 28 peças, podendo definir variantes por lógica externa.
     */
    constructor() {
        this.pieces = this.createFullDeck();
    }

    /**
     * Cria as 28 peças únicas de dominó com variantes padrão ('').
     * Variantes podem ser alteradas após a criação conforme a necessidade.
     */
    createFullDeck() {
        const pieces = [];
        for (let i = 0; i <= 6; i++) {
            for (let j = i; j <= 6; j++) {
                const variantA = Math.random() < 0.5 ? '' : 'a';
                const variantB = Math.random() < 0.5 ? '' : 'a';
                pieces.push(new DominoPiece(i, j, variantA, variantB));
            }
        }
        return pieces;
    }
    /**
     * Remove e retorna a peça no índice especificado.
     */
    popPiece(index) {
        if (index >= 0 && index < this.pieces.length) {
            return this.pieces.splice(index, 1)[0];
        }
        return null;
    }

    /**
     * Remove a primeira ocorrência de uma peça específica.
     */
    removePiece(piece) {
        const index = this.pieces.findIndex(
            p => p.sideA === piece.sideA && p.sideB === piece.sideB
        );
        if (index !== -1) this.pieces.splice(index, 1);
    }

    /**
     * Adiciona uma peça ao final do baralho.
     */
    addPiece(piece) {
        this.pieces.push(piece);
    }

    /**
     * Verifica se o baralho está vazio.
     */
    isEmpty() {
        return this.pieces.length === 0;
    }
}
