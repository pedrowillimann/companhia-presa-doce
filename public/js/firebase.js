import { firebaseConfig } from './config.js';
export async function connectFirebase() {
 if (!firebaseConfig) return null;
 const version='12.3.0';
 const [app, authSDK, dbSDK] = await Promise.all(['app','auth','firestore'].map(name=>import(`https://www.gstatic.com/firebasejs/${version}/firebase-${name}.js`)));
 const instance=app.initializeApp(firebaseConfig), auth=authSDK.getAuth(instance), db=dbSDK.getFirestore(instance);
 return {auth,db,a:authSDK,f:dbSDK};
}
