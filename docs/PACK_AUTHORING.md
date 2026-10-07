# Pack authoring

Start from `packs/community/generic-graphic-study/manifest.json`. Use schemaVersion `1.0`, stable packId/version/displayName, Community provenance and a complete license declaration. Validate with the PackManifest schema in `schemas/pack.schema.json`; `npm run validate-packs` validates installed manifests and the Official preservation ledger.

A Community ZIP has exactly one root `manifest.json` (optionally inside one pack folder), README_PACK.txt and any licensed referenced files. Paths are portable relative paths: no absolute paths, parent traversal, duplicate/conflicting ZIP paths or temporary object URLs. Bundled assets need SHA-256, mediaType and ID. External references use credential-free HTTPS; unavailable references declare unavailableReason. Asset IDs and paths must not conflict. Import verifies schema, compatibility, hashes and ZIP safety before installation.

Declare governs and doesNotGovern narrowly. Options extend known category/axis slots, not arbitrary controls. Presets remain read-only after import; users duplicate them into editable global presets. Exemplars declare approvedFeatures, knownDefects, provenance and license; optional production metadata specifies role, panelScope, transfer, doNotTransfer and notes. Approval for one feature does not authorize transferring identity, palette or costume wholesale. Subject identity and portable Theme transformation remain distinct.

Custom color strategies declare basis and hueOffsets; color-role IDs remain generic. Major/minor importance and relationships guide contrast, not compulsory harmonies. Four historical triads are examples. Custom artist choices remain unrestricted.

Export Pack uses selected collection metadata and remaps option/preset/exemplar IDs into the new pack namespace. A referenced pack color strategy is copied/remapped with its definition. Bundled bytes require a declared/verified compatible redistribution declaration and source bytes; unresolved files become external/unavailable metadata. Source declarations are retained, not independently verified. Contributor claims of Official status never grant Official curation.

Future categories may use known slots after compatibility validation. Unrecognized categories stay reference-only; extending production contracts/UI requires a separate versioned change and tests, not a new manifest field interpreted dynamically.
