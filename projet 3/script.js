// URL de base de l’API Pokémon
const API_BASE = "https://pokeapi.co/api/v2";

// Récupération des éléments HTML par leur ID
const input = document.getElementById("q");
const searchBtn = document.getElementById("searchBtn");
const randomBtn = document.getElementById("randomBtn");
const cancelBtn = document.getElementById("cancelBtn");
const statusEl = document.getElementById("status");
const card = document.getElementById("card");
const nameEl = document.getElementById("name");
const spriteEl = document.getElementById("sprite");
const typesEl = document.getElementById("types");
const statsEl = document.getElementById("stats");
const historyEl = document.getElementById("history");

// Variables globales
let controller = null;      // Permet d’annuler une requête en cours
let cache = new Map();      // Stocke les Pokémon déjà chargés pour éviter de refaire les requêtes
let historyList = [];       // Liste des dernières recherches

/**
 * Met à jour la carte avec les informations du Pokémon
 */
function updateCard(pokemon, species) {
  nameEl.textContent = `${pokemon.name} (#${pokemon.id})`;
  spriteEl.src = pokemon.sprites.front_default;
  typesEl.textContent = "Types: " + pokemon.types.map(t => t.type.name).join(", ");
  statsEl.textContent = "Stats: " + pokemon.stats.map(s => `${s.stat.name}:${s.base_stat}`).join(", ");
  card.style.borderColor = species.color.name;
}

/**
 * Ajoute un Pokémon à l’historique
 */
function addToHistory(name) {
  historyList.unshift(name);
  if (historyList.length > 10) historyList.pop();

  historyEl.innerHTML = "";
  historyList.forEach(item => {
    let li = document.createElement("li");
    li.textContent = item;
    historyEl.appendChild(li);
  });
}

/**
 * Récupère les données d’un Pokémon à partir de l’API
 */
async function fetchPokemon(query) {
  if (!query) return;

  if (cache.has(query)) {
    statusEl.textContent = "Servi depuis le cache ✅";
    let {pokemon, species} = cache.get(query);
    updateCard(pokemon, species);
    addToHistory(pokemon.name);
    return;
  }

  controller = new AbortController();
  let signal = controller.signal;

  try {
    statusEl.textContent = "Chargement...";

    const [pokemonRes, speciesRes] = await Promise.all([
      fetch(`${API_BASE}/pokemon/${query}`, {signal}),
      fetch(`${API_BASE}/pokemon-species/${query}`, {signal})
    ]);

    if (!pokemonRes.ok) throw new Error("Pokémon non trouvé !");
    if (!speciesRes.ok) throw new Error("Espèce non trouvée !");

    const pokemon = await pokemonRes.json();
    const species = await speciesRes.json();

    cache.set(query, {pokemon, species});
    updateCard(pokemon, species);
    addToHistory(pokemon.name);
    statusEl.textContent = "Fini ✅";
  } catch (err) {
    if (err.name === "AbortError") {
      statusEl.textContent = "Recherche annulée ❌";
    } else {
      statusEl.textContent = "Erreur : " + err.message;
    }
  }
}

/* ----------------------------- */
/* ÉVÉNEMENTS DES BOUTONS        */
/* ----------------------------- */

searchBtn.addEventListener("click", () => {
  fetchPokemon(input.value.toLowerCase());
});

randomBtn.addEventListener("click", () => {
  let randomId = Math.floor(Math.random() * 151) + 1;
  fetchPokemon(randomId);
});

cancelBtn.addEventListener("click", () => {
  if (controller) controller.abort();
});

/* ----------------------------- */
/* TESTS CONSOLE AUTOMATIQUES 🧪 */
/* ----------------------------- */
console.log("===== DÉMARRAGE DES TESTS =====");

// Test 1 : ajout à l’historique
console.log("Test: ajout de 'pikachu' à l’historique...");
addToHistory("pikachu");
console.log("Historique attendu: [pikachu]");
console.log("Historique réel:", historyList);

// Test 2 : mise à jour de la carte avec un Pokémon fictif
console.log("Test: updateCard() avec un faux Pokémon...");
const fakePokemon = {
  id: 25,
  name: "pikachu",
  sprites: { front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png" },
  types: [{type: {name: "electric"}}],
  stats: [{stat: {name: "speed"}, base_stat: 90}]
};
const fakeSpecies = { color: { name: "yellow" } };
updateCard(fakePokemon, fakeSpecies);
console.log("Affichage:", nameEl.textContent, "| Couleur de bordure:", card.style.borderColor);

// Test 3 : vérification du cache
console.log("Test: ajout au cache...");
cache.set("pikachu", {pokemon: fakePokemon, species: fakeSpecies});
console.log("Cache contient pikachu ?", cache.has("pikachu"));

// Test 4 : récupération réelle d’un Pokémon (asynchrone)
console.log("Test: récupération réelle de 'bulbasaur' (attendre 1-2s)...");
fetchPokemon("bulbasaur").then(() => {
  console.log("Pokémon chargé:", nameEl.textContent);
  console.log("Cache contient bulbasaur ?", cache.has("bulbasaur"));
});

console.log("===== FIN DES TESTS INITIAUX =====");
