/** Phase 1 contracts. Generic identifiers carry meaning through data, never subject-specific code. */
export const SCHEMA_VERSION = '1.0' as const;
export type SchemaVersion = typeof SCHEMA_VERSION;
export type Provenance = 'official' | 'community';
export type PanelId = string;
export type PanelScope = { kind: 'all' } | { kind: 'panels'; panelIds: PanelId[] };
export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
export interface PresetReference { presetId: string; provenance: Provenance }
export type Choice<T> =
  | { kind: 'literal'; value: T }
  | { kind: 'preset'; reference: PresetReference }
  | { kind: 'random'; candidates: T[] };
export type OverrideChoice<T> = Choice<T> | { kind: 'inherit' };
export interface ScopedSetting<T> {
  global: Choice<T>;
  perPanel: Record<PanelId, OverrideChoice<T>>;
}
export type StructuredPattern = 'role_rotation' | 'alternation' | 'paired_echo' | 'inversion'
  | 'progression' | 'escalation' | 'controlled_sequence';
export type VariationRule<T> =
  | { mode: 'uniform' }
  | { mode: 'structured'; pattern: StructuredPattern; sequence: T[] }
  | { mode: 'random'; candidates: T[] }
  | { mode: 'manual'; perPanel: Record<PanelId, OverrideChoice<T>> };
export interface CategorySetting<T> extends ScopedSetting<T> {
  variation: VariationRule<T>;
  additionalInstructions: string;
}
export interface AssetReference { id: string; path: string; mediaType: string; sha256: string }
/** URL-only pack evidence can retain provenance without redistributing third-party bytes. */
export type PackAssetReference = AssetReference | { id: string; sourceUrl: string; mediaType: string } | { id: string; mediaType: string; unavailableReason: string };
export interface LicenseInfo {
  identifier: string;
  status: 'declared' | 'intended' | 'verified' | 'unknown';
  attribution: string;
  sourceUrl?: string;
  redistribution?: 'allowed' | 'external_only' | 'not_redistributable' | 'unresolved' | 'private_use_only';
}
export interface ContextPackReference {
  packId: string;
  displayName: string;
  provenance: Provenance;
  contextAssets: AssetReference[];
}
export interface Canvas {
  aspectRatio: { width: number; height: number };
  panels: { id: PanelId; row: number; column: number; rowSpan: number; columnSpan: number }[];
  grid: { rows: number; columns: number };
  outerBorder: { enabled: boolean; thickness: number; color: HexColor };
  dividers: { enabled: boolean; thickness: number; color: HexColor };
  additionalInstructions: string;
}
export interface Composition {
  framing: string; camera: string; pose: string;
  headOrientation: string; eyeDirection: string; expression: string;
  family?: 'conventional' | 'unconventional'; technique?: string;
  subjectPlacement?: {x: number; y: number}; cropExtent?: string;
  cameraElevation?: string; cameraOrientation?: string; torsoOrientation?: string;
  focalRegion?: string; negativeSpace?: {direction: string; amount: number}; edgeTreatment?: string;
}
export type HexColor = string; // Runtime schema requires #RRGGBB.
export type ColorStrategy =
  | { kind: 'builtin'; id: 'high_contrast_structured' | 'complementary' | 'split_complementary'
      | 'triadic' | 'analogous' | 'monochromatic' | 'custom' }
  | { kind: 'pack'; packId: string; strategyId: string };
export interface ColorRole {
  id: string;
  importance: 'major' | 'minor';
  domain: 'subject' | 'background' | 'prop' | 'accent';
  displayLabel?: string;
  materialLabel?: string;
  panelScope: PanelScope;
}
export type RelationshipType = 'touching' | 'overlapping' | 'same_focal_region' | 'likely_visual_merging';
export interface IntentionalSeparator {
  type: 'black_contour' | 'gap' | 'explicit_boundary' | 'other';
  description: string;
  strength: 'supporting' | 'strong';
}
export interface ColorRelationship {
  roleIds: [string, string];
  type: RelationshipType;
  panelScope: PanelScope;
  separators: IntentionalSeparator[];
}
export interface ColorAssignment { roleId: string; color: HexColor }
export interface Palette { assignments: ColorAssignment[]; mood?: string }
export type ColorPattern = 'role_rotation' | 'alternation' | 'paired_echo' | 'inversion'
  | 'progressive_shift' | 'controlled_sequence';
