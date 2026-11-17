// TAUBENGAME - Waffe in der Ego-Ansicht wie in modernen Shootern: 3D-Modelle mit Materialien (Metall glaenzt, Kunststoff matt,
// Holz warm, Linsen spiegeln, Energie leuchtet), abgeschraegte Kanten und zwei Arme mit Handschuhen.
// Zielen (Rechtsklick) schiebt die Waffe vor das Auge, Kimme und Korn liegen in der Bildmitte.
// Koordinaten in Metern, Ursprung = Griff der rechten Hand, x rechts, y oben, z nach vorn (Laufrichtung).
const VMF=250,ZN0=.02;                        // Brennweite, Nahebene
const nrm=v=>{const l=Math.hypot(...v)||1;return v.map(q=>q/l)};
const LIGHT=nrm([.5,.75,-.55]),RIM=nrm([-.6,.35,.2]);
// Materialien: Grundlicht, Streulicht, Glanz, Glanzschaerfe
const MAT={m:[.42,.62,.55,22],p:[.44,.6,.12,8],w:[.46,.58,.16,10],c:[.46,.55,0,1],g:[.42,.55,.08,6],l:[.35,.3,.9,50],e:[1,0,0,1]};
const GLOVE='#2a2a2e',SLEEVE='#4a5040',CUFF='#353a2d';
const CC={};
function col(h){if(CC[h])return CC[h];let s=h.slice(1);if(s.length==3)s=[...s].map(c=>c+c).join('');return CC[h]=[0,2,4].map(i=>parseInt(s.slice(i,i+2),16))}
// ---------- Bauteile ----------
function face(L,v,f,c,m,sm){                  // Flaechen nach aussen drehen; sm = runde Seitenflaechen (ohne Kantenlinie)
 const ctr=[0,1,2].map(k=>v.reduce((s,p)=>s+p[k],0)/v.length);
 for(const q of f){const a=v[q[0]],b=v[q[1]],d=v[q[2]],u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],w=[d[0]-a[0],d[1]-a[1],d[2]-a[2]],
  n=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]],fc=[0,1,2].map(k=>q.reduce((s,i)=>s+v[i][k],0)/q.length);
  if(n[0]*(fc[0]-ctr[0])+n[1]*(fc[1]-ctr[1])+n[2]*(fc[2]-ctr[2])<0)q.reverse()}
 L.push({v,f,c:col(c),m:m||'p',sm})}
// Prisma entlang z aus einem Querschnitt (Punkte in x/y)
function prism(L,pr,z,d,c,m,sm,sc){sc=sc||1;const n=pr.length,v=[];for(const p of pr)v.push([p[0],p[1],z]);for(const p of pr)v.push([p[0]*sc,p[1]*sc,z+d]);
 const f=[];for(let k=0;k<n;k++){const j=(k+1)%n;f.push([k,j,n+j,n+k])}f.push([...Array(n).keys()]);f.push([...Array(n).keys()].map(k=>n+k));
 face(L,v,f,c,m,sm?f.slice(0,n):null);if(sm){const P=L[L.length-1];P.sm=new Set(P.f.slice(0,n))}}
// Quader mit abgeschraegten Kanten (b = Fase)
function cb(L,x,y,z,w,h,d,c,m,b){b=b==null?Math.min(w,h)*.18:b;const a=x-w/2,e=x+w/2,p=y-h/2,q=y+h/2;
 prism(L,[[a+b,p],[e-b,p],[e,p+b],[e,q-b],[e-b,q],[a+b,q],[a,q-b],[a,p+b]],z,d,c,m)}
function box(L,x,y,z,w,h,d,c,m){cb(L,x,y,z,w,h,d,c,m,0)}
function cyl(L,x,y,z,r,len,c,m,n,r2){n=n||12;r2=r2==null?r:r2;const pr=[];for(let k=0;k<n;k++){const a=k/n*6.2832+Math.PI/n;pr.push([x+Math.cos(a)*r,y+Math.sin(a)*r])}
 if(r2===r)prism(L,pr,z,len,c,m,1);else{const v=[];for(const p of pr)v.push([p[0],p[1],z]);for(let k=0;k<n;k++){const a=k/n*6.2832+Math.PI/n;v.push([x+Math.cos(a)*r2,y+Math.sin(a)*r2,z+len])}
  const f=[];for(let k=0;k<n;k++){const j=(k+1)%n;f.push([k,j,n+j,n+k])}f.push([...Array(n).keys()]);if(r2>0)f.push([...Array(n).keys()].map(k=>n+k));face(L,v,f,c,m);L[L.length-1].sm=new Set(f.slice(0,n))}}
function beam(L,a,b,w,h,c,m,fs){              // Quader zwischen zwei Punkten
 const d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],D=nrm(d);let u=[-D[2],0,D[0]];if(Math.hypot(...u)<1e-4)u=[1,0,0];u=nrm(u);const v=[D[1]*u[2]-D[2]*u[1],D[2]*u[0]-D[0]*u[2],D[0]*u[1]-D[1]*u[0]];
 const W=w/2,H=(h||w)/2,B=fs?Math.min(W,H)*.35:0,pr=[[-W+B,-H],[W-B,-H],[W,-H+B],[W,H-B],[W-B,H],[-W+B,H],[-W,H-B],[-W,-H+B]];
 const P=(o,s,t)=>[o[0]+u[0]*s+v[0]*t,o[1]+u[1]*s+v[1]*t,o[2]+u[2]*s+v[2]*t],V=[...pr.map(p=>P(a,p[0],p[1])),...pr.map(p=>P(b,p[0],p[1]))];
 const f=[];for(let k=0;k<8;k++){const j=(k+1)%8;f.push([k,j,8+j,8+k])}f.push([0,1,2,3,4,5,6,7]);f.push([8,9,10,11,12,13,14,15]);face(L,V,f,c,m)}
function rail(L,x,y,z,len){box(L,x,y,z,.022,.007,len,'#1c1e22','m');for(let q=.004;q<len-.004;q+=.011)box(L,x,y+.0055,z+q,.024,.004,.0055,'#26292e','m')}
function tguard(L,z0,c){c=c||'#1c1e22';beam(L,[0,-.008,z0+.045],[0,-.032,z0+.04],.008,.006,c,'p');beam(L,[0,-.032,z0+.04],[0,-.032,z0-.005],.008,.006,c,'p');beam(L,[0,-.012,z0+.012],[0,-.026,z0+.02],.004,.006,'#2a2c31','m')}
// Haende: rechte Hand umgreift den Griff, linke Hand liegt am Vordergriff (lh), Arme als Aermel mit Buendchen
function rhand(L,gy){gy=gy==null?-.035:gy;
 beam(L,[.018,gy-.02,-.05],[.19,-.27,-.22],.078,.082,SLEEVE,'c',1);beam(L,[.015,gy-.012,-.03],[.035,gy-.045,-.085],.074,.078,CUFF,'c',1);
 cb(L,.019,gy,-.04,.026,.06,.065,GLOVE,'g');cb(L,0,gy-.006,.012,.046,.052,.022,GLOVE,'g');for(let k=0;k<3;k++)box(L,.02,gy+.012-k*.017,.012,.006,.012,.022,'#202024','g')}
