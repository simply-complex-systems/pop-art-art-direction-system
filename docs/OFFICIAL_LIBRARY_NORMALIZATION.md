# Official library normalization ledger

Phase 3 metadata normalization only. All supplied originals are immutable. No visual derivative was created. The machine-readable ledger is `packs/normalization-ledger.json`; draft manifests and all source text are retained under `packs/sources/`.

## Source and normalized fields

| Source field | v1 representation |
|---|---|
| schema_version | schemaVersion 1.0; no silent runtime migration |
| pack_id / display_name / pack_type | packId / displayName / packType; stable IDs retained |
| status | Historical endorsement retained; curated development provenance, no rights claim |
| governs / does_not_govern | governs / doesNotGovern; approved scope amendments only |
| exemplars | Stable IDs, approvedFeatures, knownDefects, tags; typed hash/media references |
| documents | Source-derived titles and stable document IDs; PDF license unknown |
| examples | Supporting asset ledger records, without expanded exemplar approval |
| options | Stable source IDs/labels, category/axis/value, source JSON pointers |
| license | Intended metadata/exemplar declarations; documents unknown, redistribution unresolved |
| notes | compatibility.notes; missing parameters explicitly unresolved |

## System additions

Category 5 separates field (10), texture (7), and finish (4). Flat Field and None are explicit product additions. Definitions preserve the distinction between equal-size Ben-Day dots, variable halftone tone, irregular stipple, single-family hatch, intersecting crosshatch, and print-layer misregistration with stable black structure. Category 14 defines camera/perspective; Category 8 teaches pose/gesture/staging.

Category 4 governs successful structured relationships and whole-figure/background separation. All major roles have baseline separation priority; adjacency increases priority, minor accents may repeat, backgrounds are assessed against all major subject roles, and Custom choices remain unrestricted. Seven strategies are product options, with no newly claimed exemplar evidence. Empty hueOffsets establish no additional numeric rule. Category 9 exposes mood and harmony evidence independently.

The four named triads are optional Official preset records. Generic role assignments and representative hex targets are **provisional**, not measured or newly approved artistic facts. There is no prescribed background swatch. Future controls must make this status visible when presenting these presets. Generic role templates are product metadata and do not infer anatomy from images.

## Preservation and rights

All 71 supplied inventory entries were verified. The inventory itself is separately hashed: 72 source mappings point to 71 unique stored originals. The example handoff PDF occurs twice in the source with identical bytes and is stored once under example-project context. Twenty-two unique PNGs and eight unique PDFs retain their original hashes. Six composition examples and the example master reference stay supporting/example evidence; only the original 15 category sheets are registered as approved exemplars. All visual public-redistribution rights are unresolved. Original source declarations remain accessible; no ownership or new approval is inferred. Embedded third-party imagery and provenance must be reviewed before release.

## Per-manifest records

### official.category-01.subject-identity.v1

Source: `packs/official/01-subject-identity/manifest.json`  
Historical copy: `sources/packs/official/01-subject-identity/manifest.json`  
Normalized: `official/01-subject-identity/manifest.json`

**Unchanged:** pack_id value; version; display_name; exemplar IDs/titles/approved_features/known_defects/tags; option IDs/labels.

**Transformed:** snake_case to camelCase; schema_version to 1.0; asset paths to static library-relative references with hash/media type; documents to typed asset records; licenses to explicit intended/unknown status; notes to compatibility.notes; examples preserved as supporting evidence in asset ledger; governs and does_not_govern carried forward; status user-endorsed retained as development approval through source backup and approvedFeatures; no rights promotion; description carried forward except Category 4 rewritten under approved color amendment; source license strings mapped to intended or unknown; exact statements retained in historical manifest.

**Added:** typed documents with source-derived filename titles; document IDs; exact asset hashes/media types; generic tags from approved sheet; compatibility; typed option category/axis/value; empty arrays for unspecified presets/strategies/roles/relationships; explicit unresolved public redistribution caveats; pack tags copied from approved-sheet tags; source-relative mapping for all option/exemplar/document/preset records.

