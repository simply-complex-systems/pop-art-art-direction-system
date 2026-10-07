# Pop Art Art-Direction System

A local, desktop-first Art Director for an oriented production agent. It expresses concrete production choices as a human Prompt or production JSON, and preserves personal creative memory in portable project ZIPs. It does not generate images. No backend, account or publication is required.

## Start with the artist-agent workflow

1. Load `orientation/00_START_HERE.pdf` into your production agent. Follow ONE numbered stage at a time; each names the next file.
2. Make the controlled orientation studies and critique them conversationally.
3. In stage 08, provide your own Subject exemplars and negotiate identity/proportions/protected features.
4. In stage 09, provide Theme exemplars and negotiate portable transformation signals without importing their identity.
5. Accept the simple Subject + Theme calibration in stage 10. Freeze/reference the working packs.
6. Open the Art Director and establish those Subject/Theme references. Configure the image.
7. Choose **CREATE PROMPT** or **CREATE JSON** and paste the result into the oriented agent. Both describe the same concrete production snapshot. Broader artistic instructions remain conversational.
8. Save a personal project when useful. Critique results and audit the agent’s understanding only when desired.

The supplied example project is evidence, not the default Subject or Theme. Approved exemplar images are preserved originals with bounded authority. Official approval does not establish public redistribution rights.

## Open locally

Use Node 24 or newer. Run `npm ci`, then `npm run dev`, and open the printed local URL (normally http://127.0.0.1:5173/). To review a build: `npm run build`, then `npm run preview`. No public deployment is performed by these commands.

## Workspace

The persistent summary shows Subject/Theme, panel count, aspect ratio, advisory status and a low-resolution layout schematic. The schematic is not generated artwork. Quick actions remain available. Light/Dark changes workspace appearance only, never production colors.

| Tab | Purpose |
| --- | --- |
| Canvas & Layout | Overall aspect ratio, panel grid, panel geometry, borders and dividers. |
| Composition | Framing, camera, pose, expression and environment direction. |
| Color | Contrast-first structured color, major/minor roles, backgrounds, relationships and unrestricted Custom values. |
| Texture & Print | Independent background field, surface texture and print-finish axes. |
| Lighting & Rendering | Light, rendering, ink and master treatment controls. |
| Typography | Exact authored text, style, placement and panel scope. |
| Props & Effects | Object interactions and visual effects with explicit placement and scope. |
| Exemplars | Attach originals; declare authority, transfer/do-not-transfer and Subject/Theme references. |
| Presets | Official/Community read-only references, editable global user presets, and Packs / Library import/export. |
| Project | Save/Load, project context, original attachments, creative history and feedback. |
| Export | Human Prompt and machine JSON preview/copy from the shared snapshot. |

Use global settings for shared direction and explicit per-panel overrides for differences. Panel Variation Logic coordinates uniform, structured, random or manual changes. Category 8 pose and Category 14 camera remain separate. Structured color encourages distinction among ALL major roles by default; adjacency increases priority, and backgrounds are compared with all major subject roles. Minor accents can repeat. Advisories explain possible problems without forbidding artist choices.

Official presets are examples, not governing rules. Duplicate a read-only preset to edit it; user presets can be created, edited, renamed, duplicated and deleted and are stored globally in this browser. Randomize This Category, Art Direction or Everything has explicit scope. Committed random decisions persist through Project Save/Load. Creating outputs or saving does not reroll them.

## Creative memory

Save Project creates a portable ZIP with project state, an available resolved production specification and prompt, feedback ledger, dossier PDF, original exemplar/context files and generation history. Incomplete Subject/Theme projects can still be saved without fabricated production decisions. Original attached image bytes are not recompressed. Dossier thumbnails are separate presentation derivatives.

Load validates the whole package and hashes before committing it; failure leaves the current project intact. Loaded originals become usable browser File/Blob references. Temporary object URLs are not saved. Global user presets are not overwritten. On reload, inspect the dossier and context with the oriented agent and use the conversational Understanding Check guidance. Accepted history and Exemplar Candidate labels never promote themselves into canon.

## Community packs

Import a ZIP or a standalone metadata manifest under Presets → Packs / Library. Structural failures reject the import atomically. Source claims are retained for audit, while imported packs are installed as Community. Their options extend known control slots; unfamiliar categories remain reference-only. Community installation is session-only in v1. Save the pack ZIP and reimport it in a later session when needed.

Export Pack collects selected options, presets and exemplars. Include original binaries only when redistribution is declared allowed and bytes are present; otherwise retain an honest external/unavailable reference. Contributor declarations are not independent verification. The clean example is `packs/community/generic-graphic-study/`.

## Local corpus versus public candidate

`npm run review-assets` creates the machine/human Publication Asset Review. `npm run release:development` preserves the full authorized local corpus. `npm run release:public` creates a filtered source candidate; `npm run build:public` builds a public-safe site from its primary-visual library. All remain local under `.release/`. The 15 hash-bound, user-attested primary Official sheets are included unchanged. Unresolved supporting binaries remain excluded, with paths/hashes retained in an external-reference index.

The full development package runs the complete integration suite. The filtered source candidate uses `test:public` for shipped contract/metadata behavior; private corpus integration evidence remains in the development package. Do not publish either package without final authorization and review. The Pages workflow is manual and requires explicit publication and rights-review inputs.

## Verification and contribution

Run `npm run typecheck`, `npm test`, `npm run validate-packs`, `npm run build`, `npm run build:public`, `npm run validate-public` and `npm run validate-release`. See CONTRIBUTING.md, docs/PACK_AUTHORING.md, docs/CONTRACTS.md and docs/ARCHITECTURE.md for developer details.

Software: Apache-2.0. Original project documentation/reference material: CC BY 4.0. Fonts retain their bundled licenses. No repository-wide license claim overrides unresolved third-party visual rights; see docs/PUBLICATION_ASSET_REVIEW.md.

## Primary exemplar creator attestation

The public candidate now includes the 15 original approved primary category sheets unchanged. `docs/PRIMARY_EXEMPLAR_PROVENANCE.json` records the user/project creator attestation bound to each exact SHA-256, under the existing CC BY 4.0 original-reference declaration. This records supplied provenance, not independent legal certification. Supporting PDFs, supplemental imagery, raw historical corpus and private review evidence remain excluded. The 11 orientation PDFs reference the available sheets and explicitly separate unavailable supporting references. No public publication is authorized by local candidate generation.
