import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect,
  onAuthStateChanged, signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  initializeFirestore, persistentLocalCache, collection, doc, addDoc, updateDoc,
  deleteDoc, onSnapshot, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig, ALLOWED_EMAILS } from "./config.js";

// ---------- Firebase ----------
const fbApp = initializeApp(firebaseConfig);
const auth = getAuth(fbApp);
// cache locale: l'app si apre anche con poco segnale al supermercato
const db = initializeFirestore(fbApp, { localCache: persistentLocalCache() });
const itemsCol = collection(db, "items");

// ---------- Stato ----------
let items = [];          // tutti gli alimenti
let user = null;
let unsub = null;
let fridgeFilter = "all";

// ---------- Utility ----------
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const num = (v, def = 0) => { const n = parseFloat(String(v).replace(",", ".")); return Number.isFinite(n) ? n : def; };
const fmt = (n) => (Math.round(n * 100) / 100).toString().replace(".", ",");
const norm = (s) => s.trim().toLowerCase();
const cap = (s) => s.trim().charAt(0).toUpperCase() + s.trim().slice(1);

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
  if (unsub) { unsub(); unsub = null; }
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

  unsub = onSnapshot(itemsCol, (snap) => {
    items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    render();
  }, (err) => {
    console.error(err);
    toast("Accesso negato al database: controlla le regole Firestore");
  });
});

// ---------- Tabs ----------
document.querySelectorAll(".tab").forEach((b) => {
  b.onclick = () => {
    document.querySelectorAll(".tab").forEach((x) => x.classList.toggle("active", x === b));
    $("tab-spesa").classList.toggle("hidden", b.dataset.tab !== "spesa");
    $("tab-frigo").classList.toggle("hidden", b.dataset.tab !== "frigo");
  };
});

// ---------- Render ----------
function render() {
  // suggerimenti nomi per i campi di testo
  $("itemNames").innerHTML = items
    .map((i) => `<option value="${esc(i.name)}">`).join("");
  renderShopping();
  renderFridge();
}

function renderShopping() {
  const list = items.filter((i) => i.onList).sort((a, b) => a.nameLower.localeCompare(b.nameLower));
  $("listBadge").textContent = list.length;

  $("shoppingList").innerHTML = list.length ? list.map((i) => {
    const st = status(i);
    return `
    <div class="item">
      <span class="dot ${st}" title="In frigo: ${qtyText(i.qty, i.unit)}"></span>
      <div class="info">
        <div class="name">${esc(i.name)}</div>
        <div class="meta">Da prendere: <b>${qtyText(i.listQty || 1, i.unit)}</b> · in frigo: ${qtyText(i.qty, i.unit)}</div>
      </div>
      <div class="actions">
        <button class="icon buy" data-buy="${i.id}">✓ Comprato</button>
        <button class="icon" data-unlist="${i.id}" title="Togli dalla lista">✕</button>
      </div>
    </div>`;
  }).join("") : `<div class="empty">Lista vuota 🎉</div>`;

  const sugg = items.filter((i) => !i.onList && status(i) !== "ok")
    .sort((a, b) => (status(a) === "out" ? 0 : 1) - (status(b) === "out" ? 0 : 1) || a.nameLower.localeCompare(b.nameLower));
  $("suggPanel").classList.toggle("hidden", sugg.length === 0);
  $("suggestions").innerHTML = sugg.map((i) =>
    `<button data-sugg="${i.id}"><span class="dot ${status(i)}" style="display:inline-block;width:9px;height:9px;margin-right:5px"></span>+ ${esc(i.name)}</button>`
  ).join("");
}

function renderFridge() {
  const order = { out: 0, low: 1, ok: 2 };
  const counts = { ok: 0, low: 0, out: 0 };
  items.forEach((i) => counts[status(i)]++);
  $("cOk").textContent = counts.ok; $("cLow").textContent = counts.low; $("cOut").textContent = counts.out;

  const q = norm($("search").value || "");
  const list = items
    .filter((i) => fridgeFilter === "all" || status(i) === fridgeFilter)
    .filter((i) => !q || i.nameLower.includes(q))
    .sort((a, b) => order[status(a)] - order[status(b)] || a.nameLower.localeCompare(b.nameLower));

  $("fridgeList").innerHTML = list.length ? list.map((i) => {
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
  }).join("") : `<div class="empty">${items.length ? "Nessun risultato" : "Il frigo è vuoto. Aggiungi qualcosa sopra!"}</div>`;
}

$("search").oninput = renderFridge;
document.querySelectorAll("#filters .chip").forEach((c) => {
  c.onclick = () => {
    fridgeFilter = c.dataset.f;
    document.querySelectorAll("#filters .chip").forEach((x) => x.classList.toggle("active", x === c));
    renderFridge();
  };
});

// ---------- Aggiungi alla spesa ----------
$("addListForm").onsubmit = async (e) => {
  e.preventDefault();
  const name = $("listName").value.trim();
  if (!name) return;
  const qty = num($("listQty").value, 1) || 1;
  const existing = findByName(name);
  if (existing) {
    await save(existing.id, { onList: true, listQty: (existing.onList ? num(existing.listQty) : 0) + qty });
  } else {
    await addDoc(itemsCol, stamp({
      name: cap(name), nameLower: norm(name), qty: 0, unit: "", low: 1, onList: true, listQty: qty,
    })).catch((err) => toast("Errore: " + err.message));
  }
  toast(`🛒 ${cap(name)} aggiunto alla lista`);
  $("listName").value = ""; $("listQty").value = 1; $("listName").focus();
};

// ---------- Aggiungi al frigo ----------
$("addFridgeForm").onsubmit = async (e) => {
  e.preventDefault();
  const name = $("fName").value.trim();
  if (!name) return;
  const qty = num($("fQty").value, 0);
  const unit = $("fUnit").value.trim();
  const low = num($("fLow").value, 1);
  const existing = findByName(name);
  if (existing) {
    await save(existing.id, { qty: num(existing.qty) + qty, ...(unit && { unit }), low });
    toast(`🧊 ${existing.name}: +${fmt(qty)}`);
  } else {
    await addDoc(itemsCol, stamp({
      name: cap(name), nameLower: norm(name), qty, unit, low, onList: false, listQty: 0,
    })).catch((err) => toast("Errore: " + err.message));
    toast(`🧊 ${cap(name)} aggiunto al frigo`);
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
  $("buyDialog").showModal();
  $("buyQty").select();
}
$("buyMinus").onclick = () => { $("buyQty").value = Math.max(0, num($("buyQty").value) - 1); };
$("buyPlus").onclick = () => { $("buyQty").value = num($("buyQty").value) + 1; };
$("buyDialog").addEventListener("close", () => {
  if ($("buyDialog").returnValue === "ok" && buying) {
    const n = num($("buyQty").value, 0);
    save(buying.id, { qty: num(buying.qty) + n, onList: false, listQty: 0 });
    toast(`🧊 ${buying.name}: +${fmt(n)} in frigo`);
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
    });
  } else if (v === "delete") {
    if (confirm(`Eliminare "${it.name}" per sempre?`)) {
      await deleteDoc(doc(db, "items", it.id)).catch((err) => toast("Errore: " + err.message));
      toast(`🗑️ ${it.name} eliminato`);
    }
  }
});
