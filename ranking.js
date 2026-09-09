// /ranking.js
import { supabase } from '/supabaseClient.js';

// Utilitário para remover acentos e padronizar textos para buscas
function normalizeText(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Mapeamento inteligente de fallback para integrantes com fotos autênticas
function resolvePlayerAvatar(u) {
  const customAvatar = (u.avatar || '').trim();
  if (customAvatar && customAvatar !== '/image/boneco_logo_ofc.png') {
    if (!customAvatar.includes('microsoft.png') && !customAvatar.includes('pngtree-avatar-icon')) {
      return customAvatar;
    }
  }

  const nome = normalizeText(u.nome);
  const email = normalizeText(u.email);

  if (nome.includes('caique') || email.includes('caique')) {
    return '/equipes/images/caiquebrandao.jpg';
  }
  if (nome.includes('gabriel') || email.includes('costaoliveira')) {
    return '/equipes/images/gabrieloliveira.webp';
  }

  return '/image/boneco_logo_ofc.png';
}

// Core points formula
function calculatePoints(stats) {
  if (!stats) return 0;
  let parsedStats = stats;
  if (typeof stats === 'string') {
    try {
      parsedStats = JSON.parse(stats);
    } catch {
      parsedStats = {};
    }
  }
  const disputed = parseInt(parsedStats.disputed) || 0;
  const won = parseInt(parsedStats.won) || 0;
  const wins = parseInt(parsedStats.wins) || 0;
  const losses = parseInt(parsedStats.losses) || 0;

  // formula: 300 for tournaments won + 15 for individual wins + 5 for participation - 2 for losses
  const score = (won * 300) + (wins * 15) + (disputed * 5) - (losses * 2);
  return Math.max(0, score);
}

// Armazena vetor ordenado oficial para buscas e filtros
let sortedList = [];
let currentLoggedUser = null;

// Elementos do DOM
let podiumContainer = null;
let tableContainer = null;
let searchInput = null;

// Funcao para renderizar o Top 3 do Podium
function renderPodium(players) {
  if (!podiumContainer) return;
  podiumContainer.innerHTML = '';

  // Pegamos os 3 primeiros colocados globais
  const top3 = players.slice(0, 3);
  if (!top3.length) {
    podiumContainer.style.display = 'none';
    return;
  } else {
    podiumContainer.style.display = 'flex';
  }

  // Mapeamento de posicoes para classes (2o esq, 1o centro, 3o dir)
  const orderConfig = [
    { pos: 2, cssClass: 'second', label: '2o Lugar', title: 'Silver' },
    { pos: 1, cssClass: 'first', label: '#1', title: 'Supremo' },
    { pos: 3, cssClass: 'third', label: '3o Lugar', title: 'Cooper' }
  ];

  orderConfig.forEach(cfg => {
    const playerIndex = cfg.pos - 1; // 0 para 1st, 1 para 2nd, 2 para 3rd
    const player = top3[playerIndex];

    if (!player) return;

    const card = document.createElement('div');
    card.className = `podium-card ${cfg.cssClass}`;

    const totalGames = (player.stats.wins || 0) + (player.stats.losses || 0);
    const winRate = totalGames > 0
      ? Math.round(((player.stats.wins || 0) / totalGames) * 100)
      : (player.stats.disputed ? Math.round(((player.stats.wins || 0) / player.stats.disputed) * 100) : 0);

    card.innerHTML = `
      <div class="podium-rank-badge">
        ${cfg.cssClass === 'first' ? '<i class="fa-solid fa-crown" style="color: inherit;"></i>' : cfg.pos}
      </div>
      <div class="podium-avatar-wrapper">
        <img referrerpolicy="no-referrer" src="${player.avatar}" alt="${player.nome}" class="podium-avatar" onerror="this.onerror=null; this.src='/image/boneco_logo_ofc.png';" />
      </div>
      <h3 class="podium-name">${player.nome}</h3>
      <p class="podium-title">${cfg.title}</p>
      <div class="podium-score">${player.points} pts</div>
      
      <div class="podium-stats-micro">
        <div class="podium-stat-item">
          <span class="podium-stat-label">Disputas</span>
          <span class="podium-stat-value">${player.stats.disputed}</span>
        </div>
        <div class="podium-stat-item">
          <span class="podium-stat-label">Vitorias</span>
          <span class="podium-stat-value">${player.stats.wins}</span>
        </div>
        <div class="podium-stat-item">
          <span class="podium-stat-label">Aproveit.</span>
          <span class="podium-stat-value">${winRate}%</span>
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      window.location.href = player.link;
    });

    podiumContainer.appendChild(card);
  });
}

// Funcao para renderizar a lista da tabela
function renderTableList(players, isFiltered = false) {
  if (!tableContainer) return;
  tableContainer.innerHTML = '';

  // Se estiver filtrado, renderizamos a partir do primeiro item retornado.
  // Se for listagem global completa, o top 3 ja esta no Podium, entao a tabela mostra a partir do 4o player.
  const startIndex = isFiltered ? 0 : 3;
  const listToShow = players.slice(startIndex);

  if (listToShow.length === 0) {
    if (isFiltered) {
      tableContainer.innerHTML = `
        <div class="ranking-no-results">
          <i class="fa-solid fa-magnifying-glass" style="font-size: 32px; color: #ff7300; margin-bottom: 12px; display: block;"></i>
          Nenhum jogador encontrado com este nome ou tag.
        </div>
      `;
    } else if (players.length === 0) {
      tableContainer.innerHTML = `
        <div class="ranking-no-results" style="color: #9cb1cf; padding: 24px;">
          <i class="fa-solid fa-users-slash" style="font-size: 32px; color: #ff7300; margin-bottom: 12px; display: block;"></i>
          Nenhum jogador registrado no momento.
        </div>
      `;
    } else {
      tableContainer.innerHTML = `
        <div class="ranking-no-results" style="color: #9cb1cf; padding: 24px;">
          <i class="fa-solid fa-trophy" style="font-size: 28px; color: #ff7300; margin-bottom: 12px; display: block;"></i>
          Todos os jogadores classificados estao atualmente no podio acima.
        </div>
      `;
    }
    return;
  }

  listToShow.forEach((player, index) => {
    // A posicao do ranking real e o indice absoluto na lista completa oficial
    const originalRank = sortedList.findIndex(p => p.id === player.id) + 1 || (index + 1);

    // Verifica se este jogador é o usuário logado
    const isCurrentUser = Boolean(
      currentLoggedUser && (
        (currentLoggedUser.id && player.id === currentLoggedUser.id) ||
        (currentLoggedUser.email && player.email && normalizeText(player.email) === normalizeText(currentLoggedUser.email))
      )
    );

    const row = document.createElement('div');
    row.className = 'leaderboard-row' + (isCurrentUser ? ' current-user' : '');

    // Calcula taxa de vitorias
    const totalPartidas = (player.stats.wins || 0) + (player.stats.losses || 0);
    const winRate = totalPartidas > 0 ? Math.round(((player.stats.wins || 0) / totalPartidas) * 100) : 0;
    
    let winRateClass = 'mid';
    if (winRate >= 70) winRateClass = 'high';
    else if (winRate < 50) winRateClass = 'low';

    row.innerHTML = `
      <div class="player-rank">#${originalRank}</div>
      <div class="player-identity">
        <img referrerpolicy="no-referrer" src="${player.avatar}" alt="${player.nome}" class="player-img" onerror="this.onerror=null; this.src='/image/boneco_logo_ofc.png';" />
        <div class="player-name-wrapper">
          <span class="player-name">
            ${player.nome}
            ${isCurrentUser ? '<span class="player-badge">VOCÊ</span>' : ''}
          </span>
        </div>
      </div>
      <div class="player-points" style="color: #ff7300;">${player.points} pts</div>
      <div class="player-stat">${player.stats.disputed}</div>
      <div class="player-stat" style="color: #4ade80;">${player.stats.wins}</div>
      <div class="player-stat" style="color: #f97373;">${player.stats.losses}</div>
      <div class="player-winrate ${winRateClass}">${winRate}%</div>
      <div class="player-action">
        <button type="button" title="Ver perfil completo">
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    `;

    row.addEventListener('click', () => {
      window.location.href = player.link;
    });

    tableContainer.appendChild(row);
  });
}

// Verifica se um jogador corresponde ao termo pesquisado de forma inteligente
function matchesSearch(player, rawTerm) {
  if (!rawTerm) return true;
  const term = normalizeText(rawTerm);
  if (!term) return true;

  const nome = normalizeText(player.nome);
  const email = normalizeText(player.email);
  const emailPrefix = email.split('@')[0] || '';

  // Verifica se o jogador corresponde ao usuário logado
  let isCurrent = false;
  let loggedNome = '';
  let loggedEmail = '';
  if (currentLoggedUser) {
    if (
      (currentLoggedUser.id && player.id === currentLoggedUser.id) ||
      (currentLoggedUser.email && player.email && normalizeText(player.email) === normalizeText(currentLoggedUser.email)) ||
      (currentLoggedUser.nome && normalizeText(player.nome) === normalizeText(currentLoggedUser.nome))
    ) {
      isCurrent = true;
      loggedNome = normalizeText(currentLoggedUser.nome);
      loggedEmail = normalizeText(currentLoggedUser.email);
    }
  }

  // 1. Busca direta no nome ou email do jogador
  if (nome.includes(term) || email.includes(term) || emailPrefix.includes(term)) {
    return true;
  }

  // 2. Busca nos dados locais do usuário da sessão caso seja ele
  if (isCurrent) {
    if (loggedNome.includes(term) || loggedEmail.includes(term)) {
      return true;
    }
  }

  // 3. Busca por múltiplas palavras isoladas (ex: "gabriel costa", "costa", etc.)
  const words = term.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    const combined = `${nome} ${email} ${emailPrefix} ${loggedNome} ${loggedEmail}`;
    if (words.every(w => combined.includes(w))) {
      return true;
    }
  }

  return false;
}

// Aplica o filtro de busca dinamicamente
function applySearchFilter(term) {
  const trimmed = (term || '').trim();

  if (trimmed === '') {
    // Se a busca estiver vazia, volta ao padrao (Top 3 no Podium, resto na tabela)
    if (podiumContainer) {
      podiumContainer.style.display = 'flex';
    }
    renderPodium(sortedList);
    renderTableList(sortedList, false);
  } else {
    // Se houver busca, filtra a sortedList e repassa os resultados reais para a tabela
    const filtered = sortedList.filter(p => matchesSearch(p, trimmed));

    // Esconde o Podium ao pesquisar para exibir os resultados diretamente na tabela
    if (podiumContainer) {
      podiumContainer.style.display = 'none';
    }

    renderTableList(filtered, true);
  }
}

// Inicializacao do Ranking consumindo os usuarios reais do Supabase
async function initRanking() {
  podiumContainer = document.getElementById('podiumContainer');
  tableContainer  = document.getElementById('leaderboardTableBody');
  searchInput     = document.getElementById('rankingSearch');

  if (tableContainer) {
    tableContainer.innerHTML = `
      <div class="ranking-no-results" style="color: #9cb1cf; padding: 24px;">
        <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 28px; color: #ff7300; margin-bottom: 12px; display: block;"></i>
        Carregando ranking de jogadores...
      </div>
    `;
  }

  // 1. Recupera usuário logado da sessão local
  try {
    const rawLogged = localStorage.getItem('vh_loggedUser');
    if (rawLogged) {
      currentLoggedUser = JSON.parse(rawLogged);
    }
  } catch (err) {
    console.error('Erro ao ler vh_loggedUser:', err);
  }

  // 2. Consulta usuários reais no Supabase
  let users = [];
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*');

    if (error) {
      console.error('Erro ao consultar usuarios no Supabase:', error);
    } else if (data) {
      users = data;
    }
  } catch (err) {
    console.error('Erro de conexao ao carregar ranking:', err);
  }

  // 3. Sincroniza dados do usuário logado entre Supabase e sessão local
  if (currentLoggedUser) {
    try {
      const matched = users.find(u =>
        (currentLoggedUser.id && u.id === currentLoggedUser.id) ||
        (currentLoggedUser.email && u.email && normalizeText(u.email) === normalizeText(currentLoggedUser.email)) ||
        (currentLoggedUser.nome && u.nome && normalizeText(u.nome) === normalizeText(currentLoggedUser.nome))
      );

      if (matched) {
        currentLoggedUser.id = matched.id;
        
        // Se o usuário logado tem foto customizada no localStorage, mantém e sincroniza com o banco
        if (currentLoggedUser.avatar && currentLoggedUser.avatar !== '/image/boneco_logo_ofc.png') {
          matched.avatar = currentLoggedUser.avatar;
        } else if (matched.avatar && matched.avatar !== '/image/boneco_logo_ofc.png' && !matched.avatar.includes('microsoft.png') && !matched.avatar.includes('pngtree')) {
          currentLoggedUser.avatar = matched.avatar;
          const userBtn = document.getElementById('userBtn');
          if (userBtn) userBtn.src = matched.avatar;
        }

        // Se o usuário atualizou o nome localmente, sincroniza com o objeto matched
        if (currentLoggedUser.nome && matched.nome !== currentLoggedUser.nome) {
          matched.nome = currentLoggedUser.nome;
          supabase.from('usuarios').update({ nome: currentLoggedUser.nome }).eq('id', matched.id).then();
        }

        localStorage.setItem('vh_loggedUser', JSON.stringify(currentLoggedUser));
      } else if (currentLoggedUser.nome || currentLoggedUser.email) {
        // Se o usuário logado ainda não estava na lista (ex: cadastrado offline), adiciona
        const newUserEntry = {
          id: currentLoggedUser.id || 'user-' + Date.now(),
          nome: currentLoggedUser.nome || 'Jogador Sem Nome',
          email: currentLoggedUser.email || '',
          avatar: currentLoggedUser.avatar || resolvePlayerAvatar(currentLoggedUser),
          stats: currentLoggedUser.stats || { disputed: 0, won: 0, wins: 0, losses: 0 }
        };
        users.push(newUserEntry);
      }
    } catch (err) {
      console.error('Erro ao sincronizar usuario logado:', err);
    }
  }

  // 4. Montagem da matriz activeCompetitors a partir dos dados do Supabase
  const activeCompetitors = users.map(u => {
    let statsObj = u.stats;
    if (typeof statsObj === 'string') {
      try {
        statsObj = JSON.parse(statsObj);
      } catch {
        statsObj = {};
      }
    }

    const stats = {
      disputed: parseInt(statsObj?.disputed) || 0,
      won: parseInt(statsObj?.won) || 0,
      wins: parseInt(statsObj?.wins) || 0,
      losses: parseInt(statsObj?.losses) || 0
    };

    const points = calculatePoints(stats);
    let finalAvatar = resolvePlayerAvatar(u);

    const isCurrentUser = Boolean(
      currentLoggedUser && (
        (currentLoggedUser.id && u.id === currentLoggedUser.id) ||
        (currentLoggedUser.email && u.email && normalizeText(u.email) === normalizeText(currentLoggedUser.email)) ||
        (currentLoggedUser.nome && u.nome && normalizeText(u.nome) === normalizeText(currentLoggedUser.nome))
      )
    );

    if (isCurrentUser && currentLoggedUser.avatar && currentLoggedUser.avatar !== '/image/boneco_logo_ofc.png') {
      finalAvatar = currentLoggedUser.avatar;
    }

    const targetId = isCurrentUser ? (currentLoggedUser.id || u.id || 'me') : (u.id || u.email || 'me');

    return {
      id: u.id,
      nome: u.nome || 'Jogador Sem Nome',
      avatar: finalAvatar,
      email: u.email || '',
      link: '/perfil/perfil-publico.html?id=' + encodeURIComponent(targetId),
      stats,
      points
    };
  });

  // 5. Ordena a matriz de competidores pela pontuação decrescente
  activeCompetitors.sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    if (b.stats.wins !== a.stats.wins) {
      return b.stats.wins - a.stats.wins;
    }
    return (a.nome || '').localeCompare(b.nome || '');
  });

  // Armazena na lista global oficial
  sortedList = [...activeCompetitors];

  // 6. Configura eventos de busca
  const setupSearchListeners = () => {
    const handleSearchEvent = (val) => {
      applySearchFilter(val);
    };

    if (searchInput) {
      ['input', 'keyup', 'change', 'search'].forEach(evtType => {
        searchInput.addEventListener(evtType, () => handleSearchEvent(searchInput.value));
      });
    }

    // Também escuta o campo de busca global do cabeçalho se o usuário digitar nele
    const headerSearch = document.getElementById('searchInput');
    if (headerSearch && headerSearch !== searchInput) {
      headerSearch.addEventListener('input', () => {
        if (searchInput) {
          searchInput.value = headerSearch.value;
        }
        handleSearchEvent(headerSearch.value);
      });
    }
  };

  setupSearchListeners();

  // 7. Verifica se há termo inicial (digitado ou vindo de query string)
  const urlParams = new URLSearchParams(window.location.search);
  const buscaUrl = urlParams.get('busca');
  const initialTerm = (searchInput && searchInput.value) ? searchInput.value : (buscaUrl || '');

  if (searchInput && initialTerm) {
    searchInput.value = initialTerm;
  }

  if (initialTerm) {
    applySearchFilter(initialTerm);
  } else {
    renderPodium(sortedList);
    renderTableList(sortedList, false);
  }
}

// Inicializa no carregamento do documento
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRanking);
} else {
  initRanking();
}

