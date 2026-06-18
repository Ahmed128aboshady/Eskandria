

function initializeConfig(){localStorage.getItem("eskandria_config")||localStorage.setItem("eskandria_config",JSON.stringify(window.RestaurantConfig))}

function getConfig(){return JSON.parse(localStorage.getItem("eskandria_config"))||window.RestaurantConfig}

function saveConfig(e){localStorage.setItem("eskandria_config",JSON.stringify(e))}

function setupThemeToggler(){const e=document.getElementById("theme-toggle");e&&("light"===(localStorage.getItem("eskandria_theme")||"dark")?(document.body.classList.add("light-theme"),updateThemeIcon(!0)):(document.body.classList.remove("light-theme"),updateThemeIcon(!1)),e.addEventListener("click",()=>{const e=document.body.classList.toggle("light-theme");localStorage.setItem("eskandria_theme",e?"light":"dark"),updateThemeIcon(e)}))}

function updateThemeIcon(e){const t=document.querySelector("#theme-toggle i");t&&(t.className=e?"fa-solid fa-moon":"fa-solid fa-sun")}

function setupScrollReveal(){const e=document.querySelectorAll(".reveal");if(0===e.length)return;
const t=new IntersectionObserver(e=>{e.forEach(e=>{e.isIntersecting&&(e.target.classList.add("active"),t.unobserve(e.target))})},{threshold:.12,rootMargin:"0px 0px -50px 0px"});e.forEach(e=>{t.observe(e)})}
document.addEventListener("DOMContentLoaded",async()=>{
  initializeConfig(),
  setupLanguageSwitcher(),
  setupThemeToggler(),
  highlightActiveLink(),
  setupScrollReveal(),
  setupMobileMenu(),
  document.getElementById("menu-page-container")&&renderMenuPage(),document.getElementById("order-page-container")&&renderOrderPage(),loadDynamicContents(),
  injectSideMonuments(),
  await isAdminLoggedIn()&&enableAdminMode(),initLenisSmoothScroll(),
  initGSAPAnimations(),
  initGoldenParticles(),
  initCustomCursor(),
  document.getElementById("reviews-carousel-swiper")&&initReviewsSwiper(),document.getElementById("chef-avatar-wrapper")&&initChefScrollTracker()});
let currentLang="de";

function setupLanguageSwitcher(){const e=localStorage.getItem("eskandria_lang");e&&(currentLang=e),document.documentElement.setAttribute("lang",currentLang),"ar"===currentLang?document.body.classList.add("rtl"):document.body.classList.remove("rtl");
const t=document.getElementById("active-lang-text");t&&(t.textContent="de"===currentLang?"DE":"en"===currentLang?"EN":"AR");
const n=document.getElementById("lang-btn-trigger"),a=document.getElementById("lang-dropdown-menu");n&&a&&(n.addEventListener("click",e=>{e.stopPropagation(),a.classList.toggle("show")}),
document.addEventListener("click",()=>{a.classList.remove("show")}),document.querySelectorAll(".lang-option").forEach(e=>{e.addEventListener("click",e=>{switchLanguage(e.target.getAttribute("data-lang"))})}))}

function switchLanguage(e){currentLang=e,localStorage.setItem("eskandria_lang",e),document.documentElement.setAttribute("lang",e),"ar"===e?document.body.classList.add("rtl"):document.body.classList.remove("rtl");
const t=document.getElementById("active-lang-text");t&&(t.textContent="de"===e?"DE":"en"===e?"EN":"AR"),document.getElementById("menu-page-container")&&renderMenuPage(),loadDynamicContents(),
  document.getElementById("reviews-carousel-swiper")&&initReviewsSwiper()}

