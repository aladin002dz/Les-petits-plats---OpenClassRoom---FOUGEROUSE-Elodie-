export function normaliserTexte(texte) {
  return texte.trim().toLowerCase();
}

export function supprimerPluriel(mot) {
  if (mot.length > 3 && (mot.endsWith("s") || mot.endsWith("x"))) {
    return mot.slice(0, -1);
  }
  return mot;
}

export function recetteCorrespondRecherche(recette, requeteNormalisee) {
  if (!requeteNormalisee) return true;

  if (normaliserTexte(recette.name).includes(requeteNormalisee)) return true;
  if (normaliserTexte(recette.description).includes(requeteNormalisee)) return true;

  for (let i = 0; i < recette.ingredients.length; i++) {
    if (normaliserTexte(recette.ingredients[i].ingredient).includes(requeteNormalisee)) return true;
  }

  return false;
}
