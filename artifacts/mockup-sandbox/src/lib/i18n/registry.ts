export type Locale = "ru" | "en";

const dictionaries: Record<Locale, Record<string, string>> = {
  en: {},
  ru: {},
};

export function loadDictionary(locale: Locale, dict: Record<string, string>) {
  dictionaries[locale] = { ...dictionaries[locale], ...dict };
}

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
