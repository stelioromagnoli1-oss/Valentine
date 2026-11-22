// =====================================================================
//  CONFIGURAZIONE — modifica SOLO questo file (vedi README.md)
// =====================================================================

// 1) Incolla qui la configurazione che Firebase ti dà quando registri
//    la "Web app" (Impostazioni progetto → Le tue app → Configurazione SDK).
//    Questi valori NON sono segreti: la protezione vera la fanno le regole
//    di Firestore (file firestore.rules).
export const firebaseConfig = {
  apiKey: "AIzaSyBYXhHGk5HKmJUUDl87OEE42MS8qbf2ZrE",
  authDomain: "spesa-casina.firebaseapp.com",
  projectId: "spesa-casina",
  storageBucket: "spesa-casina.firebasestorage.app",
  messagingSenderId: "430676540130",
  appId: "1:430676540130:web:77d53235e28080cbb7bcbb",
};

// 2) Le due email Google che possono entrare (tutto minuscolo).
//    DEVONO essere le stesse scritte in firestore.rules.
export const ALLOWED_EMAILS = [
  "stelioromagnoli1@gmail.com",
  "michelleangrisanii@gmail.com",
];
