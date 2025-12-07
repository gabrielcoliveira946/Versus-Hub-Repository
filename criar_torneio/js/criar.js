// /criar_torneio/js/criar.js
document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'vh_createdTournaments';

  const form = document.getElementById('formCriarTorneio');
  const bannerInput = document.getElementById('bannerInput');
  const bannerPreview = document.getElementById('bannerPreview');
  const nomeTorneio = document.getElementById('nomeTorneio');
  const jogoNome = document.getElementById('jogoNome');
  const categoria = document.getElementById('categoria');
  const plataforma = document.getElementById('plataforma');
  const inicioData = document.getElementById('inicioData');
  const inicioHora = document.getElementById('inicioHora');
  const status = document.getElementById('status');
  const descricao = document.getElementById('descricao');
  const localizacao = document.getElementById('localizacao');
  const modalidade = document.getElementById('modalidade');
  const regras = document.getElementById('regras');
  const premiacao = document.getElementById('premiacao');
  const taxaTipo = document.getElementById('taxaTipo');
  const taxaValor = document.getElementById('taxaValor');
  const requisitos = document.getElementById('requisitos');
  const feedbackMsg = document.getElementById('feedbackMsg');

  let bannerDataUrl = ''; // vamos guardar o banner aqui

  // ===== PREMIAÇÃO =====
let premiacaoLinhas = [];

if (tipoPremio.value === "nenhuma") {
  premiacaoLinhas.push("Não há premiação neste torneio.");
} else {
  const labelTipo = {
    'dinheiro': 'Tipo: Dinheiro',
    'itens': 'Tipo: Itens / Skins / Diamantes',
    'dinheiro-itens': 'Tipo: Dinheiro + Itens',
    'outro': 'Tipo: Outro'
  }[tipoPremio.value] || '';

  if (labelTipo) premiacaoLinhas.push(labelTipo);

  if (premio1.value.trim()) premiacaoLinhas.push(`1º lugar: ${premio1.value.trim()}`);
  if (premio2.value.trim()) premiacaoLinhas.push(`2º lugar: ${premio2.value.trim()}`);
  if (premio3.value.trim()) premiacaoLinhas.push(`3º lugar: ${premio3.value.trim()}`);

  if (premiacaoExtra.value.trim()) {
    premiacaoLinhas.push(`Extras: ${premiacaoExtra.value.trim()}`);
  }
}

const premiacaoFinal = premiacaoLinhas.join("\n");

let taxaFinal = "Gratuito";
if (taxaTipo.value === "pago") {
  taxaFinal = `R$ ${parseFloat(taxaValor.value || 0).toFixed(2)}`;
}


  // ===== PREVIEW DO BANNER =====
  bannerInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) {
      bannerDataUrl = '';
      bannerPreview.innerHTML = '<span>Nenhuma imagem selecionada</span>';
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      bannerDataUrl = ev.target.result;
      bannerPreview.innerHTML = '';
      const img = document.createElement('img');
      img.src = bannerDataUrl;
      bannerPreview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });

  // ===== FUNÇÕES LOCALSTORAGE =====
  function loadCreated() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveCreated(arr) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }

  // ===== SUBMIT DO FORM =====
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // validação básica
if (
  !nomeTorneio.value.trim() ||
  !jogoNome.value.trim() ||
  !categoria.value ||
  !plataforma.value ||
  !inicioData.value ||
  !inicioHora.value
) {
  feedbackMsg.textContent = 'Preencha todos os campos obrigatórios.';
  feedbackMsg.style.color = '#fecaca'; // vermelho claro
  return;
}


    // pega o texto exibido nos selects (ex: "FPS", "PC")
    const categoriaText = categoria.options[categoria.selectedIndex].textContent;
    const plataformaText = plataforma.options[plataforma.selectedIndex].textContent;

    // monta a string "Jogo: XXX • Categoria • Plataforma"
    const jogoDisplay = `${jogoNome.value.trim()} • ${categoriaText} • ${plataformaText}`;

    // formata a data para aparecer no card
    const dataValue = inicioData.value;
const horaValue = inicioHora.value;

// Exemplo final: "Início: 12/03/2026 às 19h"
let dataDisplay = '';

if (dataValue && horaValue) {
  const [ano, mes, dia] = dataValue.split("-");
  const [horas, mins] = horaValue.split(":");

  dataDisplay = `Início: ${dia}/${mes}/${ano} às ${horas}h${mins !== "00" ? mins : ""}`;
}


    // status
    let statusText = '';
    let statusClass = '';
    switch (status.value) {
      case 'aberto':
        statusText = 'Inscrições abertas';
        statusClass = 'status-aberto';
        break;
      case 'andamento':
        statusText = 'Em andamento';
        statusClass = 'status-andamento';
        break;
      case 'encerrado':
        statusText = 'Encerrado';
        statusClass = 'status-encerrado';
        break;
      default:
        statusText = '';
        statusClass = '';
    }

    // id único pro torneio
    const id = 'custom-' + Date.now();
    const inicioIso = dataValue && horaValue ? `${dataValue}T${horaValue}` : '';


    // se o usuário não colocar banner, você pode usar uma imagem padrão
    const bannerFinal = bannerDataUrl || '/images/cerradocup.jpg'; // troque por um padrão seu

    // objeto no MESMO formato que o Gerenciar Torneios espera
   const novoTorneio = {
  id,
  nome: nomeTorneio.value.trim(),
  jogo: jogoDisplay,
  data: dataDisplay,
  status: statusText,
  statusClass,
  banner: bannerFinal,
  descricao: descricao.value.trim(),
  categoria: categoria.value,
  plataforma: plataforma.value,
  taxa: taxaFinal,
premiacao: premiacaoFinal,
  inicioIso, // agora variável real
    link: '/torneio/custom.html?id=' + encodeURIComponent(id)

};

    

    const lista = loadCreated();
    lista.push(novoTorneio);
    saveCreated(lista);

    feedbackMsg.textContent = 'Torneio criado com sucesso! Redirecionando para Gerenciar Torneios...';
    feedbackMsg.style.color = '#a7f3d0';

    setTimeout(() => {
      window.location.href = '/gerenciartorneios/gerentornindex.html';
    }, 1200);
  });
});

 