/**
 * Eskandria Restaurant - Main Logic
 * Manages multilingual updates, theme switching, active states, dynamic UI rendering, scroll animations, and in-line admin editing.
 */

document.addEventListener("DOMContentLoaded", async () => {
  // Initialize configuration database
  initializeConfig();

  // Load language settings
  setupLanguageSwitcher();

  // Load and setup theme settings (Light/Dark mode)
  setupThemeToggler();

  // Highlight active navbar link
  highlightActiveLink();

  // Initialize scroll reveal animations
  setupScrollReveal();

  // If we are on menu.html, render the menu items
  if (document.getElementById("menu-page-container")) {
    renderMenuPage();
  }

  // If we are on order.html, render links
  if (document.getElementById("order-page-container")) {
    renderOrderPage();
  }

  // Load dynamic contents across all pages
  loadDynamicContents();

  // Inject side watermarks representing Pharaonic landmarks
  injectSideMonuments();

  // Setup admin editing triggers if logged in
  const loggedIn = await isAdminLoggedIn();
  if (loggedIn) {
    enableAdminMode();
  }

  // Initialize Premium Effects & Libraries
  initLenisSmoothScroll();
  initGSAPAnimations();
  initGoldenParticles();
  initCustomCursor();
  if (document.getElementById("reviews-carousel-swiper")) {
    initReviewsSwiper();
  }
  // Chef scroll tracker (single-page only)
  if (document.getElementById("chef-avatar-wrapper")) {
    initChefScrollTracker();
  }
});

/**
 * Checks and loads config from localStorage or defaults
 */
function initializeConfig() {
  if (!localStorage.getItem("eskandria_config")) {
    localStorage.setItem("eskandria_config", JSON.stringify(window.RestaurantConfig));
  }
}

function getConfig() {
  return JSON.parse(localStorage.getItem("eskandria_config")) || window.RestaurantConfig;
}

function saveConfig(config) {
  localStorage.setItem("eskandria_config", JSON.stringify(config));
}

/**
 * Theme Switching System (Light/Dark Mode)
 */
function setupThemeToggler() {
  const toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) return;

  // Check saved theme or default to dark
  const savedTheme = localStorage.getItem("eskandria_theme") || "dark";
  if (savedTheme === "light") {
    document.body.classList.add("light-theme");
    updateThemeIcon(true);
  } else {
    document.body.classList.remove("light-theme");
    updateThemeIcon(false);
  }

  toggleBtn.addEventListener("click", () => {
    const isLightNow = document.body.classList.toggle("light-theme");
    localStorage.setItem("eskandria_theme", isLightNow ? "light" : "dark");
    updateThemeIcon(isLightNow);
  });
}

function updateThemeIcon(isLight) {
  const icon = document.querySelector("#theme-toggle i");
  if (!icon) return;
  
  if (isLight) {
    icon.className = "fa-solid fa-moon"; // Shows moon (click to change to dark)
  } else {
    icon.className = "fa-solid fa-sun"; // Shows sun (click to change to light)
  }
}

/**
 * Scroll Reveal Animations using IntersectionObserver
 */
function setupScrollReveal() {
  const revealElements = document.querySelectorAll(".reveal");
  if (revealElements.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target); // Stop observing once animated
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: "0px 0px -50px 0px"
  });

  revealElements.forEach(el => {
    observer.observe(el);
  });
}

/**
 * Language Switching System
 */
let currentLang = "de"; // Default language