**Unresolved:** precise artistic parameters beyond supplied option labels; independent rights verification; knownDefects empty means none supplied, not a defect-free certification.

**Caveats:** Official is curated development provenance, not a rights certification.; Metadata CC-BY-4.0 intended; visual redistribution unresolved..

Every normalized option, exemplar, document and preset ID is mapped in the machine ledger. Product additions use null source pointers; preset mappings point to the supplied named-triad options.

### official.category-02.conventional-composition.v1

Source: `packs/official/02-conventional-composition/manifest.json`  
Historical copy: `sources/packs/official/02-conventional-composition/manifest.json`  
Normalized: `official/02-conventional-composition/manifest.json`

**Unchanged:** pack_id value; version; display_name; exemplar IDs/titles/approved_features/known_defects/tags; option IDs/labels.

**Transformed:** snake_case to camelCase; schema_version to 1.0; asset paths to static library-relative references with hash/media type; documents to typed asset records; licenses to explicit intended/unknown status; notes to compatibility.notes; examples preserved as supporting evidence in asset ledger; governs and does_not_govern carried forward; status user-endorsed retained as development approval through source backup and approvedFeatures; no rights promotion; description carried forward except Category 4 rewritten under approved color amendment; source license strings mapped to intended or unknown; exact statements retained in historical manifest.

**Added:** typed documents with source-derived filename titles; document IDs; exact asset hashes/media types; generic tags from approved sheet; compatibility; typed option category/axis/value; empty arrays for unspecified presets/strategies/roles/relationships; explicit unresolved public redistribution caveats; pack tags copied from approved-sheet tags; source-relative mapping for all option/exemplar/document/preset records.

**Unresolved:** precise artistic parameters beyond supplied option labels; independent rights verification; knownDefects empty means none supplied, not a defect-free certification.

**Caveats:** Official is curated development provenance, not a rights certification.; Metadata CC-BY-4.0 intended; visual redistribution unresolved..

Every normalized option, exemplar, document and preset ID is mapped in the machine ledger. Product additions use null source pointers; preset mappings point to the supplied named-triad options.

### official.category-03.unconventional-composition.v1

Source: `packs/official/03-unconventional-composition/manifest.json`  
Historical copy: `sources/packs/official/03-unconventional-composition/manifest.json`  
Normalized: `official/03-unconventional-composition/manifest.json`

**Unchanged:** pack_id value; version; display_name; exemplar IDs/titles/approved_features/known_defects/tags; option IDs/labels.

**Transformed:** snake_case to camelCase; schema_version to 1.0; asset paths to static library-relative references with hash/media type; documents to typed asset records; licenses to explicit intended/unknown status; notes to compatibility.notes; examples preserved as supporting evidence in asset ledger; governs and does_not_govern carried forward; status user-endorsed retained as development approval through source backup and approvedFeatures; no rights promotion; description carried forward except Category 4 rewritten under approved color amendment; source license strings mapped to intended or unknown; exact statements retained in historical manifest.

**Added:** typed documents with source-derived filename titles; document IDs; exact asset hashes/media types; generic tags from approved sheet; compatibility; typed option category/axis/value; empty arrays for unspecified presets/strategies/roles/relationships; explicit unresolved public redistribution caveats; pack tags copied from approved-sheet tags; source-relative mapping for all option/exemplar/document/preset records.

**Unresolved:** precise artistic parameters beyond supplied option labels; independent rights verification; knownDefects empty means none supplied, not a defect-free certification.

**Caveats:** Official is curated development provenance, not a rights certification.; Metadata CC-BY-4.0 intended; visual redistribution unresolved..

Every normalized option, exemplar, document and preset ID is mapped in the machine ledger. Product additions use null source pointers; preset mappings point to the supplied named-triad options.

### official.category-04.color-triad-contrast.v1

Source: `packs/official/04-color-triad-contrast/manifest.json`  
Historical copy: `sources/packs/official/04-color-triad-contrast/manifest.json`  
Normalized: `official/04-color-triad-contrast/manifest.json`