export type ColorVariationRule =
  | { mode: 'uniform' }
  | { mode: 'structured'; pattern: ColorPattern; sequence: Palette[] }
  | { mode: 'random'; candidates: Palette[] }
  | { mode: 'manual'; perPanel: Record<PanelId, OverrideChoice<Palette>> };
export interface ColorState extends ScopedSetting<Palette> {
  strategy: ColorStrategy;
  roles: ColorRole[];
  relationships: ColorRelationship[];
  variation: ColorVariationRule;
  additionalInstructions: string;
}
export interface TextureLayer {
  family: string; intensity: number; region: string; exclusions: string[];
  additionalInstructions: string;
}
export interface PrintFinish {
  family: string; intensity: number; scope: 'subject' | 'background' | 'global';
  additionalInstructions: string;
}
export interface TextureTreatment {
  backgroundField: string; environment?: string;
  subject: TextureLayer; background: TextureLayer; finishes: PrintFinish[];
}
export interface Lighting {
  style: string; direction: string; intensity: number; colorBehavior: string; color?: HexColor;
  additionalInstructions: string;
}
export interface LightingRendering {
  subjectLighting: Lighting; backgroundLighting: Lighting;
  ink: string; rendering: string;
}
export interface RenderingSliders {
  subjectPreservation: number; themePreservation: number;
  subjectAbstraction: number; backgroundAbstraction: number;
  subjectStyleIntensity: number; backgroundStyleIntensity: number;
  subjectTextureIntensity: number; backgroundTextureIntensity: number;
}
export interface ElementBase {
  id: string; panelScope: PanelScope; placement: string; scale: number;
  orientation: string; layering: string; additionalInstructions: string;
}
export interface TextElement extends ElementBase {
  type: 'speech_balloon' | 'thought_balloon' | 'caption' | 'title' | 'sound_effect';
  content: string; style: string; cropBehavior: string;
}
export interface PropElement extends ElementBase {
  description: string; interaction: string; contactLogic: string;
}
export interface EffectElement extends ElementBase {
  description: string; target: string; intensity: number; spread: string;
}
export interface ProductionExemplar {
  id: string; asset: AssetReference; name: string; role: string; panelScope: PanelScope;
  transfer: string[]; doNotTransfer: string[]; notes: string;
  packMetadata?: {packId:string; provenance:Provenance; license:LicenseInfo; governs:string[]; doesNotGovern:string[]; approvedFeatures:string[]; knownDefects:string[]; tags:string[]};
}
export interface GenerationRecord {
  id: string; status: 'accepted' | 'rejected' | 'working';
  image?: AssetReference; projectStateAsset?: AssetReference; productionSpecAsset?: AssetReference;
  label?: string; createdAt?: string; notes?: string;
}
export interface FeedbackRecord {
  id: string; generationOrAssetId: string; status: 'accepted' | 'rejected' | 'working';
  positiveFeedback: string[]; negativeFeedback: string[]; nextChange: string;
  notes?: string; recordedAt?: string; productionSpecAsset?: AssetReference; endorsed?: boolean;
  endorsementScope: 'global_preference' | 'project_specific' | 'local_exception' | 'exemplar_candidate';
}
export interface FeedbackLedger { schemaVersion: SchemaVersion; records: FeedbackRecord[] }
export interface ProjectState {
  schemaVersion: SchemaVersion;
  project: { id: string; name: string };
  subject: ContextPackReference | null;
  theme: ContextPackReference | null;
  canvas: Canvas;
  composition: CategorySetting<Composition>;
  color: ColorState;
  texture: CategorySetting<TextureTreatment>;
  lightingRendering: CategorySetting<LightingRendering>;
  sliders: CategorySetting<RenderingSliders>;
  typography: { enabled: boolean; elements: TextElement[]; additionalInstructions: string };
  props: { elements: PropElement[]; additionalInstructions: string };
  effects: { elements: EffectElement[]; additionalInstructions: string };
  exemplars: ProductionExemplar[];
  exemplarInstructions?: string;
  /** Committed concrete selections; never a seed or a reroll trigger. */
  randomDecisions?: Record<string, JsonValue>;
  generationHistory: GenerationRecord[];
  feedbackLedger: FeedbackLedger;
}
/** Central runtime state: binary storage sits outside JSON; project remains portable. */
export interface ApplicationState {
  project: ProjectState;
  globalUserPresets: Preset[];
  ui: { appearance: 'light' | 'dark'; activeTab: string };
}
export interface ResolvedPanel {
  panelId: PanelId;
  composition: Composition;
  color: Palette;
  texture: TextureTreatment;
  lightingRendering: LightingRendering;
  sliders: RenderingSliders;
}
export interface ResolvedChoreography {
  mode: 'uniform' | 'structured' | 'random' | 'manual';
  pattern?: StructuredPattern | ColorPattern;
  panelSources: {panelId:PanelId;source:'global'|'structured'|'committed_random'|'manual'|'override'}[];
}
export interface ProductionDisplay {
  layoutName:string;
  /** Labels only for terms actually present in this concrete snapshot. */
  terms:Record<string,string>;
}
export interface ProductionSpec {
  schemaVersion: SchemaVersion;
  project: ProjectState['project'];
  subject: ContextPackReference;
  theme: ContextPackReference;
  canvas: Canvas;
  color: { strategy: ColorStrategy; roles: ColorRole[]; relationships: ColorRelationship[] };
  panels: ResolvedPanel[];
  choreography?: Record<ScopedCategory,ResolvedChoreography>;
  display?: ProductionDisplay;
  categoryInstructions: {
    composition: string; color: string; texture: string; lightingRendering: string;
    sliders: string; typography: string; props: string; effects: string; exemplars?: string;
  };
  typography: ProjectState['typography'];
  props: ProjectState['props'];
  effects: ProjectState['effects'];
  exemplars: ProductionExemplar[];
}
export type ScopedCategory = 'composition' | 'color' | 'texture' | 'lightingRendering' | 'sliders';
export type PanelChoreography =
  | {category:'composition'; variation:VariationRule<Composition>}
  | {category:'color'; variation:ColorVariationRule}
  | {category:'texture'; variation:VariationRule<TextureTreatment>}
  | {category:'lightingRendering'; variation:VariationRule<LightingRendering>}
  | {category:'sliders'; variation:VariationRule<RenderingSliders>};
