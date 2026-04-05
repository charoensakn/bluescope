import { create } from 'zustand';
import { getLocale, setLocale } from '../paraglide/runtime';

interface UIState {
  mode: 'light' | 'dark' | 'system';
  setMode: (mode: 'light' | 'dark' | 'system') => void;
  uiLocale: 'en' | 'th';
  setUILocale: (locale: 'en' | 'th') => void;
  promptLocale: 'en' | 'th';
  setPromptLocale: (locale: 'en' | 'th') => void;
  isShowReasoning: boolean;
  showReasoning: () => void;
  hideReasoning: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  mode: window.config.getTheme(),
  setMode: (mode) => {
    window.config.setTheme(mode);
    set({ mode });
  },

  uiLocale: window.config.getUiLocale(),
  setUILocale: (uiLocale) => {
    window.config.setUiLocale(uiLocale);
    if (uiLocale !== getLocale()) {
      setLocale(uiLocale, { reload: false });
    }
    set({ uiLocale });
  },

  promptLocale: window.config.getPromptLocale(),
  setPromptLocale: (promptLocale) => {
    window.config.setPromptLocale(promptLocale);
    set({ promptLocale });
  },

  isShowReasoning: window.config.getReasoning(),
  showReasoning: () => {
    window.config.setReasoning(true);
    set({ isShowReasoning: true });
  },
  hideReasoning: () => {
    window.config.setReasoning(false);
    set({ isShowReasoning: false });
  },
}));
