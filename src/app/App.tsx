import {lazy,Suspense} from 'react';
const PacksLibrary=lazy(()=>import('../tabs/PacksLibrary.js').then(m=>({default:m.PacksLibrary}))); 
import {effectiveRegistry} from '../pack-loader/community-registry.js';
import type {CommunityRegistry} from '../pack-loader/community.js';
import {ProjectTab} from '../tabs/ProjectTab.js';
import {type AssetStore} from '../project-package/assets.js';
import {downloadBytes,dossierThumbnails} from '../project-package/browser.js';
import {canonical} from '../randomization/decisions.js';
import type {ProductionOutputs} from '../export/snapshot.js';
import dossierFontUrl from '../pdf/fonts/DejaVuSans.ttf?url';
import cjkFontUrl from '../pdf/fonts/PopArtCJKFallback.ttf.gz?url';
import {decodeFontResponse} from '../pdf/font-data.js';
import {productionExport,outputsFromSnapshot,productionSourceKey} from '../export/snapshot.js';
import {productionDisplay} from '../export/display.js';
import {browserClipboard,copyText} from '../export/clipboard.js';
import {compilePackPrompt,type PackPromptKind} from '../prompt-compiler/pack-prompts.js';
import {ExportTab,type ProductionOutputKind} from '../tabs/ExportTab.js';
import {validate} from './contracts.js';
import {resolutionContext} from './resolution-context.js';
import {resolveArtDirection} from '../state/resolve-production.js';
import {deriveAdvisories} from '../validation/engine.js';
import {AdvisoryDetails} from '../components/AdvisoryDetails.js';
import {presetEntries,applyPreset,type PresetEntry} from '../presets/library.js';
import {readUserPresets,saveUserPresets} from '../presets/storage.js';
import {PresetControls} from '../presets/PresetControls.js';
import {PresetsTab} from '../tabs/PresetsTab.js';
import {randomizeProject,type RandomScope,type RandomCategory} from '../randomization/engine.js';
import type {Preset,ResolvedPanel} from '../state/types.js';
import {useEffect,useReducer,useState,useMemo} from 'react';
import type {ProjectState} from '../state/types.js';
import type {Advisory} from '../validation/advisories.js';
import {WorkspaceNavigation} from '../components/WorkspaceNavigation.js';
import {SummaryStrip} from '../components/SummaryStrip.js';
import {CanvasLayoutTab} from '../tabs/CanvasLayoutTab.js';
import {CompositionTab,TextureTab,LightingTab} from '../tabs/ArtDirectionTabs.js';
import {ColorTab} from '../tabs/ColorTab.js';
import {TypographyTab,PropsEffectsTab} from '../tabs/ElementsTabs.js';
import {ExemplarsTab} from '../tabs/ExemplarsTab.js';
import {readAppearance,saveAppearance,type AppearanceStorage} from './appearance.js';
import {createWorkspace,workspaceReducer} from './workspace-state.js';
import {readTab,TAB_STORAGE_KEY,TABS,type TabId} from './tabs.js';
import {useOfficialLibrary} from './use-library.js';
function browserStorage():AppearanceStorage|undefined {try{return window.localStorage;}catch{return undefined;}}
const artKey=productionSourceKey;
export function App({initialProject,initialAssets,advisories=[]}:{initialProject?:ProjectState;initialAssets?:AssetStore;advisories?:readonly Advisory[]}) {
  const [state,dispatch]=useReducer(workspaceReducer,undefined,()=>createWorkspace(initialProject,readAppearance(browserStorage()),readTab(browserStorage()),readUserPresets(browserStorage(),validate).presets));
  const {registry:officialRegistry,error}=useOfficialLibrary();const [community,setCommunity]=useState<CommunityRegistry>(()=>new Map());const registry=useMemo(()=>effectiveRegistry(officialRegistry??undefined,community),[officialRegistry,community]);const active=state.ui.activeTab as TabId;const [packToolsOpened,setPackToolsOpened]=useState(()=>active==='presets');useEffect(()=>{if(active==='presets')setPackToolsOpened(true);},[active]);
  const [status,setStatus]=useState(()=>readUserPresets(browserStorage(),validate).message??'');
  const [exportPreview,setExportPreview]=useState<ProductionOutputKind>('prompt');
  const [copyNotice,setCopyNotice]=useState('');const [selectionRequest,setSelectionRequest]=useState(0);
  const [packKind,setPackKind]=useState<PackPromptKind|undefined>();const [packNotice,setPackNotice]=useState('');const [packSelection,setPackSelection]=useState(0);
  const [assets,setAssets]=useState<AssetStore>(()=>initialAssets??new Map());
  const [packageBusy,setPackageBusy]=useState(false);const [packageNotice,setPackageNotice]=useState('');
  const [loadedOutputs,setLoadedOutputs]=useState<{key:string;outputs:ProductionOutputs}|undefined>();
  function currentResolutionContext(){const ctx=resolutionContext(registry??undefined,state.globalUserPresets,validate);const saved=loadedOutputs?.outputs.snapshot.color.strategy;if(saved?.kind==='pack'&&canonical(saved)===canonical(state.project.color.strategy)&&!ctx.availableColorStrategies.some(s=>s.packId===saved.packId&&s.strategyId===saved.strategyId))ctx.availableColorStrategies.push({packId:saved.packId,strategyId:saved.strategyId});return ctx;}
  const exportResult=useMemo(()=>loadedOutputs?.key===artKey(state.project)?{ready:true as const,outputs:loadedOutputs.outputs}:productionExport(state.project,{...currentResolutionContext(),display:productionDisplay(state.project,registry??undefined)}),[state.project,state.globalUserPresets,registry,loadedOutputs]);
  const packPrompts=useMemo(()=>({subject:compilePackPrompt(state.project,'subject'),theme:compilePackPrompt(state.project,'theme'),combined:compilePackPrompt(state.project,'combined')}),[state.project]);
  async function copyProduction(kind:ProductionOutputKind){setExportPreview(kind);if(!exportResult.ready){setCopyNotice(exportResult.message);dispatch({type:'tab',tab:'export'});return;}
    const outcome=await copyText(exportResult.outputs[kind],kind==='prompt'?'Production prompt':'Production JSON',browserClipboard());setCopyNotice(outcome.message);
    if(!outcome.copied){dispatch({type:'tab',tab:'export'});setSelectionRequest(n=>n+1);}
  }
  async function copyPack(kind:PackPromptKind){setPackKind(kind);const label=kind==='combined'?'Subject + Theme packs prompt':kind==='subject'?'Subject Pack prompt':'Theme Pack prompt';
    const outcome=await copyText(packPrompts[kind],label,browserClipboard());setPackNotice(outcome.message);setCopyNotice(outcome.message);if(!outcome.copied){dispatch({type:'tab',tab:'exemplars'});setPackSelection(n=>n+1);}
  }
  async function saveProject(){if(packageBusy)return;setPackageBusy(true);setPackageNotice('Preparing portable project and dossier…');try{const captured=state.project;const {saveProjectPackage}=await import('../project-package/package.js');const fontResponse=await fetch(dossierFontUrl);if(!fontResponse.ok)throw Error('Dossier font could not be loaded.');const fallbackFontBytes:Uint8Array[]=[];if(/[\u1100-\u11ff\u3000-\u9fff\uac00-\ud7af\uff00-\uffef]/u.test(JSON.stringify(captured))){const response=await fetch(cjkFontUrl);fallbackFontBytes.push(await decodeFontResponse(response));}const capturedAssets=new Map(assets);const thumbnails=await dossierThumbnails(capturedAssets);const saved=await saveProjectPackage({project:captured,assets:capturedAssets,thumbnails,validate,fontBytes:new Uint8Array(await fontResponse.arrayBuffer()),fallbackFontBytes,presets:resolutionContext(registry??undefined,state.globalUserPresets,validate).presets,...(exportResult.ready?{outputs:exportResult.outputs}:{unavailableReason:exportResult.message})});downloadBytes(saved.bytes,saved.filename,'application/zip');setPackageNotice(`Project saved: ${saved.filename}. Dossier and originals included${saved.manifest.unavailableAssets?.length?`; ${saved.manifest.unavailableAssets.length} external asset(s) unavailable and declared`:''}.`);}catch(e){setPackageNotice(`Save failed: ${e instanceof Error?e.message:String(e)}`);}finally{setPackageBusy(false);}}
  async function loadProject(file:File){if(packageBusy)return;setPackageBusy(true);setPackageNotice('Validating project package…');try{const {loadProjectPackage}=await import('../project-package/package.js');const loaded=await loadProjectPackage(new Uint8Array(await file.arrayBuffer()),validate);const cached=loaded.production?{key:artKey(loaded.project),outputs:outputsFromSnapshot(loaded.project,loaded.production,validate)}:undefined;setAssets(loaded.assets);setLoadedOutputs(cached);dispatch({type:'loadProject',project:loaded.project});setCopyNotice('');setPackNotice('');setPackageNotice(`Project loaded: ${loaded.project.project.name}. State, available originals and feedback restored; global presets unchanged.`);}catch(e){setPackageNotice(`Load failed; current project unchanged: ${e instanceof Error?e.message:String(e)}`);}finally{setPackageBusy(false);}}
  const entries=presetEntries(registry??undefined,state.globalUserPresets);const context=currentResolutionContext();
  let resolved:ResolvedPanel[]=[];let structuralIssue='';try{resolved=resolveArtDirection(state.project,context);}catch(e){structuralIssue=e instanceof Error?e.message:String(e);}
  function attempt(action:()=>void){try{action();setStatus('');}catch(e){setStatus(e instanceof Error?e.message:String(e));}}
  function apply(entry:PresetEntry){attempt(()=>{const next=applyPreset(state.project,entry,validate);dispatch({type:'edit',edit:()=>next});});}
  function randomize(scope:RandomScope){attempt(()=>{const next=randomizeProject(state.project,scope,registry??undefined,entries,context);dispatch({type:'edit',edit:()=>next});});}
  function saveUsers(presets:Preset[]){dispatch({type:'userPresets',presets});setStatus(saveUserPresets(browserStorage(),presets,validate)??'User presets saved globally.');}
  const toolbar=(category:RandomCategory)=><PresetControls key={category} project={state.project} category={category} entries={entries} apply={apply} randomize={()=>randomize({kind:'category',category})}/>;
  const categoryForTab:Partial<Record<TabId,RandomCategory>>={canvas:'canvas',composition:'composition',color:'color',texture:'texture',lighting:'lightingRendering',typography:'typography'};
  useEffect(()=>{document.documentElement.dataset['appearance']=state.ui.appearance;saveAppearance(browserStorage(),state.ui.appearance);},[state.ui.appearance]);
  useEffect(()=>{try{browserStorage()?.setItem(TAB_STORAGE_KEY,state.ui.activeTab);}catch{/* UI persistence is optional. */}},[state.ui.activeTab]);
  const tabProps={project:state.project,registry:registry??undefined,edit:(edit:(p:ProjectState)=>ProjectState)=>dispatch({type:'edit',edit})};
  const derived=deriveAdvisories(state.project,resolved);const supplied=[...advisories,...derived];
  const reports:readonly Advisory[]=error?[...supplied,{id:'library-load',severity:'warning',category:'exemplars',message:'Reference library unavailable. The workspace remains usable.'}]:supplied;
  return <div className="app-shell">
    <a className="skip-link" href="#workspace">Skip to workspace</a>
    <header className="app-header"><div><p className="eyebrow">Art-direction workspace</p><h1>Pop Art Art-Direction System</h1></div>
      <div className="header-tools"><span className="library-indicator" data-library-status={registry?'ready':error?'error':'loading'}>
        {registry?`Official library · ${officialRegistry?.packs.size??0} packs · Community ${community.size}`:error?'Library unavailable':'Loading library…'}</span>
        <button className="appearance-toggle" type="button" aria-pressed={state.ui.appearance==='dark'} aria-label={`Switch to ${state.ui.appearance==='light'?'dark':'light'} appearance`} onClick={()=>dispatch({type:'appearance'})}>
          Appearance: {state.ui.appearance==='light'?'Light':'Dark'}</button></div>
    </header>
    <SummaryStrip project={state.project} advisories={reports} resolvedPanels={resolved} onArtDirection={()=>randomize({kind:'artDirection'})} onEverything={()=>randomize({kind:'everything'})} onPrompt={()=>{void copyProduction('prompt');}} onJSON={()=>{void copyProduction('json');}} {...(!packageBusy?{onSave:()=>{void saveProject();}}:{})} packageNotice={packageNotice} exportNotice={copyNotice}/>
    <div className="workspace-layout">
      <WorkspaceNavigation activeTab={active} onSelect={tab=>dispatch({type:'tab',tab})}/>
      <main id="workspace" className="workspace-main" tabIndex={-1}>
        {TABS.map(t=><div key={t.id} role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`} hidden={active!==t.id} tabIndex={0}>
          <div className="workspace-heading"><h2>{t.label}</h2><span className="phase-label">Art direction</span></div>
          {status&&active===t.id&&<p className="field-message" role="status">{status}</p>}{structuralIssue&&active===t.id&&<p className="field-message">Structural validation: {structuralIssue}</p>}
          {categoryForTab[t.id]&&toolbar(categoryForTab[t.id]!)}{t.id==='props'&&<>{toolbar('props')}{toolbar('effects')}</>}{t.id==='lighting'&&toolbar('sliders')}
          {t.id==='color'&&<details className="resolved-colors"><summary>Resolved panel colors · {resolved.length} panels</summary><p className="muted">Concrete colors from the shared production resolver. Navigation and appearance changes do not reroll them.</p><div className="resolved-color-grid">{resolved.map((p,i)=><div key={p.panelId}><strong>Panel {i+1} · {p.panelId}</strong>{p.color.assignments.map(a=><p key={a.roleId}><span className="color-swatch" style={{background:a.color}}/> {a.roleId} · {a.color}</p>)}</div>)}</div></details>}
          <AdvisoryDetails records={reports.filter(r=>r.category===t.id)}/>
          {t.id==='canvas'?<CanvasLayoutTab canvas={state.project.canvas} dispatch={dispatch} canExpandPanels={state.project.color.roles.some(r=>r.domain==='background'&&r.panelScope.kind==='all')}/>:t.id==='composition'?<CompositionTab {...tabProps}/>:t.id==='color'?<ColorTab {...tabProps}/>:t.id==='texture'?<TextureTab {...tabProps}/>:t.id==='lighting'?<LightingTab {...tabProps}/>:t.id==='typography'?<TypographyTab {...tabProps}/>:t.id==='props'?<PropsEffectsTab {...tabProps}/>:t.id==='exemplars'?<ExemplarsTab {...tabProps} assets={assets} onAssetsChange={setAssets} onPackPrompt={kind=>{void copyPack(kind);}} {...(packKind?{packOutput:{kind:packKind,text:packPrompts[packKind],notice:packNotice,selectionRequest:packSelection}}:{})}/>:t.id==='presets'?<><Suspense fallback={<p role="status">Loading pack tools…</p>}>{(packToolsOpened||active==='presets')&&<PacksLibrary community={community} setCommunity={setCommunity} official={officialRegistry??undefined} users={state.globalUserPresets} project={state.project} assets={assets} setAssets={setAssets} edit={tabProps.edit} validate={validate}/>}</Suspense><PresetsTab project={state.project} entries={entries} users={state.globalUserPresets} validate={validate} apply={apply} saveUsers={saveUsers} status={status}/></>:t.id==='project'?<ProjectTab project={state.project} edit={tabProps.edit} assets={assets} setAssets={setAssets} result={exportResult} onSave={()=>{void saveProject();}} onLoad={file=>{void loadProject(file);}} busy={packageBusy} notice={packageNotice}/>:t.id==='export'?<ExportTab result={exportResult} preview={exportPreview} onPreview={setExportPreview} onCopy={kind=>{void copyProduction(kind);}} notice={copyNotice} selectionRequest={selectionRequest}/>:null}
          {t.id==='project'&&registry&&<details className="library-details"><summary>Official reference library · {officialRegistry?.packs.size} curated packs</summary>
            <ul>{registry.catalog.categories.map(c=><li key={c.packId}>{c.displayName} · {registry.packs.get(c.packId)?.provenance}</li>)}</ul></details>}
        </div>)}
        <p className="agent-context-note">Subject and Theme are established with your production agent.</p>
      </main>
    </div>
  </div>;
}