function setupLanguageSwitcher() {
  // Check if lang is saved in localStorage, default is 'de'
  const savedLang = localStorage.getItem("eskandria_lang");
  if (savedLang) {
    currentLang = savedLang;
  }
  
  // Set html document attribute and class
  document.documentElement.setAttribute("lang", currentLang);
  if (currentLang === "ar") {
    document.body.classList.add("rtl");
  } else {
    document.body.classList.remove("rtl");
  }

  // Display active language code in language selector btn
  const activeLangBtn = document.getElementById("active-lang-text");
  if (activeLangBtn) {
    activeLangBtn.textContent = currentLang === "de" ? "DE" : currentLang === "en" ? "EN" : "AR";
  }

  // Bind trigger events to language options
  const langBtn = document.getElementById("lang-btn-trigger");
  const langDropdown = document.getElementById("lang-dropdown-menu");
  
  if (langBtn && langDropdown) {
    langBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      langDropdown.classList.toggle("show");
    });

    document.addEventListener("click", () => {
      langDropdown.classList.remove("show");
    });

    const langOptions = document.querySelectorAll(".lang-option");
    langOptions.forEach(option => {
      option.addEventListener("click", (e) => {
        const selected = e.target.getAttribute("data-lang");
        switchLanguage(selected);
      });
    });
  }
}

function switchLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("eskandria_lang", lang);
  document.documentElement.setAttribute("lang", lang);
  
  if (lang === "ar") {
    document.body.classList.add("rtl");
  } else {
    document.body.classList.remove("rtl");
  }

  const activeLangBtn = document.getElementById("active-lang-text");
  if (activeLangBtn) {
    activeLangBtn.textContent = lang === "de" ? "DE" : lang === "en" ? "EN" : "AR";
  }

  // Re-render menu page if relevant (since filters, category text depends on language)
  if (document.getElementById("menu-page-container")) {
    renderMenuPage();
  }

  // Refresh page dynamic texts
  loadDynamicContents();

  // Re-initialize Swiper for direction/RTL adjustments
  if (document.getElementById("reviews-carousel-swiper")) {
    initReviewsSwiper();
  }
}

/**
 * Highlights the active navbar link by scroll position (single-page mode)
 */
function highlightActiveLink() {
  const sectionIds = ["#hero-home", "#menu-section", "#reservation-section", "#order-section", "#contact-section"];
  const navLinks = document.querySelectorAll(".nav-link");

  // If it's a multi-page context (not single page), fall back to pathname matching
  const hasSections = document.querySelector("#menu-section");
  if (!hasSections) {
    const currentPath = window.location.pathname;
    const page = currentPath.substring(currentPath.lastIndexOf("/") + 1) || "index.html";
    navLinks.forEach(link => {
      link.classList.toggle("active", link.getAttribute("href") === page);
    });
    return;
  }

  function updateActive() {
    const scrollY = window.scrollY + 120;
    let current = sectionIds[0];
    sectionIds.forEach(id => {
      const el = document.querySelector(id);
      if (el && el.offsetTop <= scrollY) current = id;
    });
    navLinks.forEach(link => {
      link.classList.toggle("active", link.getAttribute("href") === current);
    });
  }

  window.addEventListener("scroll", updateActive, { passive: true });
  updateActive();
}

/**
 * Render dynamic translations on all page items
 */
function loadDynamicContents() {
  const config = getConfig();

  // Taglines / Titles
  updateTextElement("dyn-tagline", config.tagline);
  updateTextElement("dyn-about-text", config.aboutText);
  
  // Contact details
  updateTextElement("dyn-phone", config.contact.phoneDisplay, false);
  updateTextElement("dyn-phone-link", config.contact.phone, false, "href", "tel:");
  updateTextElement("dyn-whatsapp", config.contact.whatsappDisplay, false);
  updateTextElement("dyn-whatsapp-link", config.contact.whatsapp, false, "href", "https://wa.me/");
  updateTextElement("dyn-email", config.contact.email, false);
  updateTextElement("dyn-email-link", config.contact.email, false, "href", "mailto:");
  updateTextElement("dyn-address", config.contact.address, false);
  updateTextElement("dyn-address-link", config.contact.googleMapsUrl, false, "href");

  // Opening hours
  updateTextElement("dyn-hours", config.openingHours);

  // Social Links
  updateTextElement("dyn-insta-link", config.socialLinks.instagram, false, "href");
  updateTextElement("dyn-tiktok-link", config.socialLinks.tiktok, false, "href");
  updateTextElement("dyn-facebook-link", config.socialLinks.facebook, false, "href");

  // Footer references
  updateTextElement("dyn-footer-name", config.restaurantName, false);

  // Apply Pharaonic decorations
  applyPharaonicCardDecorations();
}

