import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const text=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const context=vm.createContext({});
vm.runInContext(text('./questions.js')+'\n'+text('./core.js')+'\nthis.qs=QUESTIONS;this.core=QuizCore;',context);
const {qs,core}=context;
assert.equal(qs.length,16);
assert.equal(new Set(qs.map(q=>q.id)).size,16);
assert.equal(qs.map(q=>'ABCD'[q.answer]).join(''),'BCADBCADCBACBDAC');
qs.forEach(q=>{assert.equal(q.options.length,4);assert.ok(/^(What|When|Who|Where|How)\b/.test(q.question));});
let s=core.create();
assert.equal(core.next(s),false);assert.equal(core.check(s),false);assert.equal(core.select(s,8),false);
const missed=[4,10,16];
for(let i=0;i<16;i++){
 const q=core.current(s);const choice=missed.includes(q.id)?(q.answer+1)%4:q.answer;
 assert.equal(core.select(s,choice),true);assert.equal(core.check(s),true);
 assert.equal(core.check(s),false);assert.equal(core.select(s,(choice+1)%4),false);
 assert.equal(core.valid(JSON.parse(JSON.stringify(s))),true);
 assert.equal(core.next(s),true);
}
assert.equal(s.phase,'results');assert.equal(core.correct(s),13);assert.equal(core.answered(s),16);assert.equal(JSON.stringify(core.missed(s)),JSON.stringify(missed));assert.equal(core.next(s),false);
const retry=core.create(core.missed(s));assert.equal(retry.mode,'retry');assert.equal(retry.order.length,3);
while(retry.phase==='quiz'){core.select(retry,core.current(retry).answer);core.check(retry);core.next(retry);}
assert.equal(core.correct(retry),3);assert.equal(core.missed(retry).length,0);assert.equal(core.valid(retry),true);
const bad=JSON.parse(JSON.stringify(s));bad.answers['1'].choice=9;assert.equal(core.valid(bad),false);
assert.equal(core.valid({version:1,order:[1,1],index:0,answers:{},phase:'quiz',mode:'all'}),false);
for(let n=0;n<20;n++){const shuffled=core.create(undefined,true);assert.equal(new Set(shuffled.order).size,16);assert.equal(core.valid(shuffled),true);}
const html=text('./index.html');assert.ok(!html.includes('/* INLINE_'));assert.equal((html.match(/data:image\/jpeg;base64,/g)||[]).length,7);
assert.ok(!/<script[^>]+src=/i.test(html));assert.ok(!/<link[^>]+href=/i.test(html));
console.log('PASS: 16 questions and approved answer key; answer locking; complete scoring; missed-question retry; progress restore; corrupt-data rejection; shuffle; seven embedded images; offline HTML.');
