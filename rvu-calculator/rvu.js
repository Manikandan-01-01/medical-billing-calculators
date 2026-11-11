(function(){
var R=document.getElementById('mbx-rvu');if(!R)return;
var F=R.querySelector('form'),C=R.querySelector('#rvu-code'),M=R.querySelector('#rvu-mod'),L=R.querySelector('#rvu-loc'),O=R.querySelector('#rvu-out'),S=R.querySelector('#rvu-msg');
var URL=R.getAttribute('data-src'),D=null,X=null,P=null;
var ST={B:'bundled (status B): Medicare does not pay it separately',C:'carrier priced (status C): your Medicare contractor sets the payment case by case',E:'excluded from the fee schedule by regulation (status E)',I:'not valid for Medicare (status I): Medicare uses another code',J:'an anesthesia code (status J): it is paid with base and time units, not RVUs',M:'a measurement code (status M), for reporting only',N:'not covered by Medicare (status N)',P:'bundled or excluded (status P): no separate fee schedule payment',X:'a statutory exclusion (status X): not paid under the physician fee schedule',A0:'active, but CMS lists no RVUs for it in this file'};
function load(){if(P)return P;msg('Loading CMS 2026 RVU data\u2026');P=fetch(URL,{cache:'force-cache'}).then(function(r){if(!r.ok)throw 0;return r.text()}).then(function(t){D={};X={};var ln=t.split('\n'),h=ln[0].split('\t'),o=0;R.setAttribute('data-ver',h[1]);
for(var i=1;i<ln.length;i++){var s=ln[i];if(!s)continue;if(s=='##'){o=1;continue}var a=s.split('\t');if(o){X[a[0]]=a[1];continue}(D[a[0]]=D[a[0]]||[]).push(a)}msg('');return D}).catch(function(){P=null;msg('The RVU data did not load. Check your connection and try again.',1)});return P}
function msg(t,e){S.textContent=t;S.className='rvu-msg'+(e?' is-err':'')}
function n(v){return parseFloat(v)||0}
function f2(v){return v.toFixed(2)}
function f3(v){return v.toFixed(3)}
function f4(v){return v.toFixed(4)}
function $(v){return '$'+(Math.round(v*100)/100).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
function r2(v){return Math.round((v+1e-9)*100)/100}
function esc(s){return s.replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function parse(){var v=C.value.toUpperCase().replace(/[^A-Z0-9]/g,'');return{c:v.slice(0,5),m:v.slice(5,7)}}
function mods(){var p=parse();if(!D||p.c.length<5)return;var rows=D[p.c]||[],cur=p.m||M.value,h='';
rows.forEach(function(a){var k=a[1];h+='<option value="'+k+'">'+(k==''?'None (global)':k=='26'?'26 (professional component)':k=='TC'?'TC (technical component)':k=='53'?'53 (discontinued procedure)':k)+'</option>'});
M.innerHTML=h||'<option value="">None (global)</option>';if(cur&&rows.some(function(a){return a[1]==cur}))M.value=cur;M.disabled=rows.length<2}
function calc(){var p=parse();if(p.c.length<5){msg('Enter a 5-character CPT or HCPCS code, for example 99213.',1);O.hidden=true;return}
var rows=D[p.c];if(!rows){O.hidden=true;var s=X[p.c];msg(s?p.c+' is '+(ST[s]||'status '+s)+', so this calculator cannot price it.':p.c+' is not in the CMS 2026 physician fee schedule file. It may be paid under another Medicare fee schedule (for example lab, DMEPOS or drugs), or the code may be mistyped.',1);return}
var md=M.value;if(p.m&&rows.some(function(a){return a[1]==p.m}))md=p.m;var a=rows.filter(function(x){return x[1]==md})[0]||rows[0];msg('');
var o=L.options[L.selectedIndex],g=o.getAttribute('data-g').split(','),gw=n(g[0]),gp=n(g[1]),gm=n(g[2]);
var fac=R.querySelector('input[name=rvu-set]:checked').value=='f',qp=R.querySelector('input[name=rvu-cf]:checked').value=='q';
var cf=n(R.getAttribute(qp?'data-cfq':'data-cf'));
var w=n(a[4]),pn=n(a[5]),pf=n(a[6]),mp=n(a[7]),fl=+a[8],pe=fac?pf:pn;
var aw=w*gw,ap=pe*gp,am=mp*gm,tot=w+pe+mp,adj=aw+ap+am,pay=r2(adj*cf);
var other=r2((w*gw+(fac?pn:pf)*gp+mp*gm)*cf),cap=null,capO=null;
if(fl&4){var on=n(a[10]),of=n(a[11]),om=n(a[12]);cap=r2((aw+(fac?of:on)*gp+om*gm)*cf);capO=r2((aw+(fac?on:of)*gp+om*gm)*cf);other=Math.min(other,capO)}
var fin=cap!==null?Math.min(pay,cap):pay,na=fac?(fl&2):(fl&1);
var loc=o.textContent,set=fac?'Facility':'Non-facility';
var h='<div class="rvu-hd"><p class="rvu-code">'+esc(p.c)+(a[1]?'-'+esc(a[1]):'')+'</p><p class="rvu-desc">'+esc(a[2])+'</p><p class="rvu-meta">Status '+esc(a[3])+(a[9]&&a[9]!='XXX'?' \u00b7 Global '+esc(a[9]):'')+' \u00b7 '+set+' \u00b7 '+esc(loc)+'</p></div>';
h+='<div class="rvu-pay"><span>Estimated Medicare payment</span><strong>'+$(fin)+'</strong><small>'+(fac?'Non-facility':'Facility')+' rate for comparison: '+$(other)+'</small></div>';
h+='<div class="rvu-tw"><table class="rvu-t"><caption class="screen-reader-text">RVU breakdown for '+esc(p.c)+'</caption><thead><tr><th scope="col">Component</th><th scope="col">RVU</th><th scope="col">GPCI</th><th scope="col">Adjusted</th></tr></thead><tbody>';
h+='<tr><th scope="row">Work (wRVU)</th><td>'+f2(w)+'</td><td>'+f3(gw)+'</td><td>'+f4(aw)+'</td></tr>';
h+='<tr><th scope="row">Practice expense ('+(fac?'facility':'non-facility')+')</th><td>'+f2(pe)+'</td><td>'+f3(gp)+'</td><td>'+f4(ap)+'</td></tr>';
h+='<tr><th scope="row">Malpractice</th><td>'+f2(mp)+'</td><td>'+f3(gm)+'</td><td>'+f4(am)+'</td></tr>';
h+='</tbody><tfoot><tr><th scope="row">Total</th><td>'+f2(tot)+'</td><td></td><td>'+f4(adj)+'</td></tr></tfoot></table></div>';
h+='<dl class="rvu-dl"><div><dt>wRVU</dt><dd>'+f2(w)+'</dd></div><div><dt>Total RVUs</dt><dd>'+f2(tot)+'</dd></div><div><dt>Adjusted total RVUs</dt><dd>'+f4(adj)+'</dd></div><div><dt>Conversion factor</dt><dd>$'+cf.toFixed(4)+'</dd></div></dl>';
h+='<p class="rvu-f"><strong>Formula:</strong> [('+f2(w)+' \u00d7 '+f3(gw)+') + ('+f2(pe)+' \u00d7 '+f3(gp)+') + ('+f2(mp)+' \u00d7 '+f3(gm)+')] \u00d7 $'+cf.toFixed(4)+' = '+$(pay)+'</p>';
var nt=[];
if(cap!==null)nt.push('Imaging cap: CMS limits this service to the OPPS-based amount, '+$(cap)+'. Medicare pays the lower figure'+(cap<pay?', so the cap applies here.':'; here the fee schedule amount is already lower.'));
if(na)nt.push('CMS marks this code \u201cNA\u201d for the '+(fac?'facility':'non-facility')+' setting: it is rarely or never done there.');
if(a[3]=='R')nt.push('Status R: restricted coverage. Special coverage rules apply, and if covered your contractor prices it.');
if(a[3]=='T')nt.push('Status T: paid only when no other fee schedule service is billed by the same provider on the same date.');
nt.push('Not participating with Medicare: '+$(r2(fin*0.95))+' (95%). Limiting charge: '+$(r2(fin*1.0925))+'.');
h+='<ul class="rvu-notes">'+nt.map(function(t){return'<li>'+t+'</li>'}).join('')+'</ul>';
O.innerHTML=h;O.hidden=false}
function go(e){if(e)e.preventDefault();load().then(function(d){if(d){mods();calc();if(e&&!O.hidden&&O.getBoundingClientRect().top>window.innerHeight*0.6)O.parentNode.scrollIntoView({behavior:'smooth',block:'start'})}})}
F.addEventListener('submit',go);
['focusin','pointerdown'].forEach(function(t){F.addEventListener(t,function(){load().then(mods)},{once:true})});
C.addEventListener('input',function(){if(D)mods()});
F.addEventListener('change',function(e){if(e.target!==C&&D&&!O.hidden)calc()});
var q=/[?&]code=([A-Za-z0-9]{5})/.exec(location.search);if(q){C.value=q[1].toUpperCase();go()}
})();