function lhand(L,lh,two){
 if(two){cb(L,-.02,lh[1],lh[2]-.04,.026,.055,.06,GLOVE,'g');beam(L,[-.02,lh[1]-.02,lh[2]-.05],[-.22,-.3,lh[2]-.25],.076,.08,SLEEVE,'c',1);return}
 cb(L,lh[0],lh[1]-.018,lh[2]-.04,.055,.026,.08,GLOVE,'g');cb(L,lh[0]+.026,lh[1]+.002,lh[2]-.036,.012,.04,.07,GLOVE,'g');for(let k=0;k<3;k++)box(L,lh[0]+.032,lh[1]+.014,lh[2]-.03+k*.022,.006,.012,.016,'#202024','g');
 beam(L,[lh[0]-.005,lh[1]-.03,lh[2]-.05],[-.23,-.3,lh[2]-.26],.076,.08,SLEEVE,'c',1);beam(L,[lh[0]-.004,lh[1]-.028,lh[2]-.045],[lh[0]-.03,lh[1]-.06,lh[2]-.1],.072,.076,CUFF,'c',1);
 cb(L,lh[0]-.028,lh[1]-.045,lh[2]-.085,.03,.016,.026,'#111214','m');box(L,lh[0]-.028,lh[1]-.036,lh[2]-.08,.02,.003,.016,'#5ee8ff','l')}   // Uhr am linken Handgelenk
