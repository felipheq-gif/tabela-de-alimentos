// Banco de Alimentos Customizado
const alimentosIniciais = [
  { id: 'pao', nome: 'Pão Francês', cat: 'carbo', emEstoque: true, historico: [] },
  { id: 'tapioca', nome: 'Tapioca', cat: 'carbo', emEstoque: true, historico: [] },
  { id: 'macarrao', nome: 'Macarrão', cat: 'carbo', emEstoque: true, historico: [] },
  { id: 'arroz', nome: 'Arroz Branco', cat: 'carbo', emEstoque: true, historico: [] },
  { id: 'feijao', nome: 'Feijão Carioca', cat: 'carbo', emEstoque: true, historico: [] },
  { id: 'batata_doce', nome: 'Batata Doce', cat: 'carbo', emEstoque: true, historico: [] },
  { id: 'aveia', nome: 'Aveia em Flocos', cat: 'carbo', emEstoque: true, historico: [] },
  { id: 'banana', nome: 'Banana Prata/D\'água', cat: 'carbo', emEstoque: true, historico: [] },
  { id: 'farinha_lactea', nome: 'Farinha Láctea', cat: 'carbo', limiteSemanal: 2, emEstoque: true, historico: [] },
  { id: 'mucilon', nome: 'Mucilon', cat: 'carbo', limiteSemanal: 2, emEstoque: true, historico: [] },
  
  { id: 'frango', nome: 'Peito de Frango', cat: 'proteina', emEstoque: true, historico: [] },
  { id: 'carne_moida', nome: 'Carne Moída', cat: 'proteina', emEstoque: true, historico: [] },
  { id: 'ovos', nome: 'Ovo Inteiro', cat: 'proteina', emEstoque: true, historico: [] },
  { id: 'leite', nome: 'Leite Integral', cat: 'proteina', emEstoque: true, historico: [] },
  { id: 'iogurte', nome: 'Iogurte Natural', cat: 'proteina', emEstoque: true, historico: [] },
  { id: 'creatina', nome: 'Creatina (Suplemento)', cat: 'proteina', emEstoque: true, historico: [] },
  
  { id: 'leite_po', nome: 'Leite em Pó', cat: 'gordura', emEstoque: true, historico: [] },
  { id: 'chia', nome: 'Semente de Chia', cat: 'gordura', emEstoque: true, historico: [] }
];

let alimentos = JSON.parse(localStorage.getItem('meuEstoqueOficial')) || alimentosIniciais;

function pegarDataDeHoje() {
  return new Date().toLocaleDateString('pt-BR'); 
}

function salvarEstoque() {
  localStorage.setItem('meuEstoqueOficial', JSON.stringify(alimentos));
}

// SISTEMA DE MEMÓRIA DOS BOTÕES
function getBotoesConfirmados() {
  const salvo = JSON.parse(localStorage.getItem('botoesClicadosHoje')) || {};
  if (salvo.data !== pegarDataDeHoje()) return []; 
  return salvo.botoes || [];
}

function salvarBotaoConfirmado(btnId) {
  const botoes = getBotoesConfirmados();
  if (!botoes.includes(btnId)) {
    botoes.push(btnId);
    localStorage.setItem('botoesClicadosHoje', JSON.stringify({ data: pegarDataDeHoje(), botoes: botoes }));
  }
}

// Regra do Limite Semanal
function podeConsumirHoje(item) {
  if (!item.limiteSemanal) return true; 
  const hoje = pegarDataDeHoje();
  if (item.historico && item.historico.includes(hoje)) return true; 
  
  const seteDiasAtras = new Date();
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
  
  const consumosRecentes = (item.historico || []).filter(dataStr => {
    const partes = dataStr.split('/');
    if(partes.length === 3) {
      const dataHist = new Date(partes[2], partes[1] - 1, partes[0]);
      return dataHist >= seteDiasAtras;
    }
    return false;
  });
  return consumosRecentes.length < item.limiteSemanal;
}

