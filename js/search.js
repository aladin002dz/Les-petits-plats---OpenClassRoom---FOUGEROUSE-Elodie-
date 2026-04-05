export function attacherBarreRecherche({ onChangementRequete }) {
  const input = document.getElementById("recipe-search-input");
  const form = document.getElementById("recipe-search-form");

  function emettre() {
    const valeur = input.value;
    // Minimum 3 caractères requis (ou champ vide pour réinitialiser)
    if (valeur.length === 0 || valeur.length >= 3) {
      onChangementRequete(valeur);
    }
  }

  input.addEventListener("input", emettre);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    emettre();
  });
}
