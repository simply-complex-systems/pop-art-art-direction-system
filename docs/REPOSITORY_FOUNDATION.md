# Repository foundation

## Application boundary

`src/main.tsx` mounts React in StrictMode. `App` contains only a neutral desktop workspace and an appearance preference. `WorkspaceNavigation` lists eleven disabled planned sections; it provides no tab functionality or art-direction controls. The application does not instantiate or mutate ProjectState, interpret Subject/Theme. Phase 3 adds an isolated library-loading diagnostic using the generic typed registry.

Runtime dependencies are React/React DOM for the UI, Ajv for contracts, JSZip for later ZIP workflows and pdf-lib for later dossiers. JSZip/pdf-lib are installed but not imported into the Phase 2 application. Browser File/Blob APIs will handle later user-selected local assets without backend services.

## CSS

Native CSS separates spacing/color/type tokens, base accessible controls/focus styles and workspace layout. Light and dark use `--ui-*` variables; artwork palettes do not drive these values. The desktop layout has a 1024 CSS-pixel minimum width and a conventional system font. No external fonts, icons, decorative images or artistic assumptions are embedded.

## Appearance storage

`pop-art.ui.appearance.v1` is the sole Phase 2 storage key. Appearance reads validate light/dark and gracefully handle unavailable localStorage. It sets `data-appearance` on the document root and CSS `color-scheme`. No project or production state is stored by the scaffold.

## TypeScript and tests

Shared strict settings are extended by browser, Node tooling and test configurations. Phase 1 sources/schemas/fixtures/tests are preserved. Node's built-in test runner verifies both the original contracts and new base-path/appearance/pack-validation infrastructure. Test output is isolated in `.test-build/`.

## Base path and Pages

Vite receives `VITE_BASE_PATH` through `loadEnv`. `/` is the local/default root. `/repository-name/` supports repository Pages hosting; the base normalizer rejects traversal and non-path values. Vite rewrites entry/chunk URLs for the selected base. Later public asset URLs must use `import.meta.env.BASE_URL`; avoid site-root absolute asset references or hard-coded repository names. No client router is needed for the future tabbed workspace.

CI builds using the actual GitHub repository name. The manually dispatched Pages workflow uses the same derived base unless explicitly overridden for root/custom-domain hosting. It runs checks before artifact creation and requests Pages write permissions only in the deployment job. No remote repository or Pages settings are provisioned by this scaffold.

## Pack validation

`npm run validate-packs` loads the final schema set and validates the generic Phase 1 pack fixture plus any `manifest.json` files under `packs/official` and `packs/community`. It checks directory/provenance agreement and exits nonzero for failures. It validates all 15 normalized Official packs and audits catalog/ledger/reference coverage and the supplied inventory hashes. It never edits assets or metadata.

## Reserved modules

Empty directories use `.gitkeep` so the intended repository structure survives Git checkout. These are slots, not feature implementations: art-direction tabs, randomization, compilers, project packaging, advisories, PDF dossiers and presets. Orientation authoring is also deferred.

## Static library

Phase 3 configures `packs/` as Vite publicDir. It is the one canonical corpus; original files are not duplicated into `public/`. Generated `dist/` copies are deployment artifacts. See `LIBRARY_ARCHITECTURE.md` for registry details and `OFFICIAL_LIBRARY_NORMALIZATION.md` for scope and rights.
