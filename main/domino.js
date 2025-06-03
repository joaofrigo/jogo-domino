// Representa uma peça do dominó
class Peca {
  constructor(valor1, valor2) {
    this.valor1 = valor1;
    this.valor2 = valor2;
    this.rotated = false;
    this.col = null;  // inicializa posição no grid vazia
    this.row = null;
    this.element = this.criarElemento();
  }

  criarElemento() {
    const peca = document.createElement('div');
    peca.className = 'peca';

    const lado1 = document.createElement('img');
    lado1.src = `img/${this.valor1}.png`;
    lado1.alt = this.valor1;
    lado1.style.width = '50px';  // ajuste conforme necessário
    lado1.style.height = '50px';
    lado1.draggable = false;     // EVITA problemas no drag

    const lado2 = document.createElement('img');
    lado2.src = `img/${this.valor2}.png`;
    lado2.alt = this.valor2;
    lado2.style.width = '50px';
    lado2.style.height = '50px';
    lado2.draggable = false;     // EVITA problemas no drag

    peca.appendChild(lado1);
    peca.appendChild(lado2);

    // Rotacionar no duplo clique
    peca.ondblclick = () => {
        this.rotated = !this.rotated;
        if (this.rotated) {
            peca.classList.add('rotated');
        } else {
            peca.classList.remove('rotated');
        }
    };

    return peca;
}

}

// Cria todas as peças do dominó (0-0 a 6-6)
function criarPecasDomino() {
  const pecas = [];
  for (let i = 0; i <= 6; i++) {
    for (let j = i; j <= 6; j++) {
      pecas.push(new Peca(i, j));
    }
  }
  return pecas;
}


const posicaoMouseDiv = document.getElementById('posicaoMouse');



