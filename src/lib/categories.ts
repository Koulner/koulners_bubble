export type CategoryType = "Natur" | "Philosophie" | "Ganzheitliche Gesundheit" | "DIY Kosmetik" | "Ernährung" | "Frequenzen" | "Funktionelles Training" | "Entfaltung" | "Bücher" | string;

const DEFAULT_CATEGORIES = [
  "Natur",
  "Philosophie",
  "Ganzheitliche Gesundheit",
  "DIY Kosmetik",
  "Ernährung",
  "Frequenzen",
  "Funktionelles Training",
  "Entfaltung",
  "Bücher",
];

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

/**
 * Liest die zentralen Kategorien aus content/categories.json aus (Single Source of Truth)
 */
export function getAvailableCategories(): string[] {
  if (typeof window !== "undefined") return DEFAULT_CATEGORIES;
  try {
    const fs = require("fs");
    const path = require("path");
    const jsonPath = path.join(process.cwd(), "content", "categories.json");
    if (fs.existsSync(jsonPath)) {
      const raw = fs.readFileSync(jsonPath, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((c: any) => String(c).trim()).filter(Boolean);
      }
    }
  } catch (err) {
    console.error("Fehler beim Lesen von categories.json:", err);
  }
  return DEFAULT_CATEGORIES;
}

/**
 * Speichert die Kategorien lokal in content/categories.json
 */
export function saveAvailableCategories(categories: string[]): boolean {
  if (typeof window !== "undefined") return false;
  try {
    const fs = require("fs");
    const path = require("path");
    const jsonPath = path.join(process.cwd(), "content", "categories.json");
    const cleaned = Array.from(new Set(categories.map((c) => String(c).trim()).filter(Boolean)));
    fs.writeFileSync(jsonPath, JSON.stringify(cleaned, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Fehler beim Speichern von categories.json:", err);
    return false;
  }
}
