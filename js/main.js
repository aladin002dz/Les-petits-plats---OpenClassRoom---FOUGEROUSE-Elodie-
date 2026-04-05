import { initialiserFiltres } from "./filters.js";
import { attacherBarreRecherche } from "./search.js";

async function initialiserApp() {
  const res = await fetch("./data/recipes.json");
  const recettes = await res.json();

  const { definirRequete } = initialiserFiltres(recettes);
  attacherBarreRecherche({ onChangementRequete: definirRequete });
}

initialiserApp();
