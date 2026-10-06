if(sessionStorage.getItem("adminLoggedIn")!=="true")location.href="admin-login.html";
const MENU_KEY="addiseats_menu",ORDERS_KEY="addiseats_orders";
let menu=load(MENU_KEY,[]),orders=load(ORDERS_KEY,[]);
function load(k,d=[])  {
  try  {
    return JSON.parse(localStorage.getItem(k))??d
  }catch  {
    return d
  }
}
function save(k,v)  {
  localStorage.setItem(k,JSON.stringify(v))
}
const money=n=>`${Number(n||0).toLocaleString("en-US")} ETB`;

function escapeHtml(v)   {
  return String(v??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]))}
function ensureEnabled(){let changed=false;menu=menu.map(d=>{if(typeof d.enabled!=="boolean"){changed=true;return {...d,enabled:true}}return d});if(changed)save(MENU_KEY,menu)}ensureEnabled();
function render(){
 const revenue=orders.reduce((s,o)=>s+Number(o.total||0),0),avg=orders.length?revenue/orders.length:0,enabled=menu.filter(d=>d.enabled!==false).length,disabled=menu.length-enabled;
 analytics.innerHTML=[["Revenue",money(revenue),"↗"],["Orders",orders.length,""],["Avg. order",money(avg),""],["Available dishes",enabled,`${disabled} hidden`]].map(x=>`<article class="stat-card"><span class="muted">${x[0]}</span><strong>${x[1]}</strong><small>${x[2]}</small></article>`).join("");
 sideOrderCount.textContent=orders.filter(o=>o.status!=="delivered").length; enabledCount.textContent=enabled; disabledCount.textContent=disabled;
 const sales={};orders.forEach(o=>o.items?.forEach(i=>sales[i.id]=(sales[i.id]||0)+i.qty));const top=Object.entries(sales).sort((a,b)=>b[1]-a[1]).slice(0,5);topDishes.innerHTML=top.length?top.map(([id,n],i)=>{const d=menu.find(x=>x.id==id);return`<div class="top-row"><span class="rank">${i+1}</span><div><strong>${escapeHtml(d?.name||"Deleted dish")}</strong><small>${n} sold</small></div><span>${money((d?.price||0)*n)}</span></div>`}).join(""):"<p class='muted'>No sales yet.</p>";
 const counts={pending:0,preparing:0,delivering:0,delivered:0};orders.forEach(o=>counts[o.status]=(counts[o.status]||0)+1);statusDistribution.innerHTML=Object.entries(counts).map(([s,n])=>`<div class="bar"><span>${s}</span><div class="bar-track"><div class="bar-fill" style="width:${orders.length?n/orders.length*100:0}%"></div></div><strong>${n}</strong></div>`).join("");
 const q=(adminDishSearch.value||"").toLowerCase();dishGrid.innerHTML=menu.filter(d=>`${d.name} ${d.category}`.toLowerCase().includes(q)).map(d=>`<article class="dish-admin-card ${d.enabled===false?"disabled-card":""}"><div class="dish-admin-image"><img src="${escapeHtml(d.image)}" alt="${escapeHtml(d.name)}" onerror="this.style.display='none'"><span>YOUR IMAGE</span><span class="availability-pill ${d.enabled===false?"off":"on"}">${d.enabled===false?"Hidden":"Live"}</span></div><div class="dish-admin-body"><div class="dish-admin-title"><div><h3>${escapeHtml(d.name)}</h3><span>${escapeHtml(d.category)}</span></div><strong>${money(d.price)}</strong></div><p>${escapeHtml(d.description)}</p><div class="dish-admin-actions"><button class="table-btn" onclick="editDish(${d.id})">Edit</button><button class="table-btn danger" onclick="deleteDish(${d.id})">Delete</button><button class="toggle ${d.enabled===false?"off":"on"}" onclick="toggleDish(${d.id})" aria-pressed="${d.enabled!==false}"><span class="toggle-knob"></span>${d.enabled===false?"Enable":"Disable"}</button></div></div></article>`).join("");
 orderTable.innerHTML=orders.length?orders.map(o=>`<tr><td><strong>${escapeHtml(o.id)}</strong><br><small class="muted">${new Date(o.createdAt).toLocaleString()}</small></td><td>${escapeHtml(o.customer?.name||"")}<br><small class="muted">${escapeHtml(o.customer?.area||"")}</small></td><td>${o.items?.reduce((s,i)=>s+i.qty,0)||0}</td><td>${money(o.total)}</td><td><select onchange="updateStatus('$   {
    o.id
  }
  ',this.value)">${["pending","preparing","delivering","delivered"].map(s=>`<option ${s===o.status?"selected":""}>${s}</option>`).join("")}</select></td><td><button class="table-btn danger" onclick="deleteOrder('$   {
    o.id
  }
  ')">Delete</button></td></tr>`).join(""):"<tr><td colspan='6'>No orders yet.</td></tr>";
}
function openAdd(){dishForm.reset();dishId.value="";dishEnabled.checked=true;dishDialogTitle.textContent="Add dish";dishDialog.showModal()}
addDishBtn.onclick=openAdd;addDishBtn2.onclick=openAdd;dishClose.onclick=()=>dishDialog.close();adminDishSearch.oninput=render;logoutBtn.onclick=()=>{sessionStorage.removeItem("adminLoggedIn");location.href="admin-login.html"};
dishForm.addEventListener("submit",e=>{e.preventDefault();const id=dishId.value,d={id:id?Number(id):Date.now(),name:dishName.value.trim(),description:dishDescription.value.trim(),price:Number(dishPrice.value),category:dishCategory.value,image:dishImage.value.trim(),ingredients:dishIngredients.value.split(",").map(x=>x.trim()).filter(Boolean),enabled:dishEnabled.checked};menu=id?menu.map(x=>x.id===Number(id)?d:x):[...menu,d];save(MENU_KEY,menu);dishDialog.close();render()});
function editDish(id){const d=menu.find(x=>x.id===id);if(!d)return;dishId.value=d.id;dishName.value=d.name;dishDescription.value=d.description;dishPrice.value=d.price;dishCategory.value=d.category;dishImage.value=d.image;dishIngredients.value=(d.ingredients||[]).join(", ");dishEnabled.checked=d.enabled!==false;dishDialogTitle.textContent="Edit dish";dishDialog.showModal()}
function toggleDish(id){const d=menu.find(x=>x.id===id);if(!d)return;d.enabled=d.enabled===false;save(MENU_KEY,menu);render()}
function deleteDish(id){if(confirm("Delete this dish? Customers will no longer see it.")){menu=menu.filter(x=>x.id!==id);save(MENU_KEY,menu);render()}}
function updateStatus(id,status){orders=orders.map(o=>o.id===id?{...o,status}:o);save(ORDERS_KEY,orders);render()}function deleteOrder(id){if(confirm("Delete this order?")){orders=orders.filter(o=>o.id!==id);save(ORDERS_KEY,orders);render()}}
render();