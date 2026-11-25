// TAUBENGAME - Online: Statistik, Bestenliste und Lobby-Liste (Firebase, siehe js/account.js)
// Firestore: board/{uid} = oeffentliche Werte fuer die Bestenliste, lobbies/{uid} = offenes Spiel eines eingeloggten Hosts
const onT=(d,e)=>typeof LANG!='undefined'&&LANG=='en'?e:d;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

// ---------- Statistik (lokal, wird mit dem Account gespeichert) ----------
let STAT={k:0,d:0,gg:0,t:0};try{Object.assign(STAT,JSON.parse(localStorage.hfStats||'{}'))}catch(e){}
function statSave(){try{localStorage.hfStats=JSON.stringify({k:STAT.k|0,d:STAT.d|0,gg:STAT.gg|0,t:Math.round(STAT.t)})}catch(e){}}
function statAdd(k,n){STAT[k]=(STAT[k]||0)+n;statSave()}
const STW={kc:null,al:1,tt:0};
function statTick(P,dt){if(!P||!S)return;
 const kc=P.kc|0;if(STW.kc==null||kc<STW.kc)STW.kc=kc;
 if(kc>STW.kc){const d=kc-STW.kc;STW.kc=kc;if(!S.sb&&d<60)statAdd('k',d)}
 if(STW.al&&!P.al&&!S.sb)statAdd('d',1);STW.al=!!P.al;
 STAT.t+=dt;STW.tt+=dt;if(STW.tt>10){STW.tt=0;statSave()}}

// ---------- Bestenliste ----------
const BOARD={tab:'k',last:'',rows:null,err:''};
const BTABS=[['k',()=>onT('Kills','Kills')],['wv',()=>onT('Beste Welle','Best wave')],['gg',()=>onT('Gun-Game-Siege','Gun Game wins')],['c',()=>'Coins']];
function boardMine(){let wv=0,c=0;try{wv=+localStorage.hfBest||0;c=+localStorage.hfCoins||0}catch(e){}
 return{name:ACC.name,k:STAT.k|0,d:STAT.d|0,gg:STAT.gg|0,t:Math.round(STAT.t),wv,c}}
async function boardPush(){if(!ACC.on||!ACC.user||!ACC.name)return;const m=boardMine(),j=JSON.stringify(m);if(j===BOARD.last)return;
 try{await ACC.db.collection('board').doc(ACC.user.uid).set(Object.assign({},m,{updated:Date.now()}));BOARD.last=j}catch(e){console.warn('board',e)}}
async function boardLoad(){const box=document.getElementById('board');if(!box)return;
 if(!ACC.on){BOARD.err=ACC.err||onT('Verbinde …','Connecting …');boardUI();return}
 BOARD.err='';BOARD.rows=null;boardUI();await boardPush();
 try{const q=await ACC.db.collection('board').orderBy(BOARD.tab,'desc').limit(25).get();BOARD.rows=q.docs.map(d=>Object.assign({id:d.id},d.data()))}
 catch(e){BOARD.err=onT('Bestenliste konnte nicht geladen werden.','Could not load the leaderboard.');console.warn(e)}boardUI()}
function fmtT(s){s=s|0;const h=s/3600|0,m=(s%3600)/60|0;return h?h+' h '+m+' min':m+' min'}
function boardUI(){const box=document.getElementById('board');if(!box)return;const m=boardMine();
 let h='<div class="btabs">'+BTABS.map(([k,f])=>'<button data-t="'+k+'" class="'+(BOARD.tab==k?'on':'')+'">'+f()+'</button>').join('')+'</div>';
 if(BOARD.err)h+='<p class="acc-msg err">'+esc(BOARD.err)+'</p>';
 else if(!BOARD.rows)h+='<p class="hint">'+onT('Lädt …','Loading …')+'</p>';
 else if(!BOARD.rows.length)h+='<p class="hint">'+onT('Noch niemand drauf. Spiel eine Runde und sei die Nummer 1.','Nobody here yet. Play a round and be number 1.')+'</p>';
 else{h+='<ol class="blist">'+BOARD.rows.map((r,i)=>'<li class="'+(ACC.user&&r.id==ACC.user.uid?'me':'')+'"><span class="rk">'+(i+1)+'</span><b>'+esc(r.name)+'</b><span class="v">'+(r[BOARD.tab]|0)+'</span></li>').join('')+'</ol>'}
 h+='<h3>'+onT('Deine Statistik','Your stats')+'</h3><div class="bstats">'+
  [['Kills',m.k],[onT('Tode','Deaths'),m.d],['K/D',(m.k/Math.max(1,m.d)).toFixed(2)],[onT('Beste Welle','Best wave'),m.wv],[onT('Gun-Game-Siege','Gun Game wins'),m.gg],[onT('Spielzeit','Play time'),fmtT(m.t)]]
  .map(([a,b])=>'<div><b>'+b+'</b><span>'+a+'</span></div>').join('')+'</div>';
 if(!ACC.user)h+='<p class="hint">'+onT('Log dich unter „Account“ ein, damit du selbst in der Bestenliste auftauchst.','Log in under “Account” to appear on the leaderboard yourself.')+'</p>';
 box.innerHTML=h;box.querySelectorAll('.btabs button').forEach(b=>b.onclick=()=>{BOARD.tab=b.dataset.t;boardLoad()})}