function highlightActiveLink(){const e=["#hero-home","#menu-section","#reservation-section","#order-section","#contact-section"],t=document.querySelectorAll(".nav-link");if(!document.querySelector("#menu-section")){const e=window.location.pathname,n=e.substring(e.lastIndexOf("/")+1)||"index.html";return void t.forEach(e=>{e.classList.toggle("active",e.getAttribute("href")===n)})}

function n(){const n=window.scrollY+120;
let a=e[0];e.forEach(e=>{const t=document.querySelector(e);t&&t.offsetTop<=n&&(a=e)}),t.forEach(e=>{e.classList.toggle("active",e.getAttribute("href")===a)})}window.addEventListener("scroll",n,{passive:!0}),n()}

function loadDynamicContents(){const e=getConfig();updateTextElement("dyn-tagline",e.tagline),updateTextElement("dyn-about-text",e.aboutText),updateTextElement("dyn-phone",e.contact.phoneDisplay,!1),updateTextElement("dyn-phone-link",e.contact.phone,!1,"href","tel:"),updateTextElement("dyn-whatsapp",e.contact.whatsappDisplay,!1),updateTextElement("dyn-whatsapp-link",e.contact.whatsapp,!1,"href","https://wa.me/"),updateTextElement("dyn-email",e.contact.email,!1),updateTextElement("dyn-email-link",e.contact.email,!1,"href","mailto:"),updateTextElement("dyn-address",e.contact.address,!1),updateTextElement("dyn-address-link",e.contact.googleMapsUrl,!1,"href"),updateTextElement("dyn-hours",e.openingHours),updateTextElement("dyn-insta-link",e.socialLinks.instagram,!1,"href"),updateTextElement("dyn-tiktok-link",e.socialLinks.tiktok,!1,"href"),updateTextElement("dyn-facebook-link",e.socialLinks.facebook,!1,"href"),updateTextElement("dyn-footer-name",e.restaurantName,!1),applyPharaonicCardDecorations()}

function updateTextElement(e,t,n=!0,a=null,o=""){document.querySelectorAll(`.${e}, #${e}`).forEach(e=>{let i="";i=n?t[currentLang]||t.de:t,a?e.setAttribute(a,o+i):e.textContent=i})}

function renderMenuPage(){const e=getConfig(),t=document.getElementById("menu-page-container"),n=document.getElementById("menu-filters-container");if(!t||!n)return;n.innerHTML="",t.innerHTML="";
const a=document.createElement("button");a.className="filter-btn active",a.setAttribute("data-filter","all"),a.textContent="de"===currentLang?"Alle":"en"===currentLang?"All":"الكل",a.addEventListener("click",()=>filterMenu("all")),n.appendChild(a),e.categories.forEach(e=>{const t=document.createElement("button");t.className="filter-btn",t.setAttribute("data-filter",e.id),t.textContent=e.name[currentLang]||e.name.de,t.addEventListener("click",()=>filterMenu(e.id)),n.appendChild(t)}),e.items.forEach(e=>{const n=document.createElement("div");n.className="menu-item reveal",n.setAttribute("data-category",e.categoryId),n.setAttribute("data-item-id",e.id);
const a=e.name[currentLang]||e.name.de,o=e.description[currentLang]||e.description.de;n.innerHTML=`\n      <div class="menu-item-img-container">\n        <img class="menu-item-img" src="${e.image}" alt="${a}" loading="lazy">\n      </div>\n      <div class="menu-item-content">\n        <div class="menu-item-header">\n          <h3 class="menu-item-title admin-editable-menu-title" data-item-id="${e.id}">${a}</h3>\n          <span class="menu-item-price admin-editable-menu-price" data-item-id="${e.id}">${e.price} €</span>\n        </div>\n        <p class="menu-item-desc admin-editable-menu-desc" data-item-id="${e.id}">${o}</p>\n        <div style="margin-top: auto;">\n          <a href="order.html" class="btn btn-secondary" style="padding: 10px 20px; width: 100%; text-align: center; font-size: 11px;">\n            ${"de"===currentLang?"JETZT BESTELLEN":"en"===currentLang?"ORDER NOW":"اطلب الآن"}\n          </a>\n        </div>\n      </div>\n    `,t.appendChild(n)}),setupScrollReveal(),
  applyPharaonicCardDecorations()}