// ---------- Modelle ----------
function model(w,now,P){
 const L=[];let mz=[0,.03,.2],sY=.06,az=.2;
 const GM='#3a3e46',DK='#25282d',PO='#2a2d32';
 switch(w){
  case 0:{const k=Math.min(1,rec*1.4),z=k*.13;cb(L,0,0,z,.066,.064,.08,GLOVE,'g');for(let i=0;i<4;i++)cb(L,-.024+i*.016,.022,z+.062,.015,.024,.024,'#202024','g');beam(L,[.02,-.02,z],[.19,-.27,-.22],.08,.085,SLEEVE,'c',1);
   cb(L,-.2,.02,.05,.066,.064,.08,GLOVE,'g');for(let i=0;i<4;i++)cb(L,-.224+i*.016,.042,.112,.015,.024,.024,'#202024','g');beam(L,[-.2,0,.03],[-.27,-.31,-.18],.08,.085,SLEEVE,'c',1);mz=[0,0,.2];sY=0;az=.3;break}
  case 1:cb(L,0,.012,-.03,.03,.028,.19,PO,'p');beam(L,[0,-.002,-.008],[0,-.088,-.04],.029,.052,PO,'p',1);box(L,0,-.094,-.064,.031,.01,.056,'#141518','p');
   for(let i=0;i<4;i++)box(L,.0152,-.03-i*.016,-.03-i*.005,.002,.004,.04,'#18191c','p');cb(L,0,.04,-.035,.031,.028,.205,'#3a3e46','m',.005);
   for(let i=0;i<6;i++)box(L,.0158,.04,-.03+i*.007,.0015,.02,.003,'#1d1f24','m');box(L,.0156,.046,.05,.0015,.012,.042,'#0e0f11','m');cyl(L,0,.036,.168,.0055,.004,'#0a0a0b','m',10);
   cb(L,0,.058,-.03,.024,.008,.014,'#111','p',.001);box(L,0,.058,.152,.006,.011,.01,'#111','p');box(L,0,.06,.16,.003,.003,.002,'#fff','e');tguard(L,.0);rhand(L);lhand(L,[-.03,-.04,.0],1);mz=[0,.036,.175];sY=.0635;az=.34;break
  case 2:cb(L,0,.02,-.06,.048,.06,.22,GM,'m');box(L,.0245,.032,.0,.002,.02,.07,'#0f1012','m');cyl(L,0,.04,.16,.011,.5,'#41454d','m',14);cyl(L,0,.013,.16,.01,.42,'#26282d','m',12);cyl(L,0,.013,.58,.011,.012,DK,'m',12);
   cb(L,0,.013,.27,.05,.04,.16,'#6b4226','w');for(let i=0;i<5;i++)box(L,0,-.007,.285+i*.028,.052,.003,.008,'#4a2c18','w');cb(L,0,-.005,-.38,.042,.072,.32,'#6b4226','w');box(L,0,-.005,-.392,.044,.074,.014,'#141414','p');
   beam(L,[0,-.005,-.04],[0,-.075,-.075],.03,.045,'#6b4226','w',1);cyl(L,0,.053,.6,.003,.006,'#e8c35a','m',6);tguard(L,-.02);rhand(L);lhand(L,[0,-.01,.34]);mz=[0,.04,.66];sY=.057;break
  case 3:cb(L,0,.02,-.1,.056,.075,.32,'#454951','m');cb(L,0,.066,-.08,.05,.02,.18,'#2c2f34','m');rail(L,0,.08,-.07,.15);cyl(L,0,.03,.22,.023,.28,'#2f3237','m',12);
   for(let i=0;i<5;i++)box(L,.022,.03,.24+i*.05,.003,.008,.026,'#111214','m');cyl(L,0,.03,.5,.009,.15,'#55595f','m',10);cyl(L,0,.03,.6,.013,.07,DK,'m',10);
   beam(L,[-.012,.008,.48],[-.016,-.004,.2],.008,.008,DK,'m');beam(L,[.012,.008,.48],[.016,-.004,.2],.008,.008,DK,'m');cb(L,.055,-.035,-.02,.045,.085,.1,'#3d4a2a','p');box(L,.078,-.035,-.0,.002,.06,.06,'#2c361e','p');
   cb(L,0,0,-.42,.045,.078,.32,PO,'p');beam(L,[0,-.005,-.05],[0,-.08,-.08],.03,.045,PO,'p',1);box(L,0,.096,.04,.006,.03,.01,'#111','p');box(L,0,.086,.58,.006,.032,.01,'#111','p');tguard(L,-.03);rhand(L);lhand(L,[0,-.002,.34]);mz=[0,.03,.67];sY=.101;break
  case 4:cyl(L,0,.03,-.24,.055,.78,'#4f6236','p',16);for(const z of[-.24,.08,.3])cyl(L,0,.03,z,.059,.03,'#38462a','p',16);cyl(L,0,.03,.51,.06,.03,'#2c361e','p',16);cyl(L,0,.03,.54,.045,.1,'#3d4a2a','m',14,.004);
   cb(L,0,-.035,-.03,.04,.03,.12,'#2a2c31','p');beam(L,[0,-.04,0],[0,-.11,-.025],.03,.05,PO,'p',1);cb(L,-.0,.1,0,.022,.04,.12,'#26282d','m');cyl(L,0,.11,.0,.008,.01,'#59c8ff','l',8);box(L,0,.1,.3,.006,.032,.01,'#111','p');
   tguard(L,-.06,'#2a2c31');rhand(L,-.07);lhand(L,[0,-.03,.32]);mz=[0,.03,.64];sY=.117;break
  case 5:cb(L,0,.02,-.13,.07,.085,.37,'#1b2a40','p',.012);cb(L,.037,.02,-.06,.008,.06,.22,'#2b4772','m',.002);cb(L,-.037,.02,-.06,.008,.06,.22,'#2b4772','m',.002);
   cyl(L,0,.025,.24,.03,.24,'#24364f','m',14);for(let k=0;k<4;k++)cyl(L,0,.025,.27+k*.05,.034,.008,'#3df','e',14);cyl(L,0,.025,.47,.022,.02,'#9ff','e',12);
   box(L,0,.065,-.06,.016,.006,.28,'#3df','e');cb(L,.046,-.01,.04,.018,.035,.08,'#3df','e',.004);cb(L,0,.08,-.02,.03,.024,.06,'#0e2238','p');box(L,0,.088,.012,.022,.012,.002,'#7ff','l');
   beam(L,[0,-.01,-.04],[0,-.085,-.07],.03,.048,'#0e1a2c','p',1);tguard(L,-.04,'#0e1a2c');rhand(L);lhand(L,[0,-.022,.3]);mz=[0,.025,.5];sY=.1;break
  case 6:cb(L,0,.02,-.17,.13,.12,.47,'#25542a','p',.025);cb(L,.068,.02,-.08,.012,.09,.3,'#3a7a40','m',.004);cb(L,-.068,.02,-.08,.012,.09,.3,'#3a7a40','m',.004);
   cyl(L,0,.025,.29,.074,.2,'#2f6b35','m',18);cyl(L,0,.025,.48,.078,.02,'#1c3d20','m',18);cyl(L,0,.025,.495,.056,.006,'#5f5','e',18);for(let k=0;k<4;k++)box(L,0,.09,-.1+k*.06,.06,.006,.03,'#5f5','e');
   beam(L,[0,.09,-.12],[0,.09,.15],.02,.02,'#1c3d20','m',1);beam(L,[0,-.04,-.05],[0,-.12,-.08],.035,.055,'#152e18','p',1);rhand(L,-.06);lhand(L,[-.05,-.04,.24]);mz=[0,.025,.52];sY=.11;break
  case 7:cb(L,0,-.002,-.4,.036,.075,.36,'#2e3a2a','p');cb(L,0,.03,-.32,.03,.018,.14,'#2e3a2a','p');beam(L,[0,-.005,-.05],[0,-.085,-.085],.03,.046,'#2e3a2a','p',1);
   cb(L,0,.022,-.05,.042,.046,.24,'#3a3d44','m');cyl(L,0,.028,.19,.0095,.62,'#2b2e33','m',12);cyl(L,0,.028,.78,.014,.06,DK,'m',10);for(let k=0;k<3;k++)box(L,.014,.028,.79+k*.016,.002,.006,.008,'#050505','m');
   beam(L,[.022,.035,.08],[.055,.025,.07],.006,.006,'#2b2e33','m');cyl(L,.058,.025,.063,.008,.014,'#3a3d44','m',8);
   for(const z of[-.02,.13])cb(L,0,.06,z,.03,.028,.02,'#1a1c20','m');cyl(L,0,.088,-.06,.021,.24,'#1d1f24','m',14);cyl(L,0,.088,-.11,.026,.05,'#1d1f24','m',14,.021);cyl(L,0,.088,.18,.021,.06,'#1d1f24','m',14,.029);
   cyl(L,0,.088,.24,.026,.004,'#59c8ff','l',14);cyl(L,0,.088,-.112,.02,.003,'#2f6f9a','l',12);cb(L,0,.114,.05,.016,.012,.016,'#26282d','m');cb(L,.026,.088,.05,.012,.016,.016,'#26282d','m');
   tguard(L,-.04);rhand(L);lhand(L,[0,-.004,.28]);mz=[0,.028,.84];sY=.09;break
  case 8:cb(L,0,.022,-.02,.032,.048,.1,'#a7adb8','m',.004);cyl(L,0,.022,0,.028,.058,'#8c929d','m',14);for(let k=0;k<6;k++){const a=k*1.047+.5;box(L,Math.cos(a)*.027,.022+Math.sin(a)*.027,.008,.004,.004,.04,'#5c616a','m')}
   cyl(L,0,.038,.08,.011,.15,'#9aa0ab','m',12);cb(L,0,.051,.08,.008,.008,.15,'#8c929d','m',.001);cyl(L,0,.018,.08,.005,.11,'#7d838e','m',8);beam(L,[0,.05,-.02],[0,.062,-.045],.008,.01,'#5c616a','m');
   beam(L,[0,-.005,-.02],[0,-.088,-.05],.032,.05,'#5b3a22','w',1);box(L,.0165,-.05,-.04,.002,.03,.02,'#c9a13a','m');box(L,0,.058,.218,.005,.012,.01,'#2a2b30','m');tguard(L,-.01,'#8c929d');rhand(L);lhand(L,[-.03,-.045,0],1);mz=[0,.038,.232];sY=.064;az=.34;break
  case 9:cyl(L,0,.02,-.13,.028,.34,'#3d4148','m',12);cyl(L,0,.02,.2,.036,.26,'#2b2e33','m',14);for(let k=0;k<5;k++)box(L,.035,.02,.22+k*.045,.004,.012,.025,'#0c0c0e','m');cyl(L,0,.02,.46,.036,.08,DK,'m',14,.046);
   cyl(L,.08,-.055,-.14,.05,.36,'#b8322a','m',14);for(const z of[-.05,.12])cyl(L,.08,-.055,z,.053,.018,'#6d1612','m',14);cyl(L,.08,-.055,.22,.03,.03,'#8a8f98','m',10);
   beam(L,[.08,-.055,.25],[.03,-.02,.32],.012,.012,'#1a1a1a','p',1);beam(L,[.03,-.02,.32],[.0,.0,.36],.012,.012,'#1a1a1a','p',1);box(L,0,.05,.43,.012,.012,.02,'#39f','e');
   beam(L,[0,-.008,-.04],[0,-.085,-.07],.03,.046,PO,'p',1);tguard(L,-.03);rhand(L);lhand(L,[0,-.014,.3]);mz=[0,.02,.55];sY=.07;break
  case 10:beam(L,[0,.02,-.06],[0,.0,-.38],.03,.03,'#2a2c22','m',1);beam(L,[0,-.05,-.38],[0,-.04,-.06],.03,.03,'#2a2c22','m',1);cb(L,0,-.02,-.4,.04,.1,.03,'#1c1d16','p');
   cb(L,0,.02,-.06,.05,.06,.12,'#4c4c32','m');cyl(L,0,.025,.05,.06,.12,'#6b6b47','m',16);for(let k=0;k<6;k++){const a=k*1.047;cyl(L,Math.cos(a)*.036,.025+Math.sin(a)*.036,.168,.013,.003,'#0a0a0a','m',10)}
   cyl(L,0,.025,.17,.031,.3,'#4c4c32','m',14);rail(L,0,.06,.18,.2);beam(L,[0,-.008,.32],[0,-.075,.3],.026,.03,PO,'p',1);box(L,0,.075,.45,.006,.03,.01,'#111','p');box(L,0,.075,.03,.03,.014,.02,'#111','p');
   beam(L,[0,-.008,-.04],[0,-.085,-.07],.03,.046,PO,'p',1);tguard(L,-.03);rhand(L);lhand(L,[0,-.07,.3]);mz=[0,.025,.48];sY=.09;break
  case 11:cb(L,0,.022,-.03,.04,.05,.18,'#2a4f9c','m',.008);for(const z of[.04,.08,.12])cyl(L,0,.024,z,.033,.01,'#9fd0ff','e',14);cyl(L,0,.024,.03,.026,.13,'#162c58','m',12);
   beam(L,[-.012,.024,.15],[-.016,.03,.24],.005,.005,'#dfe9f5','m');beam(L,[.012,.024,.15],[.016,.03,.24],.005,.005,'#dfe9f5','m');cyl(L,0,.024,.15,.006,.04,'#bfe6ff','e',8);
   beam(L,[0,-.003,-.01],[0,-.088,-.04],.03,.05,'#1a2f5e','p',1);box(L,0,.054,.12,.005,.012,.01,'#6cf','e');cb(L,0,.054,-.03,.022,.008,.014,'#111','p',.001);tguard(L,0,'#1a2f5e');rhand(L);lhand(L,[-.03,-.045,0],1);mz=[0,.026,.24];sY=.062;az=.34;break
  case 12:cb(L,0,.02,-.17,.07,.075,.37,'#2a2f40','p',.012);cb(L,-.027,.02,.2,.012,.034,.5,'#596079','m',.003);cb(L,.027,.02,.2,.012,.034,.5,'#596079','m',.003);box(L,0,.02,.2,.012,.012,.5,'#3cf','e');
   for(let k=0;k<5;k++)cb(L,0,.02,.24+k*.09,.075,.05,.016,'#1c2030','m',.006);cb(L,0,.072,-.05,.02,.024,.12,'#1c2030','m');cyl(L,0,.084,.0,.012,.06,'#1c2030','m',10);cyl(L,0,.084,.06,.01,.003,'#3cf','l',10);
   beam(L,[0,-.008,-.05],[0,-.088,-.08],.03,.048,'#161926','p',1);tguard(L,-.04,'#161926');rhand(L);lhand(L,[0,-.02,.3]);mz=[0,.02,.71];sY=.096;break
  case 13:cb(L,0,.02,-.09,.042,.058,.31,'#363940','m',.004);cb(L,0,.052,-.06,.04,.012,.23,'#33363c','m',.006);box(L,.0215,.034,.0,.002,.012,.06,'#0e0f11','m');beam(L,[.022,.04,.12],[.04,.042,.12],.006,.008,'#363940','m');
   cb(L,0,.012,.22,.046,.04,.16,'#8a5a2e','w');cb(L,0,.045,.22,.034,.02,.14,'#7a4e28','w');for(let i=0;i<3;i++)box(L,.0235,.012,.24+i*.04,.002,.022,.006,'#5a3a1a','w');
   cyl(L,0,.048,.36,.007,.06,'#2a2c31','m',8);cyl(L,0,.03,.38,.009,.23,'#2a2c31','m',10);cyl(L,0,.03,.6,.013,.05,'#1d1f22','m',10);for(let k=0;k<2;k++)box(L,.013,.03,.61+k*.018,.002,.007,.008,'#050505','m');
   cb(L,0,.042,.55,.02,.03,.03,'#1d1f22','m');box(L,0,.066,.56,.005,.022,.008,'#111','m');cb(L,0,.062,.1,.03,.01,.03,'#1a1b1f','m');
   beam(L,[0,-.01,.07],[0,-.085,.095],.028,.05,'#2b2d31','m',1);beam(L,[0,-.085,.095],[0,-.15,.15],.028,.05,'#2b2d31','m',1);for(let k=0;k<3;k++)box(L,.0145,-.04-k*.035,.085+k*.018,.002,.006,.035,'#1c1d20','m');
   cb(L,0,-.0,-.4,.036,.072,.31,'#8a5a2e','w');beam(L,[0,-.005,-.05],[0,-.085,-.08],.03,.046,'#6e4522','w',1);tguard(L,-.03);rhand(L);lhand(L,[0,-.003,.3]);mz=[0,.03,.65];sY=.077;break
  case 14:cb(L,0,.022,-.07,.046,.064,.28,'#363a40','m',.006);cyl(L,0,.03,.21,.016,.02,'#1c1e22','m',12);cyl(L,0,.03,.22,.01,.07,'#3d4047','m',10);
   box(L,0,.062,-.06,.02,.012,.014,'#15171a','m');box(L,-.008,.064,.17,.004,.016,.012,'#15171a','m');box(L,.008,.064,.17,.004,.016,.012,'#15171a','m');box(L,0,.062,.172,.004,.014,.008,'#15171a','m');
   cyl(L,0,.058,.02,.008,.02,'#15171a','m',8);beam(L,[0,-.004,-.02],[0,-.12,-.045],.027,.045,'#15171a','p',1);box(L,0,-.125,-.052,.03,.01,.05,'#0e0f11','p');
   beam(L,[-.025,-.01,-.06],[-.03,-.04,-.25],.006,.006,'#3d4047','m');beam(L,[.025,-.01,-.06],[.03,-.04,-.25],.006,.006,'#3d4047','m');tguard(L,-.02);rhand(L,-.05);lhand(L,[-.03,-.06,.02],1);mz=[0,.03,.29];sY=.072;az=.3;break
  case 15:cb(L,0,0,-.32,.034,.05,.64,'#2a2d30','p',.006);cb(L,0,-.012,-.36,.034,.07,.2,'#2a2d30','p',.008);beam(L,[0,-.005,-.06],[0,-.085,-.085],.03,.046,'#2a2d30','p',1);
   for(const s of[-1,1]){beam(L,[0,.02,.27],[s*.12,.025,.24],.03,.022,'#30353d','m',1);beam(L,[s*.12,.025,.24],[s*.24,.032,.18],.022,.018,'#30353d','m',1);cyl(L,s*.245,.032,.17,.017,.012,'#c9a13a','m',12);
    beam(L,[s*.245,.032,.172],[0,.034,.035],.003,.003,'#e8e2d0','c');beam(L,[s*.12,.012,.24],[s*.06,-.006,.12],.004,.004,'#4a4f58','m')}
   beam(L,[0,.04,.035],[0,.04,.36],.007,.007,'#2c2016','w');cyl(L,0,.04,.36,.006,.03,'#cfd5dc','m',6,0);for(const a of[0,2.09,4.19])beam(L,[0,.04,.04],[Math.cos(a)*.012,.04+Math.sin(a)*.012,.07],.002,.012,'#d8242c','c');
   cb(L,0,.072,.0,.016,.02,.09,'#1d1f24','m');cyl(L,0,.086,-.01,.012,.1,'#1d1f24','m',12);cyl(L,0,.086,.09,.011,.003,'#59c8ff','l',12);cb(L,0,-.03,.16,.03,.05,.03,'#2a2d30','p');
   tguard(L,-.04,'#2a2d30');rhand(L);lhand(L,[0,-.03,.18]);mz=[0,.04,.4];sY=.086;break
  case 16:{const sp=now*((P&&P.spn)||0)*30;cb(L,0,0,-.17,.12,.105,.31,'#41454d','m',.018);cyl(L,0,0,-.3,.045,.13,'#26282d','m',14);for(let k=0;k<5;k++)box(L,.061,0,-.15+k*.05,.003,.06,.02,'#151618','m');
   for(let k=0;k<6;k++){const a=sp+k*1.047;cyl(L,Math.cos(a)*.031,Math.sin(a)*.031,.14,.012,.54,'#4c5058','m',8);cyl(L,Math.cos(a)*.031,Math.sin(a)*.031,.67,.006,.006,'#050505','m',6)}
   cyl(L,0,0,.14,.02,.54,'#1d1f22','m',10);for(const z of[.28,.62])cyl(L,0,0,z,.049,.024,'#24262a','m',16);beam(L,[0,.06,-.15],[0,.06,.05],.025,.03,DK,'m',1);beam(L,[0,.06,-.15],[0,.08,-.2],.02,.02,DK,'m',1);
   beam(L,[.065,-.04,-.05],[.14,-.16,-.12],.035,.025,'#c9a13a','m',1);box(L,.065,-.05,-.08,.02,.04,.06,'#2a2c31','m');rhand(L,-.07);lhand(L,[-.04,-.075,.1]);mz=[0,0,.7];sY=.125;break}
  // ===== neue Waffen 17-26 =====
  case 17:{const SV='#b9bec7',SD='#8f949c';   // Desert Eagle: grosser verchromter Schlitten, dreieckiger Lauf
   beam(L,[0,-.002,-.01],[0,-.095,-.045],.032,.056,'#18191c','p',1);for(let i=0;i<5;i++)box(L,.0168,-.03-i*.015,-.03-i*.005,.002,.005,.042,'#0b0b0d','p');
   cb(L,0,.014,-.02,.034,.03,.21,'#2a2b2f','m',.004);cb(L,0,.047,-.04,.04,.038,.27,SV,'m',.006);for(let i=0;i<7;i++)box(L,.0202,.047,-.15+i*.008,.0015,.026,.003,SD,'m');
   box(L,0,.067,.0,.012,.004,.2,SD,'m');box(L,.0202,.05,.04,.0015,.014,.05,'#0e0f11','m');cyl(L,0,.04,.235,.007,.004,'#0a0a0b','m',10);
   cb(L,0,.072,-.15,.026,.01,.016,'#111','p',.001);box(L,0,.072,.2,.006,.012,.012,'#111','p');box(L,0,.075,.205,.003,.003,.002,'#f33','e');tguard(L,0);rhand(L);lhand(L,[-.03,-.04,.0],1);mz=[0,.042,.24];sY=.077;az=.36;break}
  case 18:{const WD='#6b4226',BR='#3a3d43';   // Doppelflinte: zwei Laeufe nebeneinander, Holzschaft
   for(const s of[-1,1]){cyl(L,s*.014,.03,.1,.014,.5,BR,'m',12);cyl(L,s*.014,.03,.6,.015,.012,'#1d1f22','m',12);cyl(L,s*.014,.03,.612,.009,.002,'#050505','m',10)}
   box(L,0,.046,.15,.004,.004,.45,'#2a2c31','m');cb(L,0,.025,-.02,.05,.06,.14,'#4a4e56','m',.006);box(L,.0255,.03,.0,.002,.03,.08,'#6c7078','m');
   cb(L,0,.008,.24,.046,.034,.2,WD,'w');for(let i=0;i<6;i++)box(L,0,-.01,.25+i*.028,.048,.003,.008,'#4a2c18','w');cb(L,0,-.01,-.36,.04,.07,.3,WD,'w');box(L,0,-.01,-.372,.042,.072,.012,'#141414','p');
   beam(L,[0,-.005,-.06],[0,-.075,-.085],.03,.045,WD,'w',1);box(L,0,.05,.59,.004,.008,.004,'#e8c35a','m');tguard(L,-.03);rhand(L);lhand(L,[0,-.01,.3]);mz=[0,.03,.62];sY=.054;break}
  case 19:{const B=model(3,now,P);L.push(...B.L);mz=B.mz;sY=B.sY;az=B.az;   // LMG: MG-Basis + Trommelmagazin, Zweibein, Tragegriff
   cyl(L,.0,-.06,-.04,.075,.07,'#3d4a2a','p',18);cyl(L,.0,-.06,-.045,.05,.005,'#2c361e','p',14);for(let k=0;k<6;k++){const a=k*1.047;box(L,Math.cos(a)*.074,-.06+Math.sin(a)*.074,-.005,.006,.006,.07,'#2c361e','p')}
   for(const s of[-1,1]){beam(L,[s*.012,.0,.5],[s*.03,-.02,.32],.007,.007,'#1d1f22','m');cyl(L,s*.03,-.02,.31,.008,.012,'#111','m',6)}
   beam(L,[0,.1,-.06],[0,.12,.0],.008,.012,'#1d1f22','m');beam(L,[0,.12,0],[0,.12,.1],.008,.012,'#1d1f22','m');beam(L,[0,.12,.1],[0,.1,.14],.008,.012,'#1d1f22','m');break}
  case 20:{const B=model(13,now,P);L.push(...B.L);   // DMR: AK-Basis + langes Zielfernrohr + Mündungsbremse
   box(L,0,.07,-.02,.02,.006,.18,'#1c1e22','m');cyl(L,0,.086,-.1,.012,.24,'#202227','m',14);cyl(L,0,.086,.14,.016,.04,'#202227','m',14);cyl(L,0,.086,-.13,.015,.03,'#202227','m',14);
   cyl(L,0,.086,.18,.014,.002,'#59c8ff','l',14);for(const z of[-.05,.06])cb(L,0,.077,z,.012,.014,.016,'#1c1e22','m');cyl(L,.017,.086,.0,.005,.014,'#2a2c31','m',8);
   cyl(L,0,.03,.66,.015,.06,'#1d1f22','m',10);for(let k=0;k<3;k++)box(L,.0155,.03,.67+k*.016,.002,.009,.007,'#050505','m');mz=[0,.03,.72];sY=.086;az=.25;break}
  case 21:{const PL='#2f3338';   // Burst-Gewehr: kompaktes Bullpup mit Leuchtpunkt-Visier
   cb(L,0,.02,-.12,.05,.08,.42,PL,'p',.012);cb(L,0,.062,-.06,.044,.016,.3,'#262a2e','p',.006);rail(L,0,.075,-.08,.22);cb(L,0,-.04,-.25,.03,.07,.08,'#1d1f22','p');
   cb(L,0,.1,.0,.03,.03,.06,'#1a1b1f','m',.004);cyl(L,0,.105,.03,.01,.002,'#ff3b3b','e',10);cyl(L,0,.025,.19,.012,.2,'#26282d','m',10);cyl(L,0,.025,.38,.016,.04,'#1d1f22','m',10);
   for(let k=0;k<4;k++)box(L,.026,.02,.05+k*.04,.002,.03,.018,'#1b1d20','p');box(L,.026,.04,-.14,.002,.016,.05,'#ffb02e','p');
   beam(L,[0,-.01,.05],[0,-.085,.025],.028,.048,PL,'p',1);tguard(L,.02);rhand(L);lhand(L,[0,-.004,.24]);mz=[0,.025,.4];sY=.105;break}
  case 22:{const B=model(11,now,P);L.push(...B.L);mz=B.mz;sY=B.sY;az=B.az;   // Tesla: Blitzpistole + Kupferspulen + leuchtender Kern
   for(const z of[.0,.04,.08,.12])cyl(L,0,.024,z,.04,.012,'#c87533','m',14);cyl(L,0,.024,-.02,.012,.17,'#7fe3ff','e',10);
   for(const s of[-1,1])beam(L,[s*.03,.06,-.02],[s*.03,.08,.14],.006,.006,'#c87533','m');cyl(L,0,.085,.15,.014,.012,'#bff4ff','e',10);break}
  case 23:{   // Frostwerfer: hellblauer Tank, Duese mit Frost
   cyl(L,0,.02,-.15,.03,.3,'#3e5a72','m',12);cyl(L,.0,-.055,-.08,.045,.22,'#d4ecf7','m',16);cyl(L,0,-.055,-.085,.047,.012,'#7fb6d4','m',16);cyl(L,0,-.055,.14,.03,.02,'#7fb6d4','m',14);
   cyl(L,0,.02,.15,.034,.18,'#2e4558','m',14);for(let k=0;k<4;k++)cyl(L,0,.02,.18+k*.035,.038,.008,'#9fd6ee','m',14);cyl(L,0,.02,.33,.02,.05,'#1f2f3c','m',12);cyl(L,0,.02,.38,.012,.003,'#bff4ff','e',10);
   beam(L,[0,-.01,.0],[0,-.085,-.03],.03,.048,'#2e4558','p',1);beam(L,[0,-.055,.14],[0,.0,.16],.01,.01,'#1f2f3c','m');tguard(L,-.02);rhand(L);lhand(L,[0,-.01,.24]);mz=[0,.02,.39];sY=.06;break}
  case 24:{const sp=now*.02;   // Kreissaege-Werfer: Saegeblatt liegt oben auf
   cb(L,0,.0,-.12,.06,.07,.36,'#8a6a1f','p',.012);cb(L,0,.0,.12,.07,.05,.16,'#2e3034','m',.008);box(L,.031,.0,-.08,.002,.04,.14,'#1d1f22','p');for(let k=0;k<3;k++)box(L,.031,-.01,.0+k*.03,.002,.01,.02,'#111','p');
   cyl(L,0,.055,.08,.004,.06,'#5a5e66','m',8);for(let k=0;k<14;k++){const a=sp+k/14*6.283;box(L,Math.cos(a)*.085,.06,.1+Math.sin(a)*.085,.02,.004,.02,'#c9ced6','m')}cyl(L,0,.06,.1,.068,.004,'#9aa1aa','m',16);cyl(L,0,.066,.1,.012,.004,'#5b6068','m',10);
   beam(L,[0,-.01,-.02],[0,-.09,-.05],.03,.05,'#2a2c31','p',1);tguard(L,-.05);rhand(L);lhand(L,[0,-.03,.12]);mz=[0,.06,.2];sY=.08;break}
  case 25:{const k=Math.sin(now*.03);   // Molotow: Flasche in der Hand, brennender Lappen
   cyl(L,.0,.0,-.04,.035,.13,'#2f6b36','l',14);cyl(L,0,.0,.09,.035,.0,'#2f6b36','l',14,.013);cyl(L,0,0,.11,.013,.06,'#2f6b36','l',10);cyl(L,0,.0,-.045,.036,.012,'#1d3a20','m',14);
   cb(L,0,.03,-.02,.03,.012,.05,'#e8e2d0','w',.002);cyl(L,0,0,.17,.016,.03,'#d8ccb0','w',8);cyl(L,0,0,.2,.012,.02+.006*k,'#ffb02e','e',8);cyl(L,0,0,.22,.006,.015,'#fff1b5','e',6);
   rhand(L,-.0);mz=[0,0,.23];sY=.0;az=.32;break}
  case 26:{const B=model(4,now,P);L.push(...B.L);mz=B.mz;sY=B.sY;az=B.az;   // Taubenwerfer: Raketenrohr + Taube schaut vorne raus
   const zf=B.mz[2]-.02;cb(L,0,.03,zf,.05,.05,.07,'#cfd2da','p',.012);cb(L,0,.06,zf+.03,.034,.034,.04,'#9aa0ac','p',.008);box(L,0,.055,zf+.06,.012,.008,.02,'#ff9a2e','p');
   for(const s of[-1,1]){box(L,s*.012,.068,zf+.045,.006,.006,.002,'#111','p');box(L,s*.014,.072,zf+.034,.004,.004,.004,'#4cd18a','e')}
   for(let i=0;i<3;i++)box(L,.058,.03,-.1+i*.08,.002,.03,.03,'#9b5cff','p');break}
  case 27:{   // Harpune: Rohr mit eingelegtem Speer
   cyl(L,0,.02,-.2,.03,.5,'#2e4558','m',14);cb(L,0,-.01,-.16,.05,.05,.18,'#1d2a36','m',.008);for(const z of[-.05,.15])cyl(L,0,.02,z,.034,.02,'#c9a13a','m',14);
   cyl(L,0,.06,-.15,.006,.62,'#cfd5dc','m',8);cyl(L,0,.06,.47,.014,.0,'#e8ecf2','m',8);cyl(L,0,.06,.45,.012,.02,'#9aa1aa','m',8,.014);for(const s of[-1,1])beam(L,[s*.004,.06,.44],[s*.022,.06,.4],.004,.004,'#9aa1aa','m');
   beam(L,[0,-.02,-.02],[0,-.095,-.05],.03,.048,'#1d2a36','p',1);tguard(L,-.05);rhand(L);lhand(L,[0,-.004,.18]);mz=[0,.06,.5];sY=.08;break}
  case 28:{   // Raketenschwarm: Kasten mit 4 Rohren
   cb(L,0,.03,-.12,.075,.075,.4,'#4a5160','m',.012);for(const a of[-1,1])for(const b of[-1,1]){cyl(L,a*.018,.03+b*.018,.08,.014,.01,'#1d1f22','m',10);cyl(L,a*.018,.03+b*.018,.085,.009,.002,'#ff5a2e','e',8)}
   cb(L,0,.08,-.08,.024,.024,.1,'#2a2c31','m');cyl(L,0,.08,-.03,.008,.002,'#59ff8a','l',8);for(let i=0;i<4;i++)box(L,.039,.03,-.26+i*.07,.002,.04,.03,'#ffb02e','p');
   beam(L,[0,-.02,-.1],[0,-.11,-.13],.03,.05,'#2a2c31','p',1);tguard(L,-.12);rhand(L,-.05);lhand(L,[-.02,-.02,.0]);mz=[0,.03,.09];sY=.1;break}
  case 29:{const pu=.6+.4*Math.sin(now*.006);   // Schwarzes Loch: Sci-Fi-Waffe mit violetter Kugel
   cb(L,0,.0,-.12,.07,.08,.34,'#1b1c22','m',.015);cyl(L,0,.01,.06,.05,.14,'#2a2b33','m',16);for(const z of[.08,.12,.16])cyl(L,0,.01,z,.055,.008,'#7b2ff7','e',16);
   cyl(L,0,.01,.21,.035,.03,'#000','m',14);cyl(L,0,.01,.24,.02*pu+.01,.006,'#c9a0ff','e',12);for(const s of[-1,1])beam(L,[s*.04,.04,-.05],[s*.04,.03,.2],.008,.008,'#7b2ff7','e');
   beam(L,[0,-.03,-.06],[0,-.11,-.09],.032,.05,'#1b1c22','p',1);tguard(L,-.08);rhand(L,-.06);lhand(L,[0,-.04,.12]);mz=[0,.01,.25];sY=.07;break}
  case 30:{   // Shuriken-Werfer am Handgelenk, Stern liegt oben
   cb(L,0,-.02,-.05,.07,.05,.22,'#2a2c31','m',.01);cb(L,0,.012,.02,.06,.016,.14,'#3a3e46','m',.004);for(let k=0;k<4;k++){const a=k/4*6.283+.4;beam(L,[0,.03,.07],[Math.cos(a)*.06,.03,.07+Math.sin(a)*.06],.016,.004,'#d9dde3','m')}cyl(L,0,.03,.07,.016,.006,'#c9ced6','m',8);
   cyl(L,0,.028,.06,.006,.004,'#3a3e46','m',8);for(let i=0;i<3;i++)box(L,.036,-.02,-.12+i*.04,.002,.02,.02,'#d8242c','p');rhand(L,-.07);mz=[0,.03,.12];sY=.03;az=.3;break}
  case 31:{   // Lasergewehr: weiss mit roten Leuchtlinien
   cb(L,0,.02,-.14,.055,.075,.48,'#e8eaee','p',.016);cb(L,0,.065,-.08,.04,.02,.3,'#cfd3da','p',.008);for(const s of[-1,1])box(L,s*.0285,.02,-.1,.002,.008,.34,'#ff2a2a','e');
   cyl(L,0,.02,.12,.016,.2,'#2a2c31','m',12);for(const z of[.16,.22,.28])cyl(L,0,.02,z,.022,.008,'#ff2a2a','e',12);cyl(L,0,.02,.32,.01,.004,'#ffd0d0','e',10);
   cb(L,0,.1,-.05,.03,.025,.07,'#1d1f22','m',.004);cyl(L,0,.105,-.015,.009,.002,'#ff3b3b','e',8);beam(L,[0,-.01,-.02],[0,-.09,-.05],.028,.048,'#2a2c31','p',1);
   tguard(L,-.05);rhand(L);lhand(L,[0,-.012,.16]);mz=[0,.02,.33];sY=.105;break}
 }
 return{L,mz,sY,az};
}
// ---------- Zeichnen ----------
function xf(p,T){   // lokale Waffe -> Kamera (Rollen, Nicken, Gieren, dann verschieben)
 let[x0,y0,z0]=p;const cr=Math.cos(T.r),sr=Math.sin(T.r),cp=Math.cos(T.p),sp=Math.sin(T.p),cy=Math.cos(T.y),sy=Math.sin(T.y);
 let x1=x0*cr-y0*sr,y1=x0*sr+y0*cr;let y2=y1*cp-z0*sp,z2=y1*sp+z0*cp;const x3=x1*cy+z2*sy,z3=-x1*sy+z2*cy;return[x3+T.x,y2+T.ty,z3+T.z]}
