(function(){
var R=document.getElementById('mbx-gp');if(!R)return;
var F=R.querySelector('form'),C=R.querySelector('#gp-code'),T=R.querySelector('#gp-dos'),Y=R.querySelector('#gp-yyy'),YW=R.querySelector('#gp-yyy-w'),O=R.querySelector('#gp-out'),S=R.querySelector('#gp-msg'),E0=R.querySelector('#gp-empty');
var URL=R.getAttribute('data-src'),D=null,P=null;
var MAN='Claims Processing Manual Ch. 12',MLN='MLN907166';
var GL={'000':['Endoscopy or minor procedure: 0-day post-op period','Pre-op and post-op work on the day of the procedure is included. Visits after the day of the procedure are paid separately.'],
'010':['Minor procedure: 10-day post-op period','The global period is 11 days: the day of the procedure and the 10 days after it. Related post-op visits in that window are not paid separately.'],
'090':['Major surgery: 1-day pre-op and 90-day post-op period','The global period is 92 days: the day before surgery, the day of surgery and the 90 days after it.'],
'MMM':['Maternity code','CMS says the usual global period does not apply to maternity codes, so this tool does not count dates for it.'],
'XXX':['Global concept does not apply','This code has no global period. When it is done during another procedure\u2019s post-op period, it can be paid without a global surgery modifier.'],
'YYY':['Contractor-priced: your MAC sets the global period','Your Medicare Administrative Contractor decides whether a global period applies, and sets it at 0, 10 or 90 days when it prices the claim.'],
'ZZZ':['Add-on code: uses the primary code\u2019s global period','This add-on code has no post-op work of its own. The global period of the primary procedure applies. Enter the primary code to see the dates.']};
var ST={B:'Status B: bundled, not paid separately.',C:'Status C: your MAC prices this code.',E:'Status E: excluded from the fee schedule by regulation.',I:'Status I: not valid for Medicare; Medicare uses another code.',J:'Status J: anesthesia code.',M:'Status M: measurement code, for reporting only.',N:'Status N: not covered by Medicare.',P:'Status P: bundled or excluded.',R:'Status R: restricted coverage.',T:'Status T: injection, paid only if no other fee schedule service is billed that day.',X:'Status X: statutory exclusion, not paid under the fee schedule.'};
function msg(t,e){S.textContent=t;S.className='gp-msg'+(e?' is-err':'')}
function load(){if(P)return P;msg('Loading CMS 2026 global days\u2026');P=fetch(URL,{cache:'force-cache'}).then(function(r){if(!r.ok)throw 0;return r.text()}).then(function(t){D={};var ln=t.split('\n');R.setAttribute('data-ver',ln[0].split('\t')[1]);for(var i=1;i<ln.length;i++){if(!ln[i])continue;var a=ln[i].split('\t');D[a[0]]=a}msg('');return D}).catch(function(){P=null;msg('The CMS data did not load. Check your connection and try again.',1)});return P}
function pd(s){var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s);return m?Date.UTC(+m[1],m[2]-1,+m[3]):NaN}
var DAY=864e5,MO=['January','February','March','April','May','June','July','August','September','October','November','December'],WD=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
function fd(t){var d=new Date(t);return WD[d.getUTCDay()]+', '+MO[d.getUTCMonth()]+' '+d.getUTCDate()+', '+d.getUTCFullYear()}
function today(){var n=new Date();return Date.UTC(n.getFullYear(),n.getMonth(),n.getDate())}
function esc(s){return String(s).replace(/[\x26<>"]/g,function(c){return'\x26#'+c.charCodeAt(0)+';'})}
function li(m,t,src){return'<li><strong>'+m+'</strong> '+t+' <span class="gp-cite">('+src+')</span></li>'}
function mods(g,a){var h=[],maj=g=='090',ten=g=='010',zero=g=='000';
if(maj)h.push(li('57','E/M on the day before or the day of surgery that results in the decision to operate. On the day of surgery, use 57, not 25.',MAN+' \u00a740.2.A.4'));
else h.push(li('57','Do not use with this code. Minor procedures have no pre-op day, and MACs may not pay 57 on the day of or the day before a 000 or 010 procedure.',MAN+' \u00a740.2.A.4; '+MLN));
h.push(li('25','Significant, separately identifiable E/M by the same physician on the day of the procedure, beyond the usual pre-op and post-op care.',MAN+' \u00a740.2.A.8'));
if(maj||ten){
h.push(li('24','Unrelated E/M by the same physician during the post-op period. The record must show it is unrelated; a diagnosis that shows this is acceptable. MACs recognize 24 only for care after discharge, with narrow exceptions.',MAN+' \u00a740.2.A.7, \u00a740.4'));
h.push(li('58','Staged or related procedure during the post-op period: planned at the time of the first one, more extensive, or therapy after a diagnostic procedure. A new post-op period begins.',MAN+' \u00a740.2.A.6'));
h.push(li('78','Unplanned return to the operating room for a related procedure. Medicare pays the intra-op portion of the code billed for the return trip.',MAN+' \u00a740.2.A.5, \u00a740.4'));
h.push(li('79','Unrelated procedure by the same physician during the post-op period. A new post-op period begins.',MAN+' \u00a740.2.A.7'));
h.push(li('FT','Unrelated critical care or other unrelated E/M visit during the global period.',MAN+' \u00a740.2.A.9, \u00a740.4'));
h.push(li('54 / 55 / 56','Formal transfer of care: 54 is surgical care only, 55 is post-op management only, 56 is pre-op care only. Each claim uses the same code and the date of surgery. Keep the written transfer agreement. The doctor taking over must see the patient once before billing.',MAN+' \u00a740.2.A.3; '+MLN));
}
if(zero){h.push(li('54 / 55 / 56','Split global care does not apply to 000 procedures.',MAN+' \u00a740.4; '+MLN));
h.push(li('78','If this code is the procedure done on a return trip to the OR during another surgery\u2019s global period, Medicare pays its full value, because 000 codes have no pre-, intra- or post-op split.',MAN+' \u00a740.4'))}
return'<h3 class="gp-h">Modifiers for separately billable services</h3><ul class="gp-mods">'+h.join('')+'</ul><p class="gp-note">Another procedure with a global period, billed during this post-op period without 58, 78 or 79, is denied. XXX codes can be paid without a modifier ('+MAN+' \u00a740.4).</p>'}
function split(a){var pre=+a[4],intr=+a[5],post=+a[6];if(!(pre+intr+post))return'<p class="gp-note">CMS lists no pre-, intra- or post-op percentages for this code.</p>';
return'<h3 class="gp-h">Split global care (from the CMS file)</h3><div class="gp-tw"><table class="gp-t"><thead><tr><th scope="col">Portion</th><th scope="col">Share</th></tr></thead><tbody><tr><th scope="row">Pre-op (modifier 56)</th><td>'+pre+'%</td></tr><tr><th scope="row">Intra-op, including in-hospital post-op visits</th><td>'+intr+'%</td></tr><tr><th scope="row">Post-op office care after discharge (modifier 55)</th><td>'+post+'%</td></tr><tr><th scope="row">Surgeon billing 54 (pre-op + intra-op)</th><td>'+(pre+intr)+'%</td></tr></tbody></table></div><p class="gp-note">Medicare pays 54 the combined pre-op and intra-op share. When two doctors share post-op care, the post-op share is divided by days of care ('+MAN+' \u00a740.4).</p>'}
function calc(){var c=C.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,5);if(c.length<5){msg('Enter a 5-character CPT or HCPCS code, for example 27447.',1);O.hidden=true;return}
var a=D[c];if(!a){O.hidden=true;msg(c+' is not in the CMS 2026 physician fee schedule file. Check the code.',1);return}
var g=a[3],dos=pd(T.value),gi=GL[g]||['Global indicator '+g,''];YW.hidden=g!='YYY';
var eg=g=='YYY'?Y.value:g;
if((eg=='000'||eg=='010'||eg=='090')&&isNaN(dos)){msg('Enter the date of surgery.',1);O.hidden=true;return}
msg('');var h='<div class="gp-hd"><p class="gp-code">'+esc(c)+'</p><p class="gp-desc">'+esc(a[1])+'</p><p class="gp-meta">Global indicator <strong>'+esc(g)+'</strong>: '+gi[0]+(ST[a[2]]?' \u00b7 '+ST[a[2]]:'')+'</p></div><p class="gp-def">'+gi[1]+'</p>';
if(g=='YYY'&&eg)h+='<p class="gp-note is-warn">Dates below assume your MAC set a '+(+eg)+'-day post-op period. Confirm it with your MAC.</p>';
if(eg=='000'||eg=='010'||eg=='090'){var n=+eg,end=dos+n*DAY,td=today(),pre=eg=='090'?dos-DAY:null,first=pre||dos,tot=Math.round((end-first)/DAY)+1,st;
if(td<first)st='Surgery is in '+Math.round((dos-td)/DAY)+' day'+((dos-td)/DAY==1?'':'s')+'. The global period has not started.';
else if(td>end)st='The global period ended '+Math.round((td-end)/DAY)+' day'+((td-end)/DAY==1?'':'s')+' ago. Related visits are no longer bundled.';
else{var left=Math.round((end-td)/DAY);st=(left?left+' day'+(left==1?'':'s')+' left after today':'Today is the last day')+' \u00b7 today is day '+(Math.round((td-first)/DAY)+1)+' of '+tot+'.'}
h+='<div class="gp-pay"><span>Global period ends</span><strong>'+fd(end)+'</strong><small>'+st+'</small></div>';
h+='<dl class="gp-dl">'+(pre?'<div><dt>Pre-op day</dt><dd>'+fd(pre)+'</dd></div>':'')+'<div><dt>Date of surgery</dt><dd>'+fd(dos)+'</dd></div><div><dt>Last day of global</dt><dd>'+fd(end)+'</dd></div><div><dt>Total days</dt><dd>'+tot+'</dd></div></dl>';
h+='<p class="gp-f"><strong>How it is counted:</strong> '+(eg=='090'?'1 day before surgery + the day of surgery + the 90 days after it':eg=='010'?'the day of surgery + the 10 days after it':'the day of the procedure only')+' ('+MAN+' \u00a740.1.E; '+MLN+').</p>';
if(g!='YYY'&&(eg=='010'||eg=='090'))h+=split(a);
h+=mods(eg,a)}
else if(g=='YYY')h+='<p class="gp-note">Pick the post-op period your MAC assigned to see the dates.</p>';
O.innerHTML=h;O.hidden=false;if(E0)E0.hidden=true}
function go(e){if(e)e.preventDefault();load().then(function(d){if(d){calc();if(e&&!O.hidden&&O.getBoundingClientRect().top>window.innerHeight*0.6)O.parentNode.scrollIntoView({behavior:'smooth',block:'start'})}})}
if(!T.value){var n=new Date(),p=function(x){return(x<10?'0':'')+x};T.value=n.getFullYear()+'-'+p(n.getMonth()+1)+'-'+p(n.getDate())}
F.addEventListener('submit',go);
['focusin','pointerdown'].forEach(function(t){F.addEventListener(t,function(){load()},{once:true})});
F.addEventListener('change',function(e){if(D&&!O.hidden)calc()});
var q=/[?&]code=([A-Za-z0-9]{5})/.exec(location.search),qd=/[?&]dos=(\d{4}-\d{2}-\d{2})/.exec(location.search);if(qd)T.value=qd[1];if(q){C.value=q[1].toUpperCase();go()}
})();