function updateTextElement(elementId, data, isMultilingual = true, attribute = null, prefix = "") {
  const elements = document.querySelectorAll(`.${elementId}, #${elementId}`);
  elements.forEach(element => {
    let content = "";
    if (isMultilingual) {
      content = data[currentLang] || data["de"];
    } else {
      content = data;
    }

    if (attribute) {
      element.setAttribute(attribute, prefix + content);
    } else {
      element.textContent = content;
    }
  });
}

/**
 * Rendering Menu Page items (menu.html)
 */
function renderMenuPage() {
  const config = getConfig();
  const menuContainer = document.getElementById("menu-page-container");
  const filtersContainer = document.getElementById("menu-filters-container");
  
  if (!menuContainer || !filtersContainer) return;

  // Clear existing
  filtersContainer.innerHTML = "";
  menuContainer.innerHTML = "";

  // Render Category Filter Buttons
  const allBtn = document.createElement("button");
  allBtn.className = "filter-btn active";
  allBtn.setAttribute("data-filter", "all");
  allBtn.textContent = currentLang === "de" ? "Alle" : currentLang === "en" ? "All" : "الكل";
  allBtn.addEventListener("click", () => filterMenu("all"));
  filtersContainer.appendChild(allBtn);

  config.categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.setAttribute("data-filter", cat.id);
    btn.textContent = cat.name[currentLang] || cat.name["de"];
    btn.addEventListener("click", () => filterMenu(cat.id));
    filtersContainer.appendChild(btn);
  });

  // Render Menu items
  config.items.forEach(item => {
    const card = document.createElement("div");
    card.className = `menu-item reveal`; // Adding reveal class for observer animations
    card.setAttribute("data-category", item.categoryId);
    card.setAttribute("data-item-id", item.id);

    const name = item.name[currentLang] || item.name["de"];
    const desc = item.description[currentLang] || item.description["de"];

    card.innerHTML = `
      <div class="menu-item-img-container">
        <img class="menu-item-img" src="${item.image}" alt="${name}" loading="lazy">
      </div>
      <div class="menu-item-content">
        <div class="menu-item-header">
          <h3 class="menu-item-title admin-editable-menu-title" data-item-id="${item.id}">${name}</h3>
          <span class="menu-item-price admin-editable-menu-price" data-item-id="${item.id}">${item.price} €</span>
        </div>
        <p class="menu-item-desc admin-editable-menu-desc" data-item-id="${item.id}">${desc}</p>
        <div style="margin-top: auto;">
          <a href="order.html" class="btn btn-secondary" style="padding: 10px 20px; width: 100%; text-align: center; font-size: 11px;">
            ${currentLang === "de" ? "JETZT BESTELLEN" : currentLang === "en" ? "ORDER NOW" : "اطلب الآن"}
          </a>
        </div>
      </div>
    `;
    menuContainer.appendChild(card);
  });

  // Reset scroll reveal observer for new items
  setupScrollReveal();

  // Apply Pharaonic decorations to dynamic menu items
  applyPharaonicCardDecorations();
}