export type Preset = {
  schemaVersion: SchemaVersion; id: string; name: string; provenance: Provenance;
} & (
  | { category: 'composition'; value: Composition }
  | { category: 'color'; value: Palette; strategy?: ColorStrategy }
  | { category: 'texture'; value: TextureTreatment }
  | { category: 'lightingRendering'; value: LightingRendering }
  | { category: 'sliders'; value: RenderingSliders }
  | { category: 'typography'; value: ProjectState['typography'] }
  | { category: 'props'; value: ProjectState['props'] }
  | { category: 'effects'; value: ProjectState['effects'] }
  | { category: 'panelChoreography'; value: PanelChoreography }
);
export interface PackExemplar {
  id: string; title: string; asset: PackAssetReference; thumbnail?: PackAssetReference;
  governs: string[]; doesNotGovern: string[]; approvedFeatures: string[]; knownDefects: string[];
  provenance: Provenance; license: LicenseInfo; tags: string[];
  production?: {role:string; panelScope:PanelScope; transfer:string[]; doNotTransfer:string[]; notes:string};
}
export interface PackOption {
  id: string; label: string; category: string; axis: string; value: JsonValue;
}
export interface PackColorStrategy {
  id: string; label: string;
  basis: 'high_contrast_structured' | 'complementary' | 'split_complementary'
    | 'triadic' | 'analogous' | 'monochromatic' | 'custom';
  hueOffsets: number[];
}
export interface PackManifest {
  schemaVersion: SchemaVersion; packId: string; displayName: string; version: string;
  provenance: Provenance; packType: string; description: string;
  license: LicenseInfo; governs: string[]; doesNotGovern: string[];
  documents: { id: string; title: string; asset: PackAssetReference; license: LicenseInfo }[];
  exemplars: PackExemplar[]; options: PackOption[]; presets: Preset[];
  colorStrategies: PackColorStrategy[]; colorRoles: ColorRole[]; colorRelationships: ColorRelationship[];
  compatibility: { categories: string[]; notes: string[] }; tags: string[];
}
export interface ProjectManifest {
  schemaVersion: SchemaVersion; projectId: string;
  files: { path: string; sha256: string; mediaType: string; assetIds?:string[]; originalNames?:string[]; byteLength?:number }[];
  projectName?:string; createdAt?:string; modifiedAt?:string; applicationVersion?:string; provenance?:'personal-project';
  subject?:ContextPackReference|null; theme?:ContextPackReference|null; exemplarCount?:number;
  historyCounts?:Record<GenerationRecord['status'],number>; production?:{available:boolean;reason?:string};
  unavailableAssets?:{assetId:string;path:string;reason:string}[];
}
