const STORAGE = 'cantina-escolar-interativa-v1';

const initial = {
  products: [
    { id: 'sand', name: 'Sanduíche natural', price: 6, category: 'Lanches', emoji: '🥪', color: '#fff0b8', stock: 9 },
    { id: 'suco', name: 'Suco de laranja', price: 4, category: 'Bebidas', emoji: '🥤', color: '#ffe9d2', stock: 3 },
    { id: 'pao', name: 'Pão de queijo', price: 3.5, category: 'Lanches', emoji: '🧀', color: '#eef0f2', stock: 0 },
    { id: 'bolo', name: 'Bolo de cenoura', price: 5, category: 'Doces', emoji: '🍰', color: '#ffdce1', stock: 8 }
  ],
  orders: [
    { id: 29, name: 'Rui', time: '10:04', status: 'new', items: [{ id: 'bolo', qty: 1 }] },
    { id: 28, name: 'Lucas', time: '10:03', status: 'preparing', items: [{ id: 'bolo', qty: 2 }] },
    { id: 26, name: 'Bia', time: '10:01', status: 'ready', items: [{ id: 'pao', qty: 1 }] }
  ],
  nextOrder: 30
};

function clone(v) { return JSON.parse(JSON.stringify(v)); }
function load() { try { return { ...clone(initial), ...JSON.parse(localStorage.getItem(STORAGE)) }; } catch { return clone(initial); } }
let data = load();
let view = 'student';
let loginRole = 'student';
let authenticated = false;
let category = 'Todos';
let cart = [];
let studentOrder = null;
let cartOpen = false;
let stockOpen = false;

const money = n => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const product = id => data.products.find(p => p.id === id);
const save = () => localStorage.setItem(STORAGE, JSON.stringify(data));
const qty = id => cart.find(i => i.id === id)?.qty || 0;
const cartTotal = () => cart.reduce((sum, item) => sum + product(item.id).price * item.qty, 0);
const itemCount = () => cart.reduce((sum, item) => sum + item.qty, 0);

function header() {
  return `<section class="role-switch" aria-label="Alternar visão">
    <button class="${view === 'student' ? 'active' : ''}" data-view="student">Estudante</button>
    <button class="${view === 'attendant' ? 'active' : ''}" data-view="attendant">Atendente</button>
  </section>`;
}

function login() {
  const isStudent = loginRole === 'student';
  return `<section class="login-shell" aria-labelledby="login-title">
    <div class="login-mark">🍞</div><p class="eyebrow">CANTINA DA ESCOLA</p>
    <h1 id="login-title">Bom intervalo!</h1><p class="login-copy">Entre para pedir seu lanche ou gerenciar os pedidos da cantina.</p>
    <div class="login-tabs" role="tablist"><button class="${isStudent ? 'active' : ''}" data-login-role="student">Estudante</button><button class="${!isStudent ? 'active' : ''}" data-login-role="attendant">Atendente</button></div>
    <label>E-mail<input id="login-email" type="email" autocomplete="username" placeholder="nome@escola.com" /></label>
    <label>Senha<input id="login-password" type="password" autocomplete="current-password" placeholder="Sua senha" /></label>
    <p class="login-error" aria-live="polite"></p>
    <button class="login-submit" data-login>Entrar na cantina</button>
    <div class="quick-access"><span>ACESSO RÁPIDO PARA DEMONSTRAÇÃO</span><button data-demo="student">🎒 Preencher como estudante</button><button data-demo="attendant">🧾 Preencher como atendente</button></div>
    <p class="login-help">Use os botões rápidos para preencher as credenciais e demonstrar os dois fluxos.</p>
  </section>`;
}

function student() {
  const products = data.products.filter(p => category === 'Todos' || p.category === category);
  const tracking = studentOrder || data.orders.find(o => o.status !== 'delivered' && o.id >= 30);
  return `<section class="phone student-view">
    <header class="student-head"><div><p class="eyebrow">CANTINA DA ESCOLA</p><h1>Cantina</h1></div><span class="interval">◷&nbsp; Intervalo: <b>17 min</b></span></header>
    <div class="content">
      <nav class="categories">${['Todos','Lanches','Bebidas','Doces'].map(c => `<button class="${category === c ? 'selected' : ''}" data-category="${c}">${c}</button>`).join('')}</nav>
      <div class="product-grid">${products.map(p => productCard(p)).join('')}</div>
      ${tracking ? orderTracking(tracking) : '<p class="hint">Escolha seus itens e confirme a sacola. Você poderá acompanhar o pedido aqui.</p>'}
    </div>
    <button class="cart-bar ${itemCount() ? '' : 'empty'}" data-cart ${itemCount() ? '' : 'disabled'}>
      <span>Meu pedido <i>${itemCount()}</i> ${itemCount() === 1 ? 'item' : 'itens'}</span><strong>${money(cartTotal())}</strong><b>→</b>
    </button>
  </section>`;
}

