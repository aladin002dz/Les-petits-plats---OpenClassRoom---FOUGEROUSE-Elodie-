/**
 * filtre.js — Fonctions pures de filtrage et de normalisation.
 *
 * Aucune dépendance au DOM. Toutes les fonctions prennent des
 * primitives, objets ou tableaux et retournent le même type.
 */

// ── Normalisation de texte ───────────────────────────────────────────────────

/**
 * Supprime les espaces superflus et met en minuscules.
 * @param {string} texte
 * @returns {string}
 */
export function normaliserTexte(texte) {
  return texte.trim().toLowerCase();
}

/**
 * Retire la dernière lettre si c'est un « s » ou « x » (pluriel français simplifié).
 * Ignore les mots de 3 caractères ou moins pour éviter les faux positifs.
 * @param {string} mot
 * @returns {string}
 */
export function supprimerPluriel(mot) {
  if (mot.length > 3 && (mot.endsWith("s") || mot.endsWith("x"))) {
    return mot.slice(0, -1);
  }
  return mot;
}

/**
 * Combine normalisation + suppression du pluriel pour la comparaison.
 * @param {string} texte
 * @returns {string}
 */
function normaliserEtSupprimerPluriel(texte) {
  return supprimerPluriel(normaliserTexte(texte));
}

// ── Correspondance de recettes ───────────────────────────────────────────────

/**
 * Vérifie si une recette correspond à la requête de recherche.
 * Cherche dans : nom, description, et noms d'ingrédients.
 * @param {Object} recette
 * @param {string} requeteNormalisee — déjà normalisée par l'appelant
 * @returns {boolean}
 */
function recetteCorrespondRecherche(recette, requeteNormalisee) {
  if (!requeteNormalisee) return true;

  if (normaliserTexte(recette.name).includes(requeteNormalisee)) return true;
  if (normaliserTexte(recette.description).includes(requeteNormalisee)) return true;

  for (let i = 0; i < recette.ingredients.length; i++) {
    if (normaliserTexte(recette.ingredients[i].ingredient).includes(requeteNormalisee)) {
      return true;
    }
  }

  return false;
}

/**
 * Vérifie si une recette satisfait un critère de filtre donné.
 * Utilise `normaliserEtSupprimerPluriel` pour tolérer les variantes singulier/pluriel.
 * @param {Object} recette
 * @param {{ type: string, value: string }} critere
 * @returns {boolean}
 */
function recetteRespecteCritere(recette, critere) {
  if (critere.type === "ingredient") {
    return recette.ingredients.some(
      (i) => normaliserEtSupprimerPluriel(i.ingredient) === normaliserEtSupprimerPluriel(critere.value)
    );
  }
  if (critere.type === "appliance") {
    return normaliserEtSupprimerPluriel(recette.appliance) === normaliserEtSupprimerPluriel(critere.value);
  }
  if (critere.type === "ustensil") {
    return recette.ustensils.some(
      (u) => normaliserEtSupprimerPluriel(u) === normaliserEtSupprimerPluriel(critere.value)
    );
  }
  return true;
}

// ── Filtrage principal ───────────────────────────────────────────────────────

/**
 * Filtre les recettes selon la requête textuelle ET les filtres actifs.
 * @param {Object[]} recettes — toutes les recettes
 * @param {{ ingredient: string[], appliance: string[], ustensil: string[] }} filtresActifs — filtres actifs par type
 * @param {string} requete — texte de la barre de recherche
 * @returns {Object[]} recettes correspondantes
 */
export function filtrerRecettes(recettes, filtresActifs, requete) {
  const q = normaliserTexte(requete);
  return recettes.filter((recette) => {
    if (!recetteCorrespondRecherche(recette, q)) return false;
    for (const [type, valeurs] of Object.entries(filtresActifs)) {
      for (const valeur of valeurs) {
        if (!recetteRespecteCritere(recette, { type, value: valeur })) return false;
      }
    }
    return true;
  });
}

// ── Extraction de valeurs uniques ────────────────────────────────────────────

/**
 * Déduplique les valeurs en regroupant singulier/pluriel via une Map.
 * Conserve la première forme rencontrée et trie alphabétiquement en français.
 * @param {string[]} valeurs
 * @returns {string[]} valeurs uniques triées
 */
function obtenirValeursUniques(valeurs) {
  const vus = new Map();
  for (const valeur of valeurs) {
    if (!valeur) continue;
    const label = normaliserTexte(valeur);
    const cle = supprimerPluriel(label);
    if (!vus.has(cle)) vus.set(cle, label);
  }
  return [...vus.values()].sort((a, b) => a.localeCompare(b, "fr"));
}

/**
 * Extrait toutes les valeurs uniques d'un type de filtre à partir des recettes.
 * @param {Object[]} recettes
 * @param {"ingredient" | "appliance" | "ustensil"} type
 * @returns {string[]} valeurs uniques triées
 */
export function extraireValeursParType(recettes, type) {
  const valeurs = [];
  if (type === "ingredient") {
    for (const recette of recettes) {
      for (const item of recette.ingredients) valeurs.push(item.ingredient);
    }
  } else if (type === "appliance") {
    for (const recette of recettes) valeurs.push(recette.appliance);
  } else if (type === "ustensil") {
    for (const recette of recettes) {
      for (const nom of recette.ustensils) valeurs.push(nom);
    }
  }
  return obtenirValeursUniques(valeurs);
}

// ── Vérification de sélection ────────────────────────────────────────────────

/**
 * Vérifie si une valeur est déjà sélectionnée pour un type de filtre donné.
 * @param {{ ingredient: string[], appliance: string[], ustensil: string[] }} filtresActifs
 * @param {string} type
 * @param {string} valeur
 * @returns {boolean}
 */
export function estDejaSelectionne(filtresActifs, type, valeur) {
  const valeurs = filtresActifs[type];
  if (!valeurs) return false;
  return valeurs.some(
    (v) => normaliserTexte(v) === normaliserTexte(valeur)
  );
}
