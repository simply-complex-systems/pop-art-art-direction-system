# Contributing

Use the simplest change that preserves the v1 contracts and approved governance. Read README.md, docs/CONTRACTS.md and docs/PACK_AUTHORING.md. Avoid product assumptions about a person, species, costume or seasonal theme. UI appearance stays outside production state.

Install pinned dependencies with `npm ci`. Run typecheck, the relevant tests, `npm run validate-packs`, and build. Before proposing release content also run `npm run build:public`, `npm run validate-public` and `npm run validate-release`. The full local suite includes private-corpus preservation checks; the public source candidate deliberately uses the shipped-contract subset and metadata registry checks.

Community submissions use the standard versioned PackManifest schema. Options supply values for known controls; presets supply reusable editable-state choices; exemplars supply scoped visual evidence. Imported Official claims are installed as Community. Official curation requires an explicit maintainer decision, not a contributor flag. Unknown future categories remain reference-only until a separately reviewed implementation maps them to compatible controls. Never use arbitrary manifest content as executable code or UI definitions.

Provide provenance, a declared license, attribution, redistribution status, stable IDs, portable paths, hashes and exemplar governance: governs, doesNotGovern, approvedFeatures, knownDefects, transfer and doNotTransfer when used in production. Do not infer rights from artistic endorsement. Do not regenerate approved originals. Unresolved assets remain metadata-only in public candidates.

Submit a pull request with the concrete user problem, resulting behavior, scope and validation evidence. Include screenshots for meaningful UI changes and unchanged-original hash evidence for asset work. Do not include private projects or unresolved binaries. Regenerate the Publication Asset Review after modifying release assets; reviewers must assess declarations before any public publication.

Software contributions use Apache-2.0; original documentation uses CC BY 4.0. Third-party fonts/assets retain their own declared terms. Describe uncertainty rather than making legal conclusions.
