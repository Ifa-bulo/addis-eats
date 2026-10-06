const KEYS =  {
  menu: "addiseats_menu",
  cart: "addiseats_cart",
  orders: "addiseats_orders",
  favorites: "addiseats_favorites",
  theme: "addiseats_theme"
}
;
const DELIVERY_FEES =  {
  bole: 50, kazanchis: 60, piassa: 70, mexico: 60, sarbet: 70, yeka: 90, other: 100
}
;
const DELIVERY_TIMES =  {
  bole: "25–35 minutes", kazanchis: "30–40 minutes", piassa: "35–45 minutes", mexico: "30–40 minutes", sarbet: "35–45 minutes", yeka: "40–50 minutes", other: "45–60 minutes"
}
;
const money = value => `${Number(value || 0).toLocaleString("en-US")} ETB`;
const load = (key, fallback = []) =>  {
  try  {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch  {
    return fallback;
  }
}
;
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
let menu = [];
let cart = load(KEYS.cart, []);
let favorites = load(KEYS.favorites, []);
let category = "all";
let activeOrderId = null;
let trackingTimer = null;
async function loadMenu()  {
  const status = document.querySelector("#menuStatus");
  status.textContent = "Loading menu...";
  const savedMenu = load(KEYS.menu, null);
  if (Array.isArray(savedMenu) && savedMenu.length)  {
    menu = savedMenu;
    status.textContent = "";
  } else  {
    try  {
      const response = await fetch("data/menu.json",  {
        cache: "no-store"
      }
      );
      if (!response.ok) throw new Error(`Menu request failed: ${response.status}`);
      menu = (await response.json()).map(d => ( {
        ...d, enabled: d.enabled !== false
      }
      ));
      save(KEYS.menu, menu);
      status.textContent = "";
    } catch (error)  {
      status.innerHTML = `Unable to load the menu. <button class="retry-btn" type="button" onclick="loadMenu()">Try again</button>`;
      return;
    }
  }
  renderMenu();
  renderCart();
}
function filteredMenu()  {
  const query = document.querySelector("#searchInput").value.trim().toLowerCase();
  return menu.filter(dish =>  {
    if (dish.enabled === false) return false;
    const matchesCategory = category === "all" || dish.category === category;
    const searchable = `${dish.name} ${dish.description} ${(dish.ingredients || []).join(" ")}`.toLowerCase();
    return matchesCategory && searchable.includes(query);
  }
  );
}
function renderMenu()  {
  const list = filteredMenu();
  renderRecommendations();
  const grid = document.querySelector("#menuGrid");
  const status = document.querySelector("#menuStatus");
  document.querySelector("#menuCount").textContent = `${list.length} dish${list.length === 1 ? "" : "es"}`;
  status.textContent = "";
  if (!list.length)  {
    grid.innerHTML = `<div class="empty-menu"><strong>No dishes found.</strong><span>Try another search or category.</span></div>`;
    return;
  }
  grid.innerHTML = list.map(dish =>  {
    const favorite = favorites.includes(dish.id);
    return `<article class="food-card">
      <div class="food-image"><img src="${dish.image}" alt="${escapeHtml(dish.name)}" loading="lazy" onerror="this.style.display='none';this.parentElement.classList.add('image-fallback');this.parentElement.setAttribute('aria-label','Image placeholder for ${escapeHtml(dish.name)}')"><span>YOUR IMAGE</span></div>
      <div class="food-info">
        <div class="food-meta"><h3>${escapeHtml(dish.name)}</h3><button class="heart-btn ${favorite ? "saved" : ""}" type="button" aria-label="${favorite ? "Remove" : "Add"} ${escapeHtml(dish.name)} ${favorite ? "from" : "to"} favorites" onclick="toggleFavorite(${dish.id})">♡</button></div>
        <p>${escapeHtml(dish.description)}</p>
        <div class="card-bottom"><strong class="price">${money(dish.price)}</strong><div class="card-actions"><button class="detail-btn" type="button" onclick="showDetail(${dish.id})">Details</button><button class="add-btn" type="button" onclick="addToCart(${dish.id})">Add</button></div></div>
      </div>
    </article>`;
  }
  ).join("");
}
function renderCart()  {
  const box = document.querySelector("#cartItems");
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + ((menu.find(d => d.id === item.id)?.price || 0) * item.qty), 0);
  const area = document.querySelector("#deliveryArea").value;
  const fee = cart.length && area ? DELIVERY_FEES[area] : 0;
  const total = subtotal + fee;
  document.querySelector("#cartBadge").textContent = itemCount;
  document.querySelector("#cartItemCount").textContent = itemCount;
  document.querySelector("#cartSubtotal").textContent = money(subtotal);
  document.querySelector("#deliveryFee").textContent = fee ? money(fee) : "0 ETB";
  document.querySelector("#cartTotal").textContent = money(total);
  document.querySelector("#checkoutTotal").textContent = money(total);
  document.querySelector("#checkoutOpen").disabled = !cart.length;
  document.querySelector("#checkoutHint").textContent = cart.length ? "Ready when you are." : "Add a dish to enable checkout.";
  const message = document.querySelector("#deliveryMessage");
  message.textContent = area ? `${money(fee)} delivery • ${DELIVERY_TIMES[area]}` : "Choose an area to calculate delivery.";
  if (!cart.length)  {
    box.innerHTML = `<div class="empty-cart"><span class="empty-icon">🛒</span><strong>Your cart is empty</strong><span>Add something delicious from the menu.</span></div>`;
    return;
  }
  box.innerHTML = cart.map(item =>  {
    const dish = menu.find(d => d.id === item.id);
    if (!dish) return "";
    return `<div class="cart-row">
      <div class="cart-row-main"><div class="mini-image"><img src="${dish.image}" alt="" onerror="this.style.display='none'"></div><div><h3>${escapeHtml(dish.name)}</h3><small>${money(dish.price)}</small></div></div>
      <div class="cart-row-bottom"><div class="qty" aria-label="Quantity for ${escapeHtml(dish.name)}"><button type="button" onclick="changeQty(${dish.id},-1)" aria-label="Decrease quantity">−</button><span>${item.qty}</span><button type="button" onclick="changeQty(${dish.id},1)" aria-label="Increase quantity">+</button></div><button class="remove-btn" type="button" onclick="removeFromCart(${dish.id})">Remove</button><strong>${money(dish.price * item.qty)}</strong></div>
    </div>`;
  }
  ).join("");
}
function renderRecommendations()  {
  const section = document.querySelector("#recommendationSection");
  const grid = document.querySelector("#recommendationGrid");
  if (!section || !menu.length) return;
  const cartIds = new Set(cart.map(x => x.id));
  const favoriteIds = new Set(favorites);
  const preferredCategories = [
  ...cart.map(x => menu.find(d => d.id === x.id)?.category),
  ...favorites.map(id => menu.find(d => d.id === id)?.category)
  ].filter(Boolean);
  const preferred = preferredCategories[0];
  let candidates = menu.filter(d => d.enabled !== false && !cartIds.has(d.id));
  if (preferred) candidates.sort((a, b) => Number(b.category === preferred) - Number(a.category === preferred));
  candidates = candidates.slice(0, 3);
  if (!candidates.length)  {
    section.classList.add("hidden");
    return;
  }
  section.classList.remove("hidden");
  grid.innerHTML = candidates.map(d => `<article class="recommend-card"><div class="recommend-image"><img src="${d.image}" alt="${escapeHtml(d.name)}" loading="lazy" onerror="this.style.display='none'"></div><div><strong>${escapeHtml(d.name)}</strong><span>${money(d.price)}</span><button type="button" onclick="addToCart(${d.id})">Quick add</button></div></article>`).join("");
}
function surpriseMe()  {
  if (!menu.length) return;
  const available = menu.filter(d => !cart.some(x => x.id === d.id));
  const dish = (available.length ? available : menu)[Math.floor(Math.random() * (available.length ? available.length : menu.length))];
  showDetail(dish.id);
}
function addToCart(id)  {
  const dish = menu.find(x => x.id === id);
  if (!dish || dish.enabled === false) return;
  const item = cart.find(x => x.id === id);
  item ? item.qty++ : cart.push( {
    id, qty: 1
  }
  );
  save(KEYS.cart, cart);
  renderCart();
  renderRecommendations();
}
function changeQty(id, delta)  {
  const item = cart.find(x => x.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(x => x.id !== id);
  save(KEYS.cart, cart);
  renderCart();
  renderRecommendations();
}
function removeFromCart(id)  {
  cart = cart.filter(x => x.id !== id);
  save(KEYS.cart, cart);
  renderCart();
  renderRecommendations();
}
function clearCart()  {
  cart = [];
  save(KEYS.cart, cart);
  renderCart();
  renderRecommendations();
}
function toggleFavorite(id)  {
  favorites = favorites.includes(id) ? favorites.filter(x => x !== id) : [...favorites, id];
  save(KEYS.favorites, favorites);
  renderMenu();
  renderRecommendations();
  renderFavorites();
}
function renderFavorites()  {
  const badge = document.querySelector("#favoritesBadge");
  if (badge) badge.textContent = favorites.length;
  const box = document.querySelector("#favoritesContent");
  if (!box) return;
  const saved = menu.filter(d => d.enabled !== false && favorites.includes(d.id));
  box.innerHTML = saved.length ? saved.map(d => `<article class="favorite-row"><div class="favorite-thumb"><img src="${d.image}" alt="${escapeHtml(d.name)}" onerror="this.style.display='none'"></div><div class="favorite-info"><strong>${escapeHtml(d.name)}</strong><span>${money(d.price)}</span><small>${escapeHtml(d.description)}</small></div><div class="favorite-actions"><button class="detail-btn" type="button" onclick="showDetail(${d.id})">Details</button><button class="add-btn" type="button" onclick="addToCart(${d.id})">Add</button><button class="remove-btn" type="button" onclick="toggleFavorite(${d.id});renderFavorites()">Remove</button></div></article>`).join("") : `<div class="empty-cart"><span class="empty-icon">♡</span><strong>No favorites yet</strong><span>Tap the heart on a dish to save it here.</span></div>`;
}
function showDetail(id)  {
  const dish = menu.find(x => x.id === id);
  if (!dish) return;
  document.querySelector("#detailContent").innerHTML = `<div class="detail-image"><img src="${dish.image}" alt="${escapeHtml(dish.name)}" onerror="this.style.display='none'"></div><p class="eyebrow">${dish.category.toUpperCase()}</p><h2>${escapeHtml(dish.name)}</h2><p class="detail-description">${escapeHtml(dish.description)}</p><h3>Ingredients</h3><ul class="ingredients">${(dish.ingredients || []).map(i => `<li>$ {
    escapeHtml(i)
  }
  </li>`).join("")}</ul><div class="detail-footer"><strong>${money(dish.price)}</strong><button class="primary-btn" type="button" onclick="addToCart(${dish.id});document.querySelector('#detailDialog').close()">Add to cart</button></div>`;
  document.querySelector("#detailDialog").showModal();
}
function renderHistory()  {
  const orders = load(KEYS.orders, []);
  const box = document.querySelector("#historyContent");
  if (!orders.length)  {
    box.innerHTML = `<div class="empty-cart"><strong>No past orders</strong><span>Your completed orders will appear here.</span></div>`;
    return;
  }
  box.innerHTML = orders.map(order =>  {
    const current = ["pending", "preparing", "delivering", "delivered"].indexOf(order.status);
    const steps = ["Order received", "Preparing", "On the way", "Delivered"];
    return `<article class="history-card"><div class="history-main"><div><strong>${escapeHtml(order.id)}</strong><small>${new Date(order.createdAt).toLocaleString()}</small><span>${escapeHtml(order.customer?.area || "")}</span></div><strong>${money(order.total)}</strong></div><div class="order-tracker" aria-label="Order status: ${escapeHtml(order.status)}">${steps.map((step, i) => `<div class="track-step ${i <= current ? "done" : ""} ${i === current ? "current" : ""}"><span>$ {
      i < current ? "✓" : i + 1
    }
    </span><small>$ {
      step
    }
    </small></div>`).join("")}</div><div class="history-actions"><span class="status-pill">${escapeHtml(order.status)}</span><div><button class="detail-btn" type="button" onclick="trackOrder('${order.id}')">Track</button> <button class="detail-btn" type="button" onclick="reorder('${order.id}')">Reorder</button></div></div></article>`;
  }
  ).join("");
}
function getStatusLabel(status)  {
  return ( {
    pending: "Order received", preparing: "Preparing your food", delivering: "Rider is on the way", delivered: "Delivered"
  }
  )[status] || "Order received";
}
function getStatusIndex(status)  {
  return ["pending", "preparing", "delivering", "delivered"].indexOf(status);
}
function trackOrder(orderId)  {
  activeOrderId = orderId;
  renderTracking();
  document.querySelector("#trackingDialog").showModal();
  clearInterval(trackingTimer);
  trackingTimer = setInterval(renderTracking, 2500);
}
function renderTracking()  {
  if (!activeOrderId) return;
  const order = load(KEYS.orders, []).find(x => x.id === activeOrderId);
  if (!order) return;
  const current = getStatusIndex(order.status);
  const steps = ["Order received", "Preparing", "On the way", "Delivered"];
  const statusMessage =  {
    pending: "We have received your order and are sending it to the kitchen.", preparing: "The kitchen is preparing your food fresh for you.", delivering: "Your food is ready. Our rider is bringing it to you.", delivered: "Your order has arrived. Enjoy your meal!"
  }
  [order.status];
  document.querySelector("#trackingContent").innerHTML = `<div class="tracking-head"><div><div class="tracking-id">${escapeHtml(order.id)}</div><div class="tracking-meta">Placed ${new Date(order.createdAt).toLocaleString()}</div></div><span class="status-pill">${escapeHtml(order.status)}</span></div><div class="tracking-eta"><span>Estimated arrival</span><strong>${escapeHtml(order.eta || "35–50 minutes")}</strong></div><div class="tracking-steps">${steps.map((step, i) => `<div class="tracking-step ${i <= current ? "done" : ""} ${i === current ? "current" : ""}"><div class="dot">$ {
    i < current ? "✓" : i + 1
  }
  </div><small>$ {
    step
  }
  </small></div>`).join("")}</div><div class="tracking-note"><strong>${getStatusLabel(order.status)}</strong><br>${statusMessage}</div><div class="tracking-details"><div class="tracking-detail"><span>Delivery area</span><strong>${escapeHtml(order.customer?.area || "")}</strong></div><div class="tracking-detail"><span>Total</span><strong>${money(order.total)}</strong></div><div class="tracking-detail"><span>Customer</span><strong>${escapeHtml(order.customer?.name || "")}</strong></div><div class="tracking-detail"><span>Phone</span><strong>${escapeHtml(order.customer?.phone || "")}</strong></div></div>`;
}
function closeTracking()  {
  clearInterval(trackingTimer);
  document.querySelector("#trackingDialog").close();
}
function reorder(orderId)  {
  const order = load(KEYS.orders, []).find(x => x.id === orderId);
  if (!order) return;
  order.items.forEach(savedItem =>  {
    const item = cart.find(x => x.id === savedItem.id);
    item ? item.qty += savedItem.qty : cart.push( {
      id: savedItem.id, qty: savedItem.qty
    }
    );
  }
  );
  save(KEYS.cart, cart);
  renderCart();
  document.querySelector("#historyDialog").close();
  document.querySelector("#menu").scrollIntoView( {
    behavior: "smooth"
  }
  );
}
function updateEta()  {
  const area = document.querySelector("#checkoutArea").value || document.querySelector("#deliveryArea").value;
  document.querySelector("#checkoutEta").textContent = DELIVERY_TIMES[area] || "35–50 minutes";
}
function escapeHtml(value)  {
  return String(value ?? "").replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c])); }

