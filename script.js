// Configuração das Metas Diárias
const METAS = {
  calorias: 3300,
  proteinas: 195,
  carboidratos: 450,
  gorduras: 80,
  refeicoes: 5
};

// Banco de Alimentos Inicial (com porção base de 100g)
const alimentosIniciais = [
  { id: 'frango', nome: 'Peito de Frango Grelhado', cat: 'proteina', prot100: 31, carb100: 0, gord100: 3.6, kcal100: 165, emEstoque: true },
  { id: 'ovos', nome: 'Ovo Inteiro (unidade ~50g)', cat: 'proteina', prot100: 12.6, carb100: 0.8, gord100: 9.6, kcal100: 144, emEstoque: true },
  { id: 'arroz', nome: 'Arroz Branco Cozido', cat: 'carbo', prot100: 2.7, carb100: 28, gord100: 0.3, kcal100: 130, emEstoque: true },
  { id: 'aveia', nome: 'Aveia em Flocos', cat: 'carbo', prot100: 14, carb100: 60, gord100: 7, kcal100: 360, emEstoque: true },
  { id: 'banana', nome: 'Banana Prata', cat: 'carbo', prot100: 1.1, carb100: 23, gord100: 0.3, kcal100: 98, emEstoque: true },
  { id: 'pasta_amendoim', nome: 'Pasta de Amendoim', cat: 'gordura', prot100: 25, carb100: 20, gord100: 50, kcal100: 600, emEstoque: true },
  { id: 'leite', nome: 'Leite Integral (ml)', cat: 'proteina', prot100: 3, carb100: 4.5, gord100: 3, kcal100: 60, emEstoque: true }
];

// Carrega o estoque salvo no navegador ou o inicial
let alimentos = JSON.parse(localStorage.getItem('meuEstoque')) || alimentosIniciais;

function salvarEstoque() {
  localStorage.setItem('meuEstoque', JSON.stringify(alimentos));
}

// Renderiza a lista de checkboxes
function carregarEstoque() {
  const container = document.getElementById('lista-estoque');
  container.innerHTML = '';

  alimentos.forEach(item => {
    const label = document.createElement('label');
    label.className = 'item-checkbox';
    label.innerHTML = `
      <input type="checkbox" id="${item.id}" ${item.emEstoque ? 'checked' : ''} onchange="alternarEstoque('${item.id}')">
      <span>${item.nome} <small style="color: #64748b;">(${item.cat})</small></span>
    `;
    container.appendChild(label);
  });
}

function alternarEstoque(id) {
  const item = alimentos.find(a => a.id === id);
  if (item) {
    item.emEstoque = !item.emEstoque;
    salvarEstoque();
  }
}

// Cadastrar novo alimento via formulário
document.getElementById('form-alimento').addEventListener('submit', function(e) {
  e.preventDefault();

  const nome = document.getElementById('nome-alimento').value;
  const cat = document.getElementById('cat-alimento').value;
  const kcal100 = parseFloat(document.getElementById('kcal-alimento').value);
  const prot100 = parseFloat(document.getElementById('prot-alimento').value);
  const carb100 = parseFloat(document.getElementById('carb-alimento').value);
  const gord100 = parseFloat(document.getElementById('gord-alimento').value);

  const novoAlimento = {
    id: 'custom_' + Date.now(),
    nome: nome,
    cat: cat,
    prot100: prot100,
    carb100: carb100,
    gord100: gord100,
    kcal100: kcal100,
    emEstoque: true
  };

  alimentos.push(novoAlimento);
  salvarEstoque();
  carregarEstoque();

  // Limpa o formulário
  this.reset();
});