function productCard(p) {
  const unavailable = p.stock <= 0;
  return `<article class="product ${unavailable ? 'sold-out' : ''}">
    <div class="food" style="background:${p.color}">${unavailable ? '<span>ESGOTADO</span>' : ''}<em>${p.emoji}</em></div>
    <h2>${p.name}</h2><strong>${money(p.price)}</strong>
    ${p.stock > 0 && p.stock <= 3 ? `<small>ⓘ Restam ${p.stock}</small>` : ''}
    <button ${unavailable ? 'disabled' : ''} data-add="${p.id}">${unavailable ? 'Indisponível' : '+ Adicionar'}</button>
  </article>`;
}

function orderTracking(order) {
  const labels = { new: 'Recebido', preparing: 'Em preparo', ready: 'Pronto', delivered: 'Entregue' };
  const steps = ['new','preparing','ready']; const current = steps.indexOf(order.status);
  const details = order.items.map(i => `${i.qty} × ${product(i.id)?.name || 'Item'}`).join(' · ');
  return `<section class="tracking"><div><p>ACOMPANHAMENTO</p><h2>Pedido #${order.id}</h2><span>${labels[order.status]}</span></div><small>${details}</small>
    <div class="timeline">${steps.map((step, i) => `<div class="${i <= current ? 'done' : ''}"><i>${i < current ? '✓' : i + 1}</i><b>${labels[step]}</b></div>`).join('')}</div>
    <p class="track-note">${order.status === 'ready' ? 'Seu lanche está pronto para retirada na cantina.' : order.status === 'delivered' ? 'Pedido entregue. Bom intervalo!' : 'Acompanhe por aqui até o seu pedido ficar pronto.'}</p>
  </section>`;
}

function attendant() {
  const active = data.orders.filter(o => o.status !== 'delivered');
  const columns = [ ['new','Novos','Em preparo'], ['preparing','Em preparo','Pronto'], ['ready','Prontos','Entregue'] ];
  return `<section class="attendant-view">
    <header class="attendant-head"><div><p class="eyebrow">CANTINA DA ESCOLA</p><h1>Painel da cantina</h1><span>${active.length} pedidos ativos</span></div><button class="stock-button" data-stock>⊘ Produtos<br/>esgotados</button></header>
    <div class="board">${columns.map(([status,title,action]) => {
      const orders = active.filter(o => o.status === status);
      return `<section class="column"><header><h2>${title}</h2><b>${orders.length}</b></header>${orders.length ? orders.map(o => orderCard(o, action)).join('') : '<p class="empty-col">Nenhum pedido aqui.</p>'}</section>`;
    }).join('')}</div>
    <footer class="attendant-footer"><button data-reset>↻ Restaurar demonstração</button><span>Dados salvos neste navegador</span></footer>
  </section>`;
}

function orderCard(o, action) {
  const text = o.items.map(i => `${i.qty} × ${product(i.id)?.name || 'Item removido'}`).join('<br/>');
  return `<article class="order-card"><p>Nº <b>${o.id}</b> <time>${o.time}</time></p><h3>${o.name}</h3><div>${text}</div><button data-advance="${o.id}">${action} <span>→</span></button></article>`;
}

function cartModal() {
  if (!cartOpen) return '';
  return `<div class="modal-backdrop"><section class="cart-modal" role="dialog" aria-modal="true"><button class="close" data-close>×</button><p class="eyebrow">SEU PEDIDO</p><h2>Revisar sacola</h2>
    <div class="cart-items">${cart.map(item => { const p = product(item.id); return `<div><span class="mini">${p.emoji}</span><p><b>${p.name}</b><small>${money(p.price)} cada</small></p><div class="counter"><button data-minus="${p.id}">−</button><b>${item.qty}</b><button data-plus="${p.id}">+</button></div></div>`; }).join('')}</div>
    <div class="total"><span>Total</span><b>${money(cartTotal())}</b></div><label>Nome para retirada<input id="order-name" maxlength="20" placeholder="Ex.: Ana" value="Aluno(a)" /></label><button class="confirm" data-confirm>Confirmar pedido <span>→</span></button></section></div>`;
}

