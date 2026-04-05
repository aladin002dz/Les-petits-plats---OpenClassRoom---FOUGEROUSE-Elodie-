import renderRecipes from "./templates/card.js";
import { normaliserTexte, supprimerPluriel, recetteCorrespondRecherche } from "./recipeSearch.js";

const CONFIGS_FILTRES = [
  { type: "ingredient", label: "Ingrédients", btnSelector: '[data-filter="ingredients"]' },
  { type: "appliance",  label: "Appareils",   btnSelector: '[data-filter="appliances"]' },
  { type: "ustensil",   label: "Ustensiles",  btnSelector: '[data-filter="ustensils"]' },
];

// ─── Utilitaires purs ────────────────────────────────────────────────────────

function normaliserEtSupprimerPluriel(texte) {
  return supprimerPluriel(normaliserTexte(texte));
}

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

function echapperHtml(texte) {
  const div = document.createElement("div");
  div.textContent = texte;
  return div.innerHTML;
}

// ─── Logique de filtrage ─────────────────────────────────────────────────────

function recetteContientIngredient(recette, valeur) {
  const ingredientsNormalises = new Set(
    recette.ingredients.map((i) => normaliserEtSupprimerPluriel(i.ingredient))
  );
  return ingredientsNormalises.has(normaliserEtSupprimerPluriel(valeur));
}

function recetteContientAppareil(recette, valeur) {
  return normaliserEtSupprimerPluriel(recette.appliance) === normaliserEtSupprimerPluriel(valeur);
}

function recetteContientUstensile(recette, valeur) {
  const ustensilesNormalises = new Set(
    recette.ustensils.map((u) => normaliserEtSupprimerPluriel(u))
  );
  return ustensilesNormalises.has(normaliserEtSupprimerPluriel(valeur));
}

function recetteRespecteCritere(recette, critere) {
  if (critere.type === "ingredient") return recetteContientIngredient(recette, critere.value);
  if (critere.type === "appliance")  return recetteContientAppareil(recette, critere.value);
  if (critere.type === "ustensil")   return recetteContientUstensile(recette, critere.value);
  return true;
}

function filtrerRecettes(recettes, criteresSelectionnes, requete) {
  const q = normaliserTexte(requete);
  return recettes.filter((recette) =>
    recetteCorrespondRecherche(recette, q) &&
    criteresSelectionnes.every((critere) => recetteRespecteCritere(recette, critere))
  );
}

function extraireValeursParType(recettes, type) {
  const valeurs = [];
  if (type === "ingredient") {
    for (const recette of recettes)
      for (const item of recette.ingredients) valeurs.push(item.ingredient);
  } else if (type === "appliance") {
    for (const recette of recettes) valeurs.push(recette.appliance);
  } else if (type === "ustensil") {
    for (const recette of recettes)
      for (const nom of recette.ustensils) valeurs.push(nom);
  }
  return obtenirValeursUniques(valeurs);
}

// ─── Création des éléments DOM ───────────────────────────────────────────────

function creerElementOption(label, selectionne, onSelectionner) {
  const li = document.createElement("li");
  li.className = selectionne
    ? "cursor-pointer px-4 py-2.5 font-manrope text-base font-medium leading-none text-dark transition-colors bg-primary"
    : "cursor-pointer px-4 py-2.5 font-manrope text-base font-medium leading-none text-dark transition-colors hover:bg-light-gray focus:bg-light-gray focus:outline-none";
  li.setAttribute("role", "option");
  li.setAttribute("aria-selected", selectionne ? "true" : "false");
  li.textContent = label;
  li.addEventListener("click", (e) => {
    e.stopPropagation();
    onSelectionner();
  });
  return li;
}

function creerTagSelectionne(label, onRetirer) {
  const tag = document.createElement("span");
  tag.className =
    "inline-flex h-[53px] w-[203px] items-center justify-between gap-2 rounded-ui bg-primary px-[18px] py-[17px] font-manrope text-sm font-normal leading-none tracking-normal text-dark opacity-100";
  const crossSvg =
    '<svg class="shrink-0 opacity-100" width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M1 1L9 9M9 1L1 9" stroke="currentColor" stroke-width="2.17" stroke-linecap="round"/></svg>';
  tag.innerHTML = `<span class="min-w-0 flex-1 truncate">${echapperHtml(label)}</span> <button type="button" class="inline-flex h-[20px] w-[20px] shrink-0 items-center justify-center border-0 bg-transparent p-0 cursor-pointer text-dark opacity-100 m-0 hover:opacity-90" aria-label="Retirer ${echapperHtml(label)}">${crossSvg}</button>`;
  tag.querySelector("button").addEventListener("click", (e) => {
    e.stopPropagation();
    onRetirer();
    tag.remove();
  });
  return tag;
}

function creerConteneurDropdown(config, btn) {
  const wrapper = document.createElement("div");
  wrapper.className = "relative flex flex-col items-start gap-2 shrink-0";
  btn.parentNode.insertBefore(wrapper, btn);
  wrapper.appendChild(btn);

  const dropdown = document.createElement("div");
  dropdown.className =
    "absolute left-0 top-full z-50 mt-1 hidden min-w-[195px] rounded-ui bg-white shadow-lg";
  dropdown.setAttribute("role", "listbox");
  dropdown.setAttribute("aria-label", config.label);
  wrapper.appendChild(dropdown);

  const liste = document.createElement("ul");
  liste.className = "m-0 list-none p-0 max-h-[220px] overflow-y-auto pb-2";

  return { dropdown, liste };
}

