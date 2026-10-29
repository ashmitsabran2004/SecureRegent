import { create } from 'zustand';

export type ThemePreference = 'light' | 'dark' | 'system';
export type Preferences = {
  theme: ThemePreference;
  defaultRange: string;
  defaultDepartment: string;
  defaultUser: string;
  currencyDisplay: 'full' | 'abbreviated';
  monthlyTarget: number;
};
type State = Preferences & {
  range: string; start: string; end: string; user: string; department: string;
  sidebar: boolean; set: (key: string, value: string) => void;
  setPreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  resetPreferences: () => void; toggle: (key: 'sidebar') => void;
};
const defaults: Preferences = { theme: 'light', defaultRange: 'Last 30 Days', defaultDepartment: 'All departments', defaultUser: 'All users', currencyDisplay: 'full', monthlyTarget: 1200000 };
function readPreferences(): Preferences {
  try {
    const saved = localStorage.getItem('secure-regent-preferences');
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  } catch { return defaults; }
}
function persistPreferences(prefs: Preferences) {
  try { localStorage.setItem('secure-regent-preferences', JSON.stringify(prefs)); } catch { /* storage can be unavailable in private browsing */ }
}
const prefs = readPreferences();
const params = new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search);
export const useStore = create<State>((set, get) => ({
  ...prefs,
  range: params.get('range') || prefs.defaultRange, start: params.get('start') || '', end: params.get('end') || '',
  user: params.get('user') || prefs.defaultUser, department: params.get('department') || prefs.defaultDepartment,
  sidebar: true,
  set: (key, value) => set({ [key]: value }),
  setPreference: (key, value) => {
    const next = { ...get(), [key]: value } as State;
    set({ [key]: value } as Partial<State>);
    persistPreferences({ theme: next.theme, defaultRange: next.defaultRange, defaultDepartment: next.defaultDepartment, defaultUser: next.defaultUser, currencyDisplay: next.currencyDisplay, monthlyTarget: next.monthlyTarget });
    if (key === 'defaultRange') set({ range: String(value) });
    if (key === 'defaultDepartment') set({ department: String(value) });
    if (key === 'defaultUser') set({ user: String(value) });
  },
  resetPreferences: () => {
    set({ ...defaults, range: params.get('range') || defaults.defaultRange, department: params.get('department') || defaults.defaultDepartment, user: params.get('user') || defaults.defaultUser });
    persistPreferences(defaults);
  },
  toggle: (key) => set((state) => ({ [key]: !state[key] })),
}));
