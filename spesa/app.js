import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect,
  onAuthStateChanged, signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  initializeFirestore, persistentLocalCache, collection, doc, addDoc, updateDoc,
  deleteDoc, onSnapshot, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
// "?v=N": quando cambi il codice aumenta N qui e in index.html, così i telefoni scaricano subito la versione nuova
import { firebaseConfig, ALLOWED_EMAILS } from "./config.js?v=5";
import { PRODUCTS, POPULAR } from "./products.js?v=5";

// ---------- Sezioni ----------
const PLACES = {
  frigo: { name: "Frigo", icon: "🧊", add: "Aggiungi un alimento al frigo", ph: "Es. Uova",
           empty: "Il frigo è vuoto. Aggiungi qualcosa sopra!" },
  casa:  { name: "Casa",  icon: "🏠", add: "Aggiungi una cosa per la casa", ph: "Es. Detersivo piatti",
           empty: "Niente per la casa. Aggiungi qualcosa sopra!" },
};

// ---------- Firebase ----------
const fbApp = initializeApp(firebaseConfig);
const auth = getAuth(fbApp);
// cache locale: l'app si apre anche con poco segnale al supermercato
const db = initializeFirestore(fbApp, { localCache: persistentLocalCache() });
const itemsCol = collection(db, "items");

// ---------- Stato ----------
let items = [];
let user = null;
let unsubs = [];
let currentTab = "spesa";
let invFilter = "all";
let formPlace = "frigo";

// ---------- Utility ----------
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const num = (v, def = 0) => { const n = parseFloat(String(v).replace(",", ".")); return Number.isFinite(n) ? n : def; };
const fmt = (n) => (Math.round(n * 100) / 100).toString().replace(".", ",");
const norm = (s) => String(s || "").trim().toLowerCase();
const cap = (s) => s.trim().charAt(0).toUpperCase() + s.trim().slice(1);
const placeOf = (it) => (it.place === "casa" ? "casa" : "frigo");

function status(it) {
  const q = num(it.qty), low = num(it.low, 1);
  if (q <= 0) return "out";
  if (q <= low) return "low";
  return "ok";
}
const qtyText = (q, unit) => `${fmt(num(q))}${unit ? " " + esc(unit) : ""}`;
const findByName = (name) => items.find((i) => i.nameLower === norm(name));
let toastTimer;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

function stamp(data) {
  return { ...data, updatedAt: serverTimestamp(), updatedBy: user?.email || "" };
}
async function save(id, data) {
  try { await updateDoc(doc(db, "items", id), stamp(data)); }
  catch (e) { console.error(e); toast("Errore: " + e.message); }
}
// ---------- Login ----------
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

$("loginBtn").onclick = async () => {
  $("loginErr").textContent = "";
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    if (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment") {
      await signInWithRedirect(auth, provider);
    } else if (e.code !== "auth/popup-closed-by-user" && e.code !== "auth/cancelled-popup-request") {
      $("loginErr").textContent = "Errore di accesso: " + e.message;
    }
  }
};
$("logoutBtn").onclick = () => signOut(auth);

onAuthStateChanged(auth, async (u) => {
  unsubs.forEach((f) => f()); unsubs = [];
  if (!u) {
    user = null;
    $("app").classList.add("hidden");
    $("login").classList.remove("hidden");
    return;
  }
  const email = (u.email || "").toLowerCase();
  if (!ALLOWED_EMAILS.map((e) => e.toLowerCase()).includes(email)) {
    $("loginErr").textContent = `L'account ${email} non è autorizzato.`;
    await signOut(auth);
    return;
  }
  user = u;
  $("whoName").textContent = u.displayName?.split(" ")[0] || email;
  $("login").classList.add("hidden");
  $("app").classList.remove("hidden");

  const onErr = (err) => { console.error(err); toast("Accesso negato al database: controlla le regole Firestore"); };
  unsubs.push(onSnapshot(itemsCol, (snap) => {
    items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    render();
  }, onErr));
});

// ---------- Tabs ----------
document.querySelectorAll(".tab").forEach((b) => {
  b.onclick = () => {
    currentTab = b.dataset.tab;
    document.querySelectorAll(".tab").forEach((x) => x.classList.toggle("active", x === b));
    $("tab-spesa").classList.toggle("hidden", currentTab !== "spesa");
    $("tab-inv").classList.toggle("hidden", currentTab === "spesa");
    if (currentTab !== "spesa") {
      const P = PLACES[currentTab];
      $("invTitle").textContent = P.add;
      $("fName").placeholder = P.ph;
      $("search").value = "";
      renderInventory();
    }
    window.scrollTo(0, 0);
  };
});

