export function normaliserTexte(texte) {
  return texte.trim().toLowerCase();
}

export function supprimerPluriel(mot) {
  if (mot.length > 3 && (mot.endsWith("s") || mot.endsWith("x"))) {
    return mot.slice(0, -1);
  }
  return mot;
}

function construireChaineRecherchable(recette) {
  const parties = [
    recette.name,
    recette.description,
    ...recette.ingredients.map((i) => i.ingredient),
  ];
  return normaliserTexte(parties.join(" "));
}

export function recetteCorrespondRecherche(recette, requeteNormalisee) {
  if (!requeteNormalisee) return true;
  return construireChaineRecherchable(recette).includes(requeteNormalisee);
}
