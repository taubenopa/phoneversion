// TAUBENGAME - Waffen-Skins (rein optisch). Gibt es aus der Skinkiste im Case-Shop, gelten in allen Modi.
// Ein Skin faerbt nur den Waffenkoerper (Metall, Kunststoff, Holz) um, Haende, Aermel und Linsen bleiben.
// f(c,h,t): c = Originalfarbe [r,g,b], h = feste Zufallszahl pro Flaeche, t = Zeit in ms -> [Farbe, Material]
const sklum=c=>(c[0]*.3+c[1]*.59+c[2]*.11)/255;
const skt=(p,c,a,b)=>{const k=(a==null?.38:a)+(b==null?1.35:b)*sklum(c);return p.map(v=>Math.min(255,v*k|0))};
const skhsl=(h,s,l)=>{const f=n=>{const k=(n+h*12)%12,a=s*Math.min(l,1-l);return 255*(l-a*Math.max(-1,Math.min(k-3,9-k,1)))|0};return[f(0),f(8),f(4)]};
const skpick=(L,h)=>L[h%L.length];
const SKINS=[
 {nm:'Feuerrot',en:'Fire Red',r:0,f:(c)=>[skt([196,48,40],c),'p']},
 {nm:'Eisblau',en:'Ice Blue',r:0,f:(c)=>[skt([70,130,205],c),'p']},
 {nm:'Arktisweiß',en:'Arctic White',r:0,f:(c)=>[skt([228,230,234],c,.5,.9),'p']},
 {nm:'Blackout',en:'Blackout',r:0,f:(c)=>[skt([46,46,52],c,.55,.8),'p']},
 {nm:'Wald-Tarn',en:'Woodland Camo',r:1,f:(c,h)=>[skt(skpick([[74,92,52],[48,62,38],[110,96,62],[34,38,30]],h),c),'p']},
 {nm:'Wüsten-Tarn',en:'Desert Camo',r:1,f:(c,h)=>[skt(skpick([[196,170,120],[160,130,88],[120,96,66],[214,196,150]],h),c),'p']},
 {nm:'Schnee-Tarn',en:'Snow Camo',r:1,f:(c,h)=>[skt(skpick([[230,234,238],[170,178,188],[120,128,140],[214,220,228]],h),c,.5,.9),'p']},
 {nm:'Bubblegum',en:'Bubblegum',r:1,f:(c,h)=>[skt(h%5?[242,128,190]:[150,220,240],c),'p']},
 {nm:'Taubenmuster',en:'Pigeon Pattern',r:2,f:(c,h,t)=>h%6==0?[skt(skhsl(.38+.4*((h>>3)%2)+.04*Math.sin(t*.002+h),.6,.45),c,.6,1),'m']:[skt(skpick([[150,152,166],[122,124,140],[176,176,188]],h),c),'p']},
 {nm:'Neon',en:'Neon',r:2,f:(c,h,t)=>h%5==0?[skpick([[60,240,255],[255,60,200],[140,255,90]],h>>2).map(v=>v*(.75+.25*Math.sin(t*.004+h))|0),'e']:[skt([34,32,44],c,.6,.7),'p']},
 {nm:'Lava',en:'Lava',r:2,f:(c,h,t)=>h%4==0?[[255,110+60*Math.sin(t*.003+h)|0,20],'e']:[skt([44,30,26],c,.6,.8),'p']},
 {nm:'Gold',en:'Gold',r:3,f:(c)=>[skt([226,178,62],c,.55,1.1),'au']},
 {nm:'Diamant',en:'Diamond',r:3,f:(c,h)=>[skt(skpick([[176,232,255],[210,244,255],[150,210,240]],h),c,.6,.9),'dm']},
 {nm:'Regenbogen',en:'Rainbow',r:4,f:(c,h,t)=>[skt(skhsl((t*.00018+(h%97)*.011)%1,.85,.55),c,.55,1),'m']},
 {nm:'Galaxie',en:'Galaxy',r:4,f:(c,h,t)=>h%9==0?[[255,255,255].map(v=>v*(.6+.4*Math.sin(t*.005+h))|0),'e']:[skt(skhsl(.7+.12*Math.sin(h*.7),.65,.22+.06*((h>>2)%3)),c,.7,.8),'m']}];
MAT.au=[.4,.72,.85,28];MAT.dm=[.55,.55,1,70];
// Besitz: "Waffe:Skin" -> 1 ; ausgeruestet: Waffe -> Skin
let SKO={},SKE={};try{SKO=JSON.parse(localStorage.hfSkins||'{}');SKE=JSON.parse(localStorage.hfSkinEq||'{}')}catch(e){}
const saveSkins=()=>{try{localStorage.hfSkins=JSON.stringify(SKO);localStorage.hfSkinEq=JSON.stringify(SKE)}catch(e){}};
const skinOf=w=>{const s=SKE[w];return s!=null&&SKO[w+':'+s]?SKINS[s]:null};
const skinCount=()=>Object.keys(SKO).length,skinTotal=()=>(WP.length-1)*SKINS.length;
// Vorschaubild: Waffe von der Seite mit Skin (ohne Haende), zugeschnitten
const SKI={};
function skinIcon(w,s,W,H){W=W||128;H=H||64;const key=w+':'+s+':'+W;if(SKI[key])return SKI[key];
 const cv=document.createElement('canvas');cv.width=VW;cv.height=VH;const g=cv.getContext('2d'),ox=x,orec=typeof rec=='number'?rec:0;
 try{x=g;const M=model(w,1000,{al:1,hp:100,f:0,spn:0,sm:0});M.L=M.L.filter(p=>p.m!='g'&&p.m!='c');
  drawModel(M,{x:.02,ty:-.02,z:.62,y:-1.42,p:.05,r:0},s<0?null:SKINS[s],2000)}catch(e){}finally{x=ox}
 const d=g.getImageData(0,0,VW,VH).data;let x0=VW,y0=VH,x1=0,y1=0;for(let j=0;j<VH;j++)for(let i=0;i<VW;i++)if(d[(j*VW+i)*4+3]>8){if(i<x0)x0=i;if(i>x1)x1=i;if(j<y0)y0=j;if(j>y1)y1=j}
 const o=document.createElement('canvas');o.width=W;o.height=H;const q=o.getContext('2d');
 if(x1>x0){const sc=Math.min((W-6)/(x1-x0+1),(H-6)/(y1-y0+1));q.imageSmoothingQuality='high';q.drawImage(cv,x0,y0,x1-x0+1,y1-y0+1,W/2-(x1-x0+1)*sc/2,H/2-(y1-y0+1)*sc/2,(x1-x0+1)*sc,(y1-y0+1)*sc)}
 return SKI[key]=o.toDataURL()}
