// domino.js

export class DominoPiece {
    constructor(sideA, sideB) {
        this.sideA = sideA;
        this.sideB = sideB;
        this.orientation = 'horizontal'; // 'horizontal' ou 'vertical'
        this.rotationCount = 0; // 0,1,2,3 - número de rotações 90°
        this.played = false; // indica se a peça já foi usada
    }

    rotate90() {
        this.rotationCount = (this.rotationCount + 1) % 4;

        // Alterna orientação a cada rotação ímpar/par
        this.orientation = (this.rotationCount % 2 === 1) ? 'vertical' : 'horizontal';

        // Inverte lados após 180° (rotations 2 e 3)
        if (this.rotationCount === 2 || this.rotationCount === 3) {
            this.swapSides();
        }
    }

    swapSides() {
        const temp = this.sideA;
        this.sideA = this.sideB;
        this.sideB = temp;
    }
}

export class Deck {
    constructor() {
        this.pieces = this.createFullDeck();
    }

    createFullDeck() {
        const pieces = [];
        for (let i = 0; i <= 6; i++) {
            for (let j = i; j <= 6; j++) {
                pieces.push(new DominoPiece(i, j));
            }
        }
        return pieces;
    }

    popPiece(index) {
        if (index >= 0 && index < this.pieces.length) {
            return this.pieces.splice(index, 1)[0];
        }
        return null;
    }

    addPiece(piece) {
        this.pieces.push(piece);
    }

    isEmpty() {
        return this.pieces.length === 0;
    }
}
