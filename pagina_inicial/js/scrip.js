const slides = document.getElementById("slides");
const imagens = slides.querySelectorAll("img");


let index = 0;


function mostraSlide() {
    slides.style.transform = `translateX(${-index * 100}%)`;
}


// BOTÃO PRÓXIMO
document.getElementById("btproximo").addEventListener("click", () => {
    index = (index + 1) % imagens.length;
    mostraSlide();
});


// BOTÃO ANTERIOR
document.getElementById("btanterior").addEventListener("click", () => {
    index = (index - 1 + imagens.length) % imagens.length;
    mostraSlide();
});