**Unchanged:** pack_id value; version; display_name; exemplar IDs/titles/approved_features/known_defects/tags; option IDs/labels.

**Transformed:** snake_case to camelCase; schema_version to 1.0; asset paths to static library-relative references with hash/media type; documents to typed asset records; licenses to explicit intended/unknown status; notes to compatibility.notes; examples preserved as supporting evidence in asset ledger; governing scope adjusted only by approved amendments; status user-endorsed retained as development approval through source backup and approvedFeatures; no rights promotion; description carried forward except Category 4 rewritten under approved color amendment; source license strings mapped to intended or unknown; exact statements retained in historical manifest.

**Added:** typed documents with source-derived filename titles; document IDs; exact asset hashes/media types; generic tags from approved sheet; compatibility; typed option category/axis/value; empty arrays for unspecified presets/strategies/roles/relationships; explicit unresolved public redistribution caveats; Contrast-First Structured Color amendment; seven system strategies without claimed exemplar evidence; four optional color presets with provisional hexadecimal targets; pack tags copied from approved-sheet tags; source-relative mapping for all option/exemplar/document/preset records; generic all-panel subject roles a/b/c and background-a, major importance; empty hue offsets mean no numeric strategy rule established.

**Unresolved:** precise artistic parameters beyond supplied option labels; independent rights verification; knownDefects empty means none supplied, not a defect-free certification; Exact hex targets and generic role assignment in triad presets are provisional; named colors are not source-measured swatches..

**Caveats:** Official is curated development provenance, not a rights certification.; Metadata CC-BY-4.0 intended; visual redistribution unresolved..

Every normalized option, exemplar, document and preset ID is mapped in the machine ledger. Product additions use null source pointers; preset mappings point to the supplied named-triad options.

### official.category-05.background-treatment.v1

Source: `packs/official/05-background-treatment/manifest.json`  
Historical copy: `sources/packs/official/05-background-treatment/manifest.json`  
Normalized: `official/05-background-treatment/manifest.json`

**Unchanged:** pack_id value; version; display_name; exemplar IDs/titles/approved_features/known_defects/tags; option IDs/labels.

**Transformed:** snake_case to camelCase; schema_version to 1.0; asset paths to static library-relative references with hash/media type; documents to typed asset records; licenses to explicit intended/unknown status; notes to compatibility.notes; examples preserved as supporting evidence in asset ledger; governs and does_not_govern carried forward; status user-endorsed retained as development approval through source backup and approvedFeatures; no rights promotion; description carried forward except Category 4 rewritten under approved color amendment; source license strings mapped to intended or unknown; exact statements retained in historical manifest.

**Added:** typed documents with source-derived filename titles; document IDs; exact asset hashes/media types; generic tags from approved sheet; compatibility; typed option category/axis/value; empty arrays for unspecified presets/strategies/roles/relationships; explicit unresolved public redistribution caveats; Flat Field neutral texture and None neutral finish from explicit Phase 3 requirements; pack tags copied from approved-sheet tags; source-relative mapping for all option/exemplar/document/preset records.

**Unresolved:** precise artistic parameters beyond supplied option labels; independent rights verification; knownDefects empty means none supplied, not a defect-free certification.

**Caveats:** Official is curated development provenance, not a rights certification.; Metadata CC-BY-4.0 intended; visual redistribution unresolved..

Every normalized option, exemplar, document and preset ID is mapped in the machine ledger. Product additions use null source pointers; preset mappings point to the supplied named-triad options.

### official.category-06.lighting.v1

Source: `packs/official/06-lighting/manifest.json`  
Historical copy: `sources/packs/official/06-lighting/manifest.json`  
Normalized: `official/06-lighting/manifest.json`

**Unchanged:** pack_id value; version; display_name; exemplar IDs/titles/approved_features/known_defects/tags; option IDs/labels.

**Transformed:** snake_case to camelCase; schema_version to 1.0; asset paths to static library-relative references with hash/media type; documents to typed asset records; licenses to explicit intended/unknown status; notes to compatibility.notes; examples preserved as supporting evidence in asset ledger; governs and does_not_govern carried forward; status user-endorsed retained as development approval through source backup and approvedFeatures; no rights promotion; description carried forward except Category 4 rewritten under approved color amendment; source license strings mapped to intended or unknown; exact statements retained in historical manifest.

