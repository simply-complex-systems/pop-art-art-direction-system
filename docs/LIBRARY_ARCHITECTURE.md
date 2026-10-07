# Official library architecture

`packs/official-library.json` is the single discovery entry point. Its schemaVersion, stable library ID, category number/pack ID/type/display metadata, manifest paths/hashes, option IDs and preset IDs describe the installed registry. It also records the color-system amendment and the normalization ledger path.

`src/pack-loader/types.ts` contains typed catalog, normalization and registry contracts. These are additive sidecars: the approved Phase 1 PackManifest and other eight schemas have not changed. Two new strict Draft-07 schemas validate the catalog and ledger.

`src/pack-loader/registry.ts` loads through an injected JSON reader, validates with Ajv before registration, checks identity/catalog references and ledger coverage, and resolves safe library-relative paths. All requests must succeed before a registry is returned. Options use `packId::optionId` composite keys because supplied option IDs are pack-local. Presets use stable global IDs; exemplars retain their source IDs under pack composite keys. `optionsFor(packId, axis?)` supports later manifest-driven controls. Original and derivative assets have separate ledger identities.

The caller specifies curated_registry or community_import trust. JSON cannot confer Official status. Nested preset/exemplar provenance is imposed by the same boundary. Catalog provenance describes the supplied source; consumers must use registered pack/item provenance for trust. This generic trust behavior does not implement Community import/export.

`src/pack-loader/browser.ts` supplies fetch and bundled schemas, using Vite BASE_URL. `LibraryStatus` reports counts and a reference link only. It creates no project and changes no Subject/Theme, preset, randomization or production state.

`packs/` is Vite publicDir. Browser paths start with `official/`, `sources/` or `example-projects/` beneath the configured site base. There is no duplicate corpus in `public/`. A build copies static originals into generated `dist/` as required for deployment. The browser loader validates JSON contracts/reference metadata; Node's `scripts/library-audit.ts` additionally verifies exact manifest, historical source and binary hashes. CI calls this through validate-packs. The browser verification also fetched and hashed every unique PNG/PDF under a repository subpath.

No derivatives are present. Future derivatives must live at a distinct path, declare kind derivative and reference an original. An approved exemplar's primary asset must remain a tracked original; a separate thumbnail may reference a tracked derivative. All visual assets currently have unresolved redistribution status.

Historical draft manifests are stored under `packs/sources/packs/official/`, outside installed-pack scanning. The example project and its duplicate handoff reference are mapped to `packs/example-projects/`. No example becomes a fresh project default. The 15 category sheets remain evidence with bounded governance, even where their incidental subject content resembles the example.

Normalization was performed as a one-time metadata migration from the supplied package. The ledgers and source backups are the maintained traceability record. Later metadata edits must update catalog hashes and ledgers; original hashes must never change. Named palette hex targets, unprovided numeric art parameters and visual redistribution rights remain explicitly provisional/unresolved. These do not block local development.
