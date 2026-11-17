// Transfers only explicitly selected hotel configuration; never prints values.
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { writeFile, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { saveSettings } from './royal-database.mjs';
const cli = 'C:/Users/lucas/AppData/Roaming/npm/node_modules/vercel/dist/vc.js';
const team='team_bVfd3xAMkjYqJfPwvIG5bydA';
const project='prj_3EJoPtmYbMevlMYUd0hyqdGEq8df';
export async function vercelApi(path, method='GET', body) {
  const inputPath=body ? resolve('.vercel',`royal-request-${randomBytes(8).toString('hex')}.json`) : null;
  if(inputPath)await writeFile(inputPath,JSON.stringify(body),{mode:0o600});
  try { return await new Promise((resolve,reject) => {
    const args=[cli,'api',path,'--method',method,'--scope','bluetrendy','--raw',...(inputPath ? ['--input',inputPath,'--header','Content-Type:application/json']:[])];
    const child=spawn(process.execPath,args,{stdio:['pipe','pipe','pipe'],windowsHide:true});
    let out='',err='';
    child.stdout.on('data',chunk=>out+=chunk); child.stderr.on('data',chunk=>err+=chunk);
    const timer=setTimeout(()=>{child.kill();reject(new Error('Vercel request timed out'));},120_000);
    child.on('error',reject);
    child.on('close',code=>{clearTimeout(timer);if(code)reject(new Error(`Vercel request failed (${code}): ${err.slice(0,400)}`));else {try{resolve(JSON.parse(out));}catch{reject(new Error('Invalid Vercel API response'));}}});
    child.stdin.end();
  }); } finally { if(inputPath)await unlink(inputPath); }
}
if(process.argv[2]==='status') {
  const result=await vercelApi(`/v9/projects/${project}/env?teamId=${team}&decrypt=false`);
  console.log(JSON.stringify({variables:result.envs?.map(({key,type,target})=>({key,type,target})),stripeSecretPresent:result.envs?.some(v=>v.key==='STRIPE_SECRET_KEY'&&v.target?.includes('production'))}));
  const settings=await vercelApi(`/v9/projects/${project}?teamId=${team}`);
  console.log(JSON.stringify({project:settings.name,rootDirectory:settings.rootDirectory,framework:settings.framework,nodeVersion:settings.nodeVersion}));
  const projects=await vercelApi(`/v9/projects?teamId=${team}&limit=100`);
  console.log(JSON.stringify({relatedProjects:projects.projects?.filter(p=>/pineapple/i.test(p.name)).map(p=>({name:p.name,id:p.id}))}));
}
async function setProductionEnv(variable) {
  await new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,[cli,'env','add',variable.key,'production','--project','hulahula-pineapple','--scope','bluetrendy','--force','--yes',...(variable.type==='sensitive'?['--sensitive']:['--no-sensitive'])],{stdio:['pipe','pipe','pipe'],windowsHide:true});
    let err='';child.stderr.on('data',chunk=>err+=chunk);child.stdout.resume();
    const timer=setTimeout(()=>{child.kill();reject(new Error(`Timed out saving ${variable.key}`));},120_000);
    child.on('error',reject);child.on('close',code=>{clearTimeout(timer);if(code)reject(new Error(`Could not save ${variable.key}: ${err.slice(0,180)}`));else resolve();});
    child.stdin.end(variable.value);
  });
}
if(process.argv[2]==='prepare') {
  const publicKey=await vercelApi(`/v1/projects/prj_PbUANWHSj2REC016GIsIlOgZq2Jf/env/BC6Nq2W5BSZNvKk6?teamId=${team}`);
  if(!/^pk_live_/.test(publicKey.value??''))throw new Error('Resort publishable key not readable');
  const settings={STRIPE_PUBLISHABLE_KEY:publicKey.value,SITE_URL:'https://hulahula-pineapple.vercel.app',CRON_SECRET:process.env.CRON_SECRET||randomBytes(32).toString('base64url'),VITE_ONSITE_BOOKING:'false'};
  await saveSettings(settings);
  console.log('Saved resort publishable key and Royal Pineapple site settings.');
  const response=await fetch('https://api.resend.com/domains',{headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`},signal:AbortSignal.timeout(20_000)});
  const data=await response.json();
  console.log(JSON.stringify({emailProviderStatus:response.status,domains:data.data?.map(d=>({name:d.name,status:d.status}))}));
}
if(process.argv[2]==='upload') {
  const existing=await vercelApi(`/v9/projects/${project}/env?teamId=${team}&decrypt=false`);
  const ready=existing.envs?.some(v=>v.key==='STRIPE_SECRET_KEY'&&v.target?.includes('production'));
  process.env.VITE_ONSITE_BOOKING=ready?'true':'false';
  await saveSettings({VITE_ONSITE_BOOKING:process.env.VITE_ONSITE_BOOKING});
  const names=['SITEMINDER_API_KEY','SITEMINDER_PROPERTY_ID','VITE_BOOKING_ENGINE_URL','SITE_URL','VITE_ONSITE_BOOKING',
    'SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','SUPABASE_ANON_KEY','VITE_SUPABASE_URL','VITE_SUPABASE_ANON_KEY',
    'STRIPE_PUBLISHABLE_KEY','RESEND_API_KEY','RESEND_CONTACT_ENQUIRY_TEMPLATE_ID','RESEND_CONTACT_CONFIRMATION_TEMPLATE_ID',
    'CONTACT_FROM','CONTACT_TO','CONTACT_BCC','RESEND_BOOKING_NOTIFICATION_TEMPLATE_ID','RESEND_BOOKING_CONFIRMATION_TEMPLATE_ID',
    'BOOKING_ADMIN_TO','BOOKING_ADMIN_BCC','BOOKING_FROM','CRON_SECRET','BOOKING_DEFAULT_DEPOSIT','BOOKING_HOLD_MINUTES','BOOKING_MAX_ROOMS'];
  const secrets=new Set(['SITEMINDER_API_KEY','SUPABASE_SERVICE_ROLE_KEY','RESEND_API_KEY','CRON_SECRET']);
  const vars=names.filter(name=>process.env[name]).map(key=>({key,value:process.env[key],type:secrets.has(key)?'sensitive':'encrypted',target:['production']}));
  for(let i=0;i<vars.length;i+=3) {
    await Promise.all(vars.slice(i,i+3).map(setProductionEnv));
    console.log(`Saved ${Math.min(i+3,vars.length)}/${vars.length} selected production variables.`);
  }
  console.log(JSON.stringify({project:'hulahula-pineapple',uploaded:vars.map(v=>v.key)}));
}
