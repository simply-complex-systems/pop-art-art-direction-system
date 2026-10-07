import type { PackManifest, PackOption, PackExemplar, Preset, Provenance } from '../state/types.js';
export interface CatalogCategory {
  number: number; packId: string; displayName: string; packType: string; provenance: 'official';
  manifestPath: string; manifestSha256: string; optionIds: string[]; presetIds: string[];
}
export interface OfficialCatalog {
  schemaVersion: '1.0'; libraryId: string; displayName: string; provenance: 'official'; status: string;
  ledgerPath: string; categories: CatalogCategory[];
  colorSystem: { defaultStrategy: string; strategies: {id: string; label: string; exemplarEvidence: string[]}[];
    majorRoleSeparation: string; backgroundSeparation: string; custom: string; presetTargets: string };
}
export interface SourceAssetRecord {
  sourcePath: string; path: string; sha256: string; bytes: number; kind: 'source-original' | 'derivative';
  derivedFrom: string | null; redistribution: 'unresolved' | 'source-license-review'; inventoryVerified: boolean;
}
export interface RecordMapping { normalizedId: string; sourcePointer: string | null }
export interface NormalizationRecord {
  sourcePath: string; sourceSha256: string; historicalPath: string; normalizedPath: string; packId: string;
  unchanged: string[]; transformed: string[]; added: string[]; unresolved: string[]; caveats: string[];
  options: RecordMapping[]; exemplars: (RecordMapping & {sourceAsset: string})[];
  documents: (RecordMapping & {sourceAsset: string})[];
  presets: (RecordMapping & {status: string})[];
}
export interface NormalizationLedger {
  schemaVersion: '1.0'; sourceInventoryPath: string; sourceInventorySha256: string;
  records: NormalizationRecord[]; assets: SourceAssetRecord[]; derivatives: SourceAssetRecord[];
}
export interface Registered<T> { packId: string; provenance: Provenance; value: T }
export interface LibraryRegistry {
  catalog: OfficialCatalog; ledger: NormalizationLedger; packs: ReadonlyMap<string, PackManifest>;
  options: ReadonlyMap<string, Registered<PackOption>>; presets: ReadonlyMap<string, Registered<Preset>>;
  exemplars: ReadonlyMap<string, Registered<PackExemplar>>;
  optionsFor(packId: string, axis?: string): readonly PackOption[];
  assetUrl(path: string): string;
}
