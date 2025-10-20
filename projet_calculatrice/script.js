// ===============================
// VARIABLES ET ÉTAT
// ===============================
const displayElement = document.getElementById("display");
const keysElement = document.getElementById("keys");
const historyElement = document.getElementById("history");

let currentInput = "";
let previousInput = "";
let operator = null;
let history = [];

// ===============================
// FONCTIONS PRINCIPALES
// ===============================

// Met à jour l’affichage
function updateDisplay(value) {
  displayElement.textContent = value;
}

// Effectue un calcul entre deux nombres
function calculate(a, b, operator) {
  a = parseFloat(a);
  b = parseFloat(b);
  switch (operator) {
    case "+": return a + b;
    case "-": return a - b;
    case "×": return a * b;
    case "÷": return b !== 0 ? a / b : "Erreur";
    default: return b;
  }
}

// Ajoute une opération à l’historique
function addToHistory(entry) {
  history.push(entry);
  if (historyElement) {
    const li = document.createElement("li");
    li.textContent = entry;
    historyElement.appendChild(li);
  }
}

// ===============================
// TESTS DE FONCTIONS
// ===============================
console.log("===== TESTS DES FONCTIONS =====");

// Test de la fonction `calculate`
console.log("5 + 3 =", calculate(5, 3, "+")); // attendu : 8
console.log("10 - 2 =", calculate(10, 2, "-")); // attendu : 8
console.log("4 × 7 =", calculate(4, 7, "×")); // attendu : 28
console.log("20 ÷ 5 =", calculate(20, 5, "÷")); // attendu : 4
console.log("20 ÷ 0 =", calculate(20, 0, "÷")); // attendu : "Erreur"

// Test de l’ajout à l’historique
addToHistory("5 + 3 = 8");
addToHistory("10 - 2 = 8");
console.log("Historique actuel :", history); // attendu : ["5 + 3 = 8", "10 - 2 = 8"]

// Test du signe négatif
currentInput = "5";
currentInput = (-parseFloat(currentInput)).toString();
console.log("Négation de 5 =", currentInput); // attendu : "-5"

// Test du format d’affichage
updateDisplay("42");
console.log("Affichage mis à jour (devrait être 42) :", displayElement.textContent);

// ===============================
// GESTION DES ÉVÉNEMENTS CLAVIER ET CLICS
// ===============================
if (keysElement) {
  keysElement.addEventListener("click", (e) => {
    const key = e.target;
    const type = key.dataset.type;
    const value = key.dataset.value;

    if (!type) return;

    switch (type) {
      case "digit":
        currentInput += value;
        updateDisplay(currentInput);
        break;

      case "op":
        if (previousInput && operator && currentInput) {
          const result = calculate(previousInput, currentInput, operator);
          addToHistory(`${previousInput} ${operator} ${currentInput} = ${result}`);
          previousInput = result;
          currentInput = "";
          updateDisplay(result);
        } else {
          previousInput = currentInput;
          currentInput = "";
        }
        operator = value;
        break;

      case "eq":
        if (previousInput && operator && currentInput) {
          const result = calculate(previousInput, currentInput, operator);
          addToHistory(`${previousInput} ${operator} ${currentInput} = ${result}`);
          updateDisplay(result);
          previousInput = "";
          currentInput = result.toString();
          operator = null;
        }
        break;

      case "cmd":
        if (value === "AC") {
          currentInput = "";
          previousInput = "";
          operator = null;
          updateDisplay("0");
        } else if (value === "CE") {
          currentInput = currentInput.slice(0, -1);
          updateDisplay(currentInput || "0");
        } else if (value === "neg") {
          currentInput = (-parseFloat(currentInput) || 0).toString();
          updateDisplay(currentInput);
        }
        break;
    }
  });
}
