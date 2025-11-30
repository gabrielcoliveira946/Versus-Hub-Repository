// parte do menu quando clica na imagem

const userBtn = document.getElementById("userBtn");
const menuUser = document.getElementById("menuUser");

if (userBtn && menuUser) {
  userBtn.addEventListener("click", () => {
    menuUser.style.display =
      menuUser.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", (e) => {
    const userIcon = document.querySelector(".user-icon");
    if (userIcon && !userIcon.contains(e.target)) {
      menuUser.style.display = "none";
    }
  });
}

// ===== MENU LATERAL (SIDEBAR) =====

const menuToggle = document.getElementById('menuToggle');          // botão com ícone do menu
const sidebar = document.getElementById('sidebar');                // a <aside> da sidebar
const sidebarOverlay = document.getElementById('sidebarOverlay');  // fundo escuro

if (menuToggle && sidebar && sidebarOverlay) {
  // Abre/fecha a sidebar
  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('open');
  });

  // Fecha ao clicar no fundo escuro
  sidebarOverlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('open');
  });
}

// ===== FILTROS DE TORNEIOS =====

// Seleciona elementos de filtro
const campoBusca       = document.getElementById('filtroBusca');
const selectCategoria  = document.getElementById('filtroCategoria');
const selectJogo       = document.getElementById('filtroJogo');
const selectPlataforma = document.getElementById('filtroPlataforma');
const selectStatus     = document.getElementById('filtroStatus');

const cardsTorneios = document.querySelectorAll('.card-torneio');

function aplicarFiltros() {
  if (!cardsTorneios.length) return;

  const textoBusca  = (campoBusca?.value || '').toLowerCase().trim();
  const categoria   = selectCategoria?.value  || 'todos';
  const jogo        = selectJogo?.value       || 'todos';
  const plataforma  = selectPlataforma?.value || 'todas';
  const status      = selectStatus?.value     || 'todos';

  cardsTorneios.forEach(card => {
    const nomeCard       = (card.dataset.nome || '').toLowerCase();
    const jogoCard       = card.dataset.jogo;
    const categoriaCard  = card.dataset.categoria;
    const plataformaCard = card.dataset.plataforma;
    const statusCard     = card.dataset.status;

    const matchTexto =
      textoBusca === '' ||
      nomeCard.includes(textoBusca) ||
      jogoCard.includes(textoBusca);

    const matchCategoria  = (categoria === 'todos')  || (categoriaCard === categoria);
    const matchJogo       = (jogo === 'todos')       || (jogoCard === jogo);
    const matchPlataforma = (plataforma === 'todas') || (plataformaCard === plataforma);
    const matchStatus     = (status === 'todos')     || (statusCard === status);

    const visivel = matchTexto && matchCategoria && matchJogo && matchPlataforma && matchStatus;

    card.style.display = visivel ? 'flex' : 'none';
  });
}

// Eventos dos filtros
if (campoBusca)       campoBusca.addEventListener('input', aplicarFiltros);
if (selectCategoria)  selectCategoria.addEventListener('change', aplicarFiltros);
if (selectJogo)       selectJogo.addEventListener('change', aplicarFiltros);
if (selectPlataforma) selectPlataforma.addEventListener('change', aplicarFiltros);
if (selectStatus)     selectStatus.addEventListener('change', aplicarFiltros);

// Aplica uma vez ao carregar
aplicarFiltros();


// ========== CONTROLE DE USUÁRIO LOGADO NO HEADER ==========

// lê usuário logado do localStorage
function vhGetLoggedUser() {
  const data = localStorage.getItem('vh_loggedUser');
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Erro ao ler vh_loggedUser:', e);
    return null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const btEntrar       = document.getElementById('btentrar');
  const btCadastrar    = document.getElementById('btcadastrar');
  const usernameHeader = document.getElementById('usernameHeader');
  const menuUser       = document.getElementById('menuUser');

  const linkSair       = document.getElementById('sairConta');
  const linkTrocar     = document.getElementById('trocarConta');
  const linkPerfil     = document.getElementById('linkPerfil');
  const liNomeMenu     = document.getElementById('menuUserNome');

  const guestItems  = menuUser ? menuUser.querySelectorAll('.guest-only')  : [];
  const loggedItems = menuUser ? menuUser.querySelectorAll('.logged-only') : [];

  function aplicarEstadoUsuario(user) {
    const logado = !!user;

    // Esconde/mostra botões ENTRAR/CADASTRAR
    if (btEntrar)    btEntrar.style.display    = logado ? 'none' : 'inline-flex';
    if (btCadastrar) btCadastrar.style.display = logado ? 'none' : 'inline-flex';

    // Nome ao lado do ícone
    if (usernameHeader) {
      if (logado) {
        usernameHeader.textContent = user.nome || user.email;
        usernameHeader.style.display = 'inline-block';
      } else {
        usernameHeader.textContent = '';
        usernameHeader.style.display = 'none';
      }
    }

    // Itens do menu
    guestItems.forEach(el  => el.style.display = logado ? 'none' : '');
    loggedItems.forEach(el => el.style.display = logado ? ''    : 'none');

    // Nome dentro do menu
    if (liNomeMenu) {
      liNomeMenu.textContent = logado ? (user.nome || user.email) : '';
    }
  }

  const usuarioLogado = vhGetLoggedUser();
  aplicarEstadoUsuario(usuarioLogado);

  // ===== ações do menu =====

  // sair da conta -> remove do localStorage e recarrega a página
  if (linkSair) {
    linkSair.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('vh_loggedUser');
      window.location.reload();
    });
  }

  // mudar de conta -> apaga logado e vai pro login
  if (linkTrocar) {
    linkTrocar.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('vh_loggedUser');
      window.location.href = '/login/login.html';
    });
  }

  // perfil -> por enquanto só um alerta (depois vocês criam a página de perfil)
  if (linkPerfil) {
    linkPerfil.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Aqui depois vocês podem abrir a página de perfil do jogador.');
    });
  }
});
