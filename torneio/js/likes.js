// /torneio/js/likes.js
// sistema de like por torneio (um "YouTubezinho" local)

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".like-btn");
  if (!btn) return; // se não tiver botão, não faz nada

  const torneioId = btn.dataset.id; // ex: "cerrado-cup-csgo"
  const countSpan = btn.querySelector(".like-count");

  // objeto onde vamos guardar likes de todos os torneios

  let savedLikes = {};
  try {
    savedLikes = JSON.parse(localStorage.getItem("vh_torneioLikes") || "{}");
  } catch (e) {
    savedLikes = {};
  }

  // se ja tem like salvo pra esse torneio

  if (savedLikes[torneioId] && savedLikes[torneioId].liked) {
    btn.classList.add("liked");
  }

  // contador de like
  const initialCount = savedLikes[torneioId]?.count ?? 0;
  countSpan.textContent = initialCount;

  btn.addEventListener("click", () => {
    let current = parseInt(countSpan.textContent) || 0;

    if (btn.classList.contains("liked")) {
      // DESCURTIR
      btn.classList.remove("liked");
      current = Math.max(current - 1, 0);
      savedLikes[torneioId] = { liked: false, count: current };
    } else {
      // CURTIR
      btn.classList.add("liked");
      current += 1;
      savedLikes[torneioId] = { liked: true, count: current };
    }

    countSpan.textContent = current;
    localStorage.setItem("vh_torneioLikes", JSON.stringify(savedLikes));
  });
});
