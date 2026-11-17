// Read-only verification of a deployment's public pages, artwork and live APIs.
import assert from 'node:assert/strict';
import { writeFile, readFile, unlink } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';
const base=process.argv[2]?.replace(/\/$/,'');
assert.ok(base?.startsWith('https://hulahula-pineapple'));
const results=[];
const request=process.argv.includes('--authenticated') ? async (url,init={})=>{
  const stem=resolve('.vercel',`verify-${randomBytes(8).toString('hex')}`);
  const headerPath=stem+'.headers',bodyPath=stem+'.body';
  try {
    const status=await new Promise((resolve,reject)=>{
      const args=['C:/Users/lucas/AppData/Roaming/npm/node_modules/vercel/dist/vc.js','curl',String(url),'--scope','bluetrendy','--',
        '--silent','--max-time','55','--dump-header',headerPath,'--output',bodyPath,'--write-out','%{http_code}',
        ...(init.method?['--request',init.method]:[]),...Object.entries(init.headers||{}).flatMap(([k,v])=>['--header',`${k}: ${v}`]),
        ...(init.body?['--data-binary',init.body]:[])];
      const child=spawn(process.execPath,args,{stdio:['ignore','pipe','pipe'],windowsHide:true});
      let output='',error='';child.stdout.on('data',c=>output+=c);child.stderr.on('data',c=>error+=c);
      child.on('error',reject);child.on('close',code=>code?reject(new Error(`Authenticated request failed (${code}): ${error.slice(0,200)}`)):resolve(Number(output.trim())));
    });
    const headers=await readFile(headerPath,'utf8');
    const contentType=[...headers.matchAll(/^content-type:\s*(.+)$/gmi)].at(-1)?.[1].trim()||'';
    return new Response(await readFile(bodyPath),{status,headers:{'Content-Type':contentType}});
  } finally { await Promise.all([headerPath,bodyPath].map(path=>unlink(path).catch(()=>{}))); }
} : fetch;
const paths=['/','/book','/admin','/meetings','/experiences',
  ...['signature-pineapple','emerald-pool-access','premier-blue-sky','double-hibiscus','twin-coco','triple-coco','triple-blue-sky','family-friend-suite'].map(id=>`/rooms/${id}`),
  '/logo/royal-pineapple.svg',
  '/images/royal-pineapple/badge-frames/22-balanced-botanical-postcard.webp',
  '/images/royal-pineapple/badge-frames/22-balanced-botanical-postcard-window.svg',
  '/images/royal-pineapple/keepsake-invitation/15-pink-postcard-writing-set.webp',
  '/images/pineapple/daySunday-1600.webp','/api/content','/api/booking/room-types',
  '/api/booking/availability?checkIn=2026-12-10&checkOut=2026-12-11&adults=2&children=0'];
const responses=[];
for(let i=0;i<paths.length;i+=3)responses.push(...await Promise.all(paths.slice(i,i+3).map(async path=>{
  const response=await request(base+path,{signal:AbortSignal.timeout(50_000)});
  const contentType=response.headers.get('content-type')||'';
  const text=await response.text();
  results.push({path,status:response.status,contentType,bytes:Buffer.byteLength(text)});
  assert.equal(response.status,200,`${path}: HTTP ${response.status}`);
  if(path.startsWith('/images/'))assert.match(contentType,/image/);
  return {path,text,contentType};
})));
const content=JSON.parse(responses.find(r=>r.path==='/api/content').text);
assert.equal(content.activities.length,7);assert.equal(content.activities.find(a=>a.weekday===7)?.images[0],'/images/pineapple/daySunday-1600.webp');
const availability=JSON.parse(responses.find(r=>r.path.startsWith('/api/booking/availability')).text);
assert.equal(availability.currency,'THB');assert.ok(availability.roomTypes.length>0);
const html=responses.find(r=>r.path==='/').text;
assert.match(html,/Royal Pineapple/);
const jsPaths=[...html.matchAll(/(?:src|href)="([^" ]+\.js)"/g)].map(m=>m[1]);
assert.ok(jsPaths.length);
for(const path of jsPaths){
  const response=await request(new URL(path,base),{signal:AbortSignal.timeout(20_000)});assert.equal(response.status,200);
  const bundle=await response.text();
  assert.ok(!/sb_secret_|sbp_[a-f0-9]{30}|sk_live_|rk_live_/.test(bundle),'Server secret found in frontend bundle');
}
const invalidContact=await request(base+'/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(15_000)});
assert.equal(invalidContact.status,400);
const staffOnly=await request(base+'/api/booking/refresh-payment',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(15_000)});
assert.equal(staffOnly.status,401);
const cron=await request(base+'/api/cron/reconcile',{signal:AbortSignal.timeout(15_000)});assert.equal(cron.status,401);
const report={url:base,checkedAt:new Date().toISOString(),pagesAndAssets:results,programmeDays:7,liveRoomTypes:availability.roomTypes.length,
  availableRates:availability.roomTypes.reduce((sum,r)=>sum+r.rates.length,0),currency:availability.currency,
  serverSecretsAbsentFromFrontend:true,contactValidation:true,adminPaymentCheckProtected:true,cronProtected:true,writes:0,emailsSent:0};
await writeFile('.vercel/verified-deployment.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
