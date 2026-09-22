import fs from 'node:fs';import path from 'node:path';import {execFileSync} from 'node:child_process';
for(const file of fs.readdirSync('public/js').filter(f=>f.endsWith('.js')))execFileSync(process.execPath,['--check',path.join('public/js',file)]);
for(const file of ['public/index.html','public/css/styles.css','public/js/config.js','firestore.rules','README.md'])if(!fs.existsSync(file))throw new Error('Arquivo ausente: '+file);
const seed=JSON.parse(fs.readFileSync('public/data/seed.json'));for(const b of seed.builds){if(b.sections.some(s=>/<script|onerror=|onclick=/i.test(s.html)))throw new Error('HTML ativo em build');}
console.log('Módulos JavaScript e estrutura: OK.');
