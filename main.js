/* main.js
   Renders 12 demo products, implements:
   - Always 3-in-row grid
   - Wishlist toggle (client-side)
   - Quick View modal (image, title, price, description, add-to-cart)
   - Sort by price (low-high, high-low)
   - Price + cart icon button
   - Toasts for actions
*/

const PRODUCTS = [
  { id: 'p1', title: 'Mysore Pak', price: 120, img: 'https://images.unsplash.com/photo-1604908177522-8a0a3c6f2b2b?q=80&w=800&auto=format&fit=crop', desc: 'Buttery, crumbly Mysore Pak — classic south Indian sweet.' },
  { id: 'p2', title: 'Rasgulla (6pcs)', price: 220, img: 'https://images.unsplash.com/photo-1612197522778-3c52f8b5f3c1?q=80&w=800&auto=format&fit=crop', desc: 'Soft, syrupy spongy rasgullas in light sugar syrup.' },
  { id: 'p3', title: 'Kaju Katli Box', price: 450, img: 'https://images.unsplash.com/photo-1585238342028-7d9a4c7a1f0d?q=80&w=800&auto=format&fit=crop', desc: 'Premium cashew fudge with silvered finish.' },
  { id: 'p4', title: 'Kanjivaram Silk - Red', price: 9500, img: 'https://images.unsplash.com/photo-1503342452485-86f7b7aa6b0d?q=80&w=800&auto=format&fit=crop', desc: 'Handwoven Kanjivaram silk for festive occasions.' },
  { id: 'p5', title: 'Chiffon Printed - Teal', price: 2499, img: 'https://images.unsplash.com/photo-1521120098171-3b2c3b6862d7?q=80&w=800&auto=format&fit=crop', desc: 'Lightweight chiffon saree with modern prints.' },
  { id: 'p6', title: 'Banarasi - Gold', price: 18800, img: 'https://images.unsplash.com/photo-1520975919795-4f9ad2d6f3f1?q=80&w=800&auto=format&fit=crop', desc: 'Classic Banarasi brocade with gold zari.' },
  { id: 'p7', title: 'Laddu — Premium', price: 180, img: 'https://i.ibb.co/zNQhZVt/laddu.jpg', desc: 'Soft, melt-in-mouth laddus made traditionally.' },
  { id: 'p8', title: 'Jalebi Crispy', price: 95, img: 'https://i.ibb.co/gFg1t0d/jalebi.jpg', desc: 'Crispy hot jalebis — best with Rabri.' },
  { id: 'p9', title: 'Gulab Jamun (4pcs)', price: 150, img: 'https://i.ibb.co/W3Jstqk/gulab-jamun.jpg', desc: 'Classic gulab jamun soaked in aromatic syrup.' },
  { id: 'p10', title: 'Soan Papdi', price: 110, img: 'https://i.ibb.co/mXh6Ck7/soan-papdi.jpg', desc: 'Flaky, melt-in-mouth soan papdi pieces.' },
  { id: 'p11', title: 'Red Silk Saree', price: 8200, img: 'https://i.ibb.co/NF3tYmt/saree-red.jpg', desc: 'Rich red silk saree with subtle motifs.' },
  { id: 'p12', title: 'Pink Kanjivaram', price: 12999, img: 'https://i.ibb.co/jTfyyYx/saree-pink.jpg', desc: 'Elegant pink Kanjivaram, luxury finish.' }
];

const productGrid = document.getElementById('productGrid');
const sortSelect = document.getElementById('sortSelect');
const quickViewModal = document.getElementById('quickViewModal');
const qvImg = document.getElementById('qv-img');
const qvTitle = document.getElementById('qv-title');
const qvPrice = document.getElementById('qv-price');
const qvDesc = document.getElementById('qv-desc');
const qvAdd = document.getElementById('qv-add');
const qvClose = document.getElementById('qv-close');
const qvPriceBtn = document.getElementById('qv-price-btn');
const qvWishlist = document.getElementById('qv-wishlist');

let currentProducts = [...PRODUCTS];
let wishlist = new Set();

// utility: format price
function fmt(n){
  return '₹' + Number(n).toLocaleString('en-IN');
}

