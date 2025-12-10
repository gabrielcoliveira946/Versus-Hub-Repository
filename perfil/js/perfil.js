// /perfil/js/perfil.js
document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "vh_loggedUser";

  // --------- UTILIDADES ---------
  function loadUser() {
    let u = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) u = JSON.parse(raw);
    } catch (err) {
      console.error("Erro ao ler vh_loggedUser:", err);
    }

    if (!u || typeof u !== "object") u = {};

    if (!u.nome) u.nome = "Usuário convidado";
    if (!u.email) u.email = "";
    if (!u.bio) u.bio = "";
    if (!u.avatar) u.avatar = "";
    if (!Array.isArray(u.jogosFavoritos)) u.jogosFavoritos = [];

    return u;
  }

  function saveUser(u) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } catch (err) {
      console.error("Erro ao salvar vh_loggedUser:", err);
    }
  }

  let user = loadUser();

  // --------- ELEMENTOS DA TELA ---------
  const headerUserImg   = document.getElementById("userBtn");

  const imgProfile      = document.getElementById("profileImage");
  const inputPhoto      = document.getElementById("inputPhoto");
  const btnPhoto        = document.getElementById("btnPhoto");

  const emailInput      = document.getElementById("emailInput");
  const displayName     = document.getElementById("displayName");
  const inputUsername   = document.getElementById("inputUsername");
  const bioTextarea     = document.getElementById("bioTextarea");

  const btnSaveProfile  = document.getElementById("btnSaveProfile");
  const btnEmailFocus   = document.getElementById("btnEmailFocus");
  const btnNameFocus    = document.getElementById("btnNameFocus");

  const jogoInput       = document.getElementById("jogoInput");
  const jogosTags       = document.getElementById("jogosTags");

  // --------- PREENCHE A TELA COM O QUE TEM NO LOCALSTORAGE ---------
  displayName.textContent = user.nome || "Usuário convidado";
  inputUsername.value     = user.nome || "";
  emailInput.value        = user.email || "";
  bioTextarea.value       = user.bio || "";

  if (user.avatar) {
    imgProfile.style.backgroundImage = `url('${user.avatar}')`;
    if (headerUserImg) headerUserImg.src = user.avatar;
  } else {
    imgProfile.style.backgroundImage = "url('/image/boneco_logo_ofc.png')";
    if (headerUserImg) headerUserImg.src = "/image/boneco_logo_ofc.png";
  }

  // --------- FOTO DE PERFIL ---------
  function abrirSeletorFoto() {
    if (inputPhoto) inputPhoto.click();
  }

  if (btnPhoto)   btnPhoto.addEventListener("click", abrirSeletorFoto);
  if (imgProfile) imgProfile.addEventListener("click", abrirSeletorFoto);

  if (inputPhoto) {
    inputPhoto.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target.result;

        imgProfile.style.backgroundImage = `url('${dataUrl}')`;
        if (headerUserImg) headerUserImg.src = dataUrl;

        user.avatar = dataUrl;
        saveUser(user);
      };
      reader.readAsDataURL(file);
    });
  }

  // --------- FOCAR NOS CAMPOS (ícones de lápis) ---------
  if (btnEmailFocus) {
    btnEmailFocus.addEventListener("click", () => {
      emailInput.focus();
    });
  }

  if (btnNameFocus) {
    btnNameFocus.addEventListener("click", () => {
      inputUsername.focus();
      inputUsername.select();
    });
  }

  // --------- SALVAR PERFIL (nome, email, bio) ---------
  if (btnSaveProfile) {
    btnSaveProfile.addEventListener("click", () => {
      const novoNome  = inputUsername.value.trim();
      const novoEmail = emailInput.value.trim();
      const novaBio   = bioTextarea.value.trim();

      if (novoNome) {
        user.nome = novoNome;
      }
      user.email = novoEmail;
      user.bio   = novaBio;

      displayName.textContent = user.nome || "Usuário convidado";

      saveUser(user);

      btnSaveProfile.textContent = "Salvo!";
      setTimeout(() => {
        btnSaveProfile.textContent = "Salvar alterações";
      }, 1500);
    });
  }

  // --------- JOGOS PREFERIDOS (tags) ---------
  function renderTags() {
    if (!jogosTags) return;
    jogosTags.innerHTML = "";

    user.jogosFavoritos.forEach((nomeJogo, index) => {
      const tag = document.createElement("div");
      tag.className = "game-tag";

      const span = document.createElement("span");
      span.textContent = nomeJogo;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "×";
      btn.setAttribute("aria-label", "Remover jogo");

      btn.addEventListener("click", () => {
        user.jogosFavoritos.splice(index, 1);
        saveUser(user);
        renderTags();
      });

      tag.appendChild(span);
      tag.appendChild(btn);
      jogosTags.appendChild(tag);
    });
  }

  renderTags();

  if (jogoInput) {
    jogoInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();

        const nome = jogoInput.value.trim();
        if (!nome) return;

        if (!user.jogosFavoritos.includes(nome)) {
          user.jogosFavoritos.push(nome);
          saveUser(user);
          renderTags();
        }

        jogoInput.value = "";
      }
    });
  }

  // ========= EQUIPES CRIADAS – PERFIL =========
  function loadTeamsProfile() {
    try {
      return JSON.parse(localStorage.getItem("vh_createdTeams") || "[]");
    } catch (e) {
      return [];
    }
  }

  function renderTeamsProfile() {
    const containerDynamic = document.getElementById("dynamicTeams");
    if (!containerDynamic) return;

    const teams = loadTeamsProfile();

    if (!teams.length) {
      containerDynamic.innerHTML =
        '<p class="empty-teams">Você ainda não criou nenhuma equipe.</p>';
      return;
    }

    containerDynamic.innerHTML = "";

    teams.forEach((team) => {
      const card = document.createElement("div");
      card.className = "profile-team-card";

      const main = document.createElement("div");
      main.className = "profile-team-main";

      const img = document.createElement("img");
      img.className = "profile-team-logo";
      img.src = team.logo || "/image/logo.png";
      img.alt = team.nome || "Equipe";

      const textBox = document.createElement("div");
      textBox.className = "profile-team-text";

      const h3 = document.createElement("h3");
      h3.textContent = team.nome || "Equipe sem nome";

      const p = document.createElement("p");
      const jogos = team.jogos ? `Jogos: ${team.jogos}` : "Jogos não informados";
      const regiao = team.regiao ? ` • Região: ${team.regiao}` : "";
      p.textContent = jogos + regiao;

      textBox.appendChild(h3);
      textBox.appendChild(p);

      main.appendChild(img);
      main.appendChild(textBox);

      const link = document.createElement("a");
      link.href = team.link || "#";
      link.textContent = "Ver detalhes";

      card.appendChild(main);
      card.appendChild(link);

      containerDynamic.appendChild(card);
    });
  }

  // chama ao carregar a página de perfil
  renderTeamsProfile();
});