**Added:** typed documents with source-derived filename titles; document IDs; exact asset hashes/media types; generic tags from approved sheet; compatibility; typed option category/axis/value; empty arrays for unspecified presets/strategies/roles/relationships; explicit unresolved public redistribution caveats; pack tags copied from approved-sheet tags; source-relative mapping for all option/exemplar/document/preset records.

**Unresolved:** precise artistic parameters beyond supplied option labels; independent rights verification; knownDefects empty means none supplied, not a defect-free certification.

**Caveats:** Official is curated development provenance, not a rights certification.; Metadata CC-BY-4.0 intended; visual redistribution unresolved..

Every normalized option, exemplar, document and preset ID is mapped in the machine ledger. Product additions use null source pointers; preset mappings point to the supplied named-triad options.

### official.category-07.ink-contour-black-structure.v1

Source: `packs/official/07-ink-contour-black-structure/manifest.json`  
Historical copy: `sources/packs/official/07-ink-contour-black-structure/manifest.json`  
Normalized: `official/07-ink-contour-black-structure/manifest.json`

**Unchanged:** pack_id value; version; display_name; exemplar IDs/titles/approved_features/known_defects/tags; option IDs/labels.

**Transformed:** snake_case to camelCase; schema_version to 1.0; asset paths to static library-relative references with hash/media type; documents to typed asset records; licenses to explicit intended/unknown status; notes to compatibility.notes; examples preserved as supporting evidence in asset ledger; governs and does_not_govern carried forward; status user-endorsed retained as development approval through source backup and approvedFeatures; no rights promotion; description carried forward except Category 4 rewritten under approved color amendment; source license strings mapped to intended or unknown; exact statements retained in historical manifest.

**Added:** typed documents with source-derived filename titles; document IDs; exact asset hashes/media types; generic tags from approved sheet; compatibility; typed option category/axis/value; empty arrays for unspecified presets/strategies/roles/relationships; explicit unresolved public redistribution caveats; pack tags copied from approved-sheet tags; source-relative mapping for all option/exemplar/document/preset records.

**Unresolved:** precise artistic parameters beyond supplied option labels; independent rights verification; knownDefects empty means none supplied, not a defect-free certification.

**Caveats:** Official is curated development provenance, not a rights certification.; Metadata CC-BY-4.0 intended; visual redistribution unresolved..

Every normalized option, exemplar, document and preset ID is mapped in the machine ledger. Product additions use null source pointers; preset mappings point to the supplied named-triad options.

### official.category-08.pose-gesture-body-mechanics.v1

Source: `packs/official/08-pose-gesture-body-mechanics/manifest.json`  
Historical copy: `sources/packs/official/08-pose-gesture-body-mechanics/manifest.json`  
Normalized: `official/08-pose-gesture-body-mechanics/manifest.json`

**Unchanged:** pack_id value; version; display_name; exemplar IDs/titles/approved_features/known_defects/tags; option IDs/labels.

**Transformed:** snake_case to camelCase; schema_version to 1.0; asset paths to static library-relative references with hash/media type; documents to typed asset records; licenses to explicit intended/unknown status; notes to compatibility.notes; examples preserved as supporting evidence in asset ledger; governing scope adjusted only by approved amendments; status user-endorsed retained as development approval through source backup and approvedFeatures; no rights promotion; description carried forward except Category 4 rewritten under approved color amendment; source license strings mapped to intended or unknown; exact statements retained in historical manifest.

**Added:** typed documents with source-derived filename titles; document IDs; exact asset hashes/media types; generic tags from approved sheet; compatibility; typed option category/axis/value; empty arrays for unspecified presets/strategies/roles/relationships; explicit unresolved public redistribution caveats; pack tags copied from approved-sheet tags; source-relative mapping for all option/exemplar/document/preset records.