// ---------- Lobby-Liste ----------
// Host (eingeloggt): meldet sein offenes Spiel alle 15 s. Liste zeigt Spiele, die sich in den letzten 45 s gemeldet haben.
const LOB={on:0,last:0,unsub:null,rows:[],timer:0,pub:0};
function lobbyAllowed(){try{return localStorage.hfLobbyOff!='1'}catch(e){return true}}
function lobbyInfo(){const np=players.filter(p=>p.on).length,mapN=(MAPS[cur]||{}).nm||'';let md,mp;
 if(mode==1){md=story?'Story':GG?'Gun Game':SBX?'Sandbox':dm?'Deathmatch':onT('Koop','Co-op');mp=story?'':mapN}
 else if(typeof curPane!='undefined'&&curPane=='story'){md='Story';mp=''}
 else{const g=+(document.getElementById('gm')||{}).value;md=['Koop','Deathmatch','Sandbox','Gun Game'][g]||'Koop';const s=document.getElementById('mp');mp=s&&s.selectedOptions[0]?s.selectedOptions[0].textContent:''}
 return{code:hostCode,name:(ACC.name||'').slice(0,16),md,mp,n:np,mx:4}}
function lobbyWanted(){return !!(ACC.on&&ACC.user&&hostCode&&lobbyAllowed()&&(mode==1||(mode==0&&typeof curPane!='undefined'&&(curPane=='host'||curPane=='story')))&&players.filter(p=>p.on).length<4)}
async function lobbyBeat(){const want=lobbyWanted();
 try{if(want){const i=lobbyInfo(),k=JSON.stringify(i);if(k!==LOB.k||Date.now()-LOB.last>15000){LOB.k=k;LOB.last=Date.now();LOB.pub=1;await ACC.db.collection('lobbies').doc(ACC.user.uid).set(Object.assign(i,{updated:Date.now()}))}}
  else if(LOB.pub&&ACC.user){LOB.pub=0;LOB.k='';await ACC.db.collection('lobbies').doc(ACC.user.uid).delete()}}catch(e){console.warn('lobby',e)}}
function lobbyListen(on){if(on&&!LOB.unsub&&ACC.on){
  LOB.unsub=ACC.db.collection('lobbies').where('updated','>',Date.now()-60000).onSnapshot(q=>{LOB.rows=q.docs.map(d=>Object.assign({id:d.id},d.data()));LOB.err='';lobbyUI()},e=>{LOB.err=onT('Lobby-Liste nicht erreichbar.','Lobby list not reachable.');lobbyUI();console.warn(e)})}
 if(!on&&LOB.unsub){LOB.unsub();LOB.unsub=null}lobbyUI()}
function lobbyUI(){const box=document.getElementById('lobbies');if(!box)return;
 if(!ACC.on){box.innerHTML='<p class="hint">'+(ACC.err||onT('Verbinde …','Connecting …'))+'</p>';return}
 const now=Date.now(),L=LOB.rows.filter(r=>now-r.updated<45000&&r.code&&r.code!==hostCode).sort((a,b)=>b.updated-a.updated);
 if(LOB.err){box.innerHTML='<p class="acc-msg err">'+esc(LOB.err)+'</p>';return}
 if(!L.length){box.innerHTML='<p class="hint">'+onT('Gerade ist kein offenes Spiel da. Starte selbst eins unter „Koop & Deathmatch“, dann taucht es hier für andere auf.','No open games right now. Host one under “Co-op & deathmatch” and it shows up here for others.')+'</p>';return}
 box.innerHTML='<ul class="lobs">'+L.map(r=>'<li><div><b>'+esc(r.name||'?')+'</b><span>'+esc(r.md)+(r.mp?' · '+esc(r.mp):'')+'</span></div><span class="pc">'+(r.n|0)+'/'+(r.mx|0||4)+'</span><button class="pri" data-c="'+esc(r.code)+'">'+onT('Beitreten','Join')+'</button></li>').join('')+'</ul>';
 box.querySelectorAll('button[data-c]').forEach(b=>b.onclick=()=>{const jc=document.getElementById('jc');jc.value=b.dataset.c;joinCode()})}
function lobbyToggleUI(){for(const id of['lobsw','lobsw2']){const el=document.getElementById(id);if(!el)continue;
 const can=ACC.on&&ACC.user;el.innerHTML=can?'<label class="chk"><input type="checkbox" '+(lobbyAllowed()?'checked':'')+'> '+onT('Spiel in der Lobby-Liste zeigen, damit andere ohne Code beitreten können','Show this game in the lobby list so others can join without a code')+'</label>':
  '<span class="hint">'+onT('Log dich unter „Account“ ein, dann taucht dein Spiel in der Lobby-Liste auf.','Log in under “Account” and your game shows up in the lobby list.')+'</span>';
 const c=el.querySelector('input');if(c)c.onchange=()=>{try{localStorage.hfLobbyOff=c.checked?'0':'1'}catch(e){}lobbyBeat();lobbyToggleUI()}}}

// ---------- Einbau ins Menue ----------
(function(){
 const _go=go;go=function(n){_go(n);if(curPane=='board')boardLoad();lobbyListen(curPane=='join');lobbyToggleUI();lobbyBeat()};
 setInterval(()=>{lobbyBeat();if(curPane=='join')lobbyUI()},5000);
 addEventListener('pagehide',()=>{if(LOB.pub&&ACC.user)try{ACC.db.collection('lobbies').doc(ACC.user.uid).delete()}catch(e){}});
 const _ui=accUI;accUI=function(){_ui();lobbyToggleUI();if(curPane=='board')boardUI();if(curPane=='join')lobbyUI();if(ACC.user)boardPush()};
 const _save=accSave;accSave=async function(){await _save();boardPush()};
})();