function setupEvents() {
  document.querySelector("#searchInput").addEventListener("input", renderMenu);
  document.querySelectorAll(".filter").forEach(button => button.addEventListener("click", () => { document.querySelectorAll(".filter").forEach(b => b.classList.remove("active")); button.classList.add("active"); category = button.dataset.category; renderMenu(); }));
  document.querySelector("#clearCart").addEventListener("click", clearCart);
  document.querySelector("#deliveryArea").addEventListener("change", () => { document.querySelector("#checkoutArea").value = document.querySelector("#deliveryArea").value; updateEta(); renderCart(); });
  document.querySelector("#checkoutOpen").addEventListener("click", () => { if (!cart.length) return; document.querySelector("#checkoutArea").value = document.querySelector("#deliveryArea").value; updateEta(); document.querySelector("#checkoutDialog").showModal(); });
  document.querySelector("#checkoutClose").addEventListener("click", () => document.querySelector("#checkoutDialog").close());
  document.querySelector("#detailClose").addEventListener("click", () => document.querySelector("#detailDialog").close());
  document.querySelector("#historyOpen").addEventListener("click", () => { renderHistory(); document.querySelector("#historyDialog").showModal(); });
  document.querySelector("#favoritesOpen").addEventListener("click", () => { renderFavorites(); document.querySelector("#favoritesDialog").showModal(); });
  document.querySelector("#favoritesClose").addEventListener("click", () => document.querySelector("#favoritesDialog").close());
  document.querySelector("#historyClose").addEventListener("click", () => document.querySelector("#historyDialog").close());
  document.querySelector("#checkoutArea").addEventListener("change", updateEta);
  document.querySelector("#themeToggle").addEventListener("click", () => { const light = !document.body.classList.contains("light"); document.body.classList.toggle("light", light); save(KEYS.theme, light ? "light" : "dark"); });
  document.querySelector("#confirmationClose").addEventListener("click", () => document.querySelector("#confirmation").classList.add("hidden"));
  document.querySelector("#checkoutForm").addEventListener("submit", placeOrder);
  document.querySelector("#surpriseBtn").addEventListener("click", surpriseMe);
  document.querySelector("#trackingClose").addEventListener("click", closeTracking);
  document.querySelector("#trackOrderBtn").addEventListener("click", () => { if (activeOrderId) trackOrder(activeOrderId); });
}

