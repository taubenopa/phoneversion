// TAUBENGAME - Accounts (Firebase): Einloggen mit Benutzername + Passwort, Fortschritt wird online gespeichert
// und ist auf jedem Geraet gleich. Gespeichert: Coins, Waffen, Skins, Story-Stand, Rekord, Charakter, Name.
// Ohne FB_CONFIG (js/firebase-config.js) bleibt alles wie vorher (nur lokal).
const ACC={on:0,user:null,name:'',db:null,auth:null,last:'',busy:0};
const ACC_KEYS=['hfCoins','hfInv','hfSkins','hfSkinEq','hfStory','hfBest','hfCh'];
const accT=(de,en)=>typeof LANG!='undefined'&&LANG=='en'?en:de;
const accMail=n=>n.toLowerCase()+'@taubengame.app';   // Benutzername wird intern zu einer E-Mail-Adresse
function accSnap(){const o={};for(const k of ACC_KEYS){try{const v=localStorage[k];if(v!=null)o[k]=v}catch(e){}}return o}
function accLoadScript(src){return new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s)})}
async function accInit(){
 accUI();if(typeof FB_CONFIG=='undefined'||!FB_CONFIG)return;
 try{const V='10.12.2',B='https://www.gstatic.com/firebasejs/'+V+'/';await accLoadScript(B+'firebase-app-compat.js');await Promise.all([accLoadScript(B+'firebase-auth-compat.js'),accLoadScript(B+'firebase-firestore-compat.js')]);
  firebase.initializeApp(FB_CONFIG);ACC.auth=firebase.auth();ACC.db=firebase.firestore();ACC.on=1;
  ACC.auth.onAuthStateChanged(u=>accState(u));setInterval(accSave,12000);addEventListener('visibilitychange',()=>{if(document.hidden)accSave()});addEventListener('pagehide',accSave);
 }catch(e){ACC.err=accT('Account-Server nicht erreichbar.','Account server not reachable.');console.warn(e)}accUI()}
// Nach dem Einloggen: Online-Stand holen. Gibt es noch keinen, wird der aktuelle Geraete-Stand hochgeladen.
async function accState(u){ACC.user=u||null;if(!u){ACC.name='';accUI();return}
 ACC.name=(u.email||'').split('@')[0];
 try{const ref=ACC.db.collection('users').doc(u.uid),d=await ref.get();
  if(d.exists){const v=d.data(),loc=accSnap(),cl=v.save||{};let changed=0;
   for(const k of ACC_KEYS){if(cl[k]!=null&&cl[k]!==loc[k]){try{localStorage[k]=cl[k]}catch(e){}changed=1}}
   if(v.name)ACC.name=v.name;try{localStorage.hfName=ACC.name.slice(0,10)}catch(e){}ACC.last=JSON.stringify(cl);
   if(changed&&!mode){sessionStorage.accReload=1;location.reload();return}}
  else{const s=accSnap();await ref.set({name:ACC.name,save:s,created:Date.now(),updated:Date.now()});ACC.last=JSON.stringify(s)}
 }catch(e){ACC.err=accT('Speicherstand konnte nicht geladen werden.','Could not load save.');console.warn(e)}
 const nm=document.getElementById('nm');if(nm){nm.value=ACC.name.slice(0,10);nm.disabled=true;try{localStorage.hfName=nm.value}catch(e){}}
 accUI()}
// Speichern, wenn sich etwas geaendert hat
async function accSave(){if(!ACC.on||!ACC.user||ACC.busy)return;const s=accSnap(),j=JSON.stringify(s);if(j===ACC.last)return;ACC.busy=1;
 try{await ACC.db.collection('users').doc(ACC.user.uid).set({name:ACC.name,save:s,updated:Date.now()},{merge:true});ACC.last=j}catch(e){console.warn(e)}ACC.busy=0}
