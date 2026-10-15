/* =========================================================
   CONTENT-ONLY TRANSLATOR (Google Translate via server)
   ========================================================= */

const TRANSLATE_API = "/api/translate-google";
const originalTextMap = new WeakMap();

/* Collect text nodes only inside [data-translate="yes"] */
function collectTranslatableTextNodes() {
  const nodes = [];

  document.querySelectorAll('[data-translate="yes"]').forEach((section) => {
    const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    let current;
    while ((current = walker.nextNode())) {
      if (!originalTextMap.has(current)) {
        originalTextMap.set(current, current.nodeValue);
      }
      nodes.push(current);
    }
  });

  return nodes;
}

/* Apply translation */
async function applyLanguage(lang) {
  document.documentElement.lang = lang;

  const nodes = collectTranslatableTextNodes();
  const originals = nodes.map((n) => originalTextMap.get(n));

  // Restore English
  if (lang === "en") {
    nodes.forEach((n, i) => {
      n.nodeValue = originals[i];
    });
    return;
  }

  try {
    const res = await fetch(TRANSLATE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        texts: originals,
        target: lang,
      }),
    });

    const data = await res.json();
    if (!data.translations) return;

    nodes.forEach((n, i) => {
      if (data.translations[i]) {
        n.nodeValue = data.translations[i];
      }
    });
  } catch (err) {
    console.error("Translation failed:", err);
  }
}

/* Language selector */
document.addEventListener("DOMContentLoaded", () => {
  const langSelect = document.getElementById("language");
  if (!langSelect) return;

  const savedLang = localStorage.getItem("preferredLanguage") || "en";
  langSelect.value = savedLang;
  applyLanguage(savedLang);

  langSelect.addEventListener("change", (e) => {
    const lang = e.target.value;
    localStorage.setItem("preferredLanguage", lang);
    applyLanguage(lang);
  });
});

/* =========================================================
   TEMPLE GALLERY MODAL (UPDATED – WITH MORE INFO REDIRECT)
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const section = document.getElementById("temples-section");
  if (!section) return;

  const gallery = section.querySelector(".gallery");
  if (!gallery) return;

  const tiles = Array.from(gallery.querySelectorAll(".tile"));
  if (!tiles.length) return;

  /* Build modal */
  const modal = document.createElement("div");
  modal.className = "temple-modal";
  modal.innerHTML = `
    <div class="overlay" data-close></div>
    <div class="dialog" role="dialog" aria-modal="true" aria-hidden="true">
      <button class="close-btn" aria-label="Close">&times;</button>
      <div class="media">
        <img class="modal-img" src="" alt="">
        <div class="nav left">&#10094;</div>
        <div class="nav right">&#10095;</div>
      </div>
      <div class="info">
        <h3 class="modal-title"></h3>
        <p class="modal-desc"></p>
        <div class="controls">
          <button class="btn btn-learn" data-link="/src/temple.html#temple-vertical">Enter Sannidi</button>
          <button class="btn secondary btn-close">Close</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const imgEl = modal.querySelector(".modal-img");
  const titleEl = modal.querySelector(".modal-title");
  const descEl = modal.querySelector(".modal-desc");
  const closeBtn = modal.querySelector(".close-btn");
  const btnClose = modal.querySelector(".btn-close");
  const learnBtn = modal.querySelector(".btn-learn"); // ✅ FIX
  const overlay = modal.querySelector(".overlay");
  const navLeft = modal.querySelector(".nav.left");
  const navRight = modal.querySelector(".nav.right");

  let currentIndex = 0;
  let lastFocused = null;

  function openModal(index) {
    const tile = tiles[index];
    if (!tile) return;

    lastFocused = document.activeElement;
    currentIndex = index;

    imgEl.src = tile.dataset.src;
    imgEl.alt = tile.dataset.title || "";
    titleEl.textContent = tile.dataset.title || "";
    descEl.textContent = tile.dataset.desc || "";

    // OPTIONAL: pass index to temple page
    learnBtn.setAttribute("data-link", `/src/temple.html#temple-${index}`);

    modal.classList.add("show");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function closeModal() {
    modal.classList.remove("show");
    imgEl.src = "";
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  function showNext() {
    openModal((currentIndex + 1) % tiles.length);
  }

  function showPrev() {
    openModal((currentIndex - 1 + tiles.length) % tiles.length);
  }

  tiles.forEach((tile, index) => {
    tile.addEventListener("click", () => openModal(index));
    tile.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(index);
      }
    });
  });

  closeBtn.addEventListener("click", closeModal);
  btnClose.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);
  navRight.addEventListener("click", showNext);
  navLeft.addEventListener("click", showPrev);

  // ✅ MORE INFO REDIRECT (MAIN FIX)
  learnBtn.addEventListener("click", () => {
    const link = learnBtn.getAttribute("data-link");
    if (link) {
      window.location.href = link;
    }
  });

  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("show")) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowRight") showNext();
    if (e.key === "ArrowLeft") showPrev();
  });
});