function filterMenu(e){document.querySelectorAll(".filter-btn").forEach(t=>{t.getAttribute("data-filter")===e?t.classList.add("active"):t.classList.remove("active")}),document.querySelectorAll(".menu-item").forEach(t=>{const n=t.getAttribute("data-category");"all"===e||n===e?t.classList.remove("hide"):t.classList.add("hide")})}

function renderOrderPage(){const e=getConfig(),t=document.getElementById("order-page-container");t&&(t.innerHTML=`\n    \x3c!-- Uber Eats --\x3e\n    <div class="platform-card uber reveal">\n      <div class="platform-icon">\n        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h4v12H4V6zm6 0h4a4 4 0 0 1 0 8h-4v4h-4V6h8a4 4 0 0 1 4 4c0 2.2-1.8 4-4 4h-4" stroke="currentColor" stroke-width="2"></path></svg>\n      </div>\n      <h3 class="platform-title">Uber Eats</h3>\n      <p class="platform-desc lang-de">Lassen Sie sich Ihr Lieblingsgericht direkt nach Hause liefern.</p>\n      <p class="platform-desc lang-en">Get your favorite Egyptian meals delivered straight to your door.</p>\n      <p class="platform-desc lang-ar">احصل على وجباتك المفضلة وتوصيلها مباشرة إلى عتبة دارك.</p>\n      <a href="${e.deliveryLinks.uberEats}" target="_blank" rel="noopener" class="platform-btn">\n        <span class="lang-de">Jetzt bestellen</span>\n        <span class="lang-en">Order Now</span>\n        <span class="lang-ar">اطلب الآن</span>\n      </a>\n    </div>\n\n    \x3c!-- Wolt --\x3e\n    <div class="platform-card wolt reveal">\n      <div class="platform-icon">\n        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 9c3 8 5-2 9 6 4 8 6-16 9-2" stroke="#009de0" stroke-width="3" stroke-linecap="round"></path></svg>\n      </div>\n      <h3 class="platform-title">Wolt</h3>\n      <p class="platform-desc lang-de">Schnelle Lieferung aus unserer Küche zu Ihnen.</p>\n      <p class="platform-desc lang-en">Fast and fresh delivery from our kitchen to yours.</p>\n      <p class="platform-desc lang-ar">توصيل سريع وطازج من مطبخنا إليك مباشرة.</p>\n      <a href="${e.deliveryLinks.wolt}" target="_blank" rel="noopener" class="platform-btn">\n        <span class="lang-de">Jetzt bestellen</span>\n        <span class="lang-en">Order Now</span>\n        <span class="lang-ar">اطلب الآن</span>\n      </a>\n    </div>\n\n    \x3c!-- Lieferando --\x3e\n    <div class="platform-card lieferando reveal">\n      <div class="platform-icon">\n        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 10l8-6 8 6v8a2 2 0 0 1-2 2h-4v-6H10v6H6a2 2 0 0 1-2-2v-8z" fill="#ff8000"></path></svg>\n      </div>\n      <h3 class="platform-title">Lieferando</h3>\n      <p class="platform-desc lang-de">Bestellen Sie mit Ihrem vertrauten Lieferdienst.</p>\n      <p class="platform-desc lang-en">Order easily using Germany's biggest delivery network.</p>\n      <p class="platform-desc lang-ar">اطلب وجبتك بكل سهولة عبر شبكة ليفيراندو الألمانية.</p>\n      <a href="${e.deliveryLinks.lieferando}" target="_blank" rel="noopener" class="platform-btn">\n        <span class="lang-de">Jetzt bestellen</span>\n        <span class="lang-en">Order Now</span>\n        <span class="lang-ar">اطلب الآن</span>\n      </a>\n    </div>\n\n    \x3c!-- Direct WhatsApp Order --\x3e\n    <div class="platform-card whatsapp reveal">\n      <div class="platform-icon">\n        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.79 14.15c-.24.67-1.39 1.27-1.9 1.34-.46.06-.92.09-3.04-.79-2.7-1.12-4.43-3.87-4.57-4.05-.13-.18-1.09-1.45-1.09-2.76 0-1.31.68-1.96.93-2.22.25-.26.54-.33.72-.33.18 0 .36 0 .51.01.16.01.37-.06.58.45.22.53.76 1.85.82 1.98.07.13.11.29.02.46-.09.18-.14.29-.28.45-.14.16-.3.36-.43.48-.15.14-.3.29-.13.58.17.29.76 1.25 1.63 2.03.87.78 1.61 1.02 1.84 1.13.23.11.37.09.51-.07.14-.16.61-.71.77-.96.16-.25.32-.21.54-.13.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.58-.18 1.25z" fill="#25d366"></path></svg>\n      </div>\n      <h3 class="platform-title">WhatsApp</h3>\n      <p class="platform-desc lang-de">Bestellen Sie direkt per Chat oder fragen Sie nach Specials.</p>\n      <p class="platform-desc lang-en">Chat directly with us to order or ask about daily specials.</p>\n      <p class="platform-desc lang-ar">تحدث معنا مباشرة للطلب أو الاستفسار عن اليومية الخاصة.</p>\n      <a href="https://wa.me/${e.contact.whatsapp}" target="_blank" rel="noopener" class="platform-btn" style="background:#25d366; border-color:#25d366; color:#fff;">\n        <span class="lang-de">Chat starten</span>\n        <span class="lang-en">Start Chat</span>\n        <span class="lang-ar">ابدأ المحادثة</span>\n      </a>\n    </div>\n  `,setupScrollReveal(),
  applyPharaonicCardDecorations())}