**Unresolved:** precise artistic parameters beyond supplied option labels; independent rights verification; knownDefects empty means none supplied, not a defect-free certification.

**Caveats:** Official is curated development provenance, not a rights certification.; Metadata CC-BY-4.0 intended; visual redistribution unresolved..

Every normalized option, exemplar, document and preset ID is mapped in the machine ledger. Product additions use null source pointers; preset mappings point to the supplied named-triad options.

### official.category-09.color-palette-mood.v1

Source: `packs/official/09-color-palette-mood/manifest.json`  
Historical copy: `sources/packs/official/09-color-palette-mood/manifest.json`  
Normalized: `official/09-color-palette-mood/manifest.json`

**Unchanged:** pack_id value; version; display_name; exemplar IDs/titles/approved_features/known_defects/tags; option IDs/labels.

**Transformed:** snake_case to camelCase; schema_version to 1.0; asset paths to static library-relative references with hash/media type; documents to typed asset records; licenses to explicit intended/unknown status; notes to compatibility.notes; examples preserved as supporting evidence in asset ledger; governs and does_not_govern carried forward; status user-endorsed retained as development approval through source backup and approvedFeatures; no rights promotion; description carried forward except Category 4 rewritten under approved color amendment; source license strings mapped to intended or unknown; exact statements retained in historical manifest.

**Added:** typed documents with source-derived filename titles; document IDs; exact asset hashes/media types; generic tags from approved sheet; compatibility; typed option category/axis/value; empty arrays for unspecified presets/strategies/roles/relationships; explicit unresolved public redistribution caveats; pack tags copied from approved-sheet tags; source-relative mapping for all option/exemplar/document/preset records.

**Unresolved:** precise artistic parameters beyond supplied option labels; independent rights verification; knownDefects empty means none supplied, not a defect-free certification.

**Caveats:** Official is curated development provenance, not a rights certification.; Metadata CC-BY-4.0 intended; visual redistribution unresolved..

Every normalized option, exemplar, document and preset ID is mapped in the machine ledger. Product additions use null source pointers; preset mappings point to the supplied named-triad options.

### official.category-10.theme-costume-transformation.v1

Source: `packs/official/10-theme-costume-transformation/manifest.json`  
Historical copy: `sources/packs/official/10-theme-costume-transformation/manifest.json`  
Normalized: `official/10-theme-costume-transformation/manifest.json`

**Unchanged:** pack_id value; version; display_name; exemplar IDs/titles/approved_features/known_defects/tags; option IDs/labels.

**Transformed:** snake_case to camelCase; schema_version to 1.0; asset paths to static library-relative references with hash/media type; documents to typed asset records; licenses to explicit intended/unknown status; notes to compatibility.notes; examples preserved as supporting evidence in asset ledger; governs and does_not_govern carried forward; status user-endorsed retained as development approval through source backup and approvedFeatures; no rights promotion; description carried forward except Category 4 rewritten under approved color amendment; source license strings mapped to intended or unknown; exact statements retained in historical manifest.

**Added:** typed documents with source-derived filename titles; document IDs; exact asset hashes/media types; generic tags from approved sheet; compatibility; typed option category/axis/value; empty arrays for unspecified presets/strategies/roles/relationships; explicit unresolved public redistribution caveats; pack tags copied from approved-sheet tags; source-relative mapping for all option/exemplar/document/preset records.

**Unresolved:** precise artistic parameters beyond supplied option labels; independent rights verification; knownDefects empty means none supplied, not a defect-free certification.

**Caveats:** Official is curated development provenance, not a rights certification.; Metadata CC-BY-4.0 intended; visual redistribution unresolved..

Every normalized option, exemplar, document and preset ID is mapped in the machine ledger. Product additions use null source pointers; preset mappings point to the supplied named-triad options.

### official.category-11.rendering-style-illustration-technique.v1

Source: `packs/official/11-rendering-style-illustration-technique/manifest.json`  
Historical copy: `sources/packs/official/11-rendering-style-illustration-technique/manifest.json`  
Normalized: `official/11-rendering-style-illustration-technique/manifest.json`

