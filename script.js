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

function salvarEstoque() {
  localStorage.setItem('meuEstoqueOficial', JSON.stringify(alimentos));
}

// Regra do Limite Semanal
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

// NOVA FUNÇÃO: O Check Individual por Refeição
function confirmarRefeicao(btnId, idsString) {
  const ids = idsString.split(',');
  const hoje = new Date().toISOString().split('T')[0];
  
  ids.forEach(id => {
    const item = alimentos.find(a => a.id === id);
    if (item) {
      if (!item.historico) item.historico = [];
      // Se não marcou hoje ainda, adiciona no histórico para descontar do limite semanal
      if (!item.historico.includes(hoje)) {
        item.historico.push(hoje);
      }
    }
  });
  
  salvarEstoque();
  
  // Muda o botão para verde
  const btn = document.getElementById(btnId);
  btn.innerHTML = '✅ Refeição Consumida';
  btn.classList.add('confirmado');
  btn.disabled = true;
}

function gerarMenuDinamico() {
  const disponiveisParaHoje = alimentos.filter(a => a.emEstoque && podeConsumirHoje(a));
  const bloqueadosHoje = alimentos.filter(a => a.emEstoque && !podeConsumirHoje(a));
  
  const containerMenu = document.getElementById('conteudo-menu');
  const divAlertas = document.getElementById('alertas-sistema');
  divAlertas.innerHTML = '';

  if (bloqueadosHoje.length > 0) {
    bloqueadosHoje.forEach(item => {
      divAlertas.innerHTML += `<div class="alerta-bloqueio">⚠️ <strong>${item.nome}</strong> atingiu o limite da semana e foi removido hoje.</div>`;
    });
  }

  const checa = (id) => disponiveisParaHoje.some(a => a.id === id);
  const temPao = checa('pao');
  const temBatata = checa('batata_doce');
  const temFarinhaLactea = checa('farinha_lactea');
  const temMucilon = checa('mucilon');
  const temIogurte = checa('iogurte');

  let ingredienteExtraVitamina = "";
  // Mapeia os IDs usados na Refeição 3
  let idsRef3 = 'leite,banana,aveia,leite_po,chia,creatina';
  
  if (temFarinhaLactea) {
    ingredienteExtraVitamina = "<li>• 40g de Farinha Láctea 🌟</li>";
    idsRef3 += ',farinha_lactea';
  } else if (temMucilon) {
    ingredienteExtraVitamina = "<li>• 40g de Mucilon 🌟</li>";
    idsRef3 += ',mucilon';
  } else {
    ingredienteExtraVitamina = "<li>• +1 Banana Prata (Compensação)</li><li>• +20g de Aveia em Flocos (Compensação)</li>";
  }

  // Mapeia os IDs das outras Refeições
  const idsRef1 = (temPao ? 'pao' : 'batata_doce') + ',ovos';
  const idsRef2 = 'arroz,feijao,frango';
  const idsRef4 = 'arroz,feijao,frango';
  const idsRef5 = (temIogurte ? 'iogurte' : 'ovos') + ',' + (temBatata ? 'batata_doce' : 'aveia,banana');

  const menuHTML = `
    <div style="background: #0f172a; padding: 12px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #334155;">
      <h4 style="color: #38bdf8; margin-bottom: 6px;">📊 Macros Calculados do Dia:</h4>
      <p style="font-size: 14px; color: #cbd5e1;">Calorias: <strong>~3.300 kcal</strong> | Proteínas: <strong>~195g</strong> | Carboidratos: <strong>~450g</strong></p>
    </div>

    <div class="refeicao-card">
      <h3>🍳 Refeição 1: Café da Manhã</h3>
      <ul>
        ${temPao ? `<li>• 2 Pães Franceses (100g)</li>` : `<li>• 200g de Batata Doce Cozida (Substituto)</li>`}
        <li>• 3 Ovos Inteiros mexidos ou cozidos</li>
        <li>• Café puro (opcional)</li>
      </ul>
      <button id="btn-ref-1" class="btn-check-meal" onclick="confirmarRefeicao('btn-ref-1', '${idsRef1}')">⬜ Marcar como Consumida</button>
    </div>

    <div class="refeicao-card">
      <h3>🍛 Refeição 2: Almoço</h3>
      <ul>
        <li>• 300g de Arroz Branco</li>
        <li>• 150g de Feijão Carioca</li>
        <li>• 180g de Peito de Frango</li>
        <li>• Salada à vontade com Azeite</li>
      </ul>
      <button id="btn-ref-2" class="btn-check-meal" onclick="confirmarRefeicao('btn-ref-2', '${idsRef2}')">⬜ Marcar como Consumida</button>
    </div>

    <div class="refeicao-card">
      <h3>🥤 Refeição 3: Café da Tarde (Vitamina)</h3>
      <ul>
        <li>• 300ml de Leite Integral</li>
        <li>• 1 Banana Prata</li>
        <li>• 40g de Aveia em Flocos</li>
        <li>• 20g de Leite em Pó</li>
        <li>• 15g de Semente de Chia</li>
        <li>• 5g de Creatina</li>
        ${ingredienteExtraVitamina}
      </ul>
      <button id="btn-ref-3" class="btn-check-meal" onclick="confirmarRefeicao('btn-ref-3', '${idsRef3}')">⬜ Marcar como Consumida</button>
    </div>

    <div class="refeicao-card">
      <h3>🍛 Refeição 4: Jantar</h3>
      <ul>
        <li>• 300g de Arroz Branco</li>
        <li>• 150g de Feijão Carioca</li>
        <li>• 180g de Peito de Frango</li>
        <li>• Salada à vontade com Azeite</li>
      </ul>
      <button id="btn-ref-4" class="btn-check-meal" onclick="confirmarRefeicao('btn-ref-4', '${idsRef4}')">⬜ Marcar como Consumida</button>
    </div>

    <div class="refeicao-card">
      <h3>🌙 Refeição 5: Ceia</h3>
      <ul>
        ${temIogurte ? `<li>• 1 Pote de Iogurte Natural (170g)</li>` : `<li>• 2 Ovos Inteiros</li>`}
        ${temBatata ? `<li>• 150g de Batata Doce</li>` : `<li>• 40g de Aveia com 1 Banana</li>`}
      </ul>
      <button id="btn-ref-5" class="btn-check-meal" onclick="confirmarRefeicao('btn-ref-5', '${idsRef5}')">⬜ Marcar como Consumida</button>
    </div>
  `;

  containerMenu.innerHTML = menuHTML;

  // Como agora o check é por refeição, o script esconde o botão "Confirmar Tudo" se ele ainda existir no seu HTML
  const btnAntigo = document.getElementById('btn-confirmar');
  if(btnAntigo) btnAntigo.style.display = 'none';
}

document.getElementById('btn-gerar').addEventListener('click', gerarMenuDinamico);
window.onload = carregarEstoque;
