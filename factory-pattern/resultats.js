/**
 * Styles appliqués au libellé "résultat recherche" (nombre de recettes trouvées).
 */
const RESULT_LABEL_STYLES = {
  fontFamily: "Anton",
  fontWeight: "400",
  fontStyle: "normal",
  fontSize: "21px",
  lineHeight: "100%",
  letterSpacing: "0%",
  color: "#1B1B1B",
};

/**
 * Met à jour le libellé affichant le résultat de la recherche (nombre de recettes).
 * @param {HTMLElement | null} element - Élément DOM du libellé (ex. #recipes-count).
 * @param {number} total - Nombre de recettes trouvées.
 */
function updateRecipesResultLabel(element, total) {
  if (!element) return;

  element.textContent =
    total <= 1 ? "1 recette trouvée" : `${total} recettes`;

  Object.assign(element.style, RESULT_LABEL_STYLES);
}
