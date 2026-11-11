(function(){
var R=document.getElementById('mbx-mue');if(!R)return;
var F=R.querySelector('form'),C=R.querySelector('#mu-code'),U=R.querySelector('#mu-units'),D=R.querySelector('#mu-days'),O=R.querySelector('#mu-out'),S=R.querySelector('#mu-msg'),E0=R.querySelector('#mu-empty');
var CFG=JSON.parse(R.getAttribute('data-cfg')),DP=null,DS=null,MP=null,MU=null,RAT=[];
var MAN='NCCI Policy Manual Ch. 1 \u00a7V';
var MAI={'1':['Claim line edit','Each claim line is compared with the MUE on its own.'],'2':['Date of service edit: policy','All units of the code on the same date of service are added up. This is an absolute limit.'],'3':['Date of service edit: clinical','All units of the code on the same date of service are added up. The limit is based on clinical benchmarks.']};
function msg(t,e){S.textContent=t;S.className='mu-msg'+(e?' is-err':'')}
function esc(s){return String(s).replace(/[\x26<>"]/g,function(c){return'\x26#'+c.charCodeAt(0)+';'})}
function norm(v){return String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,5)}
function load(){if(!MP)MP=fetch(CFG.file,{cache:'force-cache'}).then(function(r){if(!r.ok)throw 0;return r.text()}).then(function(t){MU={};t.split('\n').forEach(function(l,i){if(!l)return;var a=l.split('\t');if(i===0){RAT=a[3].split('|');return}MU[a[0]]=[+a[1],a[2],RAT[+a[3]]||'']});return MU}).catch(function(e){MP=null;throw e});return MP}
function desc(){if(!DP)DP=fetch(CFG.desc,{cache:'force-cache'}).then(function(r){return r.ok?r.text():''}).then(function(t){DS={};t.split('\n').forEach(function(l,i){if(i&&l){var a=l.split('\t');DS[a[0]]=a[1]}});return DS}).catch(function(){DS={};return DS});return DP}
function units(v){var p=String(v||'').split(/[,;+\s]+/).filter(function(x){return x!==''}),o=[];for(var i=0;i<p.length;i++){if(!/^\d{1,6}$/.test(p[i])||+p[i]<1)return null;o.push(+p[i])}return o.length&&o.length<=10?o:null}
function calc(m,lines,days){var mue=m[0],mai=m[1],eff=lines.map(function(u){return days>1?Math.round(u/days):u}),r={mue:mue,mai:mai,eff:eff};
if(mai==='1'){r.bad=eff.map(function(u,i){return u>mue?i:-1}).filter(function(i){return i>=0});r.over=r.bad.length>0;r.total=eff.reduce(function(a,b){return a+b},0)}
else{r.total=eff.reduce(function(a,b){return a+b},0);r.over=r.total>mue}
return r}
function go(e){if(e)e.preventDefault();var c=norm(C.value);C.value=c;
if(c.length<5){msg('Enter a 5-character CPT or HCPCS code, for example 96372.',1);O.hidden=true;return}
var lines=units(U.value);if(!lines){msg('Enter whole units of 1 or more. Separate up to 10 claim lines with commas, for example 2, 1.',1);O.hidden=true;return}
var days=D&&D.value?parseInt(D.value,10):1;if(!(days>=1&&days<=366)){msg('Days in the date span must be from 1 to 366.',1);O.hidden=true;return}
if(days>1&&lines.length>1){msg('Use the date span with one claim line at a time.',1);O.hidden=true;return}
msg('Checking the CMS '+CFG.qtr+' MUE table\u2026');
Promise.all([load(),desc()]).then(function(){msg('');var m=MU[c],h='';
h+='<div class="mu-hd"><p class="mu-code">'+c+'</p>'+(DS[c]?'<p class="mu-desc">'+esc(DS[c])+'</p>':'')+'<p class="mu-meta">Medicare practitioner services MUE table, effective '+CFG.eff+'</p></div>';
if(!m){h+='<div class="mu-pay"><span>No published MUE</span><strong>Not in the CMS table</strong><small>The '+CFG.qtr+' practitioner MUE table has no value for '+c+'.</small></div><p class="mu-note">Not every code has an MUE, and CMS keeps some MUE values confidential. A missing MUE does not mean any number of units will pay. Check the code is valid, then check payer and MAC policy ('+MAN+').</p>';show(h,e);return}
var r=calc(m,lines,days),mi=MAI[r.mai];
var cls=r.over?'is-over':'is-ok',head=r.over?'Exceeds the MUE':'Within the MUE';
var sub;if(r.mai==='1')sub=r.over?'Line '+r.bad.map(function(i){return i+1}).join(', ')+' has more units than the MUE of '+r.mue+'. All units on that line would deny.':'Every claim line is at or below the MUE of '+r.mue+'.';
else sub=r.over?r.total+' units on this date of service is more than the MUE of '+r.mue+'. All '+r.total+' units for '+c+' that day would deny.':r.total+' units on this date of service is at or below the MUE of '+r.mue+'.';
h+='<div class="mu-pay '+cls+'"><span>'+(r.over?'MUE exceeded':'MUE check passed')+'</span><strong>'+head+'</strong><small>'+sub+'</small></div>';
h+='<div class="mu-tw"><table class="mu-t"><tbody><tr><th scope="row">Practitioner MUE value</th><td>'+r.mue+'</td></tr><tr><th scope="row">MUE Adjudication Indicator (MAI)</th><td>'+r.mai+' &ndash; '+mi[0]+'</td></tr><tr><th scope="row">MUE rationale</th><td>'+esc(m[2])+'</td></tr><tr><th scope="row">'+(r.mai==='1'?'Units per line checked':'Units for the day checked')+'</th><td>'+(r.mai==='1'?r.eff.join(', '):r.total)+'</td></tr></tbody></table></div>';
var st=[];if(days>1)st.push('Date span: '+lines[0]+' units \u00f7 '+days+' days = '+(lines[0]/days).toFixed(2).replace(/\.?0+$/,'')+', rounded to '+r.eff[0]+'.');
if(r.mai!=='1'&&lines.length>1)st.push('Lines added: '+lines.join(' + ')+' = '+r.total+' units.');
st.push(mi[1]);if(st.length)h+='<ol class="mu-steps">'+st.map(function(s){return'<li>'+esc(s)+'</li>'}).join('')+'</ol>';
var n='';
if(r.mue===0)n+='<p class="mu-note">An MUE of 0 means CMS expects no units from a practitioner for this code. Reasons include invalid, not covered, bundled or not separately payable codes, and drugs that are billed to the DME MAC instead ('+MAN+').</p>';
if(r.mai==='1')n+='<p class="mu-note">For a claim line edit, a truly separate service can go on its own line with an appropriate modifier, such as 59, XE, XP, XS, XU, 76, 77, 91 or an anatomic modifier. Each line is then checked on its own. MACs can limit these modifiers for some codes ('+MAN+').</p>';
if(r.mai==='2')n+='<p class="mu-note">MAI 2 is an absolute date of service limit. Units above it are treated as impossible under correct coding policy, so an override on reopening or redetermination would be contrary to CMS policy. Check the code and how the units are counted ('+MAN+').</p>';
if(r.mai==='3')n+='<p class="mu-note">MAI 3 can be bypassed when records show the extra units were actually provided, correctly coded and medically necessary. The MAC can pay them on reopening, redetermination or appeal ('+MAN+').</p>';
if(r.over)n+='<p class="mu-note">An MUE denial is a coding denial. An ABN does not shift liability, so you cannot bill the patient for the denied units.</p>';
else n+='<p class="mu-note">MUEs are not utilization guides. Bill only the units in the record, even when they are below the MUE.</p>';
h+=n;show(h,e)}).catch(function(){msg('The CMS MUE data did not load. Check your connection and try again.',1)})}
function show(h,e){O.innerHTML=h;O.hidden=false;if(E0)E0.hidden=true;if(e&&O.getBoundingClientRect().top>window.innerHeight*0.6)O.parentNode.scrollIntoView({behavior:'smooth',block:'start'})}
F.addEventListener('submit',go);
R.querySelectorAll('[data-ex]').forEach(function(b){b.addEventListener('click',function(){var p=b.getAttribute('data-ex').split(':');C.value=p[0];U.value=p[1];if(D)D.value='';go()})});
var q=/[?&]code=([A-Za-z0-9]{5})/.exec(location.search);if(q){C.value=q[1];var u=/[?&]units=([0-9,]+)/.exec(location.search);U.value=u?u[1]:'1';go()}
})();