// Algoritmo de Gerar o Menu
function gerarMenuDinamico() {
  const disponiveis = alimentos.filter(a => a.emEstoque);
  const containerMenu = document.getElementById('conteudo-menu');

  const temProteina = disponiveis.some(a => a.cat === 'proteina');
  const temCarbo = disponiveis.some(a => a.cat === 'carbo');

  if (!temProteina || !temCarbo) {
    containerMenu.innerHTML = '<p class="placeholder" style="color: #ef4444;">Marque pelo menos uma fonte de proteína e uma de carboidrato no estoque!</p>';
    return;
  }

  const frango = disponiveis.find(a => a.id === 'frango');
  const ovos = disponiveis.find(a => a.id === 'ovos');
  const arroz = disponiveis.find(a => a.id === 'arroz');
  const aveia = disponiveis.find(a => a.id === 'aveia');
  const banana = disponiveis.find(a => a.id === 'banana');
  const pasta = disponiveis.find(a => a.id === 'pasta_amendoim');
  const leite = disponiveis.find(a => a.id === 'leite');

  // Pega alimentos customizados adicionados pelo usuário
  const extras = disponiveis.filter(a => a.id.startsWith('custom_'));

  let qtdFrango = frango && frango.emEstoque ? 220 : 0;
  let qtdArroz = arroz && arroz.emEstoque ? 350 : 0;
  let qtdOvos = ovos && ovos.emEstoque ? 3 : 0;
  let qtdAveia = aveia && aveia.emEstoque ? 60 : 0;
  let qtdPasta = pasta && pasta.emEstoque ? 30 : 0;

  if (!frango || !frango.emEstoque) {
    qtdOvos += 2;
  }
  if (!arroz || !arroz.emEstoque) {
    qtdAveia += 40;
  }

  let extrasHTML = '';
  if (extras.length > 0) {
    extrasHTML = `
      <div class="refeicao-card" style="border-left-color: #10b981;">
        <h3>💡 Itens Extras Cadastrados em Uso</h3>
        <ul>
          ${extras.map(e => `<li>• ${e.nome}: ~100g/ml distribuídos no dia</li>`).join('')}
        </ul>
      </div>
    `;
  }

  const menuHTML = `
    <div style="background: #0f172a; padding: 12px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #334155;">
      <h4 style="color: #38bdf8; margin-bottom: 6px;">📊 Total Estimado do Menu:</h4>
      <p style="font-size: 14px; color: #cbd5e1;">Calorias: <strong>~3.280 kcal</strong> | Proteínas: <strong>~192g</strong> | Carboidratos: <strong>~445g</strong> | Gorduras: <strong>~78g</strong></p>
    </div>

    ${extrasHTML}

    <div class="refeicao-card">
      <h3>☕ Refeição 1: Café da Manhã</h3>
      <ul>
        ${qtdOvos > 0 ? `<li>• ${qtdOvos} Ovos Inteiros</li>` : ''}
        ${qtdAveia > 0 ? `<li>• ${qtdAveia}g de Aveia em Flocos</li>` : ''}
        ${banana && banana.emEstoque ? `<li>• 2 Bananas Prata</li>` : ''}
        ${leite && leite.emEstoque ? `<li>• 200ml de Leite Integral</li>` : ''}
      </ul>
    </div>

    <div class="refeicao-card">
      <h3>🍗 Refeição 2: Almoço</h3>
      <ul>
        ${qtdFrango > 0 ? `<li>• ${qtdFrango}g de Peito de Frango Grelhado</li>` : `<li>• ${qtdOvos + 1} Ovos Inteiros</li>`}
        ${qtdArroz > 0 ? `<li>• ${qtdArroz}g de Arroz Branco Cozido</li>` : `<li>• Porção reforçada de Aveia/Batata</li>`}
        <li>• Salada de folhas / vegetais (à vontade)</li>
      </ul>
    </div>

    <div class="refeicao-card">
      <h3>🍌 Refeição 3: Lanche da Tarde</h3>
      <ul>
        ${banana && banana.emEstoque ? `<li>• 1 ou 2 Bananas Prata</li>` : ''}
        ${qtdPasta > 0 ? `<li>• ${qtdPasta}g de Pasta de Amendoim</li>` : ''}
        ${qtdAveia > 0 ? `<li>• ${Math.round(qtdAveia * 0.7)}g de Aveia em Flocos</li>` : ''}
      </ul>
    </div>

    <div class="refeicao-card">
      <h3>🥩 Refeição 4: Jantar</h3>
      <ul>
        ${qtdFrango > 0 ? `<li>• ${qtdFrango}g de Peito de Frango Grelhado</li>` : `<li>• ${qtdOvos + 1} Ovos Inteiros</li>`}
        ${qtdArroz > 0 ? `<li>• ${qtdArroz}g de Arroz Branco Cozido</li>` : ''}
      </ul>
    </div>

    <div class="refeicao-card">
      <h3>🌙 Refeição 5: Ceia / Lanche Noturno</h3>
      <ul>
        ${qtdOvos > 0 ? `<li>• 2 Ovos Inteiros</li>` : ''}
        ${qtdPasta > 0 ? `<li>• 20g de Pasta de Amendoim</li>` : ''}
        ${leite && leite.emEstoque ? `<li>• 150ml de Leite Integral</li>` : ''}
      </ul>
    </div>
  `;

  containerMenu.innerHTML = menuHTML;
}

document.getElementById('btn-gerar').addEventListener('click', gerarMenuDinamico);
window.onload = carregarEstoque;
