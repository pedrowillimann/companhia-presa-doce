import { connectFirebase } from './firebase.js';
import { validateProgress } from './domain.js';
export class GuildStore {
 constructor(seed){this.seed=seed;this.characters=seed.characters;this.builds=seed.builds;this.progress={};this.assignments={};this.user=null;this.profile=null;this.ready=false;this.unsubs=[];this.accountUnsubs=[];}
 emit(){this.onchange?.();}
 fail(error){this.onerror?.(error);}
 async start(){this.remote=await connectFirebase();if(!this.remote){this.ready=true;this.emit();return;}const {a,auth,f,db}=this.remote;
 this.unsubs.push(f.onSnapshot(f.query(f.collection(db,'characters'),f.where('public','==',true)),s=>{this.characters=s.docs.map(d=>({id:d.id,...d.data()})).filter(c=>!c.archived);this.ready=true;this.emit();},e=>this.fail(e)));
 this.unsubs.push(f.onSnapshot(f.query(f.collection(db,'builds'),f.where('public','==',true)),s=>{this.builds=s.docs.map(d=>({id:d.id,...d.data()}));this.emit();},e=>this.fail(e)));
 this.unsubs.push(f.onSnapshot(f.query(f.collection(db,'progress'),f.where('public','==',true)),s=>{this.progress=Object.fromEntries(s.docs.map(d=>[d.id,d.data()]));this.emit();},e=>this.fail(e)));
 a.onAuthStateChanged(auth,async user=>{this.accountUnsubs.forEach(fn=>fn());this.accountUnsubs=[];this.user=user;this.profile=null;this.assignments={};this.emit();if(!user)return;
 try {const ref=f.doc(db,'users',user.uid);if(!(await f.getDoc(ref)).exists())await f.setDoc(ref,{displayName:user.email.split('@')[0],role:'player',createdAt:f.serverTimestamp()});
 this.accountUnsubs.push(f.onSnapshot(ref,s=>{this.profile=s.data();this.emit();},e=>this.fail(e)));
 this.accountUnsubs.push(f.onSnapshot(f.query(f.collection(db,'assignments'),f.where('ownerUid','==',user.uid)),s=>{this.assignments=Object.fromEntries(s.docs.map(d=>[d.id,d.data()]));this.emit();},e=>this.fail(e)));
 }catch(e){this.fail(e);}});
 }
 build(character){return this.builds.find(b=>b.id===character.buildId);}
 async login(email,password,register=false){const {a,auth}=this.remote;return register?a.createUserWithEmailAndPassword(auth,email,password):a.signInWithEmailAndPassword(auth,email,password);}
 async logout(){await this.remote.a.signOut(this.remote.auth);}
 async reset(email){await this.remote.a.sendPasswordResetEmail(this.remote.auth,email);}
 async save(character,value){const build=this.build(character);validateProgress(value,build);const {f,db}=this.remote;
 const ref=f.doc(db,'progress',character.id);
 await f.runTransaction(db,async tx=>{const previous=await tx.get(ref);const revision=previous.exists()?previous.data().revision:0;if(revision!==(value.revision||0))throw new Error('O progresso mudou em outra sessão. Reabra a ficha antes de salvar.');tx.set(ref,{level:value.level,attributes:value.attributes,completed:value.completed,notes:value.notes,buildId:build.id,public:character.public,revision:revision+1,updatedAt:f.serverTimestamp(),updatedBy:this.user.uid});});
 }
 async adminData(){const {f,db}=this.remote;const [users,assignments,characters]=await Promise.all(['users','assignments','characters'].map(c=>f.getDocs(f.collection(db,c))));return {users:users.docs.map(d=>({id:d.id,...d.data()})),assignments:Object.fromEntries(assignments.docs.map(d=>[d.id,d.data()])),characters:characters.docs.map(d=>({id:d.id,...d.data()}))};}
 async seedDatabase(){const {f,db}=this.remote;await f.runTransaction(db,async tx=>{const paths=[...this.seed.characters.map(c=>['characters',c.id,c]),...this.seed.builds.map(b=>['builds',b.id,{...b,public:true}])];const snapshots=await Promise.all(paths.map(([col,id])=>tx.get(f.doc(db,col,id))));paths.forEach(([col,id,value],i)=>{if(!snapshots[i].exists()){const {id:_,...data}=value;tx.set(f.doc(db,col,id),data);}});});}
 async assign(characterId,ownerUid){const {f,db}=this.remote;await f.setDoc(f.doc(db,'assignments',characterId),{ownerUid});}
 async role(uid,role){const {f,db}=this.remote;await f.updateDoc(f.doc(db,'users',uid),{role});}
 async character(data){const {f,db}=this.remote;const {id,...value}=data;await f.setDoc(f.doc(db,'characters',id),value);}
 async newBuild(build){const {f,db}=this.remote;const {id,...value}=build;await f.runTransaction(db,async tx=>{const ref=f.doc(db,'builds',id);if((await tx.get(ref)).exists())throw new Error('Essa versão já existe. Use um novo ID para preservar o histórico.');tx.set(ref,{...value,public:true});});}
}
