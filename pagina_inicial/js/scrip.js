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



