// Banco de Alimentos Customizado com a sua Dieta
const alimentosIniciais = [
  { id: 'pao', nome: 'Pão Francês', cat: 'carbo', emEstoque: true, historico: [] },
  { id: 'ovos', nome: 'Ovo Inteiro', cat: 'proteina', emEstoque: true, historico: [] },
  { id: 'arroz', nome: 'Arroz Branco', cat: 'carbo', emEstoque: true, historico: [] },
  { id: 'feijao', nome: 'Feijão Carioca', cat: 'carbo', emEstoque: true, historico: [] },
  { id: 'frango', nome: 'Peito de Frango', cat: 'proteina', emEstoque: true, historico: [] },
  { id: 'leite', nome: 'Leite Integral', cat: 'proteina', emEstoque: true, historico: [] },
  { id: 'aveia', nome: 'Aveia em Flocos', cat: 'carbo', emEstoque: true, historico: [] },
  { id: 'banana', nome: 'Banana Prata', cat: 'carbo', emEstoque: true, historico: [] },
  { id: 'leite_po', nome: 'Leite em Pó', cat: 'gordura', emEstoque: true, historico: [] },
  { id: 'chia', nome: 'Semente de Chia', cat: 'gordura', emEstoque: true, historico: [] },
  { id: 'creatina', nome: 'Creatina (Suplemento)', cat: 'proteina', emEstoque: true, historico: [] },
  { id: 'iogurte', nome: 'Iogurte Natural/Integral', cat: 'proteina', emEstoque: true, historico: [] },
  { id: 'batata_doce', nome: 'Batata Doce', cat: 'carbo', emEstoque: true, historico: [] },
  { id: 'farinha_lactea', nome: 'Farinha Láctea', cat: 'carbo', limiteSemanal: 2, emEstoque: true, historico: [] },
  { id: 'mucilon', nome: 'Mucilon', cat: 'carbo', limiteSemanal: 2, emEstoque: true, historico: [] }
];

let alimentos = JSON.parse(localStorage.getItem('meuEstoqueOficial')) || alimentosIniciais;
let menuDeHoje = []; 

function salvarEstoque() {
  localStorage.setItem('meuEstoqueOficial', JSON.stringify(alimentos));
}

// Verifica regras de limite semanal
function podeConsumirHoje(item) {
  if (!item.limiteSemanal) return true; 
  
  const hoje = new Date().toISOString().split('T')[0];
  if (item.historico && item.historico.includes(hoje)) return true; 
  
  const seteDiasAtras = new Date();
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
  
  const consumosRecentes = (item.historico || []).filter(dataStr => new Date(dataStr) >= seteDiasAtras);
  return consumosRecentes.length < item.limiteSemanal;
}

