import { create } from 'zustand';

interface SettingsState {
  arrowWidth: number;
  arrowHeadSize: number;
  summaryMode: 'zoom' | 'toggle';
  showSummaries: boolean;
  cardWidth: 'narrow' | 'medium' | 'wide';
  updateSettings: (settings: Partial<Pick<SettingsState, 'arrowWidth' | 'arrowHeadSize'>>) => void;
  setSummaryMode: (mode: 'zoom' | 'toggle') => void;
  setCardWidth: (width: 'narrow' | 'medium' | 'wide') => void;
  toggleSummaries: () => void;
  loadSettings: () => void;
  saveSettings: () => void;
}

const STORAGE_KEY = 'canvassy-settings';

const DEFAULT_SETTINGS = {
  arrowWidth: 2,
  arrowHeadSize: 6,
  summaryMode: 'toggle' as const,
  showSummaries: false,
  cardWidth: 'medium' as const,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  arrowWidth: DEFAULT_SETTINGS.arrowWidth,
  arrowHeadSize: DEFAULT_SETTINGS.arrowHeadSize,
  summaryMode: DEFAULT_SETTINGS.summaryMode,
  showSummaries: DEFAULT_SETTINGS.showSummaries,
  cardWidth: DEFAULT_SETTINGS.cardWidth,

  updateSettings: (settings) => {
    set((state) => ({
      ...state,
      ...settings,
    }));
    get().saveSettings();
  },

  setSummaryMode: (mode) => {
    set({ summaryMode: mode });
    get().saveSettings();
  },

  setCardWidth: (width) => {
    set({ cardWidth: width });
    get().saveSettings();
  },

  toggleSummaries: () => {
    set((state) => ({ showSummaries: !state.showSummaries }));
    get().saveSettings();
  },

  loadSettings: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const settings = JSON.parse(stored);
        set({
          arrowWidth: settings.arrowWidth ?? DEFAULT_SETTINGS.arrowWidth,
          arrowHeadSize: settings.arrowHeadSize ?? DEFAULT_SETTINGS.arrowHeadSize,
          summaryMode: settings.summaryMode ?? DEFAULT_SETTINGS.summaryMode,
          showSummaries: settings.showSummaries ?? DEFAULT_SETTINGS.showSummaries,
          cardWidth: settings.cardWidth ?? DEFAULT_SETTINGS.cardWidth,
        });
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error);
    }
  },

  saveSettings: () => {
    try {
      const { arrowWidth, arrowHeadSize, summaryMode, showSummaries, cardWidth } = get();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ arrowWidth, arrowHeadSize, summaryMode, showSummaries, cardWidth }));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  },
}));
