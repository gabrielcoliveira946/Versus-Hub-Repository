document.addEventListener('DOMContentLoaded', () => {
  // --- abas ---
  const tabs = document.querySelectorAll('.tab-btn');
  const lista = document.getElementById('listaTorneios');

  // lê arrays de torneios do localStorage
  const data = {
    created: JSON.parse(localStorage.getItem('vh_createdTournaments') || '[]'),
    joined:  JSON.parse(localStorage.getItem('vh_joinedTournaments')  || '[]'),
    visited: JSON.parse(localStorage.getItem('vh_visitedTournaments') || '[]'),
  };

  function criarCard(torneio) {
    const article = document.createElement('article');
    article.className = 'card-torneio manage-card-item';

    article.innerHTML = `
      <img src="${torneio.banner}" alt="${torneio.nome}">
      <div class="card-info">
        <h2>${torneio.nome}</h2>
        <p class="jogo">${torneio.jogo || ''}</p>
        <p class="data">${torneio.data || ''}</p>
        <p class="status ${torneio.statusClass || ''}">${torneio.status || ''}</p>
        <a href="${torneio.link || '#'}" class="btn-detalhes">Ver detalhes</a>
      </div>
    `;
    return article;
  }

  function render(tabKey) {
    const listaT = data[tabKey] || [];
    lista.innerHTML = '';

    if (!listaT.length) {
      lista.innerHTML = `
        <p class="empty-state">
          Você ainda não possui torneios nesta seção.
        </p>`;
      return;
    }

    listaT.forEach(t => {
      lista.appendChild(criarCard(t));
    });
  }

  // clique nas abas
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const chave = btn.dataset.tab; // "created", "joined", "visited"
      render(chave);
    });
  });

  // carrega a primeira aba (Seus torneios)
  render('created');
});