document.addEventListener("DOMContentLoaded", () => {
  // History
  const historyBtn = document.querySelector(".history-HET .het-btn");
  if (historyBtn) {
    historyBtn.addEventListener("click", () => {
      window.location.href = "src/history.html";
    });
  }

  // Events
  const eventsBtn = document.querySelector(".events-HET .het-btn");
  if (eventsBtn) {
    eventsBtn.addEventListener("click", () => {
      window.location.href = "src/information.html";
    });
  }

  // Tenders
  const tendersBtn = document.querySelector(".tenders-HET .het-btn");
  if (tendersBtn) {
    tendersBtn.addEventListener("click", () => {
      window.location.href = "src/tenders.html";
    });
  }
});


document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("donationModal");

  if (!modal) return;

  const title = document.getElementById("donationTitle");
  const qr = document.getElementById("donationQR");
  const rightQR = modal.querySelector(".right-box img");

  const closeBtn = modal.querySelector(".donation-close");
  const overlay = modal.querySelector(".donation-overlay");

  function openModal(type) {
   
if (type === "goshala") {
  title.textContent = "Goshala Donation";
  qr.src = "/media/Goshala donation QR.jpeg";
  rightQR.src = "/media/Donation QR.jpeg";

} else if (type === "student") {
  title.textContent = "Scholarship Donation";
  qr.src = "/media/Scholarship donation QR.jpeg";
  rightQR.src = "/media/Donation QR.jpeg";

} else {
  title.textContent = "Temple Donation";
  qr.src = "/media/Temple donation QR.jpeg";
  rightQR.src = "/media/Donation QR.jpeg";
}

    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("show");
    document.body.style.overflow = "";
  }

  document.querySelector(".gdon")
    ?.addEventListener("click", () => openModal("goshala"));

  document.querySelector(".don")
    ?.addEventListener("click", () => openModal("donation"));

  document.querySelector(".sdon")
    ?.addEventListener("click", () => openModal("student"));

  closeBtn?.addEventListener("click", closeModal);
  overlay?.addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
});


document.addEventListener("DOMContentLoaded", () => {
  const serviceButtons = document.querySelectorAll(".service-btn");

  serviceButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const link = btn.getAttribute("data-link");
      if (link) {
        window.location.href = link;
      }
    });
  });
});

/* ================= VISITOR COUNTER ================= */

fetch("/api/visitors")
  .then((response) => response.json())
  .then((data) => {
    const visitorCount = document.getElementById("visitorCount");

    if (visitorCount) {
      visitorCount.textContent = data.visitors;
    }
  })
  .catch((error) => {
    console.error("Visitor counter error:", error);
  });

/* ================= SCHOLARSHIP CAROUSEL ARROWS ================= */

document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector(".gcx-track");
  const slides = document.querySelectorAll(".gcx-slide");
  const dots = document.querySelectorAll(".gcx-dot");
  const prevBtn = document.querySelector(".gcx-prev");
  const nextBtn = document.querySelector(".gcx-next");

  if (!track || !slides.length || !prevBtn || !nextBtn) return;

  let currentSlide = 0;

  function updateSlider() {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === currentSlide);
    });
  }

  /* Right arrow */
  nextBtn.addEventListener("click", () => {
    currentSlide++;

    if (currentSlide >= slides.length) {
      currentSlide = 0;
    }

    updateSlider();
  });

  /* Left arrow */
  prevBtn.addEventListener("click", () => {
    currentSlide--;

    if (currentSlide < 0) {
      currentSlide = slides.length - 1;
    }

    updateSlider();
  });

  /* Dots */
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      currentSlide = index;
      updateSlider();
    });
  });

  updateSlider();
});

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const show = params.get("show");

  if (!show) return;

  const section = document.getElementById(show);

  if (section) {
    section.classList.add("show");

    setTimeout(() => {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 200);
  }
});