function placeOrder(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const error = document.querySelector("#formError");
  error.textContent = "";
  if (!form.checkValidity()) { form.reportValidity(); return; }
  if (!cart.length) { error.textContent = "Your cart is empty."; return; }
  const area = document.querySelector("#checkoutArea").value;
  const subtotal = cart.reduce((sum, item) => sum + (menu.find(d => d.id === item.id)?.price || 0) * item.qty, 0);
  const deliveryFee = DELIVERY_FEES[area] || 0;
  const order = { id: `AE-${Date.now()}`, customer: { name: customerName.value.trim(), phone: customerPhone.value.trim(), area }, note: specialInstructions.value.trim(), items: [...cart], subtotal, deliveryFee, total: subtotal + deliveryFee, status: "pending", createdAt: new Date().toISOString(), eta: DELIVERY_TIMES[area] || "35–50 minutes" };
  const orders = load(KEYS.orders, []); orders.unshift(order); save(KEYS.orders, orders);
  activeOrderId = order.id;
  cart = []; save(KEYS.cart, cart); renderCart(); form.reset(); document.querySelector("#checkoutDialog").close();
  document.querySelector("#confirmationText").textContent = `Order ${order.id} is confirmed. Estimated delivery is ${order.eta}. You can track the order live while its status changes.`;
  document.querySelector("#confirmation").classList.remove("hidden");
}

const savedTheme = localStorage.getItem(KEYS.theme); if (savedTheme === "light") document.body.classList.add("light");
setupEvents(); renderFavorites(); loadMenu();