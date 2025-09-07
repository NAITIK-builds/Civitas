import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiPrefsState {
  language: 'en' | 'hi';
  highContrast: boolean;
  largeFonts: boolean;
  setLanguage: (lang: 'en' | 'hi') => void;
  toggleHighContrast: () => void;
  toggleLargeFonts: () => void;
  apply: () => void;
}

export const useUiPrefs = create<UiPrefsState>()(
  persist(
    (set, get) => ({
      language: 'en',
      highContrast: false,
      largeFonts: false,
      setLanguage: (language) => {
        set({ language });
        document.documentElement.lang = language;
      },
      toggleHighContrast: () => {
        const next = !get().highContrast;
        set({ highContrast: next });
        document.documentElement.classList.toggle('a11y-high-contrast', next);
      },
      toggleLargeFonts: () => {
        const next = !get().largeFonts;
        set({ largeFonts: next });
        document.documentElement.classList.toggle('a11y-font-lg', next);
      },
      apply: () => {
        const { language, highContrast, largeFonts } = get();
        document.documentElement.lang = language;
        document.documentElement.classList.toggle('a11y-high-contrast', highContrast);
        document.documentElement.classList.toggle('a11y-font-lg', largeFonts);
      }
    }),
    { name: 'ui-prefs' }
  )
);