async function accLogin(reg){const n=(document.getElementById('acc-n').value||'').trim(),p=document.getElementById('acc-p').value||'',msg=document.getElementById('acc-msg');
 const say=t=>{msg.textContent=t;msg.className='acc-msg err'};
 if(!/^[A-Za-z0-9_]{3,16}$/.test(n))return say(accT('Name: 3 bis 16 Zeichen, nur Buchstaben, Zahlen und _','Name: 3 to 16 characters, letters, numbers and _ only'));
 if(p.length<6)return say(accT('Passwort: mindestens 6 Zeichen','Password: at least 6 characters'));
 msg.textContent=accT('Einen Moment …','One moment …');msg.className='acc-msg';
 try{if(reg){const c=await ACC.auth.createUserWithEmailAndPassword(accMail(n),p);ACC.name=n;await ACC.db.collection('users').doc(c.user.uid).set({name:n,save:accSnap(),created:Date.now(),updated:Date.now()})}
  else await ACC.auth.signInWithEmailAndPassword(accMail(n),p)}
 catch(e){const c=e&&e.code||'';say(c.includes('email-already')?accT('Den Namen gibt es schon.','That name is taken.'):c.includes('invalid-credential')||c.includes('wrong-password')||c.includes('user-not-found')?accT('Name oder Passwort falsch.','Wrong name or password.'):c.includes('too-many')?accT('Zu viele Versuche, kurz warten.','Too many attempts, wait a moment.'):accT('Hat nicht geklappt: ','Did not work: ')+c)}}
async function accLogout(){await accSave();try{await ACC.auth.signOut()}catch(e){}const nm=document.getElementById('nm');if(nm)nm.disabled=false;accUI()}
function accUI(){const box=document.getElementById('acc');const badge=document.getElementById('accb');if(!box)return;
 if(badge){badge.textContent=ACC.user?ACC.name:accT('Gast','Guest');badge.classList.toggle('in',!!ACC.user)}
 if(typeof FB_CONFIG=='undefined'||!FB_CONFIG){box.innerHTML='<p class="hint">'+accT('Accounts sind noch nicht eingerichtet. Dein Fortschritt wird gerade nur auf diesem Gerät gespeichert.','Accounts are not set up yet. Your progress is only saved on this device.')+'</p>';return}
 if(!ACC.on){box.innerHTML='<p class="hint">'+(ACC.err||accT('Verbinde …','Connecting …'))+'</p>';return}
 if(ACC.user){box.innerHTML='<div class="acc-in"><b>'+ACC.name+'</b><span>'+accT('Eingeloggt. Coins, Waffen, Skins und Story-Stand werden online gespeichert.','Logged in. Coins, weapons, skins and story progress are saved online.')+'</span></div><div class="row"><button class="ghost" id="acc-out">'+accT('Ausloggen','Log out')+'</button></div>'+(ACC.err?'<p class="acc-msg err">'+ACC.err+'</p>':'');
  document.getElementById('acc-out').onclick=accLogout;return}
 box.innerHTML='<label><span>'+accT('Benutzername','Username')+'</span><input id="acc-n" maxlength="16" autocomplete="username"></label><label><span>'+accT('Passwort','Password')+'</span><input id="acc-p" type="password" maxlength="64" autocomplete="current-password"></label>'+
  '<div class="row"><button class="pri" id="acc-li">'+accT('Einloggen','Log in')+'</button><button class="ghost" id="acc-re">'+accT('Neuen Account erstellen','Create account')+'</button></div><p id="acc-msg" class="acc-msg"></p>'+
  '<p class="hint">'+accT('Beim ersten Erstellen wird dein jetziger Fortschritt von diesem Gerät übernommen. Merk dir dein Passwort gut, es gibt kein Zurücksetzen per E-Mail.','When you create an account, your current progress on this device is taken over. Remember your password, there is no e-mail reset.')+'</p>';
 document.getElementById('acc-li').onclick=()=>accLogin(0);document.getElementById('acc-re').onclick=()=>accLogin(1);
 document.getElementById('acc-p').onkeydown=e=>{if(e.key=='Enter')accLogin(0)}}