const proj=p=>[VW/2+VMF*p[0]/p[2],VH/2-VMF*p[1]/p[2]];
function clipZ(poly){const o=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],ia=a[2]>=ZN0,ib=b[2]>=ZN0;if(ia)o.push(a);
 if(ia!==ib){const t=(ZN0-a[2])/(b[2]-a[2]);o.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,ZN0])}}return o}
function shade(c,mt,n,fc){   // Licht: Grund + Streulicht + Glanz + Randlicht
 const M=MAT[mt]||MAT.p;if(mt=='e')return[c,null];
 const v=nrm([-fc[0],-fc[1],-fc[2]]),d=Math.max(0,n[0]*LIGHT[0]+n[1]*LIGHT[1]+n[2]*LIGHT[2]),h=nrm([LIGHT[0]+v[0],LIGHT[1]+v[1],LIGHT[2]+v[2]]),
  s=M[2]*Math.pow(Math.max(0,n[0]*h[0]+n[1]*h[1]+n[2]*h[2]),M[3]),r=.18*Math.max(0,n[0]*RIM[0]+n[1]*RIM[1]+n[2]*RIM[2]),ao=.86+.14*Math.max(-1,Math.min(1,n[1]+.3)),k=(M[0]+M[1]*d)*ao+r;
 return[c.map(q=>Math.min(255,q*k+255*s)|0),c.map(q=>Math.min(255,q*k*.62+255*s*.4)|0)]}