function enableAdminMode(){const e=document.createElement("div");e.className="admin-badge",e.innerHTML='\n    <span>🛠️ Admin Mode Active</span>\n    <span class="admin-badge-logout" id="admin-logout-btn">Log Out</span>\n  ',document.body.appendChild(e),document.getElementById("admin-logout-btn").addEventListener("click",()=>{sessionStorage.removeItem("admin_token"),window.location.reload()}),document.querySelectorAll("[data-key]").forEach(e=>{e.classList.add("admin-editable-active"),e.addEventListener("dblclick",()=>{const t=e.getAttribute("data-key"),n=getConfig(),a=t.split(".");
let o=n;a.forEach(e=>{o=o[e]});
const i=prompt(`Edit content for key: ${t}\n(Language: ${currentLang.toUpperCase()})`,o);if(null!==i){let e=n;for(let t=0;t<a.length-1;t++)e=e[a[t]];e[a[a.length-1]]=i,saveConfig(n),loadDynamicContents()}})}),setTimeout(()=>{document.querySelectorAll(".admin-editable-menu-title").forEach(e=>{e.style.borderBottom="1px dashed #ffbf00",e.addEventListener("dblclick",t=>{t.stopPropagation(),editMenuItem(e.getAttribute("data-item-id"),"name")})}),document.querySelectorAll(".admin-editable-menu-price").forEach(e=>{e.style.borderBottom="1px dashed #ffbf00",e.addEventListener("dblclick",t=>{t.stopPropagation(),editMenuItem(e.getAttribute("data-item-id"),"price")})}),document.querySelectorAll(".admin-editable-menu-desc").forEach(e=>{e.style.borderBottom="1px dashed #ffbf00",e.addEventListener("dblclick",t=>{t.stopPropagation(),editMenuItem(e.getAttribute("data-item-id"),"description")})})},1e3)}

