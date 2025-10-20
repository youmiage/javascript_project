// ---------------------------------------------------------
// Récupération des éléments HTML
// ---------------------------------------------------------
const displayEl = document.getElementById("display");   // Écran de la calculatrice
const keysEl = document.getElementById("keys");         // Zone contenant les boutons
const historyEl = document.getElementById("history");   // Liste d’historique des opérations
const wrapperEl = document.getElementById("wrapper");   // Conteneur principal (pour démo bubbling)

// ---------------------------------------------------------
// État interne de la calculatrice (variables globales)
// ---------------------------------------------------------
let state = {
  current: "0",        // Nombre actuellement affiché
  previous: null,      // Nombre précédent (avant opération)
  operator: null,      // Opérateur choisi (+, -, ×, ÷)
  overwrite: false,    // Indique si la prochaine saisie doit écraser l’affichage
  history: []          // Historique des calculs effectués
};

// ---------------------------------------------------------
// DÉMONSTRATION : Propagation des événements (bubbling / capturing)
// ---------------------------------------------------------
wrapperEl.addEventListener("click", () => console.log("bubble wrapper")); 
// Événement en phase de "bubbling" (par défaut) — remonte après le clic

wrapperEl.addEventListener("click", () => {}, { capture: true }); 
// Exemple vide en phase de "capture" (descend avant les enfants)

wrapperEl.addEventListener("click", (e) => console.log("capture wrapper"), { capture: true });
// Celui-ci montre dans la console la phase de capture

// ---------------------------------------------------------
// FONCTIONS UTILITAIRES (Helpers)
// ---------------------------------------------------------

// Met à jour l’écran d’affichage avec la valeur courante
function updateDisplay() {
  displayEl.textContent = state.current;
}

// Formate un nombre pour l’affichage (supprime les zéros inutiles, etc.)
function formatNumber(n) {
  let num = parseFloat(n);
  if (isNaN(num)) return "0";
  let str = num.toPrecision(12).replace(/\.?0+$/,"");
  if (str.length > 12) str = num.toExponential(6); // Notation scientifique si trop long
  return str;
}

// Ajoute une entrée à l’historique
function pushHistory(entry) {
  state.history.push(entry);
  if (state.history.length > 5) state.history.shift(); // Garde uniquement les 5 derniers
  renderHistory();
}

// Met à jour la liste visuelle de l’historique
function renderHistory() {
  historyEl.innerHTML = "";
  state.history.forEach(h => {
    const li = document.createElement("li");
    li.textContent = h;
    historyEl.appendChild(li);
  });
}

// ---------------------------------------------------------
// Gestion de la saisie des chiffres et du point décimal
// ---------------------------------------------------------
function inputDigit(d) {
  // Si on écrase la valeur (nouveau calcul) ou que l’écran affiche "0"
  if (state.overwrite || state.current === "0") {
    state.current = d === "." ? "0." : d; // Ajoute "0." si l’utilisateur tape juste un point
    state.overwrite = false;
  } 
  // Si l’utilisateur essaie d’ajouter un deuxième point → on ignore
  else if (d === "." && state.current.includes(".")) {
    return;
  } 
  // Sinon, on ajoute le chiffre à la suite
  else {
    state.current += d;
  }
  updateDisplay();
}

// ---------------------------------------------------------
// Gestion des opérateurs et du bouton "="
// ---------------------------------------------------------

// Choisit un opérateur (+, -, ×, ÷)
function chooseOperator(op) {
  // Si un opérateur était déjà choisi, on évalue d’abord le calcul en cours
  if (state.operator && state.previous !== null) {
    evaluate();
  }
  // Stocke la valeur actuelle comme "previous"
  state.previous = state.current;
  state.operator = op;
  state.overwrite = true; // Le prochain chiffre écrasera l’affichage
}

// Effectue le calcul selon l’opérateur choisi
function evaluate() {
  // Vérifie qu’un opérateur et une valeur précédente existent
  if (!state.operator || !state.previous) return;

  let a = parseFloat(state.previous);
  let b = parseFloat(state.current);
  let result = 0;

  // Effectue le calcul selon l’opérateur
  switch(state.operator){
    case "+": result = a + b; break;
    case "-": result = a - b; break;
    case "×": result = a * b; break;
    case "÷": result = b === 0 ? "Error" : a / b; break; // Gère la division par zéro
  }

  // Ajoute le calcul dans l’historique
  const entry = `${state.previous} ${state.operator} ${state.current} = ${result}`;
  pushHistory(entry);

  // Met à jour l’état
  state.current = String(result);
  state.previous = null;
  state.operator = null;
  state.overwrite = true;
  updateDisplay();
}

// ---------------------------------------------------------
// Commandes spéciales (AC, CE, ±, %)
// ---------------------------------------------------------
function handleCommand(cmd) {
  switch(cmd){
    case "AC": // Réinitialiser complètement
      state.current = "0";
      state.previous = null;
      state.operator = null;
      state.overwrite = false;
      break;

    case "CE": // Efface seulement la saisie courante
      state.current = "0";
      state.overwrite = true;
      break;

    case "neg": // Change le signe du nombre
      state.current = String(parseFloat(state.current) * -1);
      break;

    case "pct": // Convertit en pourcentage
      state.current = String(parseFloat(state.current) / 100);
      break;
  }
  updateDisplay();
}

// ---------------------------------------------------------
// Délégation d’événements : gestion de tous les clics sur les boutons
// ---------------------------------------------------------
keysEl.addEventListener("click", (event) => {
  const button = event.target.closest("button"); // Trouve le bouton cliqué
  if (!button) return; // Ignore si ce n’est pas un bouton

  const type = button.dataset.type;   // digit / op / eq / cmd
  const value = button.dataset.value; // Valeur du bouton

  if (type === "digit") inputDigit(value);         // Chiffres ou point
  else if (type === "op") {                        // Opérateurs
    chooseOperator(value);
    event.stopPropagation(); // Empêche la propagation pour la démo (bubbling)
  }
  else if (type === "eq") evaluate();              // Bouton "="
  else if (type === "cmd") handleCommand(value);   // Commandes spéciales
});

// ---------------------------------------------------------
//  Support du clavier (saisie via touches du clavier)
// ---------------------------------------------------------
document.addEventListener("keydown", (e) => {
  if (/\d/.test(e.key)) inputDigit(e.key);        // Si c’est un chiffre
  else if (e.key === ".") inputDigit(".");        // Point décimal
  else if (["+", "-", "*", "/"].includes(e.key)) {
    // Mappe les opérateurs clavier vers les symboles utilisés à l’écran
    const map = { "*":"×", "/":"÷" };
    chooseOperator(map[e.key] || e.key);
  }
  else if (e.key === "Enter") evaluate();         // Touche Entrée = Égal
  else if (e.key === "Backspace") handleCommand("CE"); // Efface la saisie
  else if (e.key === "Escape") handleCommand("AC");    // Réinitialise tout
});
