# 🛒🧊 Spesa & Frigo

App privata per due persone: lista della spesa, "comprato" con la quantità, e situazione del frigo
(🟢 presente, 🟡 sta finendo, 🔴 finito). Si aggiorna in tempo reale su entrambi i telefoni.

- `spesa/` – l'app (HTML + JS, niente da installare)
- `spesa/config.js` – **l'unico file da modificare**
- `firestore.rules` – le regole che fanno entrare solo voi due
- `index.html` – la pagina di San Valentino (resta com'era)

## Come funziona la privacy
Login con Google + database Firebase. Le regole del database accettano **solo le vostre due email**:
chiunque altro apra il sito vede la pagina di login, e anche se entra con Google riceve "permesso negato"
e non vede né modifica nulla. Firebase è gratuito per questo uso.

## Setup (una volta sola, ~10 minuti)

### 1. Crea il progetto Firebase
1. Vai su https://console.firebase.google.com → **Aggiungi progetto** (Google Analytics: puoi disattivarlo).
2. Menu **Build → Authentication → Inizia → Google → Attiva** → Salva.
3. Menu **Build → Firestore Database → Crea database** → scegli `eur3 (europe-west)` → modalità **produzione**.
4. Sempre in Firestore, scheda **Regole**: incolla il contenuto di `firestore.rules`
   **con le vostre due email** (minuscolo) e premi **Pubblica**.

### 2. Collega l'app
1. Impostazioni progetto (⚙️) → **Le tue app** → icona **`</>`** (Web) → dai un nome → Registra.
2. Copia l'oggetto `firebaseConfig` che ti mostra e incollalo in `spesa/config.js`.
3. Nello stesso file metti le vostre due email in `ALLOWED_EMAILS`.

### 3. Pubblica il sito con GitHub Pages
1. Fai commit/push delle modifiche su `main`.
2. Su GitHub: **Settings → Pages → Source: Deploy from a branch → `main` / `(root)`** → Save.
3. Dopo un minuto il sito è su `https://stelioromagnoli1-oss.github.io/valentine/spesa/`
   (la pagina di San Valentino resta su `.../valentine/`).
4. Torna su Firebase → **Authentication → Impostazioni → Domini autorizzati → Aggiungi dominio** →
   `stelioromagnoli1-oss.github.io`.

### 4. Sul telefono
Apri il link, entra con Google, poi **Condividi → Aggiungi a Home** (iPhone) o
**⋮ → Aggiungi a schermata Home** (Android): sembrerà un'app vera.

## Uso
- **🛒 Spesa**: scrivi cosa serve e quanto. Al supermercato premi **✓ Comprato**, scegli quante ne hai
  prese e finiscono direttamente nel frigo. Sopra trovi i suggerimenti degli alimenti finiti/quasi finiti.
- **Negozio**: quando aggiungi alla spesa puoi scegliere Esselunga o Lidl (o "ovunque") e scrivere il
  prodotto preciso. Viene ricordato: la volta dopo lo ritrovi tra i "prodotti già scelti" di quel negozio.
  "🔍 Cerca" apre una ricerca sul sito del negozio. La lista è divisa per negozio.
  Per aggiungere altri negozi: modifica `STORES` in cima a `spesa/app.js`.
- **🧊 Frigo / 🏠 Casa**: `+` / `−` quando usate o aggiungete qualcosa. "Pochi se ≤" decide quando un alimento
  diventa giallo (es. Uova → 2). Con ✎ modifichi nome, unità, soglia o elimini.

> Nota: i valori in `config.js` non sono segreti (Firebase è fatto così), quindi va bene anche se
> il repository è pubblico. La sicurezza la fanno le regole di Firestore.
