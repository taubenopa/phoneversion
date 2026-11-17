// TAUBENGAME - Karte "Hafen Grill" (Dortmund, Feldherrnstrasse / Gneisenaustrasse / Martha-Gillessen-Strasse) bei Nacht
// Nur Koop und Deathmatch. Offene Karte mit Sprungfeldern. Die Nachtbeleuchtung selbst steckt in game.js (buildLight, nightFx).
(function(){
 const R=Math.random,mk=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);return c};
 // Jede Fassade hat zwei Ebenen: die normale Textur und eine Leucht-Ebene (Fenster, Schilder), die nachts nicht abgedunkelt wird
 const pair=(h,f)=>{const t=mk(64,h,()=>{}),e=mk(64,h,()=>{});f(t.getContext('2d'),e.getContext('2d'),h);return[t,e]};
 const lit=(e,a,b,w,h,c)=>{e.fillStyle=c||'#ffd98a';e.fillRect(a,b,w,h);e.fillStyle='#fff3d0';e.fillRect(a+1,b+1,Math.max(1,w/3|0),1)};

 // ---- weisses Fliesen-Hochhaus (Feldherrnstr. 41-43) ----
 const tiles=(g,h)=>{g.fillStyle='#c4c6cb';g.fillRect(0,0,64,h);g.fillStyle='#a9acb2';for(let y=0;y<h;y+=4)g.fillRect(0,y,64,1);for(let a=0;a<64;a+=4)g.fillRect(a,0,1,h);
  for(let k=0;k<120;k++){g.fillStyle=R()<.5?'#0000000d':'#ffffff18';g.fillRect((R()*16|0)*4+1,(R()*h/4|0)*4+1,3,3)}};
 const twin=(g,e,y,on,bal)=>{g.fillStyle='#e9eaec';g.fillRect(9,y,46,30);g.fillStyle='#1c2638';g.fillRect(11,y+2,42,24);g.fillStyle='#e9eaec';g.fillRect(31,y+2,2,24);
  if(bal){g.fillStyle='#d6d7da';g.fillRect(8,y+18,48,10);g.fillStyle='#9a9ca1';g.fillRect(8,y+18,48,1)}
  g.fillStyle='#b9bbc0';g.fillRect(8,y+30,48,2);
  if(on){const c=on==2?'#9fc4ff':'#ffcf7a';lit(e,12,y+3,19,bal?15:22,c);if(on!=3)lit(e,33,y+3,19,bal?15:22,c);e.fillStyle='#00000055';e.fillRect(14,y+4,6,bal?13:20)}};
 const upper=(g,e)=>{tiles(g,192);g.fillStyle='#8a8d93';g.fillRect(0,0,64,3);
  twin(g,e,10,R()<.45?(R()<.3?2:1):0,R()<.5);twin(g,e,66,R()<.4?(R()<.25?3:1):0,R()<.5)};
 // Erdgeschoss: Vordach + Ladenfront (y 120..192)
 const roof=(g,c)=>{g.fillStyle=c||'#5b2f24';g.fillRect(0,116,64,6);g.fillStyle='#00000055';g.fillRect(0,122,64,2)};
 const groundFloor=(f)=>pair(192,(g,e)=>{upper(g,e);roof(g);f(g,e)});
 const plain=groundFloor((g,e)=>{g.fillStyle='#3a3d44';g.fillRect(0,124,64,68);g.fillStyle='#4b4f57';for(let y=126;y<190;y+=3)g.fillRect(2,y,60,1)});
 const gemuese=groundFloor((g,e)=>{g.fillStyle='#1d6b34';g.fillRect(0,124,64,12);g.fillStyle='#e8efe6';for(let a=0;a<64;a+=8)g.fillRect(a,124,4,12);
  g.fillStyle='#262a30';g.fillRect(0,136,64,56);lit(e,4,138,56,24,'#fff1c8');
  for(let r=0;r<3;r++){g.fillStyle='#6b4a2b';g.fillRect(2,164+r*9,60,7);for(let k=0;k<14;k++){const C=['#e33','#f80','#fd3','#5b3','#c22','#9c3'];g.fillStyle=C[(k+r*3)%6];g.fillRect(4+k*4,162+r*9,3,3)}}
  e.fillStyle='#e33';for(let k=0;k<14;k++)e.fillRect(4+k*4,162,3,3)});
 const kiosk=groundFloor((g,e)=>{g.fillStyle='#22252b';g.fillRect(0,124,64,68);g.fillStyle='#0d3d7a';g.fillRect(8,126,48,12);e.fillStyle='#4fb3ff';e.font='bold 10px monospace';e.textAlign='center';e.fillText('KIOSK',32,136);
  g.fillStyle='#111';g.fillRect(6,142,52,40);lit(e,8,144,48,36,'#fff4d6');const C=['#e33','#3ad','#fd3','#f6a','#6c4'];for(let k=0;k<6;k++){e.fillStyle=C[k%5];e.fillRect(10+k*8,148,6,9)}
  e.fillStyle='#d33';e.fillRect(10,168,44,4);g.fillStyle='#555';g.fillRect(0,182,64,10)});
 const havanna=groundFloor((g,e)=>{g.fillStyle='#14171c';g.fillRect(0,124,64,68);
  e.strokeStyle='#ffb21c';e.lineWidth=2;e.beginPath();e.moveTo(14,150);e.lineTo(16,132);e.stroke();e.fillStyle='#3fd27a';for(const[a,b]of[[8,132],[16,128],[22,133],[13,135],[20,138]]){e.beginPath();e.ellipse(a,b,6,2,(a-16)*.12,0,7);e.fill()}
  e.fillStyle='#ffd23f';e.font='italic bold 10px serif';e.fillText('Havanna',24,140);e.font='bold 7px monospace';e.fillText('CAFE',34,149);
  lit(e,4,156,26,30,'#ffb36b');lit(e,34,156,26,30,'#ffb36b');g.fillStyle='#0b0c0f';g.fillRect(30,154,4,38)});
 // Hafen Restaurant: Schild ueber drei Kacheln + Eckeingang
 const hafen=(()=>{const W=192,s=mk(W,192,()=>{}),se=mk(W,192,()=>{}),g=s.getContext('2d'),e=se.getContext('2d');
  for(let k=0;k<3;k++){const[t,te]=pair(192,(a,b)=>upper(a,b));g.drawImage(t,k*64,0);e.drawImage(te,k*64,0)}
  g.fillStyle='#0e0f12';g.fillRect(0,116,W,76);
  for(let k=0;k<40;k++){g.strokeStyle=R()<.5?'#2c2f36':'#3a3e46';g.lineWidth=1;g.beginPath();let a=R()*W,b=118+R()*70;g.moveTo(a,b);for(let i=0;i<4;i++){a+=R()*14-7;b+=R()*8-4;g.lineTo(a,b)}g.stroke()}
  g.fillStyle='#1b1d22';g.fillRect(0,116,W,24);g.fillStyle='#55585f';g.fillRect(0,139,W,1);
  e.save();e.shadowColor='#ffffff';e.shadowBlur=6;e.fillStyle='#eef1f6';e.font='italic bold 17px Georgia,serif';e.textBaseline='middle';e.fillText('Hafen',10,129);e.fillText('Restaurant',100,129);e.restore();
  e.fillStyle='#d9b45a';e.beginPath();e.arc(84,128,10,0,7);e.fill();e.fillStyle='#0d2a3a';e.beginPath();e.arc(84,128,8,0,7);e.fill();
  e.fillStyle='#e9e2c8';e.fillRect(78,130,12,3);e.beginPath();e.moveTo(84,119);e.lineTo(84,129);e.lineTo(90,129);e.fill();e.fillRect(83,119,1,11);
  g.fillStyle='#4a4d55';g.fillRect(0,142,W,5);for(let a=0;a<W;a+=16){g.fillStyle='#62666e';g.fillRect(a,142,10,5)}
  for(let k=0;k<4;k++){const a=6+k*46;g.fillStyle='#05060a';g.fillRect(a,150,40,40);lit(e,a+2,152,36,34,'#ffd08a');e.fillStyle='#00000070';e.fillRect(a+6,170,8,16);e.fillRect(a+22,166,10,20);
   e.fillStyle='#e8352b';e.save();e.translate(a+26,160);e.rotate(-.35);e.fillRect(-9,-2,18,5);e.fillStyle='#fff';e.fillRect(-7,0,14,1);e.restore()}
  return[0,1,2].map(k=>{const t=mk(64,192,q=>q.drawImage(s,-k*64,0)),te=mk(64,192,q=>q.drawImage(se,-k*64,0));return[t,te]})})();
 const ecke=pair(192,(g,e)=>{upper(g,e);g.fillStyle='#0e0f12';g.fillRect(0,116,64,76);g.fillStyle='#1d2026';g.fillRect(0,116,10,76);g.fillRect(54,116,10,76);
  g.fillStyle='#ccc';g.fillRect(14,120,36,6);g.fillStyle='#123';g.font='bold 5px monospace';g.fillText('Feldherrnstr. 41-43',2,124);
  lit(e,14,132,36,58,'#ffe2a8');g.fillStyle='#c9ccd2';g.fillRect(31,132,2,58);e.fillStyle='#fff7e0';e.beginPath();e.arc(32,130,4,0,7);e.fill();
  e.fillStyle='#00000080';e.fillRect(18,160,10,30)});

 // ---- braun-orange Backsteinblock mit Graffiti (gegenueber am Gruenzug) ----
 const tagC=['#e43','#fd3','#3cf','#f6c','#7e4','#fff','#a6f'];
 const tags=(g,y0,h)=>{for(let k=0;k<5;k++){g.strokeStyle=tagC[R()*tagC.length|0];g.lineWidth=1+(R()*2|0);g.beginPath();let a=R()*56+2,b=y0+R()*h;g.moveTo(a,b);for(let i=0;i<6;i++){a+=R()*10-5;b+=R()*8-4;g.lineTo(a,b)}g.stroke()}};
 const orange=()=>pair(160,(g,e,h)=>{g.fillStyle='#5a2f22';g.fillRect(0,0,64,h);for(let r=0;r<h/4;r++)for(let k=0;k<5;k++){const v=R();g.fillStyle=v<.33?'#6b3828':v<.66?'#5f3123':'#764030';g.fillRect(((r&1)*8+k*16)%64,r*4,15,3)}
  for(const y of[6,46,86]){g.fillStyle='#c9661f';g.fillRect(0,y+26,64,8);g.fillStyle='#e8e6df';g.fillRect(8,y,20,24);g.fillRect(36,y,20,24);g.fillStyle='#1a2130';g.fillRect(10,y+2,16,20);g.fillRect(38,y+2,16,20);
   if(R()<.4)lit(e,10,y+2,16,20,R()<.3?'#a9c8ff':'#ffc673');if(R()<.35)lit(e,38,y+2,16,20,'#ffc673')}
  g.fillStyle='#3d2019';g.fillRect(0,126,64,34);tags(g,128,28);g.fillStyle='#8b8f96';g.fillRect(0,156,64,4)});
 // ---- graue Wohnhaeuser am Rand ----
 const grau=()=>pair(192,(g,e,h)=>{g.fillStyle='#6d6f74';g.fillRect(0,0,64,h);for(let k=0;k<300;k++){g.fillStyle=R()<.5?'#0000001a':'#ffffff10';g.fillRect(R()*64|0,R()*h|0,2,1)}
  for(const y of[12,58,104,150]){g.fillStyle='#d8d8d4';g.fillRect(10,y,18,26);g.fillRect(36,y,18,26);g.fillStyle='#1b2232';g.fillRect(12,y+2,14,22);g.fillRect(38,y+2,14,22);
   if(R()<.3)lit(e,12,y+2,14,22,R()<.3?'#9fc4ff':'#ffc673');if(R()<.25)lit(e,38,y+2,14,22,'#ffc673')}
  if(R()<.5)tags(g,170,18)});

 // Texturen eintragen: 12 Fliesen schlicht, 13 Gemuese, 14 Kiosk, 15 Havanna, 16-18 Hafen-Schild, 21 Hafen-Eingang, 19/22 Backstein, 20/23 grau
 const put=(i,p,h)=>{TX[i]=p[0];TXE[i]=p[1];WH[i]=h};
 put(12,plain,3);put(13,gemuese,3);put(14,kiosk,3);put(15,havanna,3);put(16,hafen[0],3);put(17,hafen[1],3);put(18,hafen[2],3);put(21,ecke,3);
 put(19,orange(),2.5);put(22,orange(),2.5);put(20,grau(),3);put(23,grau(),3);

 // ---- Boden 9: Gehwegplatten mit Laub, 10: Fahrbahn mit Parkmarkierung ----
 const fgen=f=>{const c=mk(64,64,f);FT.push(lvls(c.getContext('2d').getImageData(0,0,64,64).data))};
 fgen(g=>{g.fillStyle='#7c7a76';g.fillRect(0,0,64,64);g.fillStyle='#5f5d5a';for(let k=0;k<64;k+=16){g.fillRect(0,k,64,1);g.fillRect(k,0,1,64)}for(let k=0;k<260;k++){g.fillStyle=R()<.5?'#0000001c':'#ffffff14';g.fillRect(R()*64|0,R()*64|0,2,1)}
  for(let k=0;k<6;k++){g.fillStyle=R()<.5?'#5b6a2c':'#7a5a2a';g.fillRect(R()*62|0,R()*62|0,2,2)}});
 fgen(g=>{g.fillStyle='#4a4b50';g.fillRect(0,0,64,64);for(let k=0;k<500;k++){g.fillStyle=R()<.5?'#00000026':'#ffffff12';g.fillRect(R()*64|0,R()*64|0,1+(R()*2|0),1)}g.fillStyle='#d8d8d0';g.fillRect(0,0,64,2);g.fillRect(30,0,2,10)});

 // ---- Deko: 53 Poller, 54 Eis-Figur, 55 Tisch+Stuehle, 56 Glascontainer, 57 Holzzaun, 58 Strassenlaterne, 59 Aufsteller, 80 Parklaterne ----
 const dec=(t,s,c,o)=>{ST[t]=Object.assign({dec:1,s,a:c.width/c.height,c,z:0},o||{})};
 dec(53,.42,mk(8,28,g=>{g.fillStyle='#9a9ea4';g.fillRect(2,3,4,25);g.fillStyle='#c9ccd0';g.fillRect(2,3,1,25);g.fillStyle='#d8dadd';g.fillRect(1,0,6,4);g.fillStyle='#e33';g.fillRect(2,7,4,2)}));
 dec(54,.85,mk(20,44,g=>{g.fillStyle='#e8a21f';g.beginPath();g.moveTo(4,18);g.lineTo(16,18);g.lineTo(10,40);g.fill();g.strokeStyle='#b97412';for(let k=0;k<4;k++){g.beginPath();g.moveTo(5+k*3,19);g.lineTo(10,38);g.stroke()}
  g.fillStyle='#f6d0e0';g.beginPath();g.arc(10,14,7,0,7);g.fill();g.fillStyle='#8ad19a';g.beginPath();g.arc(10,8,5,0,7);g.fill();g.fillStyle='#e33';g.beginPath();g.arc(10,3,2.5,0,7);g.fill();g.fillStyle='#d22';g.fillRect(3,40,14,4)}));
 dec(55,.42,mk(40,22,g=>{g.fillStyle='#1a1b1e';g.fillRect(14,6,12,2);g.fillRect(19,8,2,14);g.fillRect(15,20,10,2);for(const a of[2,30]){g.fillRect(a,4,8,2);g.fillRect(a+(a<20?0:6),0,2,22);g.fillRect(a,12,8,2);g.fillRect(a+(a<20?6:0),12,2,10)}}));
 dec(56,.62,mk(48,34,g=>{g.fillStyle='#8f9399';g.fillRect(2,6,44,26);g.fillStyle='#a9adb3';g.fillRect(4,2,40,6);g.fillStyle='#6f7379';g.fillRect(2,30,44,4);
  for(let k=0;k<3;k++){g.fillStyle=k&1?'#fff':'#d22';g.fillRect(2,8+k*7,4,7);g.fillRect(42,8+k*7,4,7)}g.fillStyle='#2b2e33';g.fillRect(14,10,20,3)}));
 dec(57,.26,mk(64,14,g=>{g.fillStyle='#5a4128';for(const a of[2,30,58])g.fillRect(a,0,5,14);g.fillStyle='#6f7377';g.fillRect(0,4,64,2)}));
 dec(58,2.7,mk(32,108,g=>{g.fillStyle='#3c4046';g.fillRect(4,12,3,96);g.fillRect(1,104,9,4);g.strokeStyle='#3c4046';g.lineWidth=3;g.beginPath();g.moveTo(5.5,14);g.quadraticCurveTo(6,3,22,4);g.stroke();
  g.fillStyle='#2b2e33';g.fillRect(18,2,13,5);g.fillStyle='#fff4c8';g.fillRect(19,7,11,2)}),{em:1});
 dec(59,.5,mk(20,26,g=>{g.fillStyle='#1d4f9a';g.beginPath();g.moveTo(3,26);g.lineTo(6,0);g.lineTo(14,0);g.lineTo(17,26);g.fill();g.fillStyle='#e8eef8';g.fillRect(7,3,6,14);g.fillStyle='#1d4f9a';for(let k=0;k<5;k++)g.fillRect(8,5+k*3,4,1)}));
 dec(80,1.5,mk(12,60,g=>{g.fillStyle='#2f3338';g.fillRect(5,10,2,50);g.fillRect(3,58,6,2);g.fillStyle='#fff6d6';g.beginPath();g.arc(6,7,5,0,7);g.fill();g.fillStyle='#2f3338';g.fillRect(2,0,8,2)}),{em:1});
 DBLK[56]=1;DBLK[54]=1;

 // ---- Nachthimmel ueber Dortmund: Mond, Sterne, Baumkronen und Dachsilhouetten mit einzelnen Fenstern ----
 SKYS[2]=mk(SKYW,VH,(g,w,h)=>{const q=g.createLinearGradient(0,0,0,h);q.addColorStop(0,'#02040c');q.addColorStop(.55,'#0a1330');q.addColorStop(.86,'#1d2748');q.addColorStop(1,'#3b3149');g.fillStyle=q;g.fillRect(0,0,w,h);
  for(let k=0;k<520;k++){g.fillStyle=R()<.15?'#fff':R()<.5?'#ffffffa0':'#ffffff50';g.fillRect(R()*w|0,R()*h*.75|0,1,1)}
  const mx=w*.3,my=h*.28;const m=g.createRadialGradient(mx,my,4,mx,my,46);m.addColorStop(0,'#fffbe8aa');m.addColorStop(1,'#fffbe800');g.fillStyle=m;g.fillRect(mx-46,my-46,92,92);
  g.fillStyle='#f4f0dc';g.beginPath();g.arc(mx,my,11,0,7);g.fill();g.fillStyle='#d9d3b8';for(const[a,b,r]of[[-3,-2,3],[4,3,2],[1,-6,1.5]]){g.beginPath();g.arc(mx+a,my+b,r,0,7);g.fill()}
  for(let a=0;a<w;){const bw=24+R()*50|0,bh=18+R()*34|0;g.fillStyle='#080b14';g.fillRect(a,h-bh,bw,bh);for(let j=0;j<6;j++)if(R()<.5){g.fillStyle=R()<.3?'#9fc4ff':'#ffc673';g.fillRect(a+3+R()*(bw-8)|0,h-bh+4+R()*(bh-10)|0,3,3)}a+=bw+(R()*30|0)}
  for(let a=0;a<w;a+=2){const t=8+7*Math.sin(a*.05)+5*Math.sin(a*.13+2)+4*Math.sin(a*.31);g.fillStyle='#04070b';g.fillRect(a,h-t,2,t)}});

 // ---- Karte ----
 const DC=(t,a,b,r)=>DECO.push({x:a,y:b,t,r:r||0}),FL=(a,b,w,h,t)=>{for(let j=b;j<b+h;j++)for(let i=a;i<a+w;i++)FG[j*N+i]=t},RR=(a,b,w,h,t)=>{for(let j=b;j<b+h;j++)for(let i=a;i<a+w;i++)G[j*N+i]=t};
 const L=[];   // Lichter: [x, y, Radius, Staerke, Hoehe des Lichthofs, Groesse, Farbe]
 const lamp=(a,b)=>{DC(58,a,b);L.push([a+.12,b,3.6,.62,2.6,.55]);};
 const plamp=(a,b)=>{DC(80,a,b);L.push([a,b,2.6,.5,1.42,.38,'255,236,190'])};
 MAPS.push({nm:'Hafen Grill',bt:20,jp:[[10,13],[10,20],[14,2],[2,13],[21,8],[21,17]],es:[[1.8,4.5],[21.5,6.5],[1.8,20.5],[16.5,21.5]],o:{sky:2,fog:.05,nt:.5,tint:'#a3acd9'},lights:L,
  th:{f:[[70,70,70],[80,80,80],[40,40,40]],c:[[10,14,30],[10,14,30],[10,14,30]]},
  b:()=>{L.length=0;
   for(let k=1;k<N-1;k++){G[k]=k>12&&k%3==0?19:20+(k&1)*3;G[k*N]=k%4==1?22:20+(k&1)*3;G[(N-1)*N+k]=k%3==0?20:k&1?19:22;G[k*N+N-1]=k%4==0?23:k%5==0?20:19}
   // Boeden
   FL(1,1,22,22,2);FL(1,1,2,22,4);FL(3,1,1,22,9);                 // Gneisenaustrasse + Gehweg
   FL(3,5,13,1,9);FL(13,1,3,5,9);                                     // Gehweg vor den Laeden, Platz an der Ecke
   FL(3,6,13,1,3);FL(3,7,20,2,4);FL(3,9,13,1,3);                      // Feldherrnstrasse mit Parkstreifen
   FL(16,1,2,22,4);FL(18,1,1,22,9);FL(16,6,2,1,10);                   // Martha-Gillessen-Strasse
   FL(4,15,12,1,9);FL(10,10,1,13,9);FL(5,11,1,4,9);FL(13,16,1,6,9);   // Wege im Gruenzug
   FL(19,5,4,2,9);FL(19,9,4,1,9);FL(3,22,13,1,9);
   // Hafen-Haus: Fliesenblock mit Laeden zur Feldherrnstrasse
   RR(4,1,9,4,12);G[4*N+4]=13;G[4*N+5]=13;G[4*N+6]=14;G[4*N+7]=15;G[4*N+8]=15;G[4*N+9]=16;G[4*N+10]=17;G[4*N+11]=18;G[4*N+12]=21;
   // Backsteinbloecke ostseitig
   RR(19,1,2,4,19);RR(19,11,3,5,22);RR(19,18,2,3,19);
   // Ladenlicht und Schild
   for(let a=4;a<12;a++)L.push([a+.5,5.3,1.9,a>=9?.5:.34]);L.push([12.6,5.2,2.2,.55]);
   L.push([10.5,4.95,1,0,1.12,1.3,'235,240,255']);L.push([6.5,4.95,1,0,.86,.5,'120,190,255']);L.push([7.6,4.95,1,0,.95,.55,'255,190,60']);
   L.push([4.8,4.95,1,0,.66,.6,'255,240,200']);L.push([12.5,4.95,1,0,.6,.5,'255,226,170']);
   // Strassenlaternen und Parklaternen
   for(const[a,b]of[[3.6,6.2],[15.7,5.6],[18.6,2.6],[3.6,13],[18.6,12.5],[18.6,20],[3.6,21],[9,9.7]])lamp(a,b);
   for(const[a,b]of[[9.6,12.5],[9.6,19.6],[13.4,15.6],[6.2,15.6]])plamp(a,b);
   // Autos
   for(const[t,a,b,r]of[[41,4.6,6.5,0],[43,6.6,6.5,0],[44,8.6,6.5,0],[42,11.4,6.5,0],[44,10.4,9.5,0],[41,12.6,9.5,0],[43,14.6,9.5,0],[42,19.6,9.4,0],[41,2.6,17,1.5708],[44,1.4,9.6,1.5708]])DC(t,a,b,r);
   // Platz an der Ecke: Poller, Eis-Figur, Aufsteller, Stuehle
   for(let a=13.3;a<16;a+=.9)DC(53,a,5.85);for(let b=1.5;b<5.5;b+=1)DC(53,15.85,b);DC(54,13.6,4.35);DC(59,14.6,4.6);DC(59,6.5,5.6);
   for(const a of[7.5,8.5,9.5,10.5,11.5])DC(55,a,5.55);
   // Glascontainer gegenueber den Laeden
   for(const a of[4.6,5.6,6.6,7.6])DC(56,a,9.55);
   // Gruenzug: Baeume, Buesche, Holzzaun
   for(const[a,b]of[[4.5,10.6],[7.2,10.6],[12.2,10.6],[15.2,10.8],[7,13],[13.6,12.6],[7,18.2],[12.4,18.8],[5,21.3],[14.6,21.4],[11.8,13.6],[19.6,7.9],[21.7,10.2],[22.3,16.4],[22.2,19.4],[21.6,4.4],[19.5,21.6]])DC(40,a,b);
   for(const[a,b]of[[4.5,12.3],[15.4,13.2],[19.5,9.6],[22.4,6],[4.5,18.8],[15.3,18.4],[20.6,16.6]])DC(48,a,b);
   for(let a=4.6;a<15.5;a+=1.3)if(Math.abs(a-10.5)>.8)DC(57,a,10.15);for(let b=11;b<22;b+=1.3)if(Math.abs(b-15.5)>.8)DC(57,15.85,b,1.5708)}});
 const sel=document.getElementById('mp');if(sel){const o=document.createElement('option');o.value=MAPS.length-1;o.textContent='Hafen Grill';sel.appendChild(o)}
})();
