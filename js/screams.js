// TAUBENGAME - Schreie: Gegner schreien, wenn sie sterben, und stoehnen bei Treffern.
// Raeumlich: leiser je weiter weg, links/rechts je nachdem wo der Gegner steht. Jede Stimme wird zufaellig hoeher/tiefer gestimmt.
// Dateien: assets/sfx/scream1-5.mp3 (Tod), pain1-3.mp3 (Treffer)
const SCR={buf:{},load:0,live:0,lastPain:0,meAl:1};
const SCRF=['scream1','scream2','scream3','scream4','scream5','pain1','pain2','pain3'];
function scrLoad(){if(SCR.load||typeof AC=='undefined'||!AC)return;SCR.load=1;
 for(const n of SCRF)fetch('assets/sfx/'+n+'.mp3').then(r=>r.arrayBuffer()).then(b=>AC.decodeAudioData(b)).then(d=>{SCR.buf[n]=d}).catch(()=>{})}
// Abspielen an einer Stelle in der Welt (x,y) oder ohne Position (eigener Spieler)
function scrPlay(n,x,y,vol,rate){if(muted)return;try{if(!AC&&typeof ac=='function')ac()}catch(e){}if(!AC)return;scrLoad();const b=SCR.buf[n];if(!b||SCR.live>=5)return;
 let g=vol,pan=0;if(x!=null){const d=Math.hypot(x-me.x,y-me.y);g*=Math.pow(Math.max(0,1-d/20),1.3);if(g<.02)return;
  try{const t=prj(x,y,0),L=Math.hypot(t[0],t[1])||1;pan=Math.max(-.85,Math.min(.85,t[0]/L))}catch(e){}}
 try{const s=AC.createBufferSource(),G=AC.createGain();s.buffer=b;s.playbackRate.value=rate;G.gain.value=g;let out=G;
  if(AC.createStereoPanner){const P=AC.createStereoPanner();P.pan.value=pan;G.connect(P);out=P}s.connect(G);out.connect(mst);SCR.live++;s.onended=()=>SCR.live--;s.start()}catch(e){}}
const SCRV=t=>t==22?1.14:t==21?.86:t==17?.95:1;   // Stimmlage je Gegnertyp (schnell = hoeher, kraeftig = tiefer)
function painSnd(x,y,t){const now=performance.now();if(now-SCR.lastPain<140||Math.random()>.45)return;SCR.lastPain=now;
 scrPlay('pain'+(1+(Math.random()*3|0)),x,y,.55,SCRV(t)*(.9+Math.random()*.25))}
function deathSnd(x,y,style,boss,t){let n,r=SCRV(t)*(.88+Math.random()*.27),v=.9;
 if(boss){n='scream2';r=.68+Math.random()*.08;v=1.3}
 else if(style=='gib')n=Math.random()<.6?'scream3':'scream5';
 else if(style=='back')n=Math.random()<.5?'scream2':'scream1';
 else n=Math.random()<.5?'scream4':'scream1';
 scrPlay(n,x,y,v,r)}
// eigener Tod: Schrei ohne Entfernung
setInterval(()=>{try{if(!mode||!S||!S.p)return;const P=S.p[id];if(!P)return;if(SCR.meAl&&!P.al)scrPlay(Math.random()<.5?'scream1':'scream4',null,null,.75,.95+Math.random()*.1);SCR.meAl=P.al?1:0}catch(e){}},100);