function filterMenu(categoryId) {
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach(btn => {
    if (btn.getAttribute("data-filter") === categoryId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  const menuItems = document.querySelectorAll(".menu-item");
  menuItems.forEach(item => {
    const cat = item.getAttribute("data-category");
    if (categoryId === "all" || cat === categoryId) {
      item.classList.remove("hide");
    } else {
      item.classList.add("hide");
    }
  });
}

/**
 * Order page dynamic configuration links (order.html)
 */
function renderOrderPage() {
  const config = getConfig();
  const container = document.getElementById("order-page-container");
  if (!container) return;

  container.innerHTML = `
    <!-- Uber Eats -->
    <div class="platform-card uber reveal">
      <div class="platform-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h4v12H4V6zm6 0h4a4 4 0 0 1 0 8h-4v4h-4V6h8a4 4 0 0 1 4 4c0 2.2-1.8 4-4 4h-4" stroke="currentColor" stroke-width="2"></path></svg>
      </div>
      <h3 class="platform-title">Uber Eats</h3>
      <p class="platform-desc lang-de">Lassen Sie sich Ihr Lieblingsgericht direkt nach Hause liefern.</p>
      <p class="platform-desc lang-en">Get your favorite Egyptian meals delivered straight to your door.</p>
      <p class="platform-desc lang-ar">احصل على وجباتك المفضلة وتوصيلها مباشرة إلى عتبة دارك.</p>
      <a href="${config.deliveryLinks.uberEats}" target="_blank" rel="noopener" class="platform-btn">
        <span class="lang-de">Jetzt bestellen</span>
        <span class="lang-en">Order Now</span>
        <span class="lang-ar">اطلب الآن</span>
      </a>
    </div>

    <!-- Wolt -->
    <div class="platform-card wolt reveal">
      <div class="platform-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 9c3 8 5-2 9 6 4 8 6-16 9-2" stroke="#009de0" stroke-width="3" stroke-linecap="round"></path></svg>
      </div>
      <h3 class="platform-title">Wolt</h3>
      <p class="platform-desc lang-de">Schnelle Lieferung aus unserer Küche zu Ihnen.</p>
      <p class="platform-desc lang-en">Fast and fresh delivery from our kitchen to yours.</p>
      <p class="platform-desc lang-ar">توصيل سريع وطازج من مطبخنا إليك مباشرة.</p>
      <a href="${config.deliveryLinks.wolt}" target="_blank" rel="noopener" class="platform-btn">
        <span class="lang-de">Jetzt bestellen</span>
        <span class="lang-en">Order Now</span>
        <span class="lang-ar">اطلب الآن</span>
      </a>
    </div>

    <!-- Lieferando -->
    <div class="platform-card lieferando reveal">
      <div class="platform-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 10l8-6 8 6v8a2 2 0 0 1-2 2h-4v-6H10v6H6a2 2 0 0 1-2-2v-8z" fill="#ff8000"></path></svg>
      </div>
      <h3 class="platform-title">Lieferando</h3>
      <p class="platform-desc lang-de">Bestellen Sie mit Ihrem vertrauten Lieferdienst.</p>
      <p class="platform-desc lang-en">Order easily using Germany's biggest delivery network.</p>
      <p class="platform-desc lang-ar">اطلب وجبتك بكل سهولة عبر شبكة ليفيراندو الألمانية.</p>
      <a href="${config.deliveryLinks.lieferando}" target="_blank" rel="noopener" class="platform-btn">
        <span class="lang-de">Jetzt bestellen</span>
        <span class="lang-en">Order Now</span>
        <span class="lang-ar">اطلب الآن</span>
      </a>
    </div>

    <!-- Direct WhatsApp Order -->
    <div class="platform-card whatsapp reveal">
      <div class="platform-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.79 14.15c-.24.67-1.39 1.27-1.9 1.34-.46.06-.92.09-3.04-.79-2.7-1.12-4.43-3.87-4.57-4.05-.13-.18-1.09-1.45-1.09-2.76 0-1.31.68-1.96.93-2.22.25-.26.54-.33.72-.33.18 0 .36 0 .51.01.16.01.37-.06.58.45.22.53.76 1.85.82 1.98.07.13.11.29.02.46-.09.18-.14.29-.28.45-.14.16-.3.36-.43.48-.15.14-.3.29-.13.58.17.29.76 1.25 1.63 2.03.87.78 1.61 1.02 1.84 1.13.23.11.37.09.51-.07.14-.16.61-.71.77-.96.16-.25.32-.21.54-.13.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.58-.18 1.25z" fill="#25d366"></path></svg>
      </div>
      <h3 class="platform-title">WhatsApp</h3>
      <p class="platform-desc lang-de">Bestellen Sie direkt per Chat oder fragen Sie nach Specials.</p>
      <p class="platform-desc lang-en">Chat directly with us to order or ask about daily specials.</p>
      <p class="platform-desc lang-ar">تحدث معنا مباشرة للطلب أو الاستفسار عن اليومية الخاصة.</p>
      <a href="https://wa.me/${config.contact.whatsapp}" target="_blank" rel="noopener" class="platform-btn" style="background:#25d366; border-color:#25d366; color:#fff;">
        <span class="lang-de">Chat starten</span>
        <span class="lang-en">Start Chat</span>
        <span class="lang-ar">ابدأ المحادثة</span>
      </a>
    </div>
  `;

  setupScrollReveal();
  applyPharaonicCardDecorations();
}

/**
 * Enable interactive admin edit mode
 */
function enableAdminMode() {
  // Inject visual Admin Badge
  const badge = document.createElement("div");
  badge.className = "admin-badge";
  badge.innerHTML = `
    <span>🛠️ Admin Mode Active</span>
    <span class="admin-badge-logout" id="admin-logout-btn">Log Out</span>
  `;
  document.body.appendChild(badge);

  document.getElementById("admin-logout-btn").addEventListener("click", () => {
    sessionStorage.removeItem("admin_token");
    window.location.reload();
  });

  // Enable inline editing for fields with data-key
  const editableTexts = document.querySelectorAll("[data-key]");
  editableTexts.forEach(el => {
    el.classList.add("admin-editable-active");
    el.addEventListener("dblclick", () => {
      const key = el.getAttribute("data-key");
      const config = getConfig();
      
      const keys = key.split(".");
      let val = config;
      keys.forEach(k => { val = val[k]; });

      const newVal = prompt(`Edit content for key: ${key}\n(Language: ${currentLang.toUpperCase()})`, val);
      if (newVal !== null) {
        let ref = config;
        for (let i = 0; i < keys.length - 1; i++) {
          ref = ref[keys[i]];
        }
        ref[keys[keys.length - 1]] = newVal;
        
        saveConfig(config);
        loadDynamicContents();
      }
    });
  });

  // Edit menu details
  setTimeout(() => {
    const editMenuTitles = document.querySelectorAll(".admin-editable-menu-title");
    editMenuTitles.forEach(el => {
      el.style.borderBottom = "1px dashed #ffbf00";
      el.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        const itemId = el.getAttribute("data-item-id");
        editMenuItem(itemId, "name");
      });
    });

    const editMenuPrices = document.querySelectorAll(".admin-editable-menu-price");
    editMenuPrices.forEach(el => {
      el.style.borderBottom = "1px dashed #ffbf00";
      el.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        const itemId = el.getAttribute("data-item-id");
        editMenuItem(itemId, "price");
      });
    });

    const editMenuDescs = document.querySelectorAll(".admin-editable-menu-desc");
    editMenuDescs.forEach(el => {
      el.style.borderBottom = "1px dashed #ffbf00";
      el.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        const itemId = el.getAttribute("data-item-id");
        editMenuItem(itemId, "description");
      });
    });
  }, 1000);
}

