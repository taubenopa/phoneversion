// TAUBENGAME - Feste Deko-Objekte: Autos, Container, Zaeune, Absperrungen, Tische und Aufsteller stehen jetzt fest im Raum
// (echte 3D-Kaesten bzw. Flaechen statt Bilder, die sich mitdrehen). Runde Sachen (Baeume, Laternen, Poller ...) sehen von
// allen Seiten gleich aus und bleiben Bilder. ALLE Deko-Objekte haben jetzt eine feste Hitbox: man laeuft nicht mehr durch.
// Art: box = Kasten (L Laenge, W Breite), plane = flache Wand (beidseitig), cross = zwei gekreuzte Flaechen, round = Bild + runde Hitbox (r)
const CARC={41:'#b9bcc0',42:'#1d2238',43:'#b3242a',44:'#2b2b2e',45:'#e8e8e4'};
const D3={41:{k:'box',W:.72,end:'car'},42:{k:'box',W:.72,end:'car'},43:{k:'box',W:.72,end:'car'},44:{k:'box',W:.72,end:'car'},45:{k:'box',W:.85,end:'car'},
 47:{k:'plane',W:.14},56:{k:'box',W:.68,end:'same'},57:{k:'plane',W:.1},59:{k:'plane',W:.22},55:{k:'cross',r:.32},
 40:{k:'round',r:.28},46:{k:'round',r:.18},48:{k:'round',r:.3},49:{k:'round',r:.08},50:{k:'round',r:.08},51:{k:'round',r:.35},52:{k:'round',r:.28},
 53:{k:'round',r:.1},54:{k:'round',r:.22},58:{k:'round',r:.08},80:{k:'round',r:.08}};
const BIGB={40:1,41:1,42:1,43:1,44:1,45:1,51:1,56:1};   // grosse Sachen bleiben fuer die Wegsuche der Gegner gesperrt
let OBJ=[],OBC=null;
const mkc=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);return c};
// Front/Heck eines Autos (das Seitenbild gibt es schon)
const ENDS={};
function carEnd(t,T){if(ENDS[t])return ENDS[t];const H=T.c.height,W=Math.round(H*.9),col=CARC[t]||'#888';
 return ENDS[t]=mkc(W,H,g=>{const y0=H*.16;g.fillStyle=col;g.fillRect(1,H*.42,W-2,H*.36);g.fillRect(W*.14,y0,W*.72,H*.28);g.fillStyle='rgba(0,0,0,.22)';g.fillRect(1,H*.42,W-2,H*.36);
  g.fillStyle='#1b2433';g.fillRect(W*.18,y0+H*.04,W*.64,H*.2);g.fillStyle='#ffe9a8';g.fillRect(3,H*.5,W*.2,H*.08);g.fillRect(W*.78-2,H*.5,W*.2,H*.08);
  g.fillStyle='#222';g.fillRect(1,H*.7,W-2,H*.08);g.fillRect(2,H*.78,W*.18,H*.16);g.fillRect(W*.8-2,H*.78,W*.18,H*.16);g.fillStyle='#ddd';g.fillRect(W*.38,H*.62,W*.24,H*.06)})}
const DARK={};function darker(c){if(DARK[c.width+'x'+c.height+':'+(c._id||(c._id=Math.random()))])return DARK[c.width+'x'+c.height+':'+c._id];
 return DARK[c.width+'x'+c.height+':'+c._id]=mkc(c.width,c.height,g=>{g.drawImage(c,0,0);g.globalCompositeOperation='source-atop';g.fillStyle='rgba(0,0,0,.22)';g.fillRect(0,0,c.width,c.height)})}