function editMenuItem(e,t){const n=getConfig(),a=n.items.findIndex(t=>t.id===e);if(-1===a)return;
const o=n.items[a];if("price"===t){const e=prompt(`Enter new price for ${o.name[currentLang]||o.name.de}:`,o.price);null!==e&&(n.items[a].price=e,saveConfig(n),renderMenuPage())}else{const e=o[t][currentLang]||o[t].de,i=prompt(`Edit ${t} (${currentLang.toUpperCase()}):`,e);null!==i&&(n.items[a][t][currentLang]=i,saveConfig(n),renderMenuPage())}}

function applyPharaonicCardDecorations(){document.querySelectorAll(".card, .glass-card, .platform-card, .menu-item").forEach(e=>{if(e.querySelector(".card-corner"))return;"static"===window.getComputedStyle(e).position&&(e.style.position="relative");
const t=document.createElement("div");t.className="card-corner card-corner-tl";
const n=document.createElement("div");n.className="card-corner card-corner-tr";
const a=document.createElement("div");a.className="card-corner card-corner-bl";
const o=document.createElement("div");o.className="card-corner card-corner-br",e.appendChild(t),e.appendChild(n),e.appendChild(a),e.appendChild(o)})}

function injectSideMonuments(){const e=document.createElement("div");e.className="monument-frame monument-left monument-abusimbel",document.body.appendChild(e);
const t=document.createElement("div");t.className="monument-frame monument-right monument-falcon",document.body.appendChild(t)}

function initLenisSmoothScroll(){if("undefined"==typeof Lenis)return;
const e=new Lenis({duration:1.2,easing:e=>Math.min(1,1.001-Math.pow(2,-10*e)),smooth:!0,smoothTouch:!1});window._lenisInstance=e,requestAnimationFrame(

function t(n){e.raf(n),requestAnimationFrame(t)}),document.querySelectorAll('a[href^="#"]').forEach(t=>{t.addEventListener("click",function(t){t.preventDefault();
const n=this.getAttribute("href");if("#"===n)return;
const a=document.querySelector(n);a&&e.scrollTo(a)})})}

function initGSAPAnimations(){if("undefined"==typeof gsap)return;document.querySelector(".hero-content")?gsap.timeline({defaults:{ease:"power3.out",duration:1.2}}).fromTo(".navbar",{y:-100,opacity:0},{y:0,opacity:.95,duration:.8}).fromTo(".hero-subtitle",{y:40,opacity:0},{y:0,opacity:1},"-=0.4").fromTo(".hero-title",{y:30,opacity:0},{y:0,opacity:1},"-=0.8").fromTo(".hero-desc",{y:20,opacity:0},{y:0,opacity:1},"-=0.8").fromTo(".btn-group",{y:15,opacity:0},{y:0,opacity:1},"-=0.8").fromTo(".hero-bg",{scale:1.12,opacity:0},{scale:1,opacity:.6,duration:1.8},"-=1.5"):gsap.fromTo(".navbar",{y:-100,opacity:0},{y:0,opacity:.95,duration:.8,ease:"power3.out"}),document.querySelector(".monument-frame")&&(gsap.fromTo(".monument-left",{x:-80,opacity:0},{x:0,opacity:.24,duration:1.5,delay:.6,ease:"power2.out"}),gsap.fromTo(".monument-right",{x:80,opacity:0},{x:0,opacity:.24,duration:1.5,delay:.6,ease:"power2.out"}));
const e=document.querySelectorAll(".grid-2, .grid-3, #menu-page-container, #order-page-container");if(e.length>0){const t=new IntersectionObserver(e=>{e.forEach(e=>{if(e.isIntersecting){const n=e.target.querySelectorAll(".card, .platform-card, .menu-item");n.length>0&&gsap.fromTo(n,{y:40,opacity:0},{y:0,opacity:1,duration:.8,stagger:.12,ease:"power2.out"}),t.unobserve(e.target)}})},{threshold:.1});e.forEach(e=>t.observe(e))}}