function carregarEstoque() {
  const container = document.getElementById('lista-estoque');
  container.innerHTML = '';

  alimentos.forEach(item => {
    const label = document.createElement('label');
    label.className = 'item-checkbox';
    const tagLimite = item.limiteSemanal ? `<small style="color: #fca5a5;"> (Máx ${item.limiteSemanal}x/semana)</small>` : '';

    label.innerHTML = `
      <input type="checkbox" id="${item.id}" ${item.emEstoque ? 'checked' : ''} onchange="alternarEstoque('${item.id}')">
      <span>${item.nome} ${tagLimite}</span>
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

// Formulário de novo alimento
document.getElementById('form-alimento').addEventListener('submit', function(e) {
  e.preventDefault();
  const limiteInput = document.getElementById('limite-alimento').value;
  const novoAlimento = {
    id: 'custom_' + Date.now(),
    nome: document.getElementById('nome-alimento').value,
    cat: document.getElementById('cat-alimento').value,
    limiteSemanal: limiteInput ? parseInt(limiteInput) : null,
    emEstoque: true,
    historico: []
  };
  alimentos.push(novoAlimento);
  salvarEstoque();
  carregarEstoque();
  this.reset();
});

// A Lógica Inteligente de Montagem
function gerarMenuDinamico() {
  const disponiveisParaHoje = alimentos.filter(a => a.emEstoque && podeConsumirHoje(a));
  const bloqueadosHoje = alimentos.filter(a => a.emEstoque && !podeConsumirHoje(a));
  
  menuDeHoje = disponiveisParaHoje;

  const containerMenu = document.getElementById('conteudo-menu');
  const divAlertas = document.getElementById('alertas-sistema');
  divAlertas.innerHTML = '';

  if (bloqueadosHoje.length > 0) {
    bloqueadosHoje.forEach(item => {
      divAlertas.innerHTML += `<div class="alerta-bloqueio">⚠️ <strong>${item.nome}</strong> atingiu o limite da semana e foi removido hoje. A vitamina será ajustada!</div>`;
    });
  }

  // Pegando o status de cada item essencial
  const checa = (id) => disponiveisParaHoje.some(a => a.id === id);
  const temPao = checa('pao');
  const temBatata = checa('batata_doce');
  const temFarinhaLactea = checa('farinha_lactea');
  const temMucilon = checa('mucilon');
  const temIogurte = checa('iogurte');

  // Lógica da Vitamina (Rodízio)
  let ingredienteExtraVitamina = "";
  if (temFarinhaLactea) {
    ingredienteExtraVitamina = "<li>• 40g de Farinha Láctea 🌟</li>";
  } else if (temMucilon) {
    ingredienteExtraVitamina = "<li>• 40g de Mucilon 🌟</li>";
  } else {
    ingredienteExtraVitamina = "<li>• +1 Banana Prata (Compensação)</li><li>• +20g de Aveia em Flocos (Compensação)</li>";
  }

  const menuHTML = `
    <div style="background: #0f172a; padding: 12px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #334155;">
      <h4 style="color: #38bdf8; margin-bottom: 6px;">📊 Macros Calculados do Dia:</h4>
      <p style="font-size: 14px; color: #cbd5e1;">Calorias: <strong>~3.300 kcal</strong> | Proteínas: <strong>~195g</strong> | Carboidratos: <strong>~450g</strong> | Gorduras: <strong>~80g</strong></p>
    </div>

    <div class="refeicao-card">
      <h3>🍳 Refeição 1: Café da Manhã</h3>
      <ul>
        ${temPao ? `<li>• 2 Pães Franceses (100g)</li>` : `<li>• 200g de Batata Doce Cozida (Substituto do Pão)</li>`}
        <li>• 3 Ovos Inteiros mexidos ou cozidos</li>
        <li>• Café puro (opcional)</li>
      </ul>
    </div>

    <div class="refeicao-card">
      <h3>🍛 Refeição 2: Almoço</h3>
      <ul>
        <li>• 300g de Arroz Branco</li>
        <li>• 150g de Feijão Carioca</li>
        <li>• 180g de Peito de Frango</li>
        <li>• Salada à vontade com 1 colher de sopa de Azeite (para bater as gorduras)</li>
      </ul>
    </div>

    <div class="refeicao-card">
      <h3>🥤 Refeição 3: Café da Tarde (A Super Vitamina)</h3>
      <ul>
        <li>• 300ml de Leite Integral</li>
        <li>• 1 Banana Prata</li>
        <li>• 40g de Aveia em Flocos</li>
        <li>• 20g de Leite em Pó</li>
        <li>• 15g de Semente de Chia</li>
        <li>• 5g de Creatina</li>
        ${ingredienteExtraVitamina}
      </ul>
    </div>

    <div class="refeicao-card">
      <h3>🍛 Refeição 4: Jantar</h3>
      <ul>
        <li>• 300g de Arroz Branco</li>
        <li>• 150g de Feijão Carioca</li>
        <li>• 180g de Peito de Frango</li>
        <li>• Salada à vontade com 1 colher de sopa de Azeite</li>
      </ul>
    </div>

    <div class="refeicao-card">
      <h3>🌙 Refeição 5: Ceia</h3>
      <ul>
        ${temIogurte ? `<li>• 1 Pote de Iogurte Natural/Integral (170g)</li>` : `<li>• 2 Ovos Inteiros</li>`}
        ${temBatata ? `<li>• 150g de Batata Doce</li>` : `<li>• 40g de Aveia com 1 Banana</li>`}
        <p style="font-size: 12px; color: #94a3b8; margin-top: 8px;">Dica: Ótima combinação de carboidrato complexo com proteína leve para a noite.</p>
      </ul>
    </div>
  `;

  containerMenu.innerHTML = menuHTML;
  document.getElementById('btn-confirmar').style.display = 'block';
}

function confirmarConsumoDiario() {
  const hoje = new Date().toISOString().split('T')[0];
  menuDeHoje.forEach(item => {
    const alimentoOriginal = alimentos.find(a => a.id === item.id);
    if (alimentoOriginal) {
      if (!alimentoOriginal.historico) alimentoOriginal.historico = [];
      if (!alimentoOriginal.historico.includes(hoje)) {
        alimentoOriginal.historico.push(hoje);
      }
    }
  });

  salvarEstoque();
  const btn = document.getElementById('btn-confirmar');
  btn.innerText = "✅ Salvo! Consumo Registrado.";
  btn.style.backgroundColor = "#047857";
  btn.disabled = true;
}

document.getElementById('btn-gerar').addEventListener('click', gerarMenuDinamico);
document.getElementById('btn-confirmar').addEventListener('click', confirmarConsumoDiario);
window.onload = carregarEstoque;
