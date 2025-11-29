const slides = document.querySelectorAll(".carousel-slide");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const indicatorsContainer = document.getElementById("carouselIndicators");


let index = 0;




/* Criar bolinhas */
slides.forEach((_, i) => {
  const dot = document.createElement("span");
  dot.addEventListener("click", () => goToSlide(i));
  indicatorsContainer.appendChild(dot);
});


function updateIndicators() {
  const dots = document.querySelectorAll("#carouselIndicators span");
  dots.forEach((d) => d.classList.remove("active"));
  dots[index].classList.add("active");
}


function showSlide() {
  slides.forEach((slide) => slide.classList.remove("active"));
  slides[index].classList.add("active");
  updateIndicators();
}


function goToSlide(idx) {
  index = idx;
  showSlide();
}


nextBtn.addEventListener("click", () => {
  index = (index + 1) % slides.length;
  showSlide();
});


prevBtn.addEventListener("click", () => {
  index = (index - 1 + slides.length) % slides.length;
  showSlide();
});


showSlide();





// ...pulso quando passa o slide...
document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.getElementById('carousel');
  const prev = document.getElementById('prevBtn');
  const next = document.getElementById('nextBtn');

  // ajuste conforme a duração da transição dos slides (0.5s = 500)
  const SLIDE_DURATION = 500;

  if (!carousel) return;

  function runSequence() {
    // apaga o shadow suavemente enquanto o slide troca
    carousel.classList.add('shadow-off');

    // após a troca, restaura e dispara o pulso
    setTimeout(() => {
      carousel.classList.remove('shadow-off');

      // reinicia a animação pulse
      carousel.classList.remove('pulse');
      void carousel.offsetWidth; // força reflow para reiniciar a animação
      carousel.classList.add('pulse');

      // limpa a classe pulse após terminar
      setTimeout(() => carousel.classList.remove('pulse'), 800);
    }, SLIDE_DURATION);
  }

  if (prev) prev.addEventListener('click', runSequence);
  if (next) next.addEventListener('click', runSequence);

  // permite disparar o efeito se o slide for trocado por script:
  // document.getElementById('carousel').dispatchEvent(new Event('slideChanged'));
  carousel.addEventListener('slideChanged', runSequence);
});
// ...new file...



// parte do menu quando clica na imagem

const userBtn = document.getElementById("userBtn");
const menuUser = document.getElementById("menuUser");

userBtn.addEventListener("click", () => {
  menuUser.style.display =
    menuUser.style.display === "block" ? "none" : "block";
});

document.addEventListener("click", (e) => {
  if (!document.querySelector(".user-icon").contains(e.target)) {
    menuUser.style.display = "none";
  }
});

// ===== MENU LATERAL (SIDEBAR) =====

// Pegamos os elementos do HTML pelo id
const menuToggle = document.getElementById('menuToggle');      // botão com ícone do menu
const sidebar = document.getElementById('sidebar');            // a <aside> da sidebar
const sidebarOverlay = document.getElementById('sidebarOverlay'); // fundo escuro

// Se existir o botão (garantia caso use o script em outra página)
if (menuToggle && sidebar && sidebarOverlay) {

  // Quando clicar no botão do menu, abre/fecha a sidebar
  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');         // adiciona/remove a classe .open
    sidebarOverlay.classList.toggle('open');  // mostra/esconde o overlay
  });

  // Quando clicar no fundo escuro, fecha a sidebar
  sidebarOverlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('open');
  });
}



