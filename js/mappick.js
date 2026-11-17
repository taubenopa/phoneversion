// TAUBENGAME - Kartenauswahl mit Vorschaubild, Beschreibung und Merkmalen (Koop & Deathmatch)
// Die Bilder liegen in assets/maps/m0.jpg ... m8.jpg. Die eigentliche Auswahl steckt weiter im versteckten <select id="mp">.
const MAPINFO=[
 {de:'Offene Halle mit Säulen und einem Block in der Mitte. Gut zum Einsteigen.',en:'Open hall with pillars and a block in the middle. Good for starters.',t:[['Halle','Hall'],['Mittel','Medium']]},
 {de:'Zwei Ringe aus Wänden um einen Kern. Hinter jeder Ecke kann einer warten.',en:'Two rings of walls around a core. Someone could be waiting behind every corner.',t:[['Halle','Hall'],['Eng','Tight']]},
 {de:'Glühende Höllenhalle mit neun dicken Pfeilern zum Deckung suchen.',en:'Glowing hell hall with nine thick pillars to take cover behind.',t:[['Halle','Hall'],['Deckung','Cover']]},
 {de:'Vier Räume, getrennt durch dicke Mauern, verbunden in der Mitte.',en:'Four rooms split by thick walls, connected in the middle.',t:[['Halle','Hall'],['Räume','Rooms']]},
 {de:'Langes Kirchenschiff mit Säulenreihen und Seitenschiffen.',en:'Long nave with rows of columns and side aisles.',t:[['Halle','Hall'],['Weit','Long']]},
 {de:'Ein Weg, der sich in Schlangenlinien durch die ganze Karte zieht.',en:'One path winding through the whole map like a snake.',t:[['Halle','Hall'],['Gänge','Corridors']]},
 {de:'Grüne Straße in Dortmund mit Bäumen, Autos und Backsteinhäusern.',en:'Green street in Dortmund with trees, cars and brick houses.',t:[['Draußen','Outdoor'],['Tag','Day'],['Sprungfelder','Jump pads']]},
 {de:'Neon-Arena unter freiem Himmel mit Scheinwerfern und Feuerschalen.',en:'Open-air neon arena with spotlights and fire bowls.',t:[['Draußen','Outdoor'],['Nacht','Night'],['Sprungfelder','Jump pads']]},
 {de:'Nachts an der Feldherrnstraße vor dem Hafen Restaurant. Offen, mit Laternenlicht.',en:'Night at Feldherrnstraße outside the Hafen Restaurant. Open, lit by street lamps.',t:[['Draußen','Outdoor'],['Nacht','Night'],['Sprungfelder','Jump pads']]}];
function mapPickInit(){
 const box=$('maps'),sel=$('mp');if(!box||!sel)return;
 let cur=+(()=>{try{return localStorage.hfMap}catch(e){}})()||0;if(!sel.options[cur])cur=0;sel.value=cur;
 box.innerHTML='';
 for(const o of sel.options){const i=+o.value,inf=MAPINFO[i]||{de:'',en:'',t:[]},b=document.createElement('button');b.type='button';b.className='mapc'+(i===cur?' on':'');b.dataset.i=i;
  const nmDe=o.dataset.de||o.textContent,nmEn=o.dataset.en||nmDe,en=typeof LANG!='undefined'&&LANG=='en';
  b.innerHTML='<span class="mi"><img src="assets/maps/m'+i+'.jpg" alt="" loading="lazy"></span><span class="mt"><b data-de="'+nmDe+'" data-en="'+nmEn+'">'+(en?nmEn:nmDe)+'</b>'+
   '<span class="md" data-de="'+inf.de+'" data-en="'+inf.en+'">'+(en?inf.en:inf.de)+'</span><span class="mg">'+inf.t.map(q=>'<i data-de="'+q[0]+'" data-en="'+q[1]+'">'+(en?q[1]:q[0])+'</i>').join('')+'</span></span>';
  b.onclick=()=>{sel.value=i;try{localStorage.hfMap=i}catch(e){}box.querySelectorAll('.mapc').forEach(c=>c.classList.toggle('on',c===b));try{click()}catch(e){}};
  box.appendChild(b)}
}