function editMenuItem(itemId, property) {
  const config = getConfig();
  const itemIndex = config.items.findIndex(i => i.id === itemId);
  if (itemIndex === -1) return;

  const item = config.items[itemIndex];
  
  if (property === "price") {
    const newPrice = prompt(`Enter new price for ${item.name[currentLang] || item.name['de']}:`, item.price);
    if (newPrice !== null) {
      config.items[itemIndex].price = newPrice;
      saveConfig(config);
      renderMenuPage();
    }
  } else {
    const currentVal = item[property][currentLang] || item[property]["de"];
    const newVal = prompt(`Edit ${property} (${currentLang.toUpperCase()}):`, currentVal);
    if (newVal !== null) {
      config.items[itemIndex][property][currentLang] = newVal;
      saveConfig(config);
      renderMenuPage();
    }
  }
}

/**
 * Dynamically injects Pharaonic gold corner ornaments into cards
 */
function applyPharaonicCardDecorations() {
  const cards = document.querySelectorAll(".card, .glass-card, .platform-card, .menu-item");
  cards.forEach(card => {
    if (card.querySelector(".card-corner")) return;
    
    // Ensure relative positioning
    if (window.getComputedStyle(card).position === "static") {
      card.style.position = "relative";
    }

    const tl = document.createElement("div"); tl.className = "card-corner card-corner-tl";
    const tr = document.createElement("div"); tr.className = "card-corner card-corner-tr";
    const bl = document.createElement("div"); bl.className = "card-corner card-corner-bl";
    const br = document.createElement("div"); br.className = "card-corner card-corner-br";
    
    card.appendChild(tl);
    card.appendChild(tr);
    card.appendChild(bl);
    card.appendChild(br);
  });
}