// ---------- Render ----------
function render() {
  renderShopping();
  renderInventory();
}

function shoppingRow(i) {
  const st = status(i);
  const P = PLACES[placeOf(i)];
  return `
    <div class="item">
      <span class="dot ${st}" title="${P.name}: ${qtyText(i.qty, i.unit)}"></span>
      <div class="info">
        <div class="name">${esc(i.name)}</div>
        <div class="meta">Da prendere: <b>${qtyText(i.listQty || 1, i.unit)}</b> · ${P.icon} ${qtyText(i.qty, i.unit)}</div>
      </div>
      <div class="actions">
        <button class="icon buy" data-buy="${i.id}">✓ Comprato</button>
        <button class="icon" data-unlist="${i.id}" title="Togli dalla lista">✕</button>
      </div>
    </div>`;
}

function renderShopping() {
  const list = items.filter((i) => i.onList).sort((a, b) => a.nameLower.localeCompare(b.nameLower));
  $("listBadge").textContent = list.length;

  $("shoppingList").innerHTML = list.length
    ? `<div class="list">${list.map(shoppingRow).join("")}</div>`
    : `<div class="empty">Lista vuota 🎉</div>`;

  const sugg = items.filter((i) => !i.onList && status(i) !== "ok")
    .sort((a, b) => (status(a) === "out" ? 0 : 1) - (status(b) === "out" ? 0 : 1) || a.nameLower.localeCompare(b.nameLower));
  $("suggPanel").classList.toggle("hidden", sugg.length === 0);
  $("suggestions").innerHTML = sugg.map((i) =>
    `<button data-sugg="${i.id}"><span class="dot ${status(i)}" style="display:inline-block;width:9px;height:9px;margin-right:5px"></span>${PLACES[placeOf(i)].icon} ${esc(i.name)}</button>`
  ).join("");
}

function renderInventory() {
  if (currentTab === "spesa") return;
  const place = currentTab;
  const mine = items.filter((i) => placeOf(i) === place);
  const order = { out: 0, low: 1, ok: 2 };
  const counts = { ok: 0, low: 0, out: 0 };
  mine.forEach((i) => counts[status(i)]++);
  $("cOk").textContent = counts.ok; $("cLow").textContent = counts.low; $("cOut").textContent = counts.out;

  const q = norm($("search").value);
  const list = mine
    .filter((i) => invFilter === "all" || status(i) === invFilter)
    .filter((i) => !q || i.nameLower.includes(q))
    .sort((a, b) => order[status(a)] - order[status(b)] || a.nameLower.localeCompare(b.nameLower));

  $("invList").innerHTML = list.length ? list.map((i) => {
    const st = status(i);
    const label = { ok: "Presente", low: "Sta finendo", out: "Finito" }[st];
    return `
    <div class="item ${st}">
      <div class="info">
        <div class="name">${esc(i.name)} ${i.onList ? "🛒" : ""}</div>
        <div class="meta">${label}${i.unit ? " · " + esc(i.unit) : ""}</div>
      </div>
      <div class="actions">
        <button class="icon" data-dec="${i.id}" aria-label="meno">−</button>
        <span class="count">${fmt(num(i.qty))}</span>
        <button class="icon" data-inc="${i.id}" aria-label="più">+</button>
        ${i.onList ? "" : `<button class="icon" data-tolist="${i.id}" title="Aggiungi alla spesa">🛒</button>`}
        <button class="icon" data-edit="${i.id}" title="Modifica">✎</button>
      </div>
    </div>`;
  }).join("") : `<div class="empty">${mine.length ? "Nessun risultato" : PLACES[place].empty}</div>`;
}

$("search").oninput = renderInventory;
document.querySelectorAll("#filters .chip").forEach((c) => {
  c.onclick = () => {
    invFilter = c.dataset.f;
    document.querySelectorAll("#filters .chip").forEach((x) => x.classList.toggle("active", x === c));
    renderInventory();
  };
});

