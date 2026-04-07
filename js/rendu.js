/**
 * rendu.js — Création et manipulation d'éléments DOM.
 *
 * Aucun état interne. Les fonctions reçoivent les données à afficher
 * et retournent des éléments DOM ou modifient le DOM directement.
 * Les événements utilisateur sont gérés via data-* attributs et
 * délégation d'événement dans main.js.
 */

const CHEMIN_IMAGES = "./assets/images/recettes/";

/**
 * Échappe les caractères spéciaux HTML via textContent → innerHTML.
 * Protège contre l'injection XSS dans les templates innerHTML.
 * @param {string} texte
 * @returns {string} texte échappé
 */
function echapperHtml(texte) {
  const div = document.createElement("div");
  div.textContent = texte;
  return div.innerHTML;
}

// ── Cartes de recettes ───────────────────────────────────────────────────────

/**
 * Construit la carte DOM complète d'une recette.
 * @param {Object} recette — objet recette provenant de recipes.json
 * @returns {HTMLElement}
 */
function creerCarteRecette(recette) {
  const { name, image, time, ingredients, description } = recette;

  const article = document.createElement("article");
  article.className =
    "flex h-full max-h-[731px] flex-col overflow-hidden rounded-card bg-white shadow-sm ring-1 ring-light-gray";

  const figure = document.createElement("figure");
  figure.className = "relative h-48 min-h-[253px] w-full overflow-hidden bg-light-gray";

  const img = document.createElement("img");
  img.src = CHEMIN_IMAGES + image;
  img.alt = name;
  img.className = "h-full w-full object-cover";

  const badgeTemps = document.createElement("p");
  badgeTemps.className =
    "pointer-events-none absolute right-3 top-3 inline-flex items-center justify-center rounded-full bg-primary px-3 py-1.5 font-manrope text-xs font-normal leading-none tracking-normal text-dark";
  badgeTemps.textContent = `${time} min`;

  figure.appendChild(img);
  figure.appendChild(badgeTemps);

  const contenu = document.createElement("div");
  contenu.className = "flex flex-1 flex-col gap-3 px-6 py-10";

  const titre = document.createElement("h2");
  titre.className = "font-Anton text-lg font-normal leading-none tracking-normal text-dark pb-4";
  titre.textContent = name;

  const titreRecette = document.createElement("h3");
  titreRecette.className =
    "font-manrope text-xs font-bold leading-none tracking-[0.09em] pb-2 uppercase text-gray";
  titreRecette.textContent = "Recette";

  const descriptionEl = document.createElement("p");
  descriptionEl.className =
    "line-clamp-4 mb-6 font-manrope text-sm font-normal leading-normal tracking-normal text-dark";
  descriptionEl.textContent = description;

  const titreIngredients = document.createElement("h3");
  titreIngredients.className =
    "font-manrope mb-1 text-xs font-bold leading-none tracking-[0.09em] uppercase text-gray";
  titreIngredients.textContent = "Ingrédients";

  const listeIngredients = document.createElement("ul");
  listeIngredients.className = "grid grid-cols-2 gap-x-10 gap-y-6 pt-2 text-xs text-gray";

  for (const item of ingredients) {
    const li = document.createElement("li");
    li.className = "flex flex-col gap-1.5";

    const nomSpan = document.createElement("span");
    nomSpan.className = "font-manrope text-sm font-medium leading-none tracking-normal text-dark";
    nomSpan.textContent = item.ingredient;

    const quantite = item.quantity || "";
    // Le JSON utilise « unit » ou « unite » selon les recettes
    const unite = item.unit || item.unite || "";
    const detail = [quantite, unite].filter(Boolean).join(" ");

    li.appendChild(nomSpan);
    if (detail) {
      const detailSpan = document.createElement("span");
      detailSpan.className =
        "font-manrope text-sm font-normal leading-none tracking-normal text-gray";
      detailSpan.textContent = detail;
      li.appendChild(detailSpan);
    }

    listeIngredients.appendChild(li);
  }

  contenu.appendChild(titre);
  contenu.appendChild(titreRecette);
  contenu.appendChild(descriptionEl);
  contenu.appendChild(titreIngredients);
  contenu.appendChild(listeIngredients);

  article.appendChild(figure);
  article.appendChild(contenu);

  return article;
}

/**
 * Affiche les recettes dans la grille et met à jour le compteur.
 * Affiche un message contextuel si aucune recette ne correspond.
 * @param {Object[]} recettes — recettes filtrées à afficher
 * @param {string} requete — texte de recherche (pour le message « aucun résultat »)
 */
export function afficherRecettes(recettes, requete) {
  const grille = document.getElementById("recipes-grid");
  grille.innerHTML = "";

  if (recettes.length === 0) {
    const msg = document.createElement("p");
    msg.className = "col-span-full font-manrope text-base text-dark text-center py-12";
    // Supprime les espaces pour un affichage propre dans le message
    const requeteAffichee = requete.trim();
    msg.textContent = requeteAffichee
      ? `Aucune recette ne contient "${requeteAffichee}", vous pouvez chercher "tarte aux pommes", "poisson", etc.`
      : "Aucune recette ne correspond à votre recherche.";
    grille.appendChild(msg);
  } else {
    for (const recette of recettes) {
      grille.appendChild(creerCarteRecette(recette));
    }
  }

  const total = recettes.length;
  document.getElementById("recipes-count").textContent =
    `${total} recette${total > 1 ? "s" : ""}`;
}