/**
 * Dynamically injects side watermark monuments on large screen displays
 */
function injectSideMonuments() {
  const leftClass = "monument-abusimbel";
  const rightClass = "monument-falcon";

  const leftEl = document.createElement("div");
  leftEl.className = `monument-frame monument-left ${leftClass}`;
  document.body.appendChild(leftEl);

  const rightEl = document.createElement("div");
  rightEl.className = `monument-frame monument-right ${rightClass}`;
  document.body.appendChild(rightEl);
}

/**
 * -------------------------------------------------------------
 * Phase 5: Premium Effects & Animations
 * -------------------------------------------------------------
 */

/**
 * 1. Lenis Smooth Scroll
 */
function initLenisSmoothScroll() {
  if (typeof Lenis === "undefined") return;

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    smoothTouch: false,
  });

  // Expose globally so chef tracker can use it
  window._lenisInstance = lenis;

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Bind internal page hashes for smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        lenis.scrollTo(targetEl);
      }
    });
  });
}

/**
 * 2. GSAP staggered reveal animations
 */
function initGSAPAnimations() {
  if (typeof gsap === "undefined") return;

  // Staggered load animations for hero contents
  if (document.querySelector(".hero-content")) {
    const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 1.2 } });
    tl.fromTo(".navbar", { y: -100, opacity: 0 }, { y: 0, opacity: 0.95, duration: 0.8 })
      .fromTo(".hero-subtitle", { y: 40, opacity: 0 }, { y: 0, opacity: 1 }, "-=0.4")
      .fromTo(".hero-title", { y: 30, opacity: 0 }, { y: 0, opacity: 1 }, "-=0.8")
      .fromTo(".hero-desc", { y: 20, opacity: 0 }, { y: 0, opacity: 1 }, "-=0.8")
      .fromTo(".btn-group", { y: 15, opacity: 0 }, { y: 0, opacity: 1 }, "-=0.8")
      .fromTo(".hero-bg", { scale: 1.12, opacity: 0 }, { scale: 1, opacity: 0.6, duration: 1.8 }, "-=1.5");
  } else {
    // Other pages: slide down header navbar
    gsap.fromTo(".navbar", { y: -100, opacity: 0 }, { y: 0, opacity: 0.95, duration: 0.8, ease: "power3.out" });
  }

  // Slide-in animation for side landmarks
  if (document.querySelector(".monument-frame")) {
    gsap.fromTo(".monument-left", { x: -80, opacity: 0 }, { x: 0, opacity: 0.24, duration: 1.5, delay: 0.6, ease: "power2.out" });
    gsap.fromTo(".monument-right", { x: 80, opacity: 0 }, { x: 0, opacity: 0.24, duration: 1.5, delay: 0.6, ease: "power2.out" });
  }

  // IntersectionObserver to trigger stagger elements
  const revealGrids = document.querySelectorAll(".grid-2, .grid-3, #menu-page-container, #order-page-container");
  if (revealGrids.length > 0) {
    const staggerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const cards = entry.target.querySelectorAll(".card, .platform-card, .menu-item");
          if (cards.length > 0) {
            gsap.fromTo(cards, 
              { y: 40, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: "power2.out" }
            );
          }
          staggerObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    revealGrids.forEach(grid => staggerObserver.observe(grid));
  }
}

/**
 * 3. Canvas-based ambient golden dust particles
 */
