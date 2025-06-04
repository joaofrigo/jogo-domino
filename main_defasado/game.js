import {
  adicionarPecaNaMao,
  dragOver,
  dropLousa,
  dropMao,
} from './dragdrop.js';

import { atualizarExtremidadesPorLeituraDeMatriz } from './leitor_de_matriz.js';

const maoDiv = document.getElementById('mao');
const lousaDiv = document.getElementById('lousa');

let pecasMao = [];
let pecasLousa = [];

let extremidades = [];

function atualizarEstadoExtremidades() {
  extremidades = atualizarExtremidadesPorLeituraDeMatriz();
}

function resetExtremidades() {
  extremidades = [];
}

function getExtremidades() {
  return extremidades;
}

function verificarVitoria() {
  atualizarEstadoExtremidades();

  if (pecasMao.length === 0) {
    alert('Você venceu! Todas as peças foram usadas.');
    return;
  }

  const extremidadesAtuais = getExtremidades();
  const jogadasPossiveis = pecasMao.some((peca) => {
    return extremidadesAtuais.some((ext) => {
      return peca.valor1 === ext.valor || peca.valor2 === ext.valor;
    });
  });

  if (!jogadasPossiveis) {
    alert('Fim de jogo! Não há mais jogadas possíveis.');
  }
}

export function iniciarJogo() {
  pecasMao = criarPecasDomino();
  pecasLousa = [];

  resetExtremidades();

  pecasMao.forEach((peca) => {
    adicionarPecaNaMao(peca, maoDiv, pecasMao, pecasLousa);
  });

  lousaDiv.addEventListener('dragover', dragOver);
  lousaDiv.addEventListener('drop', (e) =>
    dropLousa(e, lousaDiv, maoDiv, pecasMao, pecasLousa, () => {
      atualizarEstadoExtremidades();
      verificarVitoria();
    })
  );

  maoDiv.addEventListener('dragover', dragOver);
  maoDiv.addEventListener('drop', (e) =>
    dropMao(e, maoDiv, pecasMao, pecasLousa)
  );
}

window.addEventListener('load', iniciarJogo);