// ── Liste d'options ──────────────────────────────────────────────────────────

/**
 * Crée un élément <li> d'option pour le dropdown.
 * Utilise data-* attributs pour que main.js gère les clics par délégation.
 * @param {string} label — texte de l'option
 * @param {boolean} selectionne — true si le critère est actuellement actif
 * @returns {HTMLElement}
 */
function creerElementOption(label, selectionne) {
  const li = document.createElement("li");
  li.className = selectionne
    ? "cursor-pointer px-4 py-2.5 font-manrope text-base font-medium leading-none text-dark transition-colors bg-primary"
    : "cursor-pointer px-4 py-2.5 font-manrope text-base font-medium leading-none text-dark transition-colors hover:bg-light-gray focus:bg-light-gray focus:outline-none";
  li.setAttribute("role", "option");
  li.setAttribute("aria-selected", selectionne ? "true" : "false");
  li.setAttribute("data-option-valeur", label);
  li.setAttribute("data-option-selectionne", selectionne ? "true" : "false");
  li.textContent = label;
  return li;
}

/**
 * Remplit la liste <ul> d'un dropdown avec les options sélectionnées (en haut)
 * puis les options disponibles (en dessous).
 * @param {HTMLElement} liste — élément <ul> du dropdown
 * @param {string[]} selectionnes — valeurs actives pour ce type
 * @param {string[]} disponibles — options non encore sélectionnées
 */
export function remplirListeOptions(liste, selectionnes, disponibles) {
  liste.innerHTML = "";

  for (const valeur of selectionnes) {
    liste.appendChild(creerElementOption(valeur, true));
  }

  for (const option of disponibles) {
    liste.appendChild(creerElementOption(option, false));
  }
}

// ── Tags ─────────────────────────────────────────────────────────────────────

/**
 * Crée un tag visuel pour un critère sélectionné.
 * Le bouton ✕ porte les attributs data-tag-retirer (valeur) et data-tag-type
 * pour que la délégation d'événement sache quel tableau cibler.
 * @param {string} type — type de filtre (ingredient, appliance, ustensil)
 * @param {string} label — valeur du critère
 * @returns {HTMLElement}
 */
function creerTagSelectionne(type, label) {
  const tag = document.createElement("span");
  tag.className =
    "inline-flex h-[53px] w-[203px] items-center justify-between gap-2 rounded-ui bg-primary px-[18px] py-[17px] font-manrope text-sm font-normal leading-none tracking-normal text-dark opacity-100";

  const crossSvg =
    '<svg class="shrink-0 opacity-100" width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M1 1L9 9M9 1L1 9" stroke="currentColor" stroke-width="2.17" stroke-linecap="round"/></svg>';

  tag.innerHTML =
    `<span class="min-w-0 flex-1 truncate">${echapperHtml(label)}</span>` +
    ` <button type="button"` +
    ` class="inline-flex h-[20px] w-[20px] shrink-0 items-center justify-center border-0 bg-transparent p-0 cursor-pointer text-dark opacity-100 m-0 hover:opacity-90"` +
    ` aria-label="Retirer ${echapperHtml(label)}"` +
    ` data-tag-retirer="${echapperHtml(label)}"` +
    ` data-tag-type="${type}">${crossSvg}</button>`;

  return tag;
}

/**
 * Affiche tous les tags des filtres actifs dans le conteneur.
 * @param {{ ingredient: string[], appliance: string[], ustensil: string[] }} filtresActifs
 * @param {HTMLElement} conteneur — élément #recipes-selected-list
 */
export function afficherTagsSelectionnes(filtresActifs, conteneur) {
  conteneur.innerHTML = "";
  for (const [type, valeurs] of Object.entries(filtresActifs)) {
    for (const valeur of valeurs) {
      conteneur.appendChild(creerTagSelectionne(type, valeur));
    }
  }
}

// ── Ouverture / fermeture dropdown ───────────────────────────────────────────

/**
 * Affiche un dropdown et met à jour l'attribut aria-expanded du bouton associé.
 * @param {HTMLElement} dropdown
 */
export function ouvrirDropdown(dropdown) {
  dropdown.classList.remove("hidden");
  dropdown.classList.add("block");
  const btn = dropdown.parentElement?.querySelector(".recipes-filter-btn");
  if (btn) btn.setAttribute("aria-expanded", "true");
}

/**
 * Masque un dropdown et met à jour l'attribut aria-expanded du bouton associé.
 * @param {HTMLElement} dropdown
 */
export function fermerDropdown(dropdown) {
  dropdown.classList.add("hidden");
  dropdown.classList.remove("block");
  const btn = dropdown.parentElement?.querySelector(".recipes-filter-btn");
  if (btn) btn.setAttribute("aria-expanded", "false");
}
