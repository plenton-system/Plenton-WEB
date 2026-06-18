import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import esCommon from 'src/locales/es/common.json';
import enUSCommon from 'src/locales/en-US/common.json';
import ptBRCommon from 'src/locales/pt-BR/common.json';

// ----------------------------------------------------------------------

export const SUPPORTED_LANGUAGES = ['pt-BR', 'en-US', 'es'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'pt-BR';
export const LANGUAGE_STORAGE_KEY = 'language';

export const resources = {
  'pt-BR': { common: ptBRCommon },
  'en-US': { common: enUSCommon },
  es: { common: esCommon },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    // O detector associa "pt"/"en" à variante regional suportada.
    // nonExplicitSupportedLngs reduziria "pt-BR" para "pt" antes de consultar
    // supportedLngs, rejeitando os recursos que usam códigos regionais.
    load: 'currentOnly',
    defaultNS: 'common',
    ns: ['common'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
    },
  });

// Mantém o atributo <html lang="..."> sincronizado com o idioma ativo.
i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') document.documentElement.lang = lng;
});

export default i18n;
