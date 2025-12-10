// /criar_equipe/js/criar_equipe.js
document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY_TEAMS = 'vh_createdTeams';

  const form = document.getElementById('formCriarEquipe');
  const logoInput = document.getElementById('logoInput');
  const logoPreview = document.getElementById('logoPreview');

  const nomeEquipe = document.getElementById('nomeEquipe');
  const tagEquipe = document.getElementById('tagEquipe');
  const jogosEquipe = document.getElementById('jogosEquipe');
  const plataformaEquipe = document.getElementById('plataformaEquipe');
  const regiaoEquipe = document.getElementById('regiaoEquipe');
  const limiteMembros = document.getElementById('limiteMembros');
  const sobreEquipe = document.getElementById('sobreEquipe');
  const feedbackMsg = document.getElementById('feedbackMsgEquipe');

  let logoDataUrl = '';

  // ========= PREVIEW LOGO =========
  if (logoInput) {
    logoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) {
        logoDataUrl = '';
        logoPreview.innerHTML = '<span>Nenhuma imagem selecionada</span>';
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        logoDataUrl = ev.target.result;
        logoPreview.innerHTML = '';
        const img = document.createElement('img');
        img.src = logoDataUrl;
        logoPreview.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  }

  // ========= FUNÇÕES LOCALSTORAGE =========
  function loadTeams() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_TEAMS) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveTeams(arr) {
    localStorage.setItem(STORAGE_KEY_TEAMS, JSON.stringify(arr));
  }

  // ========= SUBMIT DO FORM =========
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!nomeEquipe.value.trim()) {
        feedbackMsg.textContent = 'Dê um nome para a sua equipe.';
        feedbackMsg.style.color = '#fecaca';
        return;
      }

      const id = 'team-' + Date.now();

      const novaEquipe = {
        id,
        nome: nomeEquipe.value.trim(),
        tag: tagEquipe.value.trim(),
        jogos: jogosEquipe.value.trim(),
        plataforma: plataformaEquipe.value,
        regiao: regiaoEquipe.value.trim(),
        limite: limiteMembros.value ? Number(limiteMembros.value) : null,
        sobre: sobreEquipe.value.trim(),
        logo: logoDataUrl || '/image/logo.png', // logo padrão
        link: '/equipes/template_equipe.html?id=' + encodeURIComponent(id)
      };

      const lista = loadTeams();
      lista.push(novaEquipe);
      saveTeams(lista);

      feedbackMsg.textContent = 'Equipe criada com sucesso! Indo para seu perfil...';
      feedbackMsg.style.color = '#a7f3d0';

      setTimeout(() => {
        window.location.href = '/perfil/perfil.html';
      }, 1200);
    });
  }
});