function initGoldenParticles(){if(window.innerWidth<768)return;
let e=document.getElementById("particle-canvas");e||(e=document.createElement("canvas"),e.id="particle-canvas",document.body.prepend(e));
const t=e.getContext("2d");
let n=e.width=window.innerWidth,a=e.height=window.innerHeight;window.addEventListener("resize",()=>{n=e.width=window.innerWidth,a=e.height=window.innerHeight});
const o=[];class i{constructor(){this.reset(),this.y=Math.random()*a}reset(){this.x=Math.random()*n,this.y=a+10,this.size=2*Math.random()+.8,this.speedY=.4*Math.random()+.2,this.speedX=.2*Math.random()-.1,this.opacity=.5*Math.random()+.1,this.fadeSpeed=.005*Math.random()+.002}update(){this.y-=this.speedY,this.x+=this.speedX,this.speedX+=.02*(Math.random()-.5),this.speedX=Math.max(-.25,Math.min(.25,this.speedX)),this.y<.25*a&&(this.opacity-=this.fadeSpeed),(this.y<-10||this.opacity<=0)&&this.reset()}draw(){t.beginPath(),t.fillStyle=`rgba(212, 175, 55, ${this.opacity})`,t.arc(this.x,this.y,this.size,0,2*Math.PI),t.fill()}}for(let e=0;e<45;e++)o.push(new i);!

function e(){t.clearRect(0,0,n,a),o.forEach(e=>{e.update(),e.draw()}),requestAnimationFrame(e)}()}

function initCustomCursor(){if(window.innerWidth<991)return;if(window.location.pathname.includes("admin.html"))return;
let e=document.querySelector(".custom-cursor-dot"),t=document.querySelector(".custom-cursor-ring");e||(e=document.createElement("div"),e.className="custom-cursor-dot",document.body.appendChild(e)),t||(t=document.createElement("div"),t.className="custom-cursor-ring",document.body.appendChild(t));
let n=0,a=0,o=0,i=0,r=!1;window.addEventListener("mousemove",o=>{n=o.clientX,a=o.clientY,r=!0,e.style.left=`${n}px`,e.style.top=`${a}px`,e.style.opacity=1,t.style.opacity=1}),

function e(){o+=.15*(n-o),i+=.15*(a-i),t.style.left=`${o}px`,t.style.top=`${i}px`,requestAnimationFrame(e)}();
const s="a, button, select, input, textarea, .filter-btn, .lang-btn, .theme-btn, .admin-editable-active, .card, .glass-card, .menu-item, .social-icon-btn, .platform-card";
document.addEventListener("mouseover",e=>{e.target.closest(s)&&document.body.classList.add("cursor-hovering")}),
document.addEventListener("mouseout",e=>{const t=e.relatedTarget;t&&t.closest(s)||document.body.classList.remove("cursor-hovering")}),
document.addEventListener("mouseleave",()=>{e.style.opacity=0,t.style.opacity=0}),
document.addEventListener("mouseenter",()=>{e.style.opacity=1,t.style.opacity=1})}let reviewsSwiperInstance=null;

function initReviewsSwiper(){if("undefined"==typeof Swiper)return;
const e=document.getElementById("reviews-carousel-swiper");if(!e)return;reviewsSwiperInstance&&reviewsSwiperInstance.destroy(!0,!0);
const t="ar"===currentLang?"rtl":"ltr";e.setAttribute("dir",t),reviewsSwiperInstance=new Swiper("#reviews-carousel-swiper",{slidesPerView:1,spaceBetween:24,loop:!0,autoplay:{delay:5e3,disableOnInteraction:!1},pagination:{el:".swiper-pagination",clickable:!0}})}