// ---------- Form spesa ----------
function setPlace(p) {
  formPlace = p;
  document.querySelectorAll("#placeChips .chip").forEach((c) => c.classList.toggle("active", c.dataset.place === p));
}
document.querySelectorAll("#placeChips .chip").forEach((c) => (c.onclick = () => setPlace(c.dataset.place)));

// ---------- Suggerimenti automatici (scrivi "p" → patate, pasta, pane…) ----------
function suggest(q, preferPlace) {
  q = norm(q);
  if (!q) return [];
  const seen = new Set();
  const pool = [];
  items.forEach((i) => { seen.add(i.nameLower); pool.push({ name: i.name, place: placeOf(i), item: i }); });
  PRODUCTS.forEach((p) => { const k = norm(p.name); if (!seen.has(k)) { seen.add(k); pool.push(p); } });
  const score = (p) => {
    const n = norm(p.name);
    let s;
    if (n.startsWith(q)) s = 0;
    else if (n.split(/\s+/).some((w) => w.startsWith(q))) s = 1;
    else if (n.includes(q)) s = 2;
    else return -1;
    if (!p.item) s += POPULAR.has(n) ? 0.3 : 0.6;       // prima le cose che avete già, poi le più comuni
    if (preferPlace && p.place !== preferPlace) s += 3; // in Frigo/Casa prima quelli di quella sezione
    return s;
  };
  return pool.map((p) => ({ p, s: score(p) })).filter((x) => x.s >= 0)
    .sort((a, b) => a.s - b.s || a.p.name.localeCompare(b.p.name, "it"))
    .slice(0, 10).map((x) => x.p);
}

function highlight(name, q) {
  const i = norm(name).indexOf(norm(q));
  if (i < 0 || !q) return esc(name);
  return esc(name.slice(0, i)) + "<b>" + esc(name.slice(i, i + q.trim().length)) + "</b>" + esc(name.slice(i + q.trim().length));
}

function attachAutocomplete(input, box, getPreferPlace, onPick) {
  let results = [];
  let hideTimer;
  const hide = () => box.classList.add("hidden");
  const show = () => {
    clearTimeout(hideTimer);
    results = suggest(input.value, getPreferPlace());
    // niente lista se hai già scritto esattamente un nome
    if (!results.length || (results.length === 1 && norm(results[0].name) === norm(input.value))) return hide();
    box.innerHTML = results.map((p, idx) => {
      const where = PLACES[p.place].icon;
      const hint = p.item ? (p.item.onList ? "già in lista" : `${where} ${fmt(num(p.item.qty))}`) : where;
      return `<button type="button" data-ac="${idx}"><span>${highlight(p.name, input.value)}</span><span class="hint">${hint}</span></button>`;
    }).join("");
    box.classList.remove("hidden");
  };
  input.addEventListener("input", show);
  input.addEventListener("focus", show);
  input.addEventListener("blur", () => { hideTimer = setTimeout(hide, 200); });
  input.addEventListener("keydown", (e) => { if (e.key === "Escape") hide(); });
  // pointerdown così la scelta arriva prima che l'input perda il focus
  box.addEventListener("pointerdown", (e) => {
    const b = e.target.closest("[data-ac]");
    if (!b) return;
    e.preventDefault();
    const p = results[+b.dataset.ac];
    input.value = p.name;
    hide();
    onPick(p);
  });
}

function onListNameChange() {
  const name = $("listName").value;
  const ex = findByName(name);
  if (ex) {
    setPlace(placeOf(ex));
  } else {
    const p = PRODUCTS.find((x) => norm(x.name) === norm(name));
    if (p) setPlace(p.place);
  }
}
$("listName").addEventListener("input", onListNameChange);
attachAutocomplete($("listName"), $("acList"), () => null, () => { onListNameChange(); $("listQty").focus(); $("listQty").select(); });
attachAutocomplete($("fName"), $("acInv"), () => currentTab, () => { $("fQty").focus(); $("fQty").select(); });
$("addListForm").onsubmit = async (e) => {
  e.preventDefault();
  const name = $("listName").value.trim();
  if (!name) return;
  const qty = num($("listQty").value, 1) || 1;
  const existing = findByName(name);
  if (existing) {
    await save(existing.id, {
      onList: true, listQty: (existing.onList ? num(existing.listQty) : 0) + qty,
    });
  } else {
    await addDoc(itemsCol, stamp({
      name: cap(name), nameLower: norm(name), qty: 0, unit: "", low: 1, place: formPlace,
      onList: true, listQty: qty,
    })).catch((err) => toast("Errore: " + err.message));
  }
  toast(`🛒 ${cap(name)} aggiunto alla lista`);
  $("listName").value = ""; $("listQty").value = 1;
  setPlace("frigo");
  $("listName").focus();
};