function initGoldenParticles() {
  if (window.innerWidth < 768) return; // Skip on mobile for performance

  let canvas = document.getElementById("particle-canvas");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "particle-canvas";
    document.body.prepend(canvas);
  }

  const ctx = canvas.getContext("2d");
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const maxParticles = 45;

  class Particle {
    constructor() {
      this.reset();
      this.y = Math.random() * height;
    }

    reset() {
      this.x = Math.random() * width;
      this.y = height + 10;
      this.size = Math.random() * 2 + 0.8;
      this.speedY = Math.random() * 0.4 + 0.2;
      this.speedX = Math.random() * 0.2 - 0.1;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.fadeSpeed = Math.random() * 0.005 + 0.002;
    }

    update() {
      this.y -= this.speedY;
      this.x += this.speedX;
      this.speedX += (Math.random() - 0.5) * 0.02;
      this.speedX = Math.max(-0.25, Math.min(0.25, this.speedX));

      if (this.y < height * 0.25) {
        this.opacity -= this.fadeSpeed;
      }
      if (this.y < -10 || this.opacity <= 0) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let i = 0; i < maxParticles; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }
  animate();
}

/**
 * 4. Custom Golden Ring cursor
 */
function initCustomCursor() {
  if (window.innerWidth < 991) return; // Disable on touch devices
  if (window.location.pathname.includes("admin.html")) return; // Disable in admin area

  let cursorDot = document.querySelector(".custom-cursor-dot");
  let cursorRing = document.querySelector(".custom-cursor-ring");

  if (!cursorDot) {
    cursorDot = document.createElement("div");
    cursorDot.className = "custom-cursor-dot";
    document.body.appendChild(cursorDot);
  }
  if (!cursorRing) {
    cursorRing = document.createElement("div");
    cursorRing.className = "custom-cursor-ring";
    document.body.appendChild(cursorRing);
  }

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;
  let isMoving = false;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    isMoving = true;

    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
    
    // Ensure visibility when moving
    cursorDot.style.opacity = 1;
    cursorRing.style.opacity = 1;
  });

  // Lerp tracking animation
  function updateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;

    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;

    requestAnimationFrame(updateRing);
  }
  updateRing();

  // Event delegation for hover state expansion
  const hoverSelector = "a, button, select, input, textarea, .filter-btn, .lang-btn, .theme-btn, .admin-editable-active, .card, .glass-card, .menu-item, .social-icon-btn, .platform-card";
  
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(hoverSelector)) {
      document.body.classList.add("cursor-hovering");
    }
  });

  document.addEventListener("mouseout", (e) => {
    const related = e.relatedTarget;
    if (!related || !related.closest(hoverSelector)) {
      document.body.classList.remove("cursor-hovering");
    }
  });

  // Handle window focus and edges
  document.addEventListener("mouseleave", () => {
    cursorDot.style.opacity = 0;
    cursorRing.style.opacity = 0;
  });
  document.addEventListener("mouseenter", () => {
    cursorDot.style.opacity = 1;
    cursorRing.style.opacity = 1;
  });
}

/**
 * 5. Swiper Reviews carousel slider
 */
let reviewsSwiperInstance = null;

function initReviewsSwiper() {
  if (typeof Swiper === "undefined") return;

  const swiperContainer = document.getElementById("reviews-carousel-swiper");
  if (!swiperContainer) return;

  if (reviewsSwiperInstance) {
    reviewsSwiperInstance.destroy(true, true);
  }

  // Set correct sliding direction based on language
  const dir = currentLang === "ar" ? "rtl" : "ltr";
  swiperContainer.setAttribute("dir", dir);

  reviewsSwiperInstance = new Swiper("#reviews-carousel-swiper", {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    }
  });
}

/**
 * 6. Interactive Chef Scroll Tracker
 * — Rat mascot slides down a dotted golden path as user scrolls.
 * — Speech bubble, section dots, and back-to-top on click.
 */