// Nach dem Laden einer Karte: Flaechen und Hitboxen bauen
function buildObj(){OBJ=[];OBC=new Array(N*N);
 for(const d of DECO){const T=ST[d.t],S=D3[d.t];if(!T||!S){if(DBLK[d.t])B[(d.y|0)*N+(d.x|0)]=1;continue}
  if(BIGB[d.t])B[(d.y|0)*N+(d.x|0)]=1;
  const r=d.r||0,ca=Math.cos(r),sa=Math.sin(r),H=T.s,L=T.s*T.a,o={d,x:d.x,y:d.y,r,ca,sa,F:[],k:S.k};
  const P=(u,v)=>[d.x+u*ca-v*sa,d.y+u*sa+v*ca];
  if(S.k=='box'){const hl=L/2,hw=S.W/2,c=[P(-hl,-hw),P(hl,-hw),P(hl,hw),P(-hl,hw)],e=S.end=='car'?carEnd(d.t,T):T.c;
   o.F=[{a:c[0],b:c[1],tex:T.c,H},{a:c[1],b:c[2],tex:darker(e),H},{a:c[2],b:c[3],tex:T.c,H,mir:1},{a:c[3],b:c[0],tex:darker(e),H}];o.hl=hl;o.hw=hw}
  else if(S.k=='plane'){const hl=L/2;o.F=[{a:P(-hl,0),b:P(hl,0),tex:T.c,H,two:1}];o.hl=hl;o.hw=S.W/2}
  else if(S.k=='cross'){const hl=L/2;o.F=[{a:P(-hl,0),b:P(hl,0),tex:T.c,H,two:1},{a:P(0,-hl),b:P(0,hl),tex:T.c,H,two:1}];o.rr=S.r}
  else o.rr=S.r;
  d.o=o;OBJ.push(o);
  const ext=o.rr||Math.hypot(o.hl,o.hw);for(let j=Math.floor(d.y-ext);j<=Math.floor(d.y+ext);j++)for(let i=Math.floor(d.x-ext);i<=Math.floor(d.x+ext);i++){if(i<0||j<0||i>=N||j>=N)continue;const k=j*N+i;(OBC[k]||(OBC[k]=[])).push(o)}}
}
// Punkt in einem Objekt? (fuer Geschosse usw.)
function objAt(a,b){if(!OBC)return false;const k=(b|0)*N+(a|0),L=OBC[k];if(!L)return false;for(const o of L)if(inObj(o,a,b,0))return true;return false}
function inObj(o,a,b,rad){const dx=a-o.x,dy=b-o.y;if(o.rr)return dx*dx+dy*dy<(o.rr+rad)*(o.rr+rad);const u=dx*o.ca+dy*o.sa,v=-dx*o.sa+dy*o.ca;
 const cu=Math.max(-o.hl,Math.min(o.hl,u)),cv=Math.max(-o.hw,Math.min(o.hw,v));if(rad<=0)return u===cu&&v===cv;return (u-cu)**2+(v-cv)**2<rad*rad}
// Kreis (Spieler/Gegner) gegen Objekte
function objHit(a,b,rad){if(!OBC)return false;for(let j=Math.floor(b-rad-.01);j<=Math.floor(b+rad+.01);j++)for(let i=Math.floor(a-rad-.01);i<=Math.floor(a+rad+.01);i++){if(i<0||j<0||i>=N||j>=N)continue;const L=OBC[j*N+i];if(L)for(const o of L)if(inObj(o,a,b,rad))return true}return false}
// Eine Flaeche spaltenweise zeichnen (wie eine Wand, mit Verdeckung durch Waende)
function drawFace(f,s){const C=CAM,inv=1/(C.plx*C.dy-C.dx*C.ply);
 const tf=p=>{const ax=p[0]-C.px,ay=p[1]-C.py;return[inv*(C.dy*ax-C.dx*ay),inv*(-C.ply*ax+C.plx*ay)]};let A=tf(f.a),Bp=tf(f.b),u0=0,u1=1;const NZ=.08;
 if(A[1]<NZ&&Bp[1]<NZ)return;if(A[1]<NZ){const t=(NZ-A[1])/(Bp[1]-A[1]);A=[A[0]+(Bp[0]-A[0])*t,NZ];u0=t}else if(Bp[1]<NZ){const t=(NZ-Bp[1])/(A[1]-Bp[1]);Bp=[Bp[0]+(A[0]-Bp[0])*t,NZ];u1=1-t}
 let sa=VW/2*(1+A[0]/A[1]),sb=VW/2*(1+Bp[0]/Bp[1]);if(!f.two&&sa>=sb)return;   // Rueckseite
 let P0=A,P1=Bp,v0=u0,v1=u1;if(sa>sb){[sa,sb]=[sb,sa];P0=Bp;P1=A;v0=u1;v1=u0}
 const i0=Math.max(0,Math.ceil(sa)),i1=Math.min(VW-1,Math.floor(sb));if(i1<i0)return;
 let tex=f.tex;const dmid=(P0[1]+P1[1])/2;if(LMI){tex.sh=tex.sh||decSh({c:tex});tex=tex.sh[nlv(Math.max(1,Math.min(8,(8/(1+dmid*FOG))|0)),s.x,s.y)]}
 const tw=tex.width,th=tex.height,dtx=P1[0]-P0[0],dty=P1[1]-P0[1];
 for(let i=i0;i<=i1;i++){const k=2*(i+.5)/VW-1,den=dtx-k*dty;if(Math.abs(den)<1e-6)continue;const t=Math.max(0,Math.min(1,(k*P0[1]-P0[0])/den)),ty=P0[1]+dty*t;if(Z[i]<ty)continue;
  // perspektivisch korrekt: t ist schon im Raum linear, da aus der Kamera-Geraden geloest
  let u=v0+(v1-v0)*t;if(f.mir)u=1-u;const sz=VH/ty,bot=HZ+EY*sz,top=bot-f.H*sz;x.drawImage(tex,Math.min(tw-1,(u*tw)|0),0,1,th,i,top,1,bot-top)}}
function drawObj(s){const o=s.o;if(!o||!o.F.length)return false;const C=CAM;
 const F=o.F.map(f=>({f,d:((f.a[0]+f.b[0])/2-C.px)**2+((f.a[1]+f.b[1])/2-C.py)**2})).sort((p,q)=>q.d-p.d);for(const q of F)drawFace(q.f,s);return true}
