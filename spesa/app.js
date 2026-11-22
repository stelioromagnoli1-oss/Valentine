import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect,
  onAuthStateChanged, signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  initializeFirestore, persistentLocalCache, collection, doc, addDoc, updateDoc, setDoc,
  deleteDoc, onSnapshot, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig, ALLOWED_EMAILS } from "./config.js";

// ---------- Negozi e sezioni ----------
// Per aggiungere un negozio basta aggiungere una riga qui.
const STORES = {
  esselunga: { name: "Esselunga", color: "#0a5aa8", site: "esselunga.it" },
  lidl:      { name: "Lidl",      color: "#e8b400", site: "lidl.it" },
};
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
const catalogCol = collection(db, "catalog"); // prodotti precisi salvati per negozio

// ---------- Stato ----------
let items = [];
let catalog = [];
let user = null;
let unsubs = [];
let currentTab = "spesa";
let invFilter = "all";
let formPlace = "frigo";
let formStore = "";

// ---------- Utility ----------
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const num = (v, def = 0) => { const n = parseFloat(String(v).replace(",", ".")); return Number.isFinite(n) ? n : def; };
const fmt = (n) => (Math.round(n * 100) / 100).toString().replace(".", ",");
const norm = (s) => String(s || "").trim().toLowerCase();
const cap = (s) => s.trim().charAt(0).toUpperCase() + s.trim().slice(1);
const placeOf = (it) => (it.place === "casa" ? "casa" : "frigo");
const slug = (s) => norm(s).replace(/[^a-z0-9àèéìòù]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

function status(it) {
  const q = num(it.qty), low = num(it.low, 1);
  if (q <= 0) return "out";
  if (q <= low) return "low";
  return "ok";
}
const qtyText = (q, unit) => `${fmt(num(q))}${unit ? " " + esc(unit) : ""}`;
const findByName = (name) => items.find((i) => i.nameLower === norm(name));
const storeTag = (key) => STORES[key]
  ? `<span class="store-tag" style="background:${STORES[key].color}">${esc(STORES[key].name)}</span>` : "";
const searchUrl = (store, q) =>
  "https://www.google.com/search?q=" + encodeURIComponent(`${q || ""} site:${STORES[store].site}`.trim());

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
async function rememberProduct(store, base, label) {
  if (!store || !label) return;
  const id = `${store}_${slug(label)}`;
  try {
    await setDoc(doc(db, "catalog", id), stamp({ store, base: norm(base), label, labelLower: norm(label) }));
  } catch (e) { console.error(e); }
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
  unsubs.push(onSnapshot(catalogCol, (snap) => {
    catalog = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderStoreBox();
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
  $("itemNames").innerHTML = items.map((i) => `<option value="${esc(i.name)}">`).join("");
  renderShopping();
  renderInventory();
  renderStoreBox();
}

function shoppingRow(i) {
  const st = status(i);
  const P = PLACES[placeOf(i)];
  return `
    <div class="item">
      <span class="dot ${st}" title="${P.name}: ${qtyText(i.qty, i.unit)}"></span>
      <div class="info">
        <div class="name">${esc(i.name)}</div>
        ${i.product ? `<div class="meta">👉 ${esc(i.product)}</div>` : ""}
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

  if (!list.length) {
    $("shoppingList").innerHTML = `<div class="empty">Lista vuota 🎉</div>`;
  } else {
    // raggruppa per negozio: prima i negozi, poi "ovunque"
    const groups = [...Object.keys(STORES), ""]
      .map((k) => ({ k, rows: list.filter((i) => (STORES[i.store] ? i.store : "") === k) }))
      .filter((g) => g.rows.length);
    $("shoppingList").innerHTML = groups.map((g) => `
      <div class="group-h">
        <span>${g.k ? storeTag(g.k) : "🛍️ Ovunque"} <span style="color:var(--muted);font-weight:600">(${g.rows.length})</span></span>
      </div>
      <div class="list">${g.rows.map(shoppingRow).join("")}</div>`).join("");
  }

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
    .filter((i) => !q || i.nameLower.includes(q) || norm(i.product).includes(q))
    .sort((a, b) => order[status(a)] - order[status(b)] || a.nameLower.localeCompare(b.nameLower));

  $("invList").innerHTML = list.length ? list.map((i) => {
    const st = status(i);
    const label = { ok: "Presente", low: "Sta finendo", out: "Finito" }[st];
    return `
    <div class="item ${st}">
      <div class="info">
        <div class="name">${esc(i.name)} ${i.onList ? "🛒" : ""}${storeTag(i.store)}</div>
        <div class="meta">${label}${i.unit ? " · " + esc(i.unit) : ""}${i.product ? " · " + esc(i.product) : ""}</div>
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

// ---------- Form spesa: A) prodotto  B) negozio sì/no  C) prodotti del negozio ----------
$("storeChips").innerHTML =
  `<button type="button" class="chip active" data-store="">No, ovunque</button>` +
  Object.entries(STORES).map(([k, s]) => `<button type="button" class="chip" data-store="${k}">${esc(s.name)}</button>`).join("");

function setPlace(p) {
  formPlace = p;
  document.querySelectorAll("#placeChips .chip").forEach((c) => c.classList.toggle("active", c.dataset.place === p));
}
function setStore(s) {
  formStore = s;
  document.querySelectorAll("#storeChips .chip").forEach((c) => c.classList.toggle("active", c.dataset.store === s));
  renderStoreBox();
}
document.querySelectorAll("#placeChips .chip").forEach((c) => (c.onclick = () => setPlace(c.dataset.place)));
document.querySelectorAll("#storeChips .chip").forEach((c) => (c.onclick = () => setStore(c.dataset.store)));

function renderStoreBox() {
  const box = $("storeBox");
  box.classList.toggle("hidden", !formStore);
  if (!formStore) return;
  const S = STORES[formStore];
  $("storeName").textContent = S.name;
  const name = norm($("listName").value);
  const words = name.split(/\s+/).filter(Boolean);
  const chosen = norm($("listProduct").value);
  const prods = catalog
    .filter((p) => p.store === formStore)
    .filter((p) => !words.length || p.base === name || words.every((w) => p.labelLower.includes(w)))
    .sort((a, b) => a.labelLower.localeCompare(b.labelLower))
    .slice(0, 30);
  $("catalogChips").innerHTML = prods.length
    ? prods.map((p) => `<button type="button" class="pick ${p.labelLower === chosen ? "active" : ""}" data-pick="${esc(p.label)}">${esc(p.label)}</button>`).join("")
    : `<span class="meta" style="color:var(--muted);font-size:13px">Ancora nessuno: scrivilo qui sotto, la prossima volta lo ritrovi qui.</span>`;
  $("storeSearch").textContent = `🔍 Cerca su ${S.name}`;
  $("storeSearch").href = searchUrl(formStore, $("listProduct").value || $("listName").value);
}

$("listName").addEventListener("input", () => {
  const ex = findByName($("listName").value);
  if (ex) {
    setPlace(placeOf(ex));
    if (ex.store && STORES[ex.store] && !formStore) { setStore(ex.store); }
    if (ex.product && !$("listProduct").value) $("listProduct").value = ex.product;
  }
  renderStoreBox();
});
$("listProduct").addEventListener("input", renderStoreBox);
$("catalogChips").addEventListener("click", (e) => {
  const b = e.target.closest("[data-pick]");
  if (!b) return;
  $("listProduct").value = $("listProduct").value === b.dataset.pick ? "" : b.dataset.pick;
  renderStoreBox();
});

$("addListForm").onsubmit = async (e) => {
  e.preventDefault();
  const name = $("listName").value.trim();
  if (!name) return;
  const qty = num($("listQty").value, 1) || 1;
  const store = formStore;
  const product = store ? $("listProduct").value.trim() : "";
  const existing = findByName(name);
  const extra = { store, product };
  if (existing) {
    await save(existing.id, {
      onList: true, listQty: (existing.onList ? num(existing.listQty) : 0) + qty, ...extra,
    });
  } else {
    await addDoc(itemsCol, stamp({
      name: cap(name), nameLower: norm(name), qty: 0, unit: "", low: 1, place: formPlace,
      onList: true, listQty: qty, ...extra,
    })).catch((err) => toast("Errore: " + err.message));
  }
  rememberProduct(store, name, product);
  toast(`🛒 ${cap(name)} aggiunto${store ? " (" + STORES[store].name + ")" : ""}`);
  $("listName").value = ""; $("listQty").value = 1; $("listProduct").value = "";
  setStore(""); setPlace("frigo");
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
      store: "", product: "", onList: false, listQty: 0,
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
$("eStore").innerHTML = `<option value="">Nessuno</option>` +
  Object.entries(STORES).map(([k, s]) => `<option value="${k}">${esc(s.name)}</option>`).join("");

let editing = null;
function openEdit(it) {
  editing = it;
  $("eName").value = it.name;
  $("eQty").value = num(it.qty);
  $("eUnit").value = it.unit || "";
  $("eLow").value = num(it.low, 1);
  $("ePlace").value = placeOf(it);
  $("eStore").value = STORES[it.store] ? it.store : "";
  $("eProduct").value = it.product || "";
  $("editDialog").showModal();
}
$("editDialog").addEventListener("close", async () => {
  const v = $("editDialog").returnValue;
  const it = editing; editing = null;
  if (!it) return;
  if (v === "ok") {
    const name = $("eName").value.trim() || it.name;
    const store = $("eStore").value;
    const product = $("eProduct").value.trim();
    save(it.id, {
      name: cap(name), nameLower: norm(name),
      qty: Math.max(0, num($("eQty").value)), unit: $("eUnit").value.trim(), low: Math.max(0, num($("eLow").value, 1)),
      place: $("ePlace").value, store, product,
    });
    rememberProduct(store, name, product);
  } else if (v === "delete") {
    if (confirm(`Eliminare "${it.name}" per sempre?`)) {
      await deleteDoc(doc(db, "items", it.id)).catch((err) => toast("Errore: " + err.message));
      toast(`🗑️ ${it.name} eliminato`);
    }
  }
});
