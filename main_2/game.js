// game.js
import { Grid } from './grid.js';

const gameBoard = document.getElementById('gameBoard');
const grid = new Grid();

grid.render(gameBoard);

// A variável grid.matrix pode ser usada para salvar e manipular peças de dominó.