**Unchanged:** pack_id value; version; display_name; exemplar IDs/titles/approved_features/known_defects/tags; option IDs/labels.

**Transformed:** snake_case to camelCase; schema_version to 1.0; asset paths to static library-relative references with hash/media type; documents to typed asset records; licenses to explicit intended/unknown status; notes to compatibility.notes; examples preserved as supporting evidence in asset ledger; governs and does_not_govern carried forward; status user-endorsed retained as development approval through source backup and approvedFeatures; no rights promotion; description carried forward except Category 4 rewritten under approved color amendment; source license strings mapped to intended or unknown; exact statements retained in historical manifest.

**Added:** typed documents with source-derived filename titles; document IDs; exact asset hashes/media types; generic tags from approved sheet; compatibility; typed option category/axis/value; empty arrays for unspecified presets/strategies/roles/relationships; explicit unresolved public redistribution caveats; pack tags copied from approved-sheet tags; source-relative mapping for all option/exemplar/document/preset records.

**Unresolved:** precise artistic parameters beyond supplied option labels; independent rights verification; knownDefects empty means none supplied, not a defect-free certification.

**Caveats:** Official is curated development provenance, not a rights certification.; Metadata CC-BY-4.0 intended; visual redistribution unresolved..

Every normalized option, exemplar, document and preset ID is mapped in the machine ledger. Product additions use null source pointers; preset mappings point to the supplied named-triad options.

### official.category-12.environment-background-abstraction.v1

Source: `packs/official/12-environment-background-abstraction/manifest.json`  
Historical copy: `sources/packs/official/12-environment-background-abstraction/manifest.json`  
Normalized: `official/12-environment-background-abstraction/manifest.json`

**Unchanged:** pack_id value; version; display_name; exemplar IDs/titles/approved_features/known_defects/tags; option IDs/labels.

**Transformed:** snake_case to camelCase; schema_version to 1.0; asset paths to static library-relative references with hash/media type; documents to typed asset records; licenses to explicit intended/unknown status; notes to compatibility.notes; examples preserved as supporting evidence in asset ledger; governs and does_not_govern carried forward; status user-endorsed retained as development approval through source backup and approvedFeatures; no rights promotion; description carried forward except Category 4 rewritten under approved color amendment; source license strings mapped to intended or unknown; exact statements retained in historical manifest.

**Added:** typed documents with source-derived filename titles; document IDs; exact asset hashes/media types; generic tags from approved sheet; compatibility; typed option category/axis/value; empty arrays for unspecified presets/strategies/roles/relationships; explicit unresolved public redistribution caveats; pack tags copied from approved-sheet tags; source-relative mapping for all option/exemplar/document/preset records.

**Unresolved:** precise artistic parameters beyond supplied option labels; independent rights verification; knownDefects empty means none supplied, not a defect-free certification.

**Caveats:** Official is curated development provenance, not a rights certification.; Metadata CC-BY-4.0 intended; visual redistribution unresolved..

Every normalized option, exemplar, document and preset ID is mapped in the machine ledger. Product additions use null source pointers; preset mappings point to the supplied named-triad options.

### official.category-13.expression-micro-mood.v1

Source: `packs/official/13-expression-micro-mood/manifest.json`  
Historical copy: `sources/packs/official/13-expression-micro-mood/manifest.json`  
Normalized: `official/13-expression-micro-mood/manifest.json`

**Unchanged:** pack_id value; version; display_name; exemplar IDs/titles/approved_features/known_defects/tags; option IDs/labels.

**Transformed:** snake_case to camelCase; schema_version to 1.0; asset paths to static library-relative references with hash/media type; documents to typed asset records; licenses to explicit intended/unknown status; notes to compatibility.notes; examples preserved as supporting evidence in asset ledger; governs and does_not_govern carried forward; status user-endorsed retained as development approval through source backup and approvedFeatures; no rights promotion; description carried forward except Category 4 rewritten under approved color amendment; source license strings mapped to intended or unknown; exact statements retained in historical manifest.

