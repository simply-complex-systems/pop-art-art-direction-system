export type Appearance = 'light' | 'dark';
export const APPEARANCE_STORAGE_KEY = 'pop-art.ui.appearance.v1';
export interface AppearanceStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
/** UI-only preference: no ProjectState or ProductionSpec dependency. */
export function readAppearance(storage: AppearanceStorage | undefined): Appearance {
  try { return storage?.getItem(APPEARANCE_STORAGE_KEY) === 'dark' ? 'dark' : 'light'; }
  catch { return 'light'; }
}
export function saveAppearance(storage: AppearanceStorage | undefined, appearance: Appearance): void {
  try { storage?.setItem(APPEARANCE_STORAGE_KEY, appearance); }
  catch { /* Appearance still works when browser storage is unavailable. */ }
}
