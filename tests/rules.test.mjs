import {test,before,after,beforeEach} from 'node:test';import fs from 'node:fs';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {doc,setDoc,getDoc,updateDoc,serverTimestamp} from 'firebase/firestore';
let env;
before(async()=>{env=await initializeTestEnvironment({projectId:'demo-presa-doce',firestore:{rules:fs.readFileSync('firestore.rules','utf8'),host:'127.0.0.1',port:8080}});});
after(async()=>env?.cleanup());
beforeEach(async()=>{await env.clearFirestore();await env.withSecurityRulesDisabled(async ctx=>{const db=ctx.firestore();await Promise.all([
setDoc(doc(db,'users/admin'),{role:'admin',displayName:'Admin',createdAt:new Date()}),
setDoc(doc(db,'users/a'),{role:'player',displayName:'A',createdAt:new Date()}),
setDoc(doc(db,'users/b'),{role:'player',displayName:'B',createdAt:new Date()}),
setDoc(doc(db,'characters/hero'),{name:'Hero',race:'Khajiit',class:'Templar',role:'DPS',content:'PvE',weapons:'Espada',buildId:'hero-v1',public:true,archived:false}),
setDoc(doc(db,'builds/hero-v1'),{characterId:'hero',public:true,checklistIds:['skill']}),
setDoc(doc(db,'assignments/hero'),{ownerUid:'a'})]);});});
const db=uid=>uid?env.authenticatedContext(uid).firestore():env.unauthenticatedContext().firestore();
const progress=uid=>({level:27,attributes:30,completed:['skill'],notes:'Aprendendo',buildId:'hero-v1',public:true,revision:1,updatedAt:serverTimestamp(),updatedBy:uid});
test('visitante lê personagem e build; não acessa contas ou escreve',async()=>{await assertSucceeds(getDoc(doc(db(),'characters/hero')));await assertSucceeds(getDoc(doc(db(),'builds/hero-v1')));await assertFails(getDoc(doc(db(),'users/a')));await assertFails(setDoc(doc(db(),'progress/hero'),progress('a')));});
test('dono salva progresso; outro jogador não salva',async()=>{await assertSucceeds(setDoc(doc(db('a'),'progress/hero'),progress('a')));await assertFails(setDoc(doc(db('b'),'progress/hero'),{...progress('b'),revision:2}));});
test('ninguém se promove ou assume personagem pelo cliente',async()=>{await assertFails(updateDoc(doc(db('a'),'users/a'),{role:'admin'}));await assertFails(setDoc(doc(db('b'),'assignments/hero'),{ownerUid:'b'}));await assertFails(setDoc(doc(db('new'),'users/new'),{role:'admin',displayName:'Hack',createdAt:serverTimestamp()}));});
test('admin gerencia vínculo e progresso',async()=>{await assertSucceeds(setDoc(doc(db('admin'),'assignments/hero'),{ownerUid:'b'}));await assertSucceeds(setDoc(doc(db('admin'),'progress/hero'),progress('admin')));await assertFails(setDoc(doc(db('a'),'progress/hero'),{...progress('a'),revision:2}));});
test('servidor rejeita níveis fora da faixa, checklist forjado, campos extras e autor falso',async()=>{for(const patch of [{level:51},{level:0},{level:1.5},{completed:['other']},{completed:['skill','skill']},{notes:'x'.repeat(2001)},{admin:true},{updatedBy:'admin'},{attributes:65},{buildId:'wrong'}])await assertFails(setDoc(doc(db('a'),'progress/hero'),{...progress('a'),...patch}));});
test('build existente é imutável até para admin',async()=>{await assertFails(updateDoc(doc(db('admin'),'builds/hero-v1'),{checklistIds:[]}));await assertFails(updateDoc(doc(db('a'),'characters/hero'),{buildId:'wrong'}));});
test('revisão impede sobrescrita de sessão desatualizada',async()=>{await assertSucceeds(setDoc(doc(db('a'),'progress/hero'),progress('a')));await assertFails(setDoc(doc(db('a'),'progress/hero'),progress('a')));await assertSucceeds(setDoc(doc(db('a'),'progress/hero'),{...progress('a'),level:28,revision:2}));});
test('cadastro cria somente perfil próprio de jogador',async()=>{await assertSucceeds(setDoc(doc(db('new'),'users/new'),{role:'player',displayName:'Novo',createdAt:serverTimestamp()}));await assertFails(setDoc(doc(db('new'),'users/other'),{role:'player',displayName:'Outro',createdAt:serverTimestamp()}));});
test('importação atômica das cinco builds e personagens reais',async()=>{const {writeBatch}=await import('firebase/firestore');const seed=JSON.parse(fs.readFileSync('public/data/seed.json'));const store=db('admin'),batch=writeBatch(store);for(const b of seed.builds){const {id,...data}=b;batch.set(doc(store,'builds',id),{...data,public:true});}for(const c of seed.characters){const {id,...data}=c;batch.set(doc(store,'characters',id),data);}await assertSucceeds(batch.commit());});
test('consultas públicas e consulta privada de vínculos',async()=>{const {collection,query,where,getDocs}=await import('firebase/firestore');await assertSucceeds(getDocs(query(collection(db(),'characters'),where('public','==',true))));await assertSucceeds(getDocs(query(collection(db(),'builds'),where('public','==',true))));await assertSucceeds(getDocs(query(collection(db(),'progress'),where('public','==',true))));await assertSucceeds(getDocs(query(collection(db('a'),'assignments'),where('ownerUid','==','a'))));await assertFails(getDocs(collection(db('b'),'assignments')));});