function creerBarreRechercheDropdown(config) {
  const wrapper = document.createElement("div");
  wrapper.className = "relative flex items-center border border-gray-300 rounded-md mx-3 mt-3 mb-2";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "w-full py-2 pl-3 pr-8 font-manrope text-sm text-dark bg-transparent outline-none";
  input.setAttribute("aria-label", `Rechercher dans ${config.label}`);

  const boutonEffacer = document.createElement("button");
  boutonEffacer.type = "button";
  boutonEffacer.className = "absolute right-7 hidden text-gray-400 hover:text-dark";
  boutonEffacer.setAttribute("aria-label", "Effacer la recherche");
  boutonEffacer.innerHTML = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M1 1L9 9M9 1L1 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

  const iconeRecherche = document.createElement("span");
  iconeRecherche.className = "absolute right-2 text-gray-400 pointer-events-none";
  iconeRecherche.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.5"/><line x1="10" y1="10" x2="13" y2="13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

  wrapper.appendChild(input);
  wrapper.appendChild(boutonEffacer);
  wrapper.appendChild(iconeRecherche);

  return { wrapper, input, boutonEffacer };
}

// ─── Initialisation des filtres ──────────────────────────────────────────────

function initialiserFiltres(recettes) {
  const criteresSelectionnes = [];
  let requete = "";
  const listeTagsEl = document.getElementById("recipes-selected-list");
  let menuOuvert = null;

  function appliquerFiltres() {
    const recettesFiltrees = filtrerRecettes(recettes, criteresSelectionnes, requete);
    renderRecipes(recettesFiltrees, requete);
    afficherTagsSelectionnes();
  }

  function afficherTagsSelectionnes() {
    listeTagsEl.innerHTML = "";
    criteresSelectionnes.forEach((critere, i) => {
      listeTagsEl.appendChild(
        creerTagSelectionne(critere.value, () => {
          criteresSelectionnes.splice(i, 1);
          appliquerFiltres();
        })
      );
    });
  }

  function fermerMenuDeroulant() {
    if (!menuOuvert) return;
    menuOuvert.classList.add("hidden");
    menuOuvert.classList.remove("block");
    const btn = menuOuvert.parentElement?.querySelector(".recipes-filter-btn");
    if (btn) btn.setAttribute("aria-expanded", "false");
    menuOuvert = null;
  }

  function ouvrirMenuDeroulant(panneau) {
    fermerMenuDeroulant();
    menuOuvert = panneau;
    panneau.classList.remove("hidden");
    panneau.classList.add("block");
    const btn = panneau.parentElement?.querySelector(".recipes-filter-btn");
    if (btn) btn.setAttribute("aria-expanded", "true");
  }

  function estDejaSelectionne(type, valeur) {
    return criteresSelectionnes.some(
      (s) => s.type === type && normaliserTexte(s.value) === normaliserTexte(valeur)
    );
  }

  function construireMenuDeroulant(config) {
    const btn = document.querySelector(config.btnSelector);
    if (!btn) return;

    const { dropdown, liste } = creerConteneurDropdown(config, btn);
    const { wrapper: barreWrapper, input: searchInput, boutonEffacer: clearBtn } = creerBarreRechercheDropdown(config);
    dropdown.appendChild(barreWrapper);
    dropdown.appendChild(liste);

    function reinitialiserRecherche() {
      searchInput.value = "";
      clearBtn.classList.add("hidden");
    }

    function afficherCriteresSelectionnes() {
      criteresSelectionnes
        .filter((s) => s.type === config.type)
        .forEach((critere) => {
          liste.appendChild(creerElementOption(critere.value, true, () => {
            const idx = criteresSelectionnes.findIndex(
              (s) => s.type === critere.type && normaliserTexte(s.value) === normaliserTexte(critere.value)
            );
            if (idx !== -1) criteresSelectionnes.splice(idx, 1);
            appliquerFiltres();
            afficherOptions();
          }));
        });
    }

    function afficherOptionsDisponibles(options) {
      options
        .filter((opt) => !estDejaSelectionne(config.type, opt))
        .forEach((opt) => {
          liste.appendChild(creerElementOption(opt, false, () => {
            criteresSelectionnes.push({ type: config.type, value: opt });
            afficherTagsSelectionnes();
            fermerMenuDeroulant();
            appliquerFiltres();
          }));
        });
    }

    function afficherOptions() {
      liste.innerHTML = "";
      const recettesCourantes = filtrerRecettes(recettes, criteresSelectionnes, requete);
      const toutesOptions = extraireValeursParType(recettesCourantes, config.type);
      const q = normaliserTexte(searchInput.value);
      const optionsFiltrees = q
        ? toutesOptions.filter((opt) => normaliserTexte(opt).includes(q))
        : toutesOptions;

      afficherCriteresSelectionnes();
      afficherOptionsDisponibles(optionsFiltrees);
    }

    searchInput.addEventListener("input", (e) => {
      e.stopPropagation();
      clearBtn.classList.toggle("hidden", searchInput.value === "");
      afficherOptions();
    });

    clearBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      reinitialiserRecherche();
      afficherOptions();
      searchInput.focus();
    });

    searchInput.addEventListener("click", (e) => e.stopPropagation());

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (dropdown.classList.contains("block")) {
        fermerMenuDeroulant();
      } else {
        ouvrirMenuDeroulant(dropdown);
        reinitialiserRecherche();
        afficherOptions();
        searchInput.focus();
      }
    });

    afficherOptions();
  }

  CONFIGS_FILTRES.forEach(construireMenuDeroulant);
  afficherTagsSelectionnes();

  document.addEventListener("click", () => fermerMenuDeroulant());
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fermerMenuDeroulant();
  });

  appliquerFiltres();

  return {
    definirRequete(valeur) {
      requete = valeur;
      appliquerFiltres();
    },
  };
}

export { initialiserFiltres };
