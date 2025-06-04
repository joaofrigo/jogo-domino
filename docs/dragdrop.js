// dragdrop.js
import { grid, deck } from './game.js';
import { DominoPiece } from './domino.js';
import { renderDebugGrid } from './debug.js';
import { renderDeck } from './game.js';

const deckContainer = document.getElementById('deckContainer');
const gameBoard = document.getElementById('gameBoard');

let draggedPiece = null;
let draggedFrom = null; // 'deck' ou 'board'
let draggedFromPosition = null; // { x, y } se da grade

deckContainer.addEventListener('dragstart', (e) => {
  const pieceDiv = e.target.closest('.deck-piece');
  if (pieceDiv) {
    const sideA = parseInt(pieceDiv.dataset.sideA, 10);
    const sideB = parseInt(pieceDiv.dataset.sideB, 10);
    draggedPiece = deck.pieces.find(p => p.sideA === sideA && p.sideB === sideB);
    // Remover a linha abaixo para manter orientação atual da peça
    // if (draggedPiece) draggedPiece.orientation = 'horizontal';

    draggedFrom = 'deck';
    draggedFromPosition = null;

    e.dataTransfer.setData('text/plain', '');
  }
});

// Novo: dragstart para peças no tabuleiro
gameBoard.addEventListener('dragstart', (e) => {
  const cell = e.target.closest('.cell');
  if (!cell) return;

  const x = parseInt(cell.dataset.col, 10);
  const y = parseInt(cell.dataset.row, 10);
  const cellData = grid.getPieceAt(x, y);
  if (!cellData) return;

  draggedPiece = cellData.piece;
  draggedFrom = 'board';
  draggedFromPosition = { x, y };

  // Passa a posição no dataTransfer para saber qual peça está sendo arrastada
  e.dataTransfer.setData('text/plain', `${x},${y}`);
});

// Permite dragover no gameBoard e deckContainer para aceitar drops
gameBoard.addEventListener('dragover', (e) => e.preventDefault());
deckContainer.addEventListener('dragover', (e) => e.preventDefault());

// No drop do gameBoard, bloqueia drop se a peça veio do tabuleiro (para impedir "clone"):
gameBoard.addEventListener('drop', (e) => {
  e.preventDefault();

  if (draggedFrom === 'board') {
    // Peça veio do tabuleiro, não permite drop no tabuleiro — só pode voltar ao deck
    console.log('Não pode reposicionar peça no tabuleiro, apenas devolver ao deck');
    draggedPiece = null;
    draggedFrom = null;
    draggedFromPosition = null;
    return;
  }

  const cell = e.target.closest('.cell');
  if (!cell || !draggedPiece) return;

  const x = parseInt(cell.dataset.col, 10);
  const y = parseInt(cell.dataset.row, 10);
  const pieceLength = 2;

  if (draggedPiece.orientation === 'horizontal') {
    if (!grid.isWithinBounds(x + pieceLength - 1, y)) {
      console.log('Posição fora dos limites');
      return;
    }
  } else if (draggedPiece.orientation === 'vertical') {
    if (!grid.isWithinBounds(x, y + pieceLength - 1)) {
      console.log('Posição fora dos limites');
      return;
    }
  } else {
    console.log('Orientação inválida');
    return;
  }

  const canPlace = grid.canPlacePiece(x, y, draggedPiece, pieceLength, draggedPiece.orientation);
  if (!canPlace) {
    console.log('Não pode colocar peça aqui');
    return;
  }

  const placed = grid.placePiece(x, y, draggedPiece, pieceLength, draggedPiece.orientation);
  if (placed) {
    grid.render(gameBoard);
    removePieceFromDeck(draggedPiece);
    draggedPiece = null;
    draggedFrom = null;
    draggedFromPosition = null;
    console.log('Peça colocada com sucesso');
    renderDebugGrid(grid, document.getElementById('debugContainer'));
  } else {
    console.log('Falha ao colocar peça');
  }
});

// Drop no deckContainer para devolver peça do tabuleiro ao deck
deckContainer.addEventListener('drop', (e) => {
  e.preventDefault();

  if (draggedFrom !== 'board' || !draggedFromPosition) return;

  // Remove peça da grade
  const { x, y } = draggedFromPosition;
  const cellData = grid.getPieceAt(x, y);
  if (!cellData) return;

  const { piece } = cellData;
  grid.removePiece(x, y);
  deck.addPiece(piece);

  // Atualiza UI
  renderDeck(deckContainer, deck);
  grid.render(gameBoard);
  renderDebugGrid(grid, document.getElementById('debugContainer'));

  draggedPiece = null;
  draggedFrom = null;
  draggedFromPosition = null;

  console.log('Peça devolvida ao deck com sucesso');
});

// Função existente para remover peça do deck visualmente e no array
function removePieceFromDeck(piece) {
  const deckPieces = deckContainer.querySelectorAll('.deck-piece');
  for (const el of deckPieces) {
    if (
      parseInt(el.dataset.sideA, 10) === piece.sideA &&
      parseInt(el.dataset.sideB, 10) === piece.sideB
    ) {
      el.remove();
      deck.pieces = deck.pieces.filter(
        p => !(p.sideA === piece.sideA && p.sideB === piece.sideB)
      );
      break;
    }
  }
}

// Rotaciona peça já colocada no tabuleiro (mantém seu código atual)
/*
gameBoard.addEventListener('dblclick', (e) => {
  const cell = e.target.closest('.cell');
  if (!cell) return;

  const x = parseInt(cell.dataset.col, 10);
  const y = parseInt(cell.dataset.row, 10);

  const cellData = grid.getPieceAt(x, y);
  if (!cellData) return;

  const { piece } = cellData;

  grid.removePiece(x, y);
  piece.rotate90();

  const pieceLength = 2;

  if (!grid.canPlacePiece(x, y, piece, pieceLength, piece.orientation)) {
    // Reverte rotação
    piece.rotate90();
    piece.rotate90();
    piece.rotate90();

    grid.placePiece(x, y, piece, pieceLength, piece.orientation);
  } else {
    grid.placePiece(x, y, piece, pieceLength, piece.orientation);
  }

  grid.render(gameBoard);
  renderDebugGrid(grid, document.getElementById('debugContainer'));
});
*/

// Rotaciona peça no baralho (novo evento)
deckContainer.addEventListener('dblclick', (e) => {
  const pieceDiv = e.target.closest('.deck-piece');
  if (!pieceDiv) return;

  const sideA = parseInt(pieceDiv.dataset.sideA, 10);
  const sideB = parseInt(pieceDiv.dataset.sideB, 10);

  const piece = deck.pieces.find(p => p.sideA === sideA && p.sideB === sideB);
  if (!piece) return;

  piece.rotate90();

  renderDeck(deckContainer, deck);
});

