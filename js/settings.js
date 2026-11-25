// TAUBENGAME - Einstellungen: Blickfeld, Grafik, FPS-Grenze, FPS-Anzeige, Tastenbelegung
// Gespeichert in localStorage.hfSet (gleiche Stelle wie Lautstaerke und Empfindlichkeit)
const setT=(d,e)=>typeof LANG!='undefined'&&LANG=='en'?e:d;
function setSave(p){let o={};try{o=JSON.parse(localStorage.hfSet||'{}')||{}}catch(e){}Object.assign(o,p);try{localStorage.hfSet=JSON.stringify(o)}catch(e){}}
function setGQ(q){q=Math.max(0,Math.min(2,+q|0));GQ=q;const hs=q==0?1:2;if(hs!==HS){HS=hs;cv.width=VW*HS;cv.height=VH*HS}setSave({gq:q});setSync()}
function setFovUI(v){setFov(v);setSave({fov:+v});setSync()}
const KBN={fw:['Vorwärts','Forward'],bk:['Rückwärts','Back'],lf:['Links','Left'],rt:['Rechts','Right'],run:['Rennen','Run'],jump:['Springen','Jump'],
 ult:['Ulti','Ultimate'],map:['Minimap','Minimap'],mute:['Ton aus/an','Mute'],pause:['Pause','Pause'],sbx:['Sandbox-Werkzeuge','Sandbox tools']};
function keyName(c){if(!c)return'—';const M={Space:setT('Leertaste','Space'),ShiftLeft:setT('Shift links','Left Shift'),ShiftRight:setT('Shift rechts','Right Shift'),ControlLeft:setT('Strg links','Left Ctrl'),ControlRight:setT('Strg rechts','Right Ctrl'),
 AltLeft:'Alt',AltRight:'Alt Gr',Tab:'Tab',CapsLock:setT('Feststell','Caps Lock'),Enter:'Enter',Backspace:setT('Rücktaste','Backspace'),ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→',
 Backquote:'^',Minus:'ß',Equal:'´',BracketLeft:'Ü',BracketRight:'+',Semicolon:'Ö',Quote:'Ä',Backslash:'#',Comma:',',Period:'.',Slash:'-',IntlBackslash:'<'};
 if(M[c])return M[c];if(/^Key[A-Z]$/.test(c))return c.slice(3);if(/^Digit\d$/.test(c))return c.slice(5);if(/^Numpad/.test(c))return'Num '+c.slice(6);if(/^F\d+$/.test(c))return c;return c}
let kbWait=null;
function kbUI(){const box=document.getElementById('kbl');if(!box)return;
 box.innerHTML=Object.keys(KBN).map(k=>'<div class="kbr"><span>'+setT(KBN[k][0],KBN[k][1])+'</span><button data-k="'+k+'" class="'+(kbWait===k?'wait':'')+'">'+(kbWait===k?setT('Taste drücken …','Press a key …'):keyName(KB[k]))+'</button></div>').join('');
 box.querySelectorAll('button[data-k]').forEach(b=>b.onclick=e=>{e.preventDefault();kbWait=kbWait===b.dataset.k?null:b.dataset.k;KBW=kbWait?1:0;kbUI()})}
// neue Taste abfangen, bevor das Spiel sie sieht
addEventListener('keydown',e=>{if(!kbWait)return;e.preventDefault();e.stopImmediatePropagation();
 const c=e.code;if(c!=='Escape'&&!/^Digit[1-9]$/.test(c)&&c){const other=Object.keys(KB).find(k=>k!==kbWait&&KB[k]===c);if(other)KB[other]=KB[kbWait];KB[kbWait]=c;kbStore()}
 kbWait=null;setTimeout(()=>{KBW=0},0);try{document.activeElement.blur()}catch(_){}kbUI()},true);
function kbStore(){const d={};for(const k in KB)if(KB[k]!==KB0[k])d[k]=KB[k];setSave({kb:d})}
function kbReset(){Object.assign(KB,KB0);kbWait=null;KBW=0;setSave({kb:{}});kbUI()}
// Regler im Hauptmenue und im Spielmenue gleich halten
function setSync(){const fv=Math.round(Math.atan(FOVK)*360/Math.PI);
 for(const id of['fov','pm-fov']){const el=document.getElementById(id);if(el&&+el.value!==fv)el.value=fv}
 for(const id of['fovv','pm-fovv']){const el=document.getElementById(id);if(el)el.textContent=fv+'°'}
 for(const id of['gq','pm-gq']){const el=document.getElementById(id);if(el)el.value=GQ}
 const f=document.getElementById('fpsl');if(f)f.value=FPSL;const s=document.getElementById('sfps');if(s)s.checked=!!SFPS}
function settingsInit(){
 for(const id of['fov','pm-fov']){const el=document.getElementById(id);if(el)el.oninput=()=>setFovUI(el.value)}
 for(const id of['gq','pm-gq']){const el=document.getElementById(id);if(el)el.onchange=()=>setGQ(el.value)}
 const f=document.getElementById('fpsl');if(f)f.onchange=()=>{FPSL=+f.value;setSave({fps:FPSL})};
 const s=document.getElementById('sfps');if(s)s.onchange=()=>{SFPS=s.checked?1:0;setSave({sf:SFPS})};
 const r=document.getElementById('kbreset');if(r)r.onclick=kbReset;
 setSync();kbUI()}
// FPS-Anzeige oben rechts
function fpsHud(){if(!SFPS)return;x.textAlign='right';x.font='bold 8px monospace';const v=FPSC.v;x.fillStyle='#000a';x.fillRect(VW-40,18,36,11);x.fillStyle=v>=50?'#7f7':v>=30?'#fd4':'#f55';x.fillText(v+' FPS',VW-6,26);x.textAlign='left'}
