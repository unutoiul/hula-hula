// Reuse only the explicitly authorized resort Stripe key. Never print it.
import { readFile } from 'node:fs/promises';
import { parseEnv } from 'node:util';
import { spawn } from 'node:child_process';
import { vercelApi } from './configure-royal-production.mjs';

const sourceProject='prj_PbUANWHSj2REC016GIsIlOgZq2Jf';
const targetProject='prj_3EJoPtmYbMevlMYUd0hyqdGEq8df';
const team='team_bVfd3xAMkjYqJfPwvIG5bydA';
const usable=value=>/^(?:sk|rk)_live_[A-Za-z0-9]{20,}$/.test(value??'');
const localSources=['../website-resort/.env.local','../website-resort/.env.production.local','../website-resort/.env.production'];
let key,source;
const checked=[];
for(const path of localSources){
  try {
    const env=parseEnv(await readFile(path,'utf8'));
    const present=usable(env.STRIPE_SECRET_KEY);
    checked.push({path,usableStripeSecret:present});
    if(present){key=env.STRIPE_SECRET_KEY;source=path;break;}
  } catch(error){if(error.code!=='ENOENT')throw error;}
}
if(!key){
  const listing=await vercelApi(`/v9/projects/${sourceProject}/env?teamId=${team}&decrypt=false`);
  const variable=listing.envs?.find(v=>v.key==='STRIPE_SECRET_KEY'&&v.target?.includes('production'));
  if(variable){
    const result=await vercelApi(`/v1/projects/${sourceProject}/env/${variable.id}?teamId=${team}`);
    const readable=usable(result.value);
    checked.push({project:'hulahula-resort',key:variable.key,type:variable.type,readable});
    if(readable){key=result.value;source='Hula Hula Resort production Stripe variable';}
  }
}
if(!key){
  const target=await vercelApi(`/v9/projects/${targetProject}/env?teamId=${team}&decrypt=false`);
  console.log(JSON.stringify({copied:false,reason:'The resort’s saved production Stripe key is write-only and no original value is available in its local configuration.',checked,
    royalPineappleHasProductionSecret:target.envs?.some(v=>v.key==='STRIPE_SECRET_KEY'&&v.target?.includes('production'))},null,2));
  process.exitCode=2;
} else {
  const cli='C:/Users/lucas/AppData/Roaming/npm/node_modules/vercel/dist/vc.js';
  await new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,[cli,'env','add','STRIPE_SECRET_KEY','production','--project','hulahula-pineapple','--scope','bluetrendy','--sensitive','--force','--yes'],{stdio:['pipe','pipe','pipe'],windowsHide:true});
    child.stdout.resume();child.stderr.resume();child.on('error',reject);
    child.on('close',code=>code?reject(new Error('Could not store the protected production Stripe key')):resolve());
    child.stdin.end(key);
  });
  console.log(JSON.stringify({copied:true,source,target:'Royal Pineapple production',key:'STRIPE_SECRET_KEY',protected:true}));
}