function initChefScrollTracker() {
  if (window.innerWidth < 1100) return; // desktop only

  const avatar   = document.getElementById("chef-avatar-wrapper");
  const bubble   = document.getElementById("chef-speech-bubble");
  const dotsWrap = document.getElementById("chef-section-dots");

  if (!avatar) return;

  // Section definitions for dot navigation
  const sections = [
    { id: "#hero-home",          labelDe: "Start",       labelEn: "Home",        labelAr: "البداية" },
    { id: "#about-story",        labelDe: "Geschichte",  labelEn: "Story",       labelAr: "قصتنا" },
    { id: "#highlights",         labelDe: "Erlebnis",    labelEn: "Experience",  labelAr: "تجربة" },
    { id: "#menu-section",       labelDe: "Menü",        labelEn: "Menu",        labelAr: "المنيو" },
    { id: "#reservation-section",labelDe: "Reservierung",labelEn: "Reservation", labelAr: "حجز" },
    { id: "#order-section",      labelDe: "Bestellen",   labelEn: "Order",       labelAr: "اطلب" },
    { id: "#reviews-and-maps",   labelDe: "Bewertungen", labelEn: "Reviews",     labelAr: "تقييمات" },
    { id: "#contact-section",    labelDe: "Kontakt",     labelEn: "Contact",     labelAr: "اتصل" },
  ];

  // Build section nav dots
  if (dotsWrap) {
    dotsWrap.innerHTML = "";
    sections.forEach((sec, i) => {
      const dot = document.createElement("div");
      dot.className = "chef-dot";
      dot.setAttribute("data-section", sec.id);
      dot.setAttribute("data-index", i);

      // Tooltip label
      const label = document.createElement("span");
      label.className = "chef-dot-label";
      const lang = currentLang || "de";
      label.textContent = lang === "de" ? sec.labelDe : lang === "en" ? sec.labelEn : sec.labelAr;
      dot.appendChild(label);

      dot.addEventListener("click", () => {
        const el = document.querySelector(sec.id);
        if (el) {
          if (typeof Lenis !== "undefined" && window._lenisInstance) {
            window._lenisInstance.scrollTo(el);
          } else {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }
      });

      dotsWrap.appendChild(dot);
    });
  }

  // Show speech bubble on hover
  if (avatar && bubble) {
    avatar.addEventListener("mouseenter", () => bubble.classList.add("visible"));
    avatar.addEventListener("mouseleave", () => bubble.classList.remove("visible"));
  }

  // Back to top on click with spin animation
  avatar.addEventListener("click", () => {
    avatar.classList.add("spinning");
    setTimeout(() => avatar.classList.remove("spinning"), 700);

    if (typeof Lenis !== "undefined" && window._lenisInstance) {
      window._lenisInstance.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  // Scroll tracking
  const trackTop    = 100;  // px from top where track starts
  const trackBottom = 80;   // px from bottom where track ends
  let lastScrollY = 0;
  let wobble = 0;

  function updateChef() {
    const scrollY   = window.scrollY;
    const docH      = document.documentElement.scrollHeight - window.innerHeight;
    const progress  = docH > 0 ? Math.min(scrollY / docH, 1) : 0;

    // Calculate vertical position along track
    const viewH        = window.innerHeight;
    const trackHeight  = viewH - trackTop - trackBottom - 72; // 72 = avatar height
    const newTop       = trackTop + progress * trackHeight;

    avatar.style.top = newTop + "px";

    // Sync speech bubble vertical position
    if (bubble) bubble.style.top = (newTop + 20) + "px";

    // Wobble based on scroll speed
    const speed   = Math.abs(scrollY - lastScrollY);
    wobble = Math.min(speed * 0.8, 18);
    const dir     = (scrollY > lastScrollY) ? 1 : -1;
    const img     = document.getElementById("chef-avatar");
    if (img) {
      img.style.transform = `rotate(${wobble * dir}deg)`;
      setTimeout(() => { if (img) img.style.transform = "rotate(0deg)"; }, 150);
    }

    lastScrollY = scrollY;

    // Highlight active dot
    if (dotsWrap) {
      let activeSectionIdx = 0;
      sections.forEach((sec, i) => {
        const el = document.querySelector(sec.id);
        if (el && el.getBoundingClientRect().top <= 140) {
          activeSectionIdx = i;
        }
      });
      dotsWrap.querySelectorAll(".chef-dot").forEach((dot, i) => {
        dot.classList.toggle("active", i === activeSectionIdx);
      });
    }
  }

  window.addEventListener("scroll", updateChef, { passive: true });
  updateChef(); // initial position
}

