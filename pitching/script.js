const slides = Array.from(document.querySelectorAll(".slide"));
const navItems = Array.from(document.querySelectorAll(".nav-dot"));
const prevButton = document.getElementById("prevSlide");
const nextButton = document.getElementById("nextSlide");
const slideCount = document.getElementById("slideCount");
const progressBar = document.getElementById("progressBar");
const currentTitle = document.getElementById("currentTitle");
const downloadPdfButton = document.getElementById("downloadPdf");
const downloadPptxButton = document.getElementById("downloadPptx");
const downloadMenu = document.querySelector(".download-menu");

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

function waitForRender() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
}

async function captureSlideImages() {
  if (!window.html2canvas) {
    throw new Error("Export library is not ready. Check your internet connection and reload the page.");
  }

  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  const images = [];
  const exportStage = document.createElement("div");
  exportStage.className = "export-stage";
  document.body.appendChild(exportStage);

  try {
    for (const sourceSlide of slides) {
      exportStage.replaceChildren();

      const slideClone = sourceSlide.cloneNode(true);
      slideClone.classList.add("active");
      exportStage.appendChild(slideClone);

      await waitForRender();

      const canvas = await window.html2canvas(slideClone, {
        backgroundColor: "#f8f6f0",
        scale: 2,
        width: 1240,
        height: 697.5,
        windowWidth: 1240,
        windowHeight: 698,
        scrollX: 0,
        scrollY: 0,
        useCORS: true,
        allowTaint: true,
        logging: false
      });

      images.push({
        dataUrl: canvas.toDataURL("image/png"),
        width: canvas.width,
        height: canvas.height
      });
    }
  } finally {
    exportStage.remove();
  }

  return images;
}

async function withExportState(button, label, callback) {
  const buttons = [downloadPdfButton, downloadPptxButton].filter(Boolean);
  const originalText = button.textContent;

  if (downloadMenu) {
    downloadMenu.open = false;
  }

  buttons.forEach((item) => {
    item.disabled = true;
  });
  button.textContent = label;

  try {
    await callback();
  } catch (error) {
    window.alert(error.message || "Export failed. Please reload the page and try again.");
  } finally {
    button.textContent = originalText;
    buttons.forEach((item) => {
      item.disabled = false;
    });
  }
}

async function downloadPdf() {
  await withExportState(downloadPdfButton, "Saving...", async () => {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      throw new Error("PDF library is not ready. Check your internet connection and reload the page.");
    }

    const images = await captureSlideImages();
    const pdf = new window.jspdf.jsPDF({
      orientation: "landscape",
      unit: "in",
      format: [13.333, 7.5]
    });

    images.forEach((image, index) => {
      if (index > 0) {
        pdf.addPage([13.333, 7.5], "landscape");
      }
      pdf.addImage(image.dataUrl, "PNG", 0, 0, 13.333, 7.5);
    });

    pdf.save("ssm-ai-compliance-pitch-deck.pdf");
  });
}

async function downloadPptx() {
  await withExportState(downloadPptxButton, "Saving...", async () => {
    const PptxConstructor = window.PptxGenJS || window.pptxgen;

    if (!PptxConstructor) {
      throw new Error("PPTX library is not ready. Check your internet connection and reload the page.");
    }

    const images = await captureSlideImages();
    const pptx = new PptxConstructor();
    pptx.layout = "LAYOUT_WIDE";
    pptx.author = "Taylor's University / SSM";
    pptx.subject = "SSM AI Compliance Intelligence Pitch Deck";
    pptx.title = "SSM AI Early Warning Pitch Deck";
    pptx.company = "Taylor's University";

    images.forEach((image) => {
      const slide = pptx.addSlide();
      slide.background = { color: "F8F6F0" };
      slide.addImage({
        data: image.dataUrl,
        x: 0,
        y: 0,
        w: 13.333,
        h: 7.5
      });
    });

    await pptx.writeFile({ fileName: "ssm-ai-compliance-pitch-deck.pptx" });
  });
}

if (downloadPdfButton) {
  downloadPdfButton.addEventListener("click", downloadPdf);
}

if (downloadPptxButton) {
  downloadPptxButton.addEventListener("click", downloadPptx);
}

document.addEventListener("click", (event) => {
  if (downloadMenu && !downloadMenu.contains(event.target)) {
    downloadMenu.open = false;
  }
});

showSlide(0);