/* Render product cards (3-per-row forced by CSS grid) */
function renderProducts(list){
  productGrid.innerHTML = '';
  list.forEach(p => {
    const cardWrap = document.createElement('article');
    cardWrap.className = 'card relative';

    // wishlist overlay (top-right)
    const wishlistBtn = document.createElement('button');
    wishlistBtn.className = 'wishlist';
    wishlistBtn.setAttribute('aria-label','wishlist');
    wishlistBtn.innerHTML = `<i class="fa fa-heart ${wishlist.has(p.id) ? 'text-red-600' : 'text-gray-300'}"></i>`;
    wishlistBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleWishlist(p.id, wishlistBtn);
    });

    // card inner HTML
    cardWrap.innerHTML = `
      <div class="thumb">
        <img src="${p.img}" alt="${escapeHtml(p.title)}" loading="lazy"/>
      </div>
      <div class="meta">
        <div class="name" title="${escapeHtml(p.title)}">${escapeHtml(p.title)}</div>
        <button class="price-cart" data-id="${p.id}">
          <span class="price">${fmt(p.price)}</span>
          <i class="fa fa-shopping-cart"></i>
        </button>
      </div>
    `;

    // click on card opens quick-view (except when clicking wishlist or price-cart)
    cardWrap.addEventListener('click', (e) => {
      // if clicked price-cart or wishlist skip
      if (e.target.closest('.price-cart') || e.target.closest('.wishlist')) return;
      openQuickView(p);
    });

    // price-cart click
    cardWrap.querySelector('.price-cart').addEventListener('click', (e) => {
      e.stopPropagation();
      addToCart(p);
    });

    // append wishlist overlay
    cardWrap.appendChild(wishlistBtn);

    productGrid.appendChild(cardWrap);
  });
}

/* Toggle wishlist state (client-side) */
function toggleWishlist(id, btnEl){
  if (wishlist.has(id)){
    wishlist.delete(id);
    btnEl.classList.remove('active');
    btnEl.innerHTML = `<i class="fa fa-heart text-gray-300"></i>`;
    showToast('Removed from wishlist');
  } else {
    wishlist.add(id);
    btnEl.classList.add('active');
    btnEl.innerHTML = `<i class="fa fa-heart text-red-600"></i>`;
    showToast('Added to wishlist');
  }
}

/* Quick view modal */
let activeProduct = null;
function openQuickView(p){
  activeProduct = p;
  qvImg.src = p.img;
  qvTitle.textContent = p.title;
  qvPrice.textContent = fmt(p.price);
  qvDesc.textContent = p.desc;
  qvPriceBtn.textContent = fmt(p.price);
  qvAdd.onclick = () => { addToCart(p); };
  qvWishlist.onclick = () => { toggleWishlist(p.id, qvWishlist); }; // qvWishlist will be replaced with icon first time - keep simple
  quickViewModal.classList.remove('hidden');
  quickViewModal.style.display = 'flex';
  quickViewModal.setAttribute('aria-hidden', 'false');
}
function closeQuickView(){
  quickViewModal.classList.add('hidden');
  quickViewModal.style.display = 'none';
  quickViewModal.setAttribute('aria-hidden', 'true');
}

/* Add to cart (demo): show toast */
function addToCart(p){
  showToast(`${p.title} added to cart`);
  // placeholder: increment cart count or persist
}

/* small toast helper */
function showToast(msg){
  const t = document.createElement('div');
  t.className = 'fixed right-6 bottom-6 bg-black/80 text-white px-4 py-2 rounded-md shadow z-60';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(()=> t.remove(), 2000);
}

/* Sort handling */
sortSelect.addEventListener('change', (e) => {
  const v = e.target.value;
  if (v === 'low-high') currentProducts.sort((a,b)=>a.price - b.price);
  else if (v === 'high-low') currentProducts.sort((a,b)=>b.price - a.price);
  else currentProducts = [...PRODUCTS];
  renderProducts(currentProducts);
});

/* quick-view modal close */
qvClose.addEventListener('click', closeQuickView);
quickViewModal.addEventListener('click', (e) => {
  if (e.target === quickViewModal) closeQuickView();
});

/* escape HTML helper to guard title attributes */
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]); });
}

/* initial render */
currentProducts = [...PRODUCTS];
renderProducts(currentProducts);

/* Optional: keyboard shortcut for demo */
document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'q' && currentProducts.length) openQuickView(currentProducts[0]);
});
