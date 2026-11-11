(function(){
var R=document.getElementById('mbx-em');if(!R)return;
var F=R.querySelector('form'),O=R.querySelector('#em-out'),S=R.querySelector('#em-msg'),E0=R.querySelector('#em-empty');
var LV=['','Straightforward','Low','Moderate','High'],DL=['','Minimal or none','Limited','Moderate','Extensive'],PL=['','Minimal','Low','Moderate','High'],RL=['','Minimal','Low','Moderate','High'];
var CODE={n:['','99202','99203','99204','99205'],e:['','99212','99213','99214','99215']};
var TT={n:[0,15,30,45,60],e:[0,10,20,30,40]};
var AMA='AMA CPT E/M guidelines',MLN='CMS MLN006764';
function q(s){return R.querySelector(s)}
function v(n){var e=F.querySelector('[name="'+n+'"]:checked')||F.querySelector('[name="'+n+'"]');return e?e.value:''}
function num(n){var x=parseInt(v(n),10);return isNaN(x)||x<0?0:x}
function ck(n){var e=F.querySelector('[name="'+n+'"]');return !!(e&&e.checked)}
function msg(t,e){S.textContent=t;S.className='em-msg'+(e?' is-err':'')}
function data(){var c1=num('notes')+num('results')+num('orders'),hi=ck('hist'),ii=ck('interp'),di=ck('disc');
var a=(c1+(hi?1:0))>=3,cats=(a?1:0)+(ii?1:0)+(di?1:0),lvl,why;
if(cats>=2){lvl=4;why='Extensive: '+cats+' of 3 data categories met (2 needed).'}
else if(cats==1){lvl=3;why='Moderate: 1 of 3 data categories met'+(a?' (3 or more unique notes, results, orders or an independent historian)':ii?' (independent interpretation of a test)':' (discussion with an external physician or appropriate source)')+'.'}
else if(c1>=2||hi){lvl=2;why='Limited: '+(hi?'assessment needs an independent historian':c1+' unique notes, results or orders (2 needed)')+'.'}
else{lvl=1;why='Minimal or none: fewer than 2 unique notes, results or orders, and no other data category.'}
return{l:lvl,why:why,c1:c1}}
function med(a,b,c){return [a,b,c].sort()[1]}
function units(t,base){return t>=base?Math.floor((t-base)/15)+1:0}
function calc(){
var pt=v('pt')=='n'?'n':'e',p=parseInt(v('prob'),10)||0,r=parseInt(v('risk'),10)||0,ts=String(v('time')).trim(),t=ts===''?null:parseInt(ts,10),s11=ck('c99211');
if(s11){if(pt=='n'){msg('99211 is for established patients only. Choose Established, or clear the 99211 box.',1);O.hidden=true;return}
msg('');O.innerHTML='<div class="em-hd"><p class="em-code">99211</p><p class="em-desc">Established patient visit that may not need a physician or other QHP</p><p class="em-meta">MDM and time do not apply to 99211 ('+AMA+').</p></div><div class="em-pay"><span>Suggested code</span><strong>99211</strong><small>Usually the presenting problem is minimal. Clinical staff may do the face-to-face service under supervision.</small></div>'+g2211()+'<p class="em-note">Check the box only when clinical staff did the visit. When the physician or QHP did the visit, clear it and use MDM or time.</p>';O.hidden=false;if(E0)E0.hidden=true;return}
if(t!==null&&(isNaN(t)||t<0||t>600)){msg('Enter total time as whole minutes from 0 to 600.',1);O.hidden=true;return}
var hasM=p>0||r>0;if(hasM&&!(p>0&&r>0)){msg('Choose both the problems level and the risk level to get an MDM level.',1);O.hidden=true;return}
if(!hasM&&t===null){msg('Choose the problems and risk levels, enter the total time, or both.',1);O.hidden=true;return}
msg('');var d=data(),m=0,tl=0,h='';
if(hasM)m=med(p,d.l,r);
if(t!==null){for(var i=4;i>=1;i--)if(t>=TT[pt][i]){tl=i;break}}
var best=Math.max(m,tl),by=best==0?'':(m>=tl?'MDM':'time');if(m==tl&&m)by='MDM or time';
var code=best?CODE[pt][best]:'';
h+='<div class="em-hd"><p class="em-code">'+(code||'No level')+'</p><p class="em-desc">'+(pt=='n'?'New':'Established')+' patient office or outpatient visit'+(best?', '+LV[best].toLowerCase()+' level':'')+'</p><p class="em-meta">'+(best?'Supported by '+by+'. Bill the higher level your documentation supports.':'')+'</p></div>';
if(!best)h+='<div class="em-pay"><span>Result</span><strong>Time too short</strong><small>'+t+' minutes is below the '+TT[pt][1]+'-minute minimum for '+CODE[pt][1]+'. Use MDM to pick the level'+(pt=='e'?', or 99211 if clinical staff did the visit':'')+'.</small></div>';
else h+='<div class="em-pay"><span>Suggested code</span><strong>'+code+'</strong><small>'+(hasM?'MDM: '+LV[m]+' ('+CODE[pt][m]+')':'MDM: not entered')+' \u00b7 '+(t!==null?'Time: '+t+' min ('+(tl?CODE[pt][tl]:'below '+TT[pt][1]+' min')+')':'Time: not entered')+'</small></div>';
if(hasM){h+='<h3 class="em-h">Medical decision making (2 of 3 elements)</h3><div class="em-tw"><table class="em-t"><thead><tr><th scope="col">Element</th><th scope="col">Level</th></tr></thead><tbody><tr><th scope="row">Problems addressed</th><td>'+PL[p]+'</td></tr><tr><th scope="row">Data reviewed and analyzed</th><td>'+DL[d.l]+'</td></tr><tr><th scope="row">Risk of patient management</th><td>'+RL[r]+'</td></tr></tbody><tfoot><tr><th scope="row">MDM level</th><td>'+LV[m]+' = '+CODE[pt][m]+'</td></tr></tfoot></table></div><p class="em-f"><strong>Data:</strong> '+d.why+'</p><p class="em-note">The MDM level is the highest level that 2 of the 3 elements meet or exceed ('+AMA+', Table 1).</p>'}
if(t!==null){var rows='';for(var j=1;j<=4;j++)rows+='<tr'+(j==tl?' class="em-on"':'')+'><th scope="row">'+CODE[pt][j]+'</th><td>'+TT[pt][j]+' min or more'+(j==tl?' \u2714':'')+'</td></tr>';
h+='<h3 class="em-h">Total time on the date of the encounter</h3><div class="em-tw"><table class="em-t"><thead><tr><th scope="col">Code</th><th scope="col">Time must be met or exceeded</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
if(tl==4&&best==4&&by!='MDM'){var top=pt=='n'?'99205':'99215',a=units(t,pt=='n'?75:55),g=units(t,pt=='n'?89:69);
h+='<p class="em-f"><strong>Prolonged time:</strong> '+(a?'CPT 99417 \u00d7 '+a+' with '+top+' (each full 15 minutes past '+(pt=='n'?60:40)+' minutes).':'No 99417 yet. It starts at '+(pt=='n'?75:55)+' minutes.')+' Medicare: '+(g?'G2212 \u00d7 '+g+' with '+top+'.':'no G2212 yet. It starts at '+(pt=='n'?89:69)+' minutes.')+' <span class="em-cite">(AMA CPT; '+MLN+' Table 3)</span></p>'}
else if(by=='MDM'&&tl)h+='<p class="em-note">Your MDM supports a higher level than your time. Bill by MDM and document it. Prolonged service codes apply only when you pick the level by time.</p>'}
h+=g2211();
h+='<p class="em-note">History and exam must be medically appropriate, but they do not set the level. When you use time, count only the billing practitioner\u2019s time on the date of the visit, not clinical staff time ('+AMA+'; '+MLN+').</p>';
O.innerHTML=h;O.hidden=false;if(E0)E0.hidden=true}
function g2211(){return'<p class="em-note is-warn"><strong>Medicare G2211:</strong> you may add G2211 to 99202\u201399205 or 99211\u201399215 when you are the continuing focal point for the patient\u2019s care or give ongoing care for a single serious or complex condition. Medicare does not pay G2211 when the visit has modifier 25, except with an annual wellness visit, vaccine administration or a Part B preventive service ('+MLN+', May 2026).</p>'}
function sync(){var n=v('pt')=='n',c=F.querySelector('[name="c99211"]');if(c){c.disabled=n;if(n)c.checked=false;c.parentNode.style.opacity=n?.55:1}}
F.addEventListener('submit',function(e){e.preventDefault();calc();if(!O.hidden&&O.getBoundingClientRect().top>window.innerHeight*0.6)O.parentNode.scrollIntoView({behavior:'smooth',block:'start'})});
F.addEventListener('change',function(e){if(e.target.name=='pt')sync();if(!O.hidden)calc()});
F.addEventListener('reset',function(){setTimeout(function(){O.hidden=true;if(E0)E0.hidden=false;msg('');sync()},0)});
sync();
})();
