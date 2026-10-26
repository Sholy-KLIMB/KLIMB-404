// Supabase Edge Function: klimb-scores. Deploy with JWT verification disabled;
// the game is public, and run tokens authorize finish/submit operations.
const origins=(Deno.env.get('ALLOWED_ORIGINS')||'https://www.goklimb.com,https://goklimb.com').split(',').map(x=>x.trim());
const url=Deno.env.get('SUPABASE_URL')!;
const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const salt=Deno.env.get('IP_HASH_SALT')!;
Deno.serve(async (req:Request)=>{
 const origin=req.headers.get('origin')||'';
 const allowed=origins.includes(origin);
 const headers={'Content-Type':'application/json','Vary':'Origin','Cache-Control':'no-store',...(allowed?{'Access-Control-Allow-Origin':origin}:{})};
 const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
 if(!allowed)return reply({error:'ORIGIN_NOT_ALLOWED'},403);
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'}});
 if(!url||!key||!salt)return reply({error:'NOT_CONFIGURED'},503);
 async function rpc(name:string,args:Record<string,unknown>={}){
  const result=await fetch(url+'/rest/v1/rpc/klimb_'+name,{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(7000)});
  const data=await result.json();if(!result.ok)throw new Error(data.message||'DATABASE_ERROR');return data;
 }
 try{
  if(req.method==='GET')return reply({top:await rpc('top')});
  if(req.method!=='POST')return reply({error:'METHOD_NOT_ALLOWED'},405);
  // Bound the request before parsing to avoid accepting arbitrary payloads.
  const reader=req.body?.getReader();let length=0,text='';const decoder=new TextDecoder();
  if(reader)while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>2048){await reader.cancel();return reply({error:'TOO_LARGE'},413)}text+=decoder.decode(value,{stream:true})}text+=decoder.decode();
  const body=JSON.parse(text);
  if(body.action==='start'){
   const ip=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';
   const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(salt+ip));
   const hash=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
   return reply(await rpc('start',{p_ip:hash}));
  }
  if(typeof body.token!=='string'||! /^[0-9a-f-]{36}$/i.test(body.token))return reply({error:'INVALID_TOKEN'},400);
  if(body.action==='finish'){
   if(!Number.isInteger(body.score)||body.score<1||body.score>2147483647||!Number.isFinite(body.seconds)||body.seconds<0)return reply({error:'INVALID_SCORE'},400);
   return reply(await rpc('finish',{p_token:body.token,p_score:body.score,p_seconds:body.seconds}));
  }
  if(body.action==='submit'){
   if(typeof body.nickname!=='string'||! /^[\p{L}\p{N} _-]{2,16}$/u.test(body.nickname.trim()))return reply({error:'INVALID_NAME'},400);
   return reply(await rpc('submit',{p_token:body.token,p_nickname:body.nickname.trim()}));
  }
  return reply({error:'INVALID_ACTION'},400);
 }catch(error){
  const message=error instanceof Error?error.message:'';
  const known=['RATE_LIMIT','EXPIRED','INVALID_SCORE','IMMUTABLE_SCORE','INVALID_NAME'];
  const code=known.find(x=>message.includes(x));
  return reply({error:code||'UNAVAILABLE'},code==='RATE_LIMIT'?429:code?400:503);
 }
});
