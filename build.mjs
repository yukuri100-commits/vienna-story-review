import fs from 'node:fs';
import path from 'node:path';
const root=import.meta.dirname;
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const assets=Object.fromEntries(fs.readdirSync(path.join(root,'assets')).filter(f=>f.endsWith('.jpg')).map(f=>[path.basename(f,'.jpg'),'data:image/jpeg;base64,'+fs.readFileSync(path.join(root,'assets',f)).toString('base64')]));
const html=read('index.template.html').replace('/* INLINE_STYLES */',read('style.css')).replace('/* INLINE_ASSETS */','const ASSETS = '+JSON.stringify(assets)+';').replace('/* INLINE_QUESTIONS */',read('questions.js')+'\n'+read('core.js')).replace('/* INLINE_APP */',read('app.js'));
fs.writeFileSync(path.join(root,'index.html'),html);
console.log(JSON.stringify({built:true,questions:16,images:Object.keys(assets).length,bytes:Buffer.byteLength(html)}));
