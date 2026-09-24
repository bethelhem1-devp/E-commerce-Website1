// ============================================
// CONFIG — edit these for the real store
// ============================================
const SHOP_WHATSAPP_NUMBER = "251900000000"; // country code + number, no + or spaces
const SHOP_TELEGRAM_USERNAME = "kebirmenswear"; // without @

// ============================================
// STATE
// ============================================
let cart = JSON.parse(localStorage.getItem("kebir_cart") || "[]");
let activeFilter = "All";

// ============================================
// SPLASH SCREEN
// ============================================
// Splash screen — no need to wait for "load" since script.js
// uses defer, so this already runs after the HTML is parsed.
const splash = document.getElementById("splash");
setTimeout(() => {
  splash.classList.add("splash-hide");
}, 1500);

// Hero video — starts loading shortly after page render
const video = document.getElementById("heroVideo");

setTimeout(() => {
  video.innerHTML = `<source src="assets/vid-2-cmp.mp4" type="video/mp4">`;
  video.load();

  video.play().catch((err) => {
    console.log("Video play failed:", err);
  });
}, 800);


//back to top btn
const backToTop = document.getElementById("backToTop");
window.addEventListener("scroll", () => {
  backToTop.classList.toggle("visible", window.scrollY > 600);
});
backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
// ============================================
// ELEMENTS
// ============================================
const productGrid = document.getElementById("productGrid");
const filterBar = document.getElementById("filterBar");
const cartBadge = document.getElementById("cartBadge");
const cartItemsEl = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartToggle = document.getElementById("cartToggle");
const cartClose = document.getElementById("cartClose");

const navToggle = document.getElementById("navToggle");
const navDrawer = document.getElementById("navDrawer");
const navOverlay = document.getElementById("navOverlay");
const navDrawerClose = document.getElementById("navDrawerClose");

// ============================================
// MOBILE NAV DRAWER
// ============================================
function openNav() { navDrawer.classList.add("open"); navOverlay.classList.add("open"); }
function closeNav() { navDrawer.classList.remove("open"); navOverlay.classList.remove("open"); }
navToggle.addEventListener("click", openNav);
navDrawerClose.addEventListener("click", closeNav);
navOverlay.addEventListener("click", closeNav);
navDrawer.querySelectorAll("a").forEach(a => a.addEventListener("click", closeNav));

// ============================================
// RENDER PRODUCTS
// ============================================
function renderProducts() {
  const list = activeFilter === "All" ? PRODUCTS : PRODUCTS.filter(p => p.category === activeFilter);

  productGrid.innerHTML = list.map(p => `
    <div class="product-card reveal">
      <div class="product-media">
        <img src="${p.image}" alt="${p.name}">
        <span class="swing-tag">${p.styleNo}</span>
      </div>
      <div class="product-info">
        <div>
          <p class="product-name">${p.name}</p>
          <p class="product-meta">${p.color} · Size ${p.size}</p>
        </div>
        <p class="product-price">${p.price} ETB</p>
      </div>
      <button class="add-to-cart" data-id="${p.id}">Add to Cart</button>
    </div>
  `).join("");

  document.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.addEventListener("click", () => addToCart(Number(btn.dataset.id), btn));
  });

  observeReveals();
}

filterBar.addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;
  activeFilter = btn.dataset.filter;
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderProducts();
});

// ============================================
// CART LOGIC
// ============================================
function saveCart() { localStorage.setItem("kebir_cart", JSON.stringify(cart)); }

function addToCart(id, btnEl) {
  const product = PRODUCTS.find(p => p.id === id);
  const existing = cart.find(item => item.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ ...product, qty: 1 });

  saveCart();
  renderCart();

  if (btnEl) {
    btnEl.textContent = "Added ✓";
    btnEl.classList.add("added");
    setTimeout(() => { btnEl.textContent = "Add to Cart"; btnEl.classList.remove("added"); }, 1200);
  }
}

function updateQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

function cartTotal() {
  return cart.reduce((sum, item) => sum + item.qty * item.price, 0);
}

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  cartBadge.textContent = count;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<p class="cart-empty">Your cart is empty.<br>Add a piece to get started.</p>`;
  } else {
    cartItemsEl.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div>
          <p class="cart-item-name">${item.name}</p>
          <p class="cart-item-meta">${item.color} · Size ${item.size}</p>
          <div class="qty-control">
            <button data-action="dec" data-id="${item.id}">−</button>
            <span>${item.qty}</span>
            <button data-action="inc" data-id="${item.id}">+</button>
          </div>
          <p class="cart-item-remove" data-remove="${item.id}">Remove</p>
        </div>
        <p class="cart-item-price">${item.qty * item.price} ETB</p>
      </div>
    `).join("");
  }

  cartTotalEl.textContent = `${cartTotal()} ETB`;

  cartItemsEl.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", () => updateQty(Number(btn.dataset.id), btn.dataset.action === "inc" ? 1 : -1));
  });
  cartItemsEl.querySelectorAll("[data-remove]").forEach(el => {
    el.addEventListener("click", () => removeFromCart(Number(el.dataset.remove)));
  });
}

// ============================================
// CART DRAWER OPEN/CLOSE
// ============================================
function openCart() { cartDrawer.classList.add("open"); cartOverlay.classList.add("open"); }
function closeCart() { cartDrawer.classList.remove("open"); cartOverlay.classList.remove("open"); }
cartToggle.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

// ============================================
// CHECKOUT MESSAGE BUILDER
// ============================================
function buildOrderMessage() {
  let message = "🛍️ New Order - Kebir Men's Wear%0A%0A";
  cart.forEach((item, index) => {
    message += `${index + 1}. ${item.name}%0A`;
    message += `   ${item.color} · Size ${item.size}%0A`;
    message += `   Qty: ${item.qty} x ${item.price} ETB = ${item.qty * item.price} ETB%0A%0A`;
  });
  message += `*Total: ${cartTotal()} ETB*%0A%0A`;
  message += "Name: %0APhone: %0ADelivery Address: ";
  return message;
}

document.getElementById("checkoutWhatsapp").addEventListener("click", () => {
  if (cart.length === 0) return;
  window.open(`https://wa.me/${SHOP_WHATSAPP_NUMBER}?text=${buildOrderMessage()}`, "_blank");
});

document.getElementById("checkoutTelegram").addEventListener("click", () => {
  if (cart.length === 0) return;
  // Telegram can't pre-fill a direct contact chat, so we use the share dialog instead.
  window.open(`https://t.me/share/url?url=&text=${buildOrderMessage()}`, "_blank");
});

// ============================================
// SCROLL REVEAL ANIMATION
// ============================================
function observeReveals() {
  const items = document.querySelectorAll(".reveal:not(.in-view)");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(item => observer.observe(item));
}

// ============================================
// INIT
// ============================================
renderProducts();
renderCart();
observeReveals();