function drawModel(M,T,sk,tm){
 const F=[];tm=tm||performance.now();let pi=0;
 for(const p of M.L){const v=p.v.map(q=>xf(q,T));pi++;let fi=0;
  for(const f of p.f){fi++;const a=v[f[0]],b=v[f[1]],c=v[f[2]],u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],w=[c[0]-a[0],c[1]-a[1],c[2]-a[2]],
   n=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]];if(n[0]*a[0]+n[1]*a[1]+n[2]*a[2]>=0)continue;   // Rueckseite
   const poly=clipZ(f.map(i=>v[i]));if(poly.length<3)continue;
   const fc=[0,1,2].map(k=>poly.reduce((s,q)=>s+q[k],0)/poly.length),[pc,pm]=sk&&(p.m=='m'||p.m=='p'||p.m=='w')?sk.f(p.c,(pi*131+fi*17)%997,tm):[p.c,p.m],[fcol,ecol]=shade(pc,pm,nrm(n),fc);
   F.push({z:fc[2],s:poly.map(proj),c:'rgb('+fcol.join(',')+')',k:(p.sm&&p.sm.has(f))||!ecol?null:'rgb('+ecol.join(',')+')',e:pm=='e'})}}
 F.sort((a,b)=>b.z-a.z);x.lineJoin='round';
 for(const f of F){x.fillStyle=f.c;x.beginPath();x.moveTo(f.s[0][0],f.s[0][1]);for(let i=1;i<f.s.length;i++)x.lineTo(f.s[i][0],f.s[i][1]);x.closePath();x.fill();
  x.lineWidth=f.k?.45:.6;x.strokeStyle=f.k||f.c;x.stroke()}
}
const MP=[];   // Zwischenspeicher fuer feste Modelle
function drawWeapon(P,now){
 if(VM.w!==me.w){VM.sw-=dt*7;if(VM.sw<=0){VM.w=me.w;VM.sw=0}}else VM.sw=Math.min(1,VM.sw+dt*5);
 const w=VM.w;if(!WP[w])return;
 VM.ak+=((me.ads&&w&&P.al&&VM.w===me.w&&!pmOpen?1:0)-VM.ak)*Math.min(1,dt*11);const ae=VM.ak*VM.ak*(3-2*VM.ak);
 VM.sc=SCOPED[w]&&VM.ak>.85?1:0;
 let da=me.a-VM.la;if(da>3)da-=6.283;if(da<-3)da+=6.283;VM.la=me.a;const dp=(me.pt||0)-VM.lp;VM.lp=me.pt||0;
 VM.sx+=(Math.max(-14,Math.min(14,-da*260))-VM.sx)*Math.min(1,dt*9);VM.sy+=(Math.max(-10,Math.min(10,dp*1.6))-VM.sy)*Math.min(1,dt*9);
 if(P.hp<=0)return;
 if(VM.sc){drawScope(now);return}
 const M=(w==0||w==16||w==24||w==25||w==29)?model(w,now,P):(MP[w]||(MP[w]=model(w,now,P)));
 const k=rec*rec,calm=1-.85*ae,sink=(1-VM.sw)*(1-VM.sw),air=me.z>0?Math.max(-1,Math.min(1,-(me.vz||0)*.12)):0;
 const kick=(WKICK[w]||0)/20;
 const T={
  x:(.135*(1-ae))+(Math.sin(bob)*.008+VM.sx*.0016)*calm,
  ty:(-.13+(-M.sY-.001+.13)*ae)-(Math.abs(Math.cos(bob))*.007+Math.sin(now*1.7)*.002)*calm-VM.sy*.002*(1-.6*ae)+air*.02-landT*.015-sink*.3,
  z:.33*(1-ae)+M.az*ae-(w?k*kick*.05:-k*.02),
  y:-.06*(1-ae)+VM.sx*.002*calm,p:-(w?k*kick*.07:0)-sink*.5+air*.03,r:(.05*(1-ae))};
 if((w==3||w==14||w==16)&&fl>0){T.x+=(Math.random()-.5)*.003;T.ty+=(Math.random()-.5)*.003}
 drawModel(M,T,typeof skinOf=='function'?skinOf(w):null);
 const mzp=d=>proj(xf([M.mz[0],M.mz[1],M.mz[2]+d],T)),m=proj(xf(M.mz,T)),mf=mzp(.05);VM.mx=mf[0];VM.my=mf[1];   // Schuss-Spur startet knapp vor dem Lauf
 const gl=(c,r,a,px,py)=>{px=px==null?m[0]:px;py=py==null?m[1]:py;const q=x.createRadialGradient(px,py,0,px,py,r);q.addColorStop(0,c);q.addColorStop(1,'rgba(0,0,0,0)');x.globalAlpha=a;x.globalCompositeOperation='lighter';x.fillStyle=q;x.beginPath();x.arc(px,py,r,0,7);x.fill();x.globalAlpha=1;x.globalCompositeOperation='source-over'};
 if(w==5)gl('#3df',10+Math.sin(now*9)*2,.5);if(w==6)gl('#5f5',16+Math.sin(now*6)*4,.55);if(w==12)gl('#3cf',8+Math.sin(now*8)*2,.45);if(w==11)gl('#6cf',7,.45);
 if(w==9){const h=4+Math.random()*3;x.fillStyle='#fa2';x.beginPath();x.moveTo(m[0]-2,m[1]);x.quadraticCurveTo(m[0]+(Math.random()-.5)*3,m[1]-h,m[0]+2,m[1]);x.fill()}
 if(fl>0&&FLR[w])flash(w,w==5?'#3df':w==6?'#5f5':w==11||w==22?'#6cf':w==12?'#3cf':w==29?'#b45cff':w==31?'#ff3b3b':'#ffb347',mzp,M,T);
}

