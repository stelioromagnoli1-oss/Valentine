// =====================================================================
//  CONFIGURAZIONE — modifica SOLO questo file (vedi README.md)
// =====================================================================

// 1) Incolla qui la configurazione che Firebase ti dà quando registri
//    la "Web app" (Impostazioni progetto → Le tue app → Configurazione SDK).
//    Questi valori NON sono segreti: la protezione vera la fanno le regole
//    di Firestore (file firestore.rules).
export const firebaseConfig = {
  apiKey: "INCOLLA_QUI",
  authDomain: "INCOLLA_QUI.firebaseapp.com",
  projectId: "INCOLLA_QUI",
  storageBucket: "INCOLLA_QUI.appspot.com",
  messagingSenderId: "INCOLLA_QUI",
  appId: "INCOLLA_QUI",
};

// 2) Le due email Google che possono entrare (tutto minuscolo).
//    DEVONO essere le stesse scritte in firestore.rules.
export const ALLOWED_EMAILS = [
  "stelioromagnoli1@gmail.com",
  "michelleangrisanii@gmail.com",
];
