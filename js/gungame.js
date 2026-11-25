// ---------- Gun Game ----------
// Jeder Kill bringt dich naeher an die naechste Waffe. Wer als Erstes mit der Faust trifft, gewinnt die Runde.
// Solo gegen Gegner, online ein Wettrennen gegen die Mitspieler. Munition ist unendlich, Waffen wechseln geht nicht.
let GG=0,GGW=null;
const GGL=[31,16,19,3,13,21,14,2,18,9,22,20,7,4,27,30,17,8,1,24,0];   // Reihenfolge der Waffen, die letzte ist die Faust
const GGK=l=>GGL[l]===0?1:2;                                           // Kills pro Stufe
const ggT=(d,e)=>typeof LANG!='undefined'&&LANG=='en'?e:d;
function ggReset(){GGW=null;for(const p of players){p.gl=0;p.gk=0;p.ggw=p.ggw|0}E=[];J=[];toSpawn=0;spawnT=1}
function ggKill(o){const p=players[o];if(!p||GGW)return;p.gk=(p.gk|0)+1;
 if(p.gk>=GGK(p.gl|0)){p.gk=0;p.gl=(p.gl|0)+1;
  if(p.gl>=GGL.length){p.gl=GGL.length-1;p.ggw=(p.ggw|0)+1;GGW={i:o,n:p.nm||('P'+(o+1)),t:7};for(const e of E)if(!e.dead){e.dead=1;e.hp=0}J=J.filter(j=>j.o>=0)}}}
// Host, jedes Update
function ggTick(dt){
 wave=3;waitT=1e9;
 for(const p of players){if(!p.on)continue;if(p.gl==null){p.gl=0;p.gk=0}if(!p.al)p.gk=0;
  const w=GGL[Math.min(p.gl,GGL.length-1)];p.lo=1|(1<<w);if(WP[w]&&WP[w].am)p.am[w]=MX[w]}
 if(GGW){GGW.t-=dt;if(GGW.t<=0)ggReset();return}
 const np=players.filter(p=>p.on).length,alive=E.filter(e=>!e.dead).length;
 if(alive+toSpawn<5+np*2)toSpawn++;
}
// Jeder Rechner: eigene Waffe festhalten, Stufenwechsel melden
const GGC={gl:-1,ft:0,txt:''};
function ggClient(P,dt){if(!P)return;const gl=P.gl|0,w=GGL[Math.min(gl,GGL.length-1)];
 me.w=w;me.lo=1|(1<<w);
 if(GGC.gl>=0&&gl>GGC.gl){GGC.ft=2.2;GGC.txt=ggT('NEUE WAFFE: ','NEW WEAPON: ')+WP[w].nm;try{tone(440,660,.1,'square',.12);tone(660,990,.14,'square',.12,.1)}catch(e){}}
 GGC.gl=gl;if(GGC.ft>0)GGC.ft-=dt;
 if(S.gw&&!GGC.won){GGC.won=1;try{jingle(S.gw.i!==id)}catch(e){}if(S.gw.i===id&&typeof statAdd=='function')statAdd('gg',1)}else if(!S.gw)GGC.won=0}
function ggTop(P){const gl=(P&&P.gl)|0,w=GGL[Math.min(gl,GGL.length-1)];
 return 'GUN GAME   '+ggT('Stufe ','Level ')+(gl+1)+'/'+GGL.length+'   '+(P?(P.gk|0)+'/'+GGK(gl)+' Kills':'')}
function ggHud(P,now){if(!S||!S.gg)return;
 const L=S.p.filter(p=>p&&p.on).sort((a,b)=>(b.gl|0)-(a.gl|0)||(b.gk|0)-(a.gk|0));
 x.textAlign='right';x.font='bold 8px monospace';let y=VH*.52;
 if(L.length>1)for(const p of L){x.fillStyle='#000a';x.fillRect(VW-112,y-8,108,11);x.fillStyle=PC[p.i]||'#fff';x.fillText((p.nm||'P'+(p.i+1))+'  '+((p.gl|0)+1)+'/'+GGL.length,VW-8,y);y+=12}
 // naechste Waffe
 const gl=(P&&P.gl)|0;if(gl+1<GGL.length){x.fillStyle='#000a';x.fillRect(VW-112,VH*.52-24,108,12);x.fillStyle='#bbb';x.fillText(ggT('Nächste: ','Next: ')+WP[GGL[gl+1]].nm,VW-8,VH*.52-15)}
 x.textAlign='center';
 if(GGC.ft>0){const a=Math.min(1,GGC.ft*2);x.globalAlpha=a;x.font='bold 14px monospace';x.fillStyle='#000';x.fillText(GGC.txt,VW/2+1,VH*.3+1);x.fillStyle='#ffd23a';x.fillText(GGC.txt,VW/2,VH*.3);x.globalAlpha=1}
 if(S.gw){const me2=S.gw.i===id;x.fillStyle='#000c';x.fillRect(0,VH*.36,VW,46);x.font='bold 18px monospace';x.fillStyle=me2?'#ffd23a':'#fff';
  x.fillText(me2?ggT('DU HAST GEWONNEN!','YOU WIN!'):(S.gw.n+ggT(' GEWINNT!',' WINS!')),VW/2,VH*.36+22);
  x.font='bold 8px monospace';x.fillStyle='#bbb';x.fillText(ggT('Neue Runde in ','New round in ')+Math.ceil(S.gw.t)+'s',VW/2,VH*.36+38)}
 x.textAlign='left'}
