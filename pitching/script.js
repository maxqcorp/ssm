const slides = Array.from(document.querySelectorAll(".slide"));
const navItems = Array.from(document.querySelectorAll(".nav-item"));
const prevButton = document.getElementById("prevSlide");
const nextButton = document.getElementById("nextSlide");
const slideCount = document.getElementById("slideCount");
const progressBar = document.getElementById("progressBar");
const currentTitle = document.getElementById("currentTitle");

let activeIndex = 0;

function showSlide(index) {
  activeIndex = Math.max(0, Math.min(index, slides.length - 1));

  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("active", slideIndex === activeIndex);
  });

  navItems.forEach((item, itemIndex) => {
    item.classList.toggle("active", itemIndex === activeIndex);
  });

  prevButton.disabled = activeIndex === 0;
  nextButton.disabled = activeIndex === slides.length - 1;
  slideCount.textContent = `${activeIndex + 1} / ${slides.length}`;
  progressBar.style.width = `${((activeIndex + 1) / slides.length) * 100}%`;
  currentTitle.textContent = slides[activeIndex].dataset.title;
  document.title = `${String(activeIndex + 1).padStart(2, "0")} - ${slides[activeIndex].dataset.title} | SSM AI Pitch`;
}

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    showSlide(Number(item.dataset.slide));
  });
});

prevButton.addEventListener("click", () => showSlide(activeIndex - 1));
nextButton.addEventListener("click", () => showSlide(activeIndex + 1));

document.addEventListener("keydown", (event) => {
  const forwardKeys = ["ArrowRight", "PageDown", " "];
  const backKeys = ["ArrowLeft", "PageUp"];

  if (forwardKeys.includes(event.key)) {
    event.preventDefault();
    showSlide(activeIndex + 1);
  }

  if (backKeys.includes(event.key)) {
    event.preventDefault();
    showSlide(activeIndex - 1);
  }

  if (event.key === "Home") {
    event.preventDefault();
    showSlide(0);
  }

  if (event.key === "End") {
    event.preventDefault();
    showSlide(slides.length - 1);
  }
});

showSlide(0);
