# Stable v1 contracts

The canonical versioned JSON Schemas are in schemas/. Contracts use schemaVersion `1.0`; unsupported versions reject rather than silently migrate. src/state/types.ts contains typed equivalents; schema validation enforces serialized boundaries.

| Contract | Responsibility |
| --- | --- |
| ApplicationState | Editable ProjectState, global user presets and separate UI state. |
| ProjectState | Editable choices, inheritance, scopes, variations, persistent random decisions, contexts, originals and history. |
| ProductionSpec | Concrete resolved production decisions only; shared input to both output compilers. |
| PackManifest | Versioned options/presets/exemplars/documents, provenance, licenses, compatibility and scoped governance. |
| Preset | Reusable category-level editable choices with source provenance; never governing authority. |
| FeedbackLedger | Artist feedback and explicitly scoped endorsement; history never self-promotes. |
| ProjectManifest | ZIP inventory, hashes, asset declarations and incomplete-production status. |
| OfficialCatalog / NormalizationLedger | Curated category references and preserved-source audit. |

Generic role IDs identify color relationships independently of Subject anatomy. Optional semantic/material display labels are descriptive. Color values serialize as readable hex strings; perceptual utilities use OKLab/OKLCH for comparison. Major/minor importance, subject/background domains, panel scope, relationship types and intentional separators support structured multi-panel color variation. Backgrounds compare with all major subject roles; explicit Custom decisions remain unrestricted.

Editable ProjectState and resolved ProductionSpec are separate. Resolver precedence applies global settings, inherited/preset/random choices and per-panel overrides before export. Random choices are committed with their decisions and input context; no compiler or Save action rerolls them. Prompt and JSON consume the same resolved snapshot and display context. Save reconstructs aligned output from that captured specification, not fresh UI interpretation.

Structural validation rejects broken versions, paths, hashes, IDs or contracts. Artistic validation produces non-blocking advisories. Project Load stages all validation and File/Blob reconstruction before atomic commit. Stored paths are portable; temporary object URLs are presentation details only. Asset hashes preserve original bytes; dossier thumbnails cannot replace originals. Global user presets are independent of project loading.

Official provenance is assigned by the curated registry, not trusted from imported JSON. Community imports retain source metadata but downgrade governing provenance. Public candidates use the existing unavailable-reference variant and a metadata reference index; they do not change v1 schemas or invent new runtime authority.
