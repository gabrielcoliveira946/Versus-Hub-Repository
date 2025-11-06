// ===========================
// CAROUSEL FUNCTIONALITY
// ===========================

// Armazenar índice do slide atual
let currentSlide = 0

// Seletor: Elementos do carousel
const slides = document.querySelectorAll(".carousel-slide")
const dots = document.querySelectorAll(".dot")
const prevBtn = document.getElementById("prevBtn")
const nextBtn = document.getElementById("nextBtn")
const menuToggle = document.getElementById("menuToggle")
const navMenu = document.getElementById("navMenu")

// Numero total de slides
const totalSlides = slides.length

/**
 * Função: Mostrar slide específico
 * @param {number} index - Índice do slide a ser exibido
 */
function showSlide(index) {
  // Garantir que o índice está entre 0 e totalSlides - 1
  if (index >= totalSlides) {
    currentSlide = 0 // Volta ao primeiro slide
  } else if (index < 0) {
    currentSlide = totalSlides - 1 // Vai para o último slide
  } else {
    currentSlide = index
  }

  // Remover classe 'active' de todos os slides e dots
  slides.forEach((slide) => slide.classList.remove("active"))
  dots.forEach((dot) => dot.classList.remove("active"))

  // Adicionar classe 'active' ao slide e dot atuais
  slides[currentSlide].classList.add("active")
  dots[currentSlide].classList.add("active")
}

/**
 * Função: Ir para próximo slide
 */
function nextSlide() {
  showSlide(currentSlide + 1)
}

/**
 * Função: Ir para slide anterior
 */
function prevSlide() {
  showSlide(currentSlide - 1)
}

// ===========================
// EVENT LISTENERS: BOTÕES
// ===========================

// Botão próximo
nextBtn.addEventListener("click", nextSlide)

// Botão anterior
prevBtn.addEventListener("click", prevSlide)

// ===========================
// EVENT LISTENERS: DOTS
// ===========================

// Adicionar evento click em cada dot
dots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    showSlide(index)
  })
})

// ===========================
// MENU MOBILE: HAMBURGER
// ===========================

/**
 * Função: Toggle do menu mobile
 */
menuToggle.addEventListener("click", () => {
  navMenu.classList.toggle("active")
})

// Fechar menu ao clicar em um link
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("active")
  })
})

// ===========================
// AUTO-ROTATE CAROUSEL (OPCIONAL)
// ===========================

// Rotacionar slides automaticamente a cada 8 segundos
// Descomente as linhas abaixo se desejar auto-rotação
/*
setInterval(() => {
    nextSlide();
}, 8000);
*/

// Inicializar com primeiro slide
showSlide(0)