function stockModal() {
  if (!stockOpen) return '';
  return `<div class="modal-backdrop"><section class="stock-modal" role="dialog" aria-modal="true"><button class="close" data-close-stock>×</button><p class="eyebrow">ESTOQUE</p><h2>Produtos da cantina</h2><p class="modal-copy">Marque os produtos que não podem mais ser pedidos.</p>
    ${data.products.map(p => `<label class="stock-row"><span class="mini" style="background:${p.color}">${p.emoji}</span><span><b>${p.name}</b><small>${p.stock > 0 ? `${p.stock} unidades disponíveis` : 'Esgotado'}</small></span><input type="checkbox" data-stock-item="${p.id}" ${p.stock <= 0 ? 'checked' : ''}/><i></i></label>`).join('')}
    <button class="confirm" data-close-stock>Concluir</button></section></div>`;
}

function render() {
  document.querySelector('#app').innerHTML = `<div class="page"><div class="brand">🍞 <span>Cantina Fácil</span><small>Protótipo interativo</small></div>${authenticated ? `${header()}${view === 'student' ? student() : attendant()}${cartModal()}${stockModal()}` : login()}</div>`;
}

function add(id) {
  const p = product(id); if (!p || p.stock <= qty(id)) return;
  const found = cart.find(i => i.id === id); found ? found.qty++ : cart.push({ id, qty: 1 }); render();
}
function advance(id) {
  const order = data.orders.find(o => o.id === Number(id));
  if (!order) return; order.status = order.status === 'new' ? 'preparing' : order.status === 'preparing' ? 'ready' : 'delivered'; save(); render();
}

document.addEventListener('click', e => {
  const el = e.target.closest('button,[data-category]'); if (!el) return;
  if (el.dataset.view) { view = el.dataset.view; cartOpen = false; stockOpen = false; }
  if (el.dataset.loginRole) { loginRole = el.dataset.loginRole; }
  if (el.dataset.demo) {
    const demo = el.dataset.demo === 'student'
      ? { email: 'aluno@cantina.local', password: 'Aluno123!', role: 'student' }
      : { email: 'atendente@cantina.local', password: 'Atendente123!', role: 'attendant' };
    loginRole = demo.role;
    render();
    document.querySelector('#login-email').value = demo.email;
    document.querySelector('#login-password').value = demo.password;
    return;
  }
  if (el.dataset.login !== undefined) {
    const email = document.querySelector('#login-email')?.value.trim().toLowerCase();
    const password = document.querySelector('#login-password')?.value;
    const expected = loginRole === 'student'
      ? { email: 'aluno@cantina.local', password: 'Aluno123!' }
      : { email: 'atendente@cantina.local', password: 'Atendente123!' };
    if (email === expected.email && password === expected.password) { authenticated = true; view = loginRole; }
    else { const error = document.querySelector('.login-error'); if (error) error.textContent = 'Confira o e-mail e a senha ou use um botão de acesso rápido.'; return; }
  }
  if (el.dataset.category) category = el.dataset.category;
  if (el.dataset.add) add(el.dataset.add);
  if (el.dataset.cart !== undefined && itemCount()) cartOpen = true;
  if (el.dataset.close !== undefined) cartOpen = false;
  if (el.dataset.plus) add(el.dataset.plus);
  if (el.dataset.minus) { const item = cart.find(i => i.id === el.dataset.minus); if (item) { item.qty--; if (!item.qty) cart = cart.filter(i => i !== item); } if (!cart.length) cartOpen = false; }
  if (el.dataset.confirm !== undefined) { const name = document.querySelector('#order-name')?.value.trim() || 'Aluno(a)'; const order = { id: data.nextOrder++, name, time: new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' }), status:'new', items: clone(cart) }; order.items.forEach(i => product(i.id).stock -= i.qty); data.orders.unshift(order); save(); studentOrder = order; cart = []; cartOpen = false; }
  if (el.dataset.advance) advance(el.dataset.advance);
  if (el.dataset.stock !== undefined) stockOpen = true;
  if (el.dataset.closeStock !== undefined) stockOpen = false;
  if (el.dataset.reset !== undefined) { data = clone(initial); cart = []; studentOrder = null; save(); }
  render();
});
document.addEventListener('change', e => { if (e.target.dataset.stockItem) { const p = product(e.target.dataset.stockItem); p.stock = e.target.checked ? 0 : 5; save(); render(); } });
window.addEventListener('storage', () => { data = load(); render(); });
render();
