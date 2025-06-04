import { Grid } from './grid.js';
import { Deck } from './domino.js';
import { renderDebugGrid } from './debug.js';
import { initLupa } from './lupa.js';  // Importação da lupa

export const grid = new Grid();
export const deck = new Deck();

const gameBoard = document.getElementById('gameBoard');
const deckContainer = document.getElementById('deckContainer');
const debugContainer = document.getElementById('debugContainer');  // Adicione esse container no HTML
const lupaContainer = document.getElementById('lupaContainer');    // Adicione esse container no HTML

function placeRandomPieceAtCenter(grid, deck) {
  const randomIndex = Math.floor(Math.random() * deck.pieces.length);
  const randomPiece = deck.pieces[randomIndex];

  const centerX = Math.floor(grid.cols / 2) - 1;
  const centerY = Math.floor(grid.rows / 2);

  if (grid.canPlacePiece(centerX, centerY, randomPiece, 2, 'horizontal')) {
    grid.placePiece(centerX, centerY, randomPiece, 2, 'horizontal');
    deck.pieces.splice(randomIndex, 1);
  }
}

placeRandomPieceAtCenter(grid, deck);
grid.render(gameBoard);
renderDeck(deckContainer, deck);

export function renderDeck(deckContainer, deck) {
  deckContainer.innerHTML = '';

  function getImageSrc(side, variant = '') {
    return `img/${side}${variant}.png`;
  }

  for (const piece of deck.pieces) {
    const div = document.createElement('div');
    div.classList.add('deck-piece');

    if (piece.orientation === 'vertical') {
      div.classList.add('vertical');
      div.style.display = 'flex';
      div.style.flexDirection = 'column';
      div.style.width = '100px';
      div.style.height = '200px';
    } else {
      div.classList.add('horizontal');
      div.style.display = 'flex';
      div.style.flexDirection = 'row';
      div.style.width = '200px';
      div.style.height = '100px';
    }

    div.draggable = true;
    div.dataset.sideA = piece.sideA;
    div.dataset.sideB = piece.sideB;

    const imgA = document.createElement('img');
    imgA.src = getImageSrc(piece.sideA, piece.variantA || '');
    imgA.alt = `${piece.sideA}`;
    imgA.draggable = false;

    const imgB = document.createElement('img');
    imgB.src = getImageSrc(piece.sideB, piece.variantB || '');
    imgB.alt = `${piece.sideB}`;
    imgB.draggable = false;

    if (piece.orientation === 'vertical') {
      imgA.style.height = '50%';
      imgA.style.width = '100%';
      imgB.style.height = '50%';
      imgB.style.width = '100%';
    } else {
      imgA.style.height = '100%';
      imgA.style.width = '50%';
      imgB.style.height = '100%';
      imgB.style.width = '50%';
    }

    imgA.style.objectFit = 'fill';
    imgB.style.objectFit = 'fill';

    div.appendChild(imgA);
    div.appendChild(imgB);

    deckContainer.appendChild(div);
  }
}

renderDebugGrid(grid, debugContainer);

// Inicialização da lupa
initLupa(gameBoard, lupaContainer);
initLupa(deckContainer, lupaContainer);
