export type CategoryType = "Natur" | "Philosophie" | "Ganzheitliche Gesundheit" | "DIY Kosmetik" | "Ernährung" | "Frequenzen" | "Funktionelles Training" | "Entfaltung" | string;

/**
 * Normalisiert die Kategorie(n) zu einem sauberen String-Array.
 * Wandelt einzelne Strings in ein 1-Element-Array um, behält bestehende Arrays bei.
 */
export function normalizeCategories(category?: CategoryType | CategoryType[]): string[] {
  if (!category) return ["Allgemein"];
  if (Array.isArray(category)) {
    return category.map((c) => String(c).trim()).filter(Boolean);
  }
  return [String(category).trim()].filter(Boolean);
}
