document.addEventListener("DOMContentLoaded", () => {
  const slides = Array.from(document.querySelectorAll(".carousel-slide img"));
  const dots = Array.from(document.querySelectorAll(".dot"));
  const prev = document.querySelector(".prev");
  const next = document.querySelector(".next");

  if (!slides.length) {
    console.warn("Carousel: no slides found");
    return;
  }

  let current = slides.findIndex(s => s.classList.contains("active"));
  if (current === -1) current = 0; // default to first slide

  const total = slides.length;

  function showSlide(index) {
    if (index >= total) index = 0;
    if (index < 0) index = total - 1;
    slides.forEach(s => s.classList.remove("active"));
    dots.forEach(d => d.classList.remove("active"));

    slides[index].classList.add("active");
    dots[index].classList.add("active");
    current = index;
  }

  // Auto-slide
  let autoSlide = setInterval(() => {
    showSlide((current + 1) % total);
  }, 4000);

  function resetTimer() {
    clearInterval(autoSlide);
    autoSlide = setInterval(() => {
      showSlide((current + 1) % total);
    }, 4000);
  }

  if (next) next.addEventListener("click", () => { showSlide(current + 1); resetTimer(); });
  if (prev) prev.addEventListener("click", () => { showSlide(current - 1); resetTimer(); });

  dots.forEach((dot, idx) => {
    dot.addEventListener("click", () => {
      showSlide(idx);
      resetTimer();
    });
  });

  // Optional: pause on hover
  const container = document.querySelector(".carousel-container");
  if (container) {
    container.addEventListener("mouseenter", () => { clearInterval(autoSlide); });
    container.addEventListener("mouseleave", () => { resetTimer(); });
  }
});

