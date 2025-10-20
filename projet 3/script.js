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
 * @param {Object} pokemon - Données du Pokémon (nom, stats, image…)
 * @param {Object} species - Données complémentaires (ex : couleur)
 */
function updateCard(pokemon, species) {
  // Affiche le nom et l’ID du Pokémon
  nameEl.textContent = `${pokemon.name} (#${pokemon.id})`;

  // Affiche l’image officielle
  spriteEl.src = pokemon.sprites.front_default;

  // Affiche les types (ex : feu, eau, plante…)
  typesEl.textContent = "Types: " + pokemon.types.map(t => t.type.name).join(", ");

  // Affiche les statistiques principales (attaque, défense, vitesse…)
  statsEl.textContent = "Stats: " + pokemon.stats.map(s => `${s.stat.name}:${s.base_stat}`).join(", ");

  // Change la couleur de la bordure de la carte selon la couleur de l’espèce
  card.style.borderColor = species.color.name;
}

/**
 * Ajoute un Pokémon à l’historique des recherches
 * @param {string} name - Nom du Pokémon recherché
 */
function addToHistory(name) {
  // Ajoute le nouveau nom au début du tableau
  historyList.unshift(name);

  // Garde uniquement les 10 dernières recherches
  if (historyList.length > 10) historyList.pop();

  // Vide la liste HTML avant de la recréer
  historyEl.innerHTML = "";

  // Crée un <li> pour chaque élément et l’ajoute à la liste
  historyList.forEach(item => {
    let li = document.createElement("li");
    li.textContent = item;
    historyEl.appendChild(li);
  });
}

/**
 * Récupère les données d’un Pokémon à partir de l’API
 * @param {string|number} query - Nom ou ID du Pokémon
 */
async function fetchPokemon(query) {
  // Ne rien faire si la saisie est vide
  if (!query) return;

  // Si le Pokémon est déjà dans le cache, on l’affiche directement
  if (cache.has(query)) {
    statusEl.textContent = "Servi depuis le cache ";
    let {pokemon, species} = cache.get(query);
    updateCard(pokemon, species);
    addToHistory(pokemon.name);
    return;
  }

  // Crée un contrôleur pour pouvoir annuler la requête si besoin
  controller = new AbortController();
  let signal = controller.signal;

  try {
    // Indique à l’utilisateur que le chargement commence
    statusEl.textContent = "Chargement...";

    // Envoie deux requêtes en parallèle :
    // 1️⃣ les infos du Pokémon
    // 2️⃣ les infos de son espèce (pour la couleur, etc.)
    const [pokemonRes, speciesRes] = await Promise.all([
      fetch(`${API_BASE}/pokemon/${query}`, {signal}),
      fetch(`${API_BASE}/pokemon-species/${query}`, {signal})
    ]);

    // Vérifie si les réponses sont valides
    if (!pokemonRes.ok) throw new Error("Pokémon non trouvé !");
    if (!speciesRes.ok) throw new Error("Species non trouvée !");

    // Convertit les réponses en objets JSON
    const pokemon = await pokemonRes.json();
    const species = await speciesRes.json();

    // Enregistre les données dans le cache pour les futures recherches
    cache.set(query, {pokemon, species});

    // Met à jour la carte avec les nouvelles informations
    updateCard(pokemon, species);

    // Ajoute le Pokémon à l’historique
    addToHistory(pokemon.name);

    // Indique que la recherche est terminée avec succès
    statusEl.textContent = "Fini ✅";
  } catch (err) {
    // Si la requête a été annulée
    if (err.name === "AbortError") {
      statusEl.textContent = "Recherche annulée ❌";
    } else {
      // Affiche un message d’erreur général
      statusEl.textContent = "Erreur : " + err.message;
    }
  }
}

/* ----------------------------- */
/* ÉVÉNEMENTS DES BOUTONS        */
/* ----------------------------- */

//  Bouton de recherche
searchBtn.addEventListener("click", () => {
  fetchPokemon(input.value.toLowerCase()); // Lance la recherche avec le texte saisi
});

//  Bouton "Surprise me" — choisit un Pokémon aléatoire (parmi les 151 premiers)
randomBtn.addEventListener("click", () => {
  let randomId = Math.floor(Math.random() * 151) + 1; // ID aléatoire entre 1 et 151
  fetchPokemon(randomId);
});

//  Bouton "Cancel" — annule la requête en cours
cancelBtn.addEventListener("click", () => {
  if (controller) controller.abort();
});
