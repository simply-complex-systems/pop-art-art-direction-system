import {useEffect,useState} from 'react';
import {loadInstalledOfficialLibrary} from '../pack-loader/browser.js';
import type {LibraryRegistry} from '../pack-loader/types.js';
export function useOfficialLibrary() {
  const [registry,setRegistry]=useState<LibraryRegistry>();const [error,setError]=useState<string>();
  useEffect(()=>{let active=true;void loadInstalledOfficialLibrary().then(r=>{if(active)setRegistry(r);},e=>{if(active)setError(e instanceof Error?e.message:String(e));});return ()=>{active=false;};},[]);
  return {registry,error};
}
