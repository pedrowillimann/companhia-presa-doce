import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {JSDOM} from 'jsdom';
// Teste de DOM em memória, sem automatizar navegador e sem acesso a serviços externos.
const dom=new JSDOM(fs.readFileSync('public/index.html','utf8'),{url:'https://example.test/companhia-presa-doce/'});
for(const key of ['window','document','location','history','DOMParser','FormData'])globalThis[key]=dom.window[key];
globalThis.confirm=()=>true;window.scrollTo=()=>{};globalThis.fetch=async()=>({ok:true,json:async()=>JSON.parse(fs.readFileSync('public/data/seed.json','utf8'))});
await import('../public/js/app.js');
function route(hash){history.replaceState(null,'',hash);window.dispatchEvent(new dom.window.HashChangeEvent('hashchange'));}
test('inicial exibe cinco fichas sem inventar níveis',()=>{assert.equal(document.querySelectorAll('.member').length,5);assert.equal([...document.querySelectorAll('.level-label')].filter(x=>x.textContent.includes('não informado')).length,5);});
test('pesquisa encontra apenas o membro correspondente',()=>{route('#membros');const input=document.querySelector('#search');input.value='nefasto';input.dispatchEvent(new dom.window.Event('input'));assert.equal(document.querySelectorAll('.member').length,1);assert.match(document.querySelector('.member').textContent,/Nefasto/);});
test('ficha mantém morphs e bloqueia edição de visitante',()=>{route('#ficha/nefasto');assert.match(document.querySelector('main').textContent,/Leeching Strikes/);assert.match(document.querySelector('main').textContent,/Contrair Vampirismo/);assert.equal(document.querySelectorAll('input[name=completed]').length,26);assert.ok([...document.querySelectorAll('input[name=completed]')].every(x=>x.disabled));assert.equal(document.querySelector('#level'),null);});
test('cinco fichas e rota inexistente carregam sem erro de DOM',()=>{for(const id of ['mraaj','darzak','krazir','broschita','nefasto']){route('#ficha/'+id);assert.ok(document.querySelector('.detail-head'));assert.ok(document.querySelector('.progress-panel'));}route('#ficha/inexistente');assert.match(document.querySelector('main').textContent,/não encontrada/);});
test('área administrativa não aparece para visitante',()=>{route('#admin');assert.equal(document.querySelector('#admin-link').hidden,true);assert.equal(document.querySelector('#seed'),null);});
