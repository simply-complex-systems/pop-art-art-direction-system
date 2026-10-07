import { useEffect, useState } from 'react';
import { loadInstalledOfficialLibrary } from '../pack-loader/browser.js';
import type { LibraryRegistry } from '../pack-loader/types.js';
/** Phase 3 diagnostic only. No project state or art-direction controls. */
export function LibraryStatus() {
  const [library, setLibrary] = useState<LibraryRegistry>();
  const [error, setError] = useState<string>();
  useEffect(() => {
    let active = true;
    void loadInstalledOfficialLibrary().then(value => {if (active) setLibrary(value);},
      reason => {if (active) setError(reason instanceof Error ? reason.message : String(reason));});
    return () => {active = false;};
  }, []);
  if (error) return <p role="alert">Official library could not load: {error}</p>;
  if (!library) return <p role="status">Loading Official reference library…</p>;
  const first = [...library.packs.values()].flatMap(p => p.documents)[0];
  return <section aria-label="Library loading verification" data-library-status="ready">
    <h3>Official reference library loaded</h3>
    <p>{library.packs.size} packs · {library.exemplars.size} exemplars · {library.options.size} options · {library.presets.size} presets</p>
    <p className="muted">Development references. Public redistribution rights remain unresolved.</p>
    {first && 'path' in first.asset && <a href={library.assetUrl(first.asset.path)}>Open supplied reference document</a>}
  </section>;
}