function initChefScrollTracker(){if(window.innerWidth<1100)return;
const e=document.getElementById("chef-avatar-wrapper"),t=document.getElementById("chef-speech-bubble"),n=document.getElementById("chef-section-dots");if(!e)return;
const a=[{id:"#hero-home",labelDe:"Start",labelEn:"Home",labelAr:"البداية"},{id:"#about-story",labelDe:"Geschichte",labelEn:"Story",labelAr:"قصتنا"},{id:"#highlights",labelDe:"Erlebnis",labelEn:"Experience",labelAr:"تجربة"},{id:"#menu-section",labelDe:"Menü",labelEn:"Menu",labelAr:"المنيو"},{id:"#reservation-section",labelDe:"Reservierung",labelEn:"Reservation",labelAr:"حجز"},{id:"#order-section",labelDe:"Bestellen",labelEn:"Order",labelAr:"اطلب"},{id:"#reviews-and-maps",labelDe:"Bewertungen",labelEn:"Reviews",labelAr:"تقييمات"},{id:"#contact-section",labelDe:"Kontakt",labelEn:"Contact",labelAr:"اتصل"}];n&&(n.innerHTML="",a.forEach((e,t)=>{const a=document.createElement("div");a.className="chef-dot",a.setAttribute("data-section",e.id),a.setAttribute("data-index",t);
const o=document.createElement("span");o.className="chef-dot-label";
const i=currentLang||"de";o.textContent="de"===i?e.labelDe:"en"===i?e.labelEn:e.labelAr,a.appendChild(o),a.addEventListener("click",()=>{const t=document.querySelector(e.id);t&&("undefined"!=typeof Lenis&&window._lenisInstance?window._lenisInstance.scrollTo(t):t.scrollIntoView({behavior:"smooth"}))}),n.appendChild(a)})),e&&t&&(e.addEventListener("mouseenter",()=>t.classList.add("visible")),e.addEventListener("mouseleave",()=>t.classList.remove("visible"))),e.addEventListener("click",()=>{e.classList.add("spinning"),setTimeout(()=>e.classList.remove("spinning"),700),"undefined"!=typeof Lenis&&window._lenisInstance?window._lenisInstance.scrollTo(0):window.scrollTo({top:0,behavior:"smooth"})});
let o=0,i=0;

function r(){const r=window.scrollY,s=document.documentElement.scrollHeight-window.innerHeight,l=100+(s>0?Math.min(r/s,1):0)*(window.innerHeight-100-80-72);e.style.top=l+"px",t&&(t.style.top=l+20+"px");
const c=Math.abs(r-o);i=Math.min(.8*c,18);
const d=r>o?1:-1,m=document.getElementById("chef-avatar");if(m&&(m.style.transform=`rotate(${i*d}deg)`,setTimeout(()=>{m&&(m.style.transform="rotate(0deg)")},150)),o=r,n){let e=0;a.forEach((t,n)=>{const a=document.querySelector(t.id);a&&a.getBoundingClientRect().top<=140&&(e=n)}),n.querySelectorAll(".chef-dot").forEach((t,n)=>{t.classList.toggle("active",n===e)})}}window.addEventListener("scroll",r,{passive:!0}),r()}

function setupMobileMenu() {
  const toggle = document.getElementById("mobile-toggle");
  const menu = document.getElementById("nav-menu-list");
  if (!toggle || !menu) return;

  let backdrop = document.getElementById("mobile-nav-backdrop");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.id = "mobile-nav-backdrop";
    backdrop.className = "nav-backdrop";
    document.body.appendChild(backdrop);
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes" && mutation.attributeName === "class") {
        if (menu.classList.contains("show")) {
          backdrop.classList.add("show");
          document.body.style.overflow = "hidden";
        } else {
          backdrop.classList.remove("show");
          document.body.style.overflow = "";
        }
      }
    });
  });
  observer.observe(menu, { attributes: true });

  backdrop.addEventListener("click", () => {
    menu.classList.remove("show");
    toggle.classList.remove("active");
  });

  document.addEventListener("click", (e) => {
    if (menu.classList.contains("show")) {
      if (!menu.contains(e.target) && !toggle.contains(e.target) && !backdrop.contains(e.target)) {
        menu.classList.remove("show");
        toggle.classList.remove("active");
      }
    }
  });
}