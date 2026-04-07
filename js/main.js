/**
 * main.js — Point d'entrée et orchestrateur de l'application.
 *
 * Ce module gère :
 *  - Le chargement des données (fetch JSON).
 *  - L'état global de l'application (recettes, critères, requête).
 *  - L'initialisation et la liaison des dropdowns de filtres.
 *  - Les écouteurs d'événements (recherche principale, tags, fermeture globale).
 *
 * Il délègue la logique de filtrage à `filtre.js` et le rendu DOM à `rendu.js`.
 */

import {
  filtrerRecettes,
  extraireValeursParType,
  estDejaSelectionne,
  normaliserTexte,
} from "./filtre.js";

import {
  afficherRecettes,
  remplirListeOptions,
  afficherTagsSelectionnes,
  ouvrirDropdown,
  fermerDropdown,
} from "./rendu.js";

// ── Configuration ────────────────────────────────────────────────────────────

/**
 * Définit les trois types de filtres disponibles dans l'interface.
 * Chaque entrée associe un type logique (utilisé pour le filtrage),
 * un label affiché à l'utilisateur et le sélecteur CSS du bouton déclencheur.
 */
const CONFIGS_FILTRES = [
  { type: "ingredient", label: "Ingrédients", btnId: "btn-ingredients", dropdownId: "dropdown-ingredients", searchId: "search-ingredients", clearId: "clear-ingredients", listId: "list-ingredients" },
  { type: "appliance",  label: "Appareils",   btnId: "btn-appliances",  dropdownId: "dropdown-appliances",  searchId: "search-appliances",  clearId: "clear-appliances",  listId: "list-appliances"  },
  { type: "ustensil",   label: "Ustensiles",  btnId: "btn-ustensils",   dropdownId: "dropdown-ustensils",   searchId: "search-ustensils",   clearId: "clear-ustensils",   listId: "list-ustensils"   },
];

// ── État de l'application ────────────────────────────────────────────────────

/**
 * Source de vérité unique pour l'état de l'interface.
 * Toutes les mises à jour passent par cet objet, ce qui facilite le débogage
 * et garantit la cohérence entre les différents composants visuels.
 *
 * @type {{
 *   toutesRecettes:      Object[],    // Données brutes chargées une seule fois
 *   criteresSelectionnes: { type: string, value: string }[], // Filtres actifs
 *   requeteRecherche:    string,      // Texte courant de la barre de recherche
 *   dropdownOuvert:      HTMLElement|null, // Panneau dropdown actuellement ouvert
 *   dropdowns:           Object[],    // Métadonnées de chaque dropdown instancié
 * }}
 */
const etat = {
  toutesRecettes: [],
  criteresSelectionnes: [],
  requeteRecherche: "",
  dropdownOuvert: null,
  dropdowns: [],
};

// ── Fonctions de mise à jour ─────────────────────────────────────────────────

/**
 * Recalcule les recettes filtrées et met à jour l'ensemble de l'interface :
 * grille de recettes, compteur et tags sélectionnés.
 * À appeler après chaque modification de `etat.criteresSelectionnes`
 * ou `etat.requeteRecherche`.
 */
function mettreAJour() {
  const filtrees = filtrerRecettes(
    etat.toutesRecettes,
    etat.criteresSelectionnes,
    etat.requeteRecherche
  );
  afficherRecettes(filtrees, etat.requeteRecherche);
  afficherTagsSelectionnes(
    etat.criteresSelectionnes,
    document.getElementById("recipes-selected-list")
  );
}

/**
 * Rafraîchit la liste d'options d'un dropdown spécifique en tenant compte
 * de la recherche locale (saisie dans ce dropdown) et des critères actifs.
 * Les options déjà sélectionnées sont affichées en tête de liste ;
 * les autres sont filtrées selon la saisie dans la barre du dropdown.
 * @param {{ config: Object, searchInput: HTMLInputElement, liste: HTMLUListElement }} dd
 *   Objet représentant un dropdown instancié.
 */
function rafraichirOptions(dd) {
  // On filtre d'abord les recettes selon l'état global pour ne proposer
  // que les options cohérentes avec les autres filtres actifs
  const filtrees = filtrerRecettes(
    etat.toutesRecettes,
    etat.criteresSelectionnes,
    etat.requeteRecherche
  );
  const toutesOptions = extraireValeursParType(filtrees, dd.config.type);

  // Filtre secondaire : correspond à la saisie locale dans ce dropdown
  const rechercheLocale = normaliserTexte(dd.searchInput.value);
  const optionsFiltrees = rechercheLocale
    ? toutesOptions.filter((o) => normaliserTexte(o).includes(rechercheLocale))
    : toutesOptions;

  // Sépare les options sélectionnées des options disponibles pour ce type
  const selectionnesParType = etat.criteresSelectionnes.filter(
    (c) => c.type === dd.config.type
  );
  const disponibles = optionsFiltrees.filter(
    (opt) => !estDejaSelectionne(etat.criteresSelectionnes, dd.config.type, opt)
  );

  remplirListeOptions(dd.liste, selectionnesParType, disponibles);
}

// ── Gestion du dropdown ouvert ───────────────────────────────────────────────

/**
 * Ferme le dropdown actuellement ouvert, s'il y en a un.
 * Centralise la logique de fermeture pour éviter les incohérences d'état.
 */
function fermerMenuOuvert() {
  if (!etat.dropdownOuvert) return;
  fermerDropdown(etat.dropdownOuvert);
  etat.dropdownOuvert = null;
}

/**
 * Ferme le menu précédemment ouvert (le cas échéant), puis ouvre `dd`.
 * Réinitialise également la barre de recherche interne du dropdown
 * et déplace le focus sur celle-ci pour faciliter la navigation clavier.
 * @param {{ dropdown: HTMLElement, searchInput: HTMLInputElement, boutonEffacer: HTMLElement }} dd
 *   Objet représentant le dropdown à ouvrir.
 */
function ouvrirMenu(dd) {
  fermerMenuOuvert(); // S'assure qu'un seul dropdown est ouvert à la fois
  ouvrirDropdown(dd.dropdown);
  etat.dropdownOuvert = dd.dropdown;
  dd.searchInput.value = "";
  dd.boutonEffacer.classList.add("hidden");
  rafraichirOptions(dd);
  dd.searchInput.focus();
}

// ── Initialisation ───────────────────────────────────────────────────────────

/**
 * Point d'entrée principal de l'application.
 * Charge les données JSON, construit les dropdowns dynamiquement puis
 * attache tous les écouteurs d'événements nécessaires au fonctionnement
 * de la recherche et des filtres.
 */
async function initialiserApp() {
  // Chargement unique des données — la liste brute ne change jamais après ça
  const reponse = await fetch("./data/recipes.json");
  etat.toutesRecettes = await reponse.json();

  // ── Liaison des dropdowns (structure déjà présente dans le HTML) ────────
  // Les éléments sont interrogés par id — aucune création dynamique de DOM.

  for (const config of CONFIGS_FILTRES) {
    const btn         = document.getElementById(config.btnId);
    const dropdown    = document.getElementById(config.dropdownId);
    const searchInput = document.getElementById(config.searchId);
    const boutonEffacer = document.getElementById(config.clearId);
    const liste       = document.getElementById(config.listId);

    if (!btn || !dropdown || !searchInput || !boutonEffacer || !liste) continue;

    // Regroupement des références utiles pour ce dropdown
    const dd = { config, btn, dropdown, liste, searchInput, boutonEffacer };
    etat.dropdowns.push(dd);

    // Bouton du filtre : bascule ouverture/fermeture
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // Empêche la fermeture globale via le clic sur document
      if (dropdown.classList.contains("block")) {
        fermerMenuOuvert();
      } else {
        ouvrirMenu(dd);
      }
    });

    // Filtrage en temps réel des options selon la saisie dans le dropdown
    searchInput.addEventListener("input", (e) => {
      e.stopPropagation();
      boutonEffacer.classList.toggle("hidden", searchInput.value === "");
      rafraichirOptions(dd);
    });

    // Empêche le clic sur l'input de fermer le dropdown via la bulle d'événement
    searchInput.addEventListener("click", (e) => e.stopPropagation());

    // Réinitialise la recherche interne et remet le focus sur l'input
    boutonEffacer.addEventListener("click", (e) => {
      e.stopPropagation();
      searchInput.value = "";
      boutonEffacer.classList.add("hidden");
      rafraichirOptions(dd);
      searchInput.focus();
    });

    // Délégation d'événement : un seul listener pour toutes les options `<li>`
    liste.addEventListener("click", (e) => {
      e.stopPropagation();
      const li = e.target.closest("[data-option-valeur]");
      if (!li) return; // Clic en dehors d'une option valide

      const valeur = li.dataset.optionValeur;
      const dejaSelectionne = li.dataset.optionSelectionne === "true";

      if (dejaSelectionne) {
        // Désélection : retire le critère de la liste
        const idx = etat.criteresSelectionnes.findIndex(
          (c) =>
            c.type === config.type &&
            normaliserTexte(c.value) === normaliserTexte(valeur)
        );
        if (idx !== -1) etat.criteresSelectionnes.splice(idx, 1);
      } else {
        // Sélection : ajoute le critère et ferme le dropdown
        etat.criteresSelectionnes.push({ type: config.type, value: valeur });
        fermerMenuOuvert();
      }

      mettreAJour();
      rafraichirOptions(dd); // Rafraîchit les options pour refléter la nouvelle sélection
    });
  }

  // ── Barre de recherche principale ────────────────────────────────────────

  const champRecherche = document.getElementById("recipe-search-input");
  const formulaireRecherche = document.getElementById("recipe-search-form");

  // Déclenche la recherche à partir de 3 caractères ou lors d'une réinitialisation
  champRecherche.addEventListener("input", () => {
    const valeur = champRecherche.value;
    if (valeur.length === 0 || valeur.length >= 3) {
      etat.requeteRecherche = valeur;
      mettreAJour();
    }
  });

  // Soumission du formulaire (touche Entrée) : force la mise à jour immédiate
  formulaireRecherche.addEventListener("submit", (e) => {
    e.preventDefault();
    etat.requeteRecherche = champRecherche.value;
    mettreAJour();
  });

  // ── Suppression de tags ───────────────────────────────────────────────────

  // Délégation d'événement : un seul listener pour tous les boutons de retrait de tag
  document.getElementById("recipes-selected-list").addEventListener("click", (e) => {
    const boutonRetirer = e.target.closest("[data-tag-retirer]");
    if (!boutonRetirer) return;

    const valeur = boutonRetirer.dataset.tagRetirer;
    const idx = etat.criteresSelectionnes.findIndex(
      (c) => normaliserTexte(c.value) === normaliserTexte(valeur)
    );
    if (idx !== -1) etat.criteresSelectionnes.splice(idx, 1);
    mettreAJour();
  });

  // ── Fermeture globale ─────────────────────────────────────────────────────

  // Ferme le dropdown ouvert lorsque l'utilisateur clique en dehors
  document.addEventListener("click", () => fermerMenuOuvert());

  // Ferme le dropdown ouvert via la touche Échap (accessibilité clavier)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fermerMenuOuvert();
  });

  // ── Rendu initial ─────────────────────────────────────────────────────────

  // Affiche toutes les recettes sans filtre au chargement de la page
  mettreAJour();
}

initialiserApp();