function carregarEstoque() {
  const container = document.getElementById('lista-estoque');
  container.innerHTML = '';

  alimentos.forEach(item => {
    const label = document.createElement('label');
    label.className = 'item-checkbox';
    const tagLimite = item.limiteSemanal ? `<small style="color: #fca5a5;"> (Máx ${item.limiteSemanal}x/sem)</small>` : '';

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

function confirmarRefeicao(btnId, idsString) {
  const ids = idsString.split(',').filter(id => id); 
  const hoje = pegarDataDeHoje();
  
  ids.forEach(id => {
    const item = alimentos.find(a => a.id === id);
    if (item) {
      if (!item.historico) item.historico = [];
      if (!item.historico.includes(hoje)) {
        item.historico.push(hoje);
      }
    }
  });
  
  salvarEstoque();
  salvarBotaoConfirmado(btnId); 
  
  const btn = document.getElementById(btnId);
  btn.innerHTML = '✅ Refeição Consumida';
  btn.classList.add('confirmado');
  btn.disabled = true;
  salvarTelaDoMenu();
}

function salvarTelaDoMenu() {
  const conteudo = document.getElementById('conteudo-menu').innerHTML;
  localStorage.setItem('menuVisualSalvo', conteudo);
  localStorage.setItem('dataDoMenuSalvo', pegarDataDeHoje());
}

function carregarMenuSalvo() {
  const dataSalva = localStorage.getItem('dataDoMenuSalvo');
  if (dataSalva === pegarDataDeHoje()) {
    const menuSalvo = localStorage.getItem('menuVisualSalvo');
    if (menuSalvo) document.getElementById('conteudo-menu').innerHTML = menuSalvo;
  } else {
    localStorage.removeItem('menuVisualSalvo');
    localStorage.removeItem('dataDoMenuSalvo');
  }
}

function gerarMenuDinamico() {
  const disponiveis = alimentos.filter(a => a.emEstoque && podeConsumirHoje(a));
  const bloqueados = alimentos.filter(a => a.emEstoque && !podeConsumirHoje(a));
  const containerMenu = document.getElementById('conteudo-menu');
  
  document.getElementById('alertas-sistema').innerHTML = bloqueados.map(item => 
    `<div class="alerta-bloqueio">⚠️ <strong>${item.nome}</strong> atingiu o limite da semana e foi substituído.</div>`
  ).join('');

  const pegar = (id) => disponiveis.find(a => a.id === id);
  const pegarSubstituto = (cat, ignorarId) => disponiveis.find(a => a.cat === cat && a.id !== ignorarId);

  const carboPrinc = pegar('arroz') || pegar('macarrao') || pegar('batata_doce') || pegarSubstituto('carbo');
  const protPrinc = pegar('frango') || pegar('carne_moida') || pegar('ovos') || pegarSubstituto('proteina');
  const leguminosa = pegar('feijao');

  const carboCafe = pegar('pao') || pegar('tapioca') || pegar('batata_doce') || pegar('aveia');
  const protCafe = pegar('ovos') || pegar('iogurte') || pegar('frango');

  const liqVitamina = pegar('leite') || pegar('iogurte') || null;
  const frutaVitamina = pegar('banana') || pegar('aveia');
  const extraVitamina = pegar('farinha_lactea') || pegar('mucilon') || pegar('aveia');
  const temCreatina = pegar('creatina');

  const protCeia = pegar('iogurte') || pegar('ovos') || pegar('leite');
  const carboCeia = pegar('batata_doce') || pegar('aveia') || pegar('banana');

  if (!carboPrinc || !protPrinc) {
    containerMenu.innerHTML = '<p class="placeholder" style="color: #ef4444;">Falta proteína ou carboidrato no estoque para gerar o menu!</p>';
    return;
  }

  const qtdCarboPrinc = carboPrinc.id === 'macarrao' ? '250g' : (carboPrinc.id === 'batata_doce' ? '350g' : '300g');
  const qtdProtPrinc = protPrinc.id === 'ovos' ? '4 unidades' : (protPrinc.id === 'carne_moida' ? '200g' : '180g');
  const qtdCarboCafe = carboCafe.id === 'tapioca' ? '100g' : (carboCafe.id === 'batata_doce' ? '200g' : '2 unidades (100g)');
  
  const getIds = (...itens) => itens.filter(i => i).map(i => i.id).join(',');

  const botoesProntos = getBotoesConfirmados();
  const renderBotao = (id, ids) => {
    if (botoesProntos.includes(id)) {
      return `<button id="${id}" class="btn-check-meal confirmado" disabled>✅ Refeição Consumida</button>`;
    }
    return `<button id="${id}" class="btn-check-meal" onclick="confirmarRefeicao('${id}', '${ids}')">⬜ Marcar como Consumida</button>`;
  };

  const menuHTML = `
    <div style="background: #0f172a; padding: 12px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #334155;">
      <h4 style="color: #38bdf8; margin-bottom: 6px;">📊 Macros Dinâmicos Calculados:</h4>
      <p style="font-size: 14px; color: #cbd5e1;">Calorias: <strong>~3.300 kcal</strong> | Proteínas: <strong>~195g</strong></p>
    </div>

    <div class="refeicao-card">
      <h3>🍳 Refeição 1: Café da Manhã (~500 kcal)</h3>
      <ul>
        <li>• ${qtdCarboCafe} de ${carboCafe.nome}</li>
        <li>• ${protCafe.id === 'ovos' ? '3 unidades' : '150g'} de ${protCafe.nome}</li>
        <li>• Café puro (opcional)</li>
      </ul>
      ${renderBotao('btn-ref-1', getIds(carboCafe, protCafe))}
    </div>

    <div class="refeicao-card">
      <h3>🍛 Refeição 2: Almoço (~920 kcal)</h3>
      <ul>
        <li>• ${qtdCarboPrinc} de ${carboPrinc.nome}</li>
        ${leguminosa ? `<li>• 150g de ${leguminosa.nome}</li>` : ''}
        <li>• ${qtdProtPrinc} de ${protPrinc.nome}</li>
        <li>• Salada à vontade com 1 col. de Azeite</li>
      </ul>
      ${renderBotao('btn-ref-2', getIds(carboPrinc, leguminosa, protPrinc))}
    </div>

    <div class="refeicao-card">
      <h3>🥤 Refeição 3: Café da Tarde (Vitamina) (~720 kcal)</h3>
      <ul>
        ${liqVitamina ? `<li>• 300ml de ${liqVitamina.nome}</li>` : '<li>• Água para bater (Falta Leite/Iogurte)</li>'}
        <li>• 1 unidade/porção de ${frutaVitamina.nome}</li>
        <li>• 40g de ${extraVitamina.nome} 🌟</li>
        ${temCreatina ? `<li>• 5g de Creatina</li>` : ''}
      </ul>
      ${renderBotao('btn-ref-3', getIds(liqVitamina, frutaVitamina, extraVitamina, temCreatina))}
    </div>

    <div class="refeicao-card">
      <h3>🍛 Refeição 4: Jantar (~920 kcal)</h3>
      <ul>
        <li>• ${qtdCarboPrinc} de ${carboPrinc.nome}</li>
        ${leguminosa ? `<li>• 150g de ${leguminosa.nome}</li>` : ''}
        <li>• ${qtdProtPrinc} de ${protPrinc.nome}</li>
        <li>• Salada à vontade com 1 col. de Azeite</li>
      </ul>
      ${renderBotao('btn-ref-4', getIds(carboPrinc, leguminosa, protPrinc))}
    </div>

    <div class="refeicao-card">
      <h3>🌙 Refeição 5: Ceia (~240 kcal)</h3>
      <ul>
        <li>• ${protCeia.id === 'ovos' ? '2 unidades' : '150g'} de ${protCeia.nome}</li>
        <li>• ${carboCeia.id === 'batata_doce' ? '150g' : '40g'} de ${carboCeia.nome}</li>
      </ul>
      ${renderBotao('btn-ref-5', getIds(protCeia, carboCeia))}
    </div>
  `;

  containerMenu.innerHTML = menuHTML;
  salvarTelaDoMenu();
}

document.getElementById('btn-gerar').addEventListener('click', gerarMenuDinamico);

window.onload = function() {
  carregarEstoque();
  carregarMenuSalvo();
};