// Muendungsfeuer: sitzt VOR dem Lauf und schiesst nach vorne raus (Flammenkegel + seitliche Zacken + Leuchten), jedes Mal etwas anders
let FLS=0,FLP=0;
function flash(w,c,mzp,M,T){
 if(fl>FLP+.001)FLS=Math.random()*1e4;FLP=fl;
 const R=FLR[w]*.7,a=Math.min(1,fl/.06),rnd=k=>{const v=Math.sin(FLS*(k+1)*12.9898)*43758.5453;return v-Math.floor(v)};
 const L=.07+.06*(R/30),p0=mzp(.004),p1=mzp(.02+L*.3),p2=mzp(.02+L*(1+.4*rnd(1)));
 const toR=h=>{const q=c.length==4?[...c.slice(1)].map(v=>parseInt(v+v,16)):[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));return'rgba('+q.join(',')+','+h+')'};
 x.save();x.globalCompositeOperation='lighter';
 // Leuchten um die Muendung
 const gr=R*1.5*(.85+.3*rnd(2)),g=x.createRadialGradient(p1[0],p1[1],0,p1[0],p1[1],gr);g.addColorStop(0,toR(.55*a));g.addColorStop(.4,toR(.18*a));g.addColorStop(1,toR(0));x.fillStyle=g;x.fillRect(p1[0]-gr,p1[1]-gr,gr*2,gr*2);
 // Flammenkegel nach vorne
 const dx=p2[0]-p0[0],dy=p2[1]-p0[1],dl=Math.hypot(dx,dy)||1,nx=-dy/dl,ny=dx/dl,wd=R*.32*(.8+.4*rnd(3));
 const cone=(q0,q1,w0,col0,col1)=>{const lg=x.createLinearGradient(q0[0],q0[1],q1[0],q1[1]);lg.addColorStop(0,col0);lg.addColorStop(1,col1);x.fillStyle=lg;x.beginPath();x.moveTo(q0[0]+nx*w0,q0[1]+ny*w0);
  x.quadraticCurveTo((q0[0]+q1[0])/2+nx*w0*.9,(q0[1]+q1[1])/2+ny*w0*.9,q1[0],q1[1]);x.quadraticCurveTo((q0[0]+q1[0])/2-nx*w0*.9,(q0[1]+q1[1])/2-ny*w0*.9,q0[0]-nx*w0,q0[1]-ny*w0);x.closePath();x.fill()};
 cone(p0,p2,wd,'rgba(255,255,240,'+a+')',toR(0));
 cone(p0,p1,wd*.55,'rgba(255,255,255,'+a+')','rgba(255,240,200,'+(.4*a)+')');
 // seitliche Zacken (in 3D um den Lauf verteilt)
 const n=4,base=rnd(4)*6.283;for(let k=0;k<n;k++){const an=base+k*6.283/n,len=.025+.03*rnd(5+k),q=proj(xf([M.mz[0]+Math.cos(an)*len,M.mz[1]+Math.sin(an)*len,M.mz[2]+.02+L*.25],T));
  const ex=q[0]-p1[0],ey=q[1]-p1[1],el=Math.hypot(ex,ey)||1,sw=wd*.35;const lg=x.createLinearGradient(p1[0],p1[1],q[0],q[1]);lg.addColorStop(0,'rgba(255,250,220,'+(.9*a)+')');lg.addColorStop(1,toR(0));x.fillStyle=lg;
  x.beginPath();x.moveTo(p1[0]-ey/el*sw,p1[1]+ex/el*sw);x.lineTo(q[0],q[1]);x.lineTo(p1[0]+ey/el*sw,p1[1]-ex/el*sw);x.closePath();x.fill()}
 // heller Kern
 x.fillStyle='rgba(255,255,255,'+(.95*a)+')';x.beginPath();x.arc(p0[0]+(p1[0]-p0[0])*.4,p0[1]+(p1[1]-p0[1])*.4,Math.max(1,R*.12),0,7);x.fill();
 x.restore()}