// ---------- Aggiungi a frigo / casa ----------
$("addInvForm").onsubmit = async (e) => {
  e.preventDefault();
  const place = currentTab;
  const name = $("fName").value.trim();
  if (!name) return;
  const qty = num($("fQty").value, 0);
  const unit = $("fUnit").value.trim();
  const low = num($("fLow").value, 1);
  const existing = findByName(name);
  if (existing) {
    await save(existing.id, { qty: num(existing.qty) + qty, ...(unit && { unit }), low });
    toast(`${PLACES[placeOf(existing)].icon} ${existing.name}: +${fmt(qty)}`);
  } else {
    await addDoc(itemsCol, stamp({
      name: cap(name), nameLower: norm(name), qty, unit, low, place,
      onList: false, listQty: 0,
    })).catch((err) => toast("Errore: " + err.message));
    toast(`${PLACES[place].icon} ${cap(name)} aggiunto`);
  }
  $("fName").value = ""; $("fQty").value = 1; $("fUnit").value = ""; $("fLow").value = 1;
};

// ---------- Click nelle liste (delegati) ----------
document.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  const get = (attr) => items.find((i) => i.id === b.dataset[attr]);
  let it;
  if ((it = get("buy"))) openBuy(it);
  else if ((it = get("unlist"))) save(it.id, { onList: false, listQty: 0 });
  else if ((it = get("sugg"))) { save(it.id, { onList: true, listQty: 1 }); toast(`🛒 ${it.name} aggiunto`); }
  else if ((it = get("tolist"))) { save(it.id, { onList: true, listQty: 1 }); toast(`🛒 ${it.name} aggiunto alla spesa`); }
  else if ((it = get("inc"))) save(it.id, { qty: num(it.qty) + 1 });
  else if ((it = get("dec"))) save(it.id, { qty: Math.max(0, num(it.qty) - 1) });
  else if ((it = get("edit"))) openEdit(it);
});

// ---------- Dialog "Comprato" ----------
let buying = null;
function openBuy(it) {
  buying = it;
  $("buyTitle").textContent = `✓ ${it.name}`;
  $("buyQty").value = num(it.listQty, 1) || 1;
  $("buyOk").textContent = placeOf(it) === "casa" ? "Metti in casa" : "Metti in frigo";
  $("buyDialog").showModal();
  $("buyQty").select();
}
$("buyMinus").onclick = () => { $("buyQty").value = Math.max(0, num($("buyQty").value) - 1); };
$("buyPlus").onclick = () => { $("buyQty").value = num($("buyQty").value) + 1; };
$("buyDialog").addEventListener("close", () => {
  if ($("buyDialog").returnValue === "ok" && buying) {
    const n = num($("buyQty").value, 0);
    save(buying.id, { qty: num(buying.qty) + n, onList: false, listQty: 0 });
    toast(`${PLACES[placeOf(buying)].icon} ${buying.name}: +${fmt(n)}`);
  }
  buying = null;
});

// ---------- Dialog "Modifica" ----------
let editing = null;
function openEdit(it) {
  editing = it;
  $("eName").value = it.name;
  $("eQty").value = num(it.qty);
  $("eUnit").value = it.unit || "";
  $("eLow").value = num(it.low, 1);
  $("ePlace").value = placeOf(it);
  $("editDialog").showModal();
}
$("editDialog").addEventListener("close", async () => {
  const v = $("editDialog").returnValue;
  const it = editing; editing = null;
  if (!it) return;
  if (v === "ok") {
    const name = $("eName").value.trim() || it.name;
    save(it.id, {
      name: cap(name), nameLower: norm(name),
      qty: Math.max(0, num($("eQty").value)), unit: $("eUnit").value.trim(), low: Math.max(0, num($("eLow").value, 1)),
      place: $("ePlace").value,
    });
  } else if (v === "delete") {
    if (confirm(`Eliminare "${it.name}" per sempre?`)) {
      await deleteDoc(doc(db, "items", it.id)).catch((err) => toast("Errore: " + err.message));
      toast(`🗑️ ${it.name} eliminato`);
    }
  }
});
