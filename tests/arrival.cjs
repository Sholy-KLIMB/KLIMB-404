const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('build/klimb-embed.source.html','utf8');
const timers=[],attrs=new Set(),button={disabled:false};
const env={state:'ready',reduced:false,arrivalLaunch:0,performance:{now:()=>100},root:{hasAttribute:n=>attrs.has(n),setAttribute:n=>attrs.add(n),removeAttribute:n=>attrs.delete(n),querySelector:()=>button},setTimeout:(fn,ms)=>timers.push({fn,ms}),reset(){env.state='running';env.starts++},starts:0};vm.createContext(env);vm.runInContext(source.match(/^function startArrival\(\).*$/m)[0],env);
env.startArrival();env.startArrival();assert.equal(timers.length,1);assert.equal(env.starts,0);assert.equal(button.disabled,true);assert.equal(timers[0].ms,450);timers.shift().fn();assert.equal(env.starts,1);assert.equal(button.disabled,false);assert.equal(attrs.size,0);env.state='ready';env.reduced=true;env.startArrival();assert.equal(timers[0].ms,0);timers.shift().fn();assert.equal(env.starts,2);
assert(source.includes("const visible=state==='over'"));assert(source.includes('target="_top">Retour à l’accueil'));for(let i=0;i<4;i++)assert(fs.existsSync('assets/terrain/'+i+'.png'));
console.log('Arrival: single launch, transition delay, reduced motion, home link, board state and assets passed');