**Added:** typed documents with source-derived filename titles; document IDs; exact asset hashes/media types; generic tags from approved sheet; compatibility; typed option category/axis/value; empty arrays for unspecified presets/strategies/roles/relationships; explicit unresolved public redistribution caveats; pack tags copied from approved-sheet tags; source-relative mapping for all option/exemplar/document/preset records.

**Unresolved:** precise artistic parameters beyond supplied option labels; independent rights verification; knownDefects empty means none supplied, not a defect-free certification.

**Caveats:** Official is curated development provenance, not a rights certification.; Metadata CC-BY-4.0 intended; visual redistribution unresolved..

Every normalized option, exemplar, document and preset ID is mapped in the machine ledger. Product additions use null source pointers; preset mappings point to the supplied named-triad options.

### official.category-14.camera-angle-perspective.v1

Source: `packs/official/14-camera-angle-perspective/manifest.json`  
Historical copy: `sources/packs/official/14-camera-angle-perspective/manifest.json`  
Normalized: `official/14-camera-angle-perspective/manifest.json`

**Unchanged:** pack_id value; version; display_name; exemplar IDs/titles/approved_features/known_defects/tags; option IDs/labels.

**Transformed:** snake_case to camelCase; schema_version to 1.0; asset paths to static library-relative references with hash/media type; documents to typed asset records; licenses to explicit intended/unknown status; notes to compatibility.notes; examples preserved as supporting evidence in asset ledger; governing scope adjusted only by approved amendments; status user-endorsed retained as development approval through source backup and approvedFeatures; no rights promotion; description carried forward except Category 4 rewritten under approved color amendment; source license strings mapped to intended or unknown; exact statements retained in historical manifest.

**Added:** typed documents with source-derived filename titles; document IDs; exact asset hashes/media types; generic tags from approved sheet; compatibility; typed option category/axis/value; empty arrays for unspecified presets/strategies/roles/relationships; explicit unresolved public redistribution caveats; pack tags copied from approved-sheet tags; source-relative mapping for all option/exemplar/document/preset records.

**Unresolved:** precise artistic parameters beyond supplied option labels; independent rights verification; knownDefects empty means none supplied, not a defect-free certification.

**Caveats:** Official is curated development provenance, not a rights certification.; Metadata CC-BY-4.0 intended; visual redistribution unresolved..

Every normalized option, exemplar, document and preset ID is mapped in the machine ledger. Product additions use null source pointers; preset mappings point to the supplied named-triad options.

### official.category-15.props-accessories.v1

Source: `packs/official/15-props-accessories/manifest.json`  
Historical copy: `sources/packs/official/15-props-accessories/manifest.json`  
Normalized: `official/15-props-accessories/manifest.json`

**Unchanged:** pack_id value; version; display_name; exemplar IDs/titles/approved_features/known_defects/tags; option IDs/labels.

**Transformed:** snake_case to camelCase; schema_version to 1.0; asset paths to static library-relative references with hash/media type; documents to typed asset records; licenses to explicit intended/unknown status; notes to compatibility.notes; examples preserved as supporting evidence in asset ledger; governs and does_not_govern carried forward; status user-endorsed retained as development approval through source backup and approvedFeatures; no rights promotion; description carried forward except Category 4 rewritten under approved color amendment; source license strings mapped to intended or unknown; exact statements retained in historical manifest.

**Added:** typed documents with source-derived filename titles; document IDs; exact asset hashes/media types; generic tags from approved sheet; compatibility; typed option category/axis/value; empty arrays for unspecified presets/strategies/roles/relationships; explicit unresolved public redistribution caveats; pack tags copied from approved-sheet tags; source-relative mapping for all option/exemplar/document/preset records.

**Unresolved:** precise artistic parameters beyond supplied option labels; independent rights verification; knownDefects empty means none supplied, not a defect-free certification.

**Caveats:** Official is curated development provenance, not a rights certification.; Metadata CC-BY-4.0 intended; visual redistribution unresolved..

Every normalized option, exemplar, document and preset ID is mapped in the machine ledger. Product additions use null source pointers; preset mappings point to the supplied named-triad options.

