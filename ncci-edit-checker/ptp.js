(function(){
var R=document.getElementById('mbx-ptp');if(!R)return;
var F=R.querySelector('form'),A=R.querySelector('#pt-a'),B=R.querySelector('#pt-b'),O=R.querySelector('#pt-out'),S=R.querySelector('#pt-msg'),E0=R.querySelector('#pt-empty');
var CFG=JSON.parse(R.getAttribute('data-cfg')),SH={},DS=null,DP=null,RAT=null;
var MAN='NCCI Policy Manual Ch. 1 \u00a7E';
function msg(t,e){S.textContent=t;S.className='pt-msg'+(e?' is-err':'')}
function esc(s){return String(s).replace(/[\x26<>"]/g,function(c){return'\x26#'+c.charCodeAt(0)+';'})}
function norm(v){return String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,5)}
function idx(c){var s=CFG.starts,lo=0,hi=s.length-1,r=0;while(lo<=hi){var m=(lo+hi)>>1;if(s[m]<=c){r=m;lo=m+1}else hi=m-1}return r}
function shard(i){if(!SH[i])SH[i]=fetch(CFG.files[i],{cache:'force-cache'}).then(function(r){if(!r.ok)throw 0;return r.text()}).then(function(t){if(!RAT){var h=t.slice(0,t.indexOf('\n')).split('\t');RAT=h[3].split('|')}return t}).catch(function(e){delete SH[i];throw e});return SH[i]}
function desc(){if(!DP)DP=fetch(CFG.desc,{cache:'force-cache'}).then(function(r){return r.ok?r.text():''}).then(function(t){DS={};t.split('\n').forEach(function(l,i){if(i&&l){var a=l.split('\t');DS[a[0]]=a[1]}});return DS}).catch(function(){DS={};return DS});return DP}
function row(t,c){var k=t.indexOf('\n'+c+'\t');if(k<0)return null;var e=t.indexOf('\n',k+1);return t.slice(k+7,e<0?t.length:e)}
function find(t,c1,c2){var r=row(t,c1);if(r===null)return{n:0,hit:null};var gs=r.split(' '),n=0,hit=null;for(var i=0;i<gs.length;i++){var g=gs[i],cs=g.slice(3).split(',');n+=cs.length;if(!hit&&cs.indexOf(c2)>=0)hit={m:g[0],r:parseInt(g[1],36)}}return{n:n,hit:hit}}
function name(c){return DS&&DS[c]?' <span class="pt-cite">'+esc(DS[c])+'</span>':''}
function card(c1,c2,h){var m=h.m,r=RAT[h.r]||'',cls=m=='0'?'is-no':'is-mod';
var head=m=='0'?'Not billable together':'Billable together only with a modifier';
var sub=m=='0'?'Modifier indicator 0: no modifier bypasses this edit. Medicare pays '+c1+' and denies '+c2+'.':'Modifier indicator 1: an NCCI PTP-associated modifier on '+c2+' can bypass the edit when the services were truly separate.';
var h2='<div class="pt-pay '+cls+'"><span>NCCI PTP edit found</span><strong>'+head+'</strong><small>'+sub+'</small></div>';
h2+='<div class="pt-tw"><table class="pt-t"><tbody><tr><th scope="row">Column 1 (paid)</th><td>'+c1+'</td></tr><tr><th scope="row">Column 2 (denied without a valid modifier)</th><td>'+c2+'</td></tr><tr><th scope="row">Modifier indicator</th><td>'+m+'</td></tr><tr><th scope="row">PTP edit rationale</th><td>'+esc(r)+'</td></tr></tbody></table></div>';
if(m=='1')h2+='<h3 class="pt-h">Modifiers that can bypass this edit</h3><ul class="pt-mods"><li><strong>Anatomic:</strong> E1\u2013E4, FA, F1\u2013F9, TA, T1\u2013T9, LT, RT, LC, LD, RC, LM, RI</li><li><strong>Global surgery:</strong> 24, 25, 57, 58, 78, 79</li><li><strong>Other:</strong> 27, 59, 91, XE, XS, XP, XU</li></ul><p class="pt-note">Use one only when the record shows a separate encounter, a separate anatomic site or a separate specimen. Modifiers 22, 76 and 77 do not bypass PTP edits ('+MAN+').</p>';
else h2+='<p class="pt-note">A modifier will not unbundle these codes, even 59 or an X modifier. If the service was unusually hard, the policy manual allows modifier 22 on the column 1 code for MAC review ('+MAN+'.a).</p>';
return h2}
function go(e){if(e)e.preventDefault();var a=norm(A.value),b=norm(B.value);A.value=a;B.value=b;
if(a.length<5||b.length<5){msg('Enter two 5-character CPT or HCPCS codes, for example 20610 and 76942.',1);O.hidden=true;return}
if(a==b){msg('Enter two different codes. For units of the same code, check the MUE.',1);O.hidden=true;return}
msg('Checking the CMS '+CFG.qtr+' edit file\u2026');
Promise.all([shard(idx(a)),shard(idx(b)),desc()]).then(function(t){var x=find(t[0],a,b),y=find(t[1],b,a),h='';msg('');
h+='<div class="pt-hd"><p class="pt-code">'+a+' + '+b+'</p><p class="pt-meta">Medicare NCCI PTP practitioner edits, '+CFG.ver+', effective '+CFG.eff+'</p></div>';
h+='<p class="pt-def"><strong>'+a+'</strong>'+name(a)+'<br><strong>'+b+'</strong>'+name(b)+'</p>';
if(x.hit)h+=card(a,b,x.hit);if(y.hit)h+=card(b,a,y.hit);
if(!x.hit&&!y.hit){h+='<div class="pt-pay"><span>No NCCI PTP edit</span><strong>No active edit for this pair</strong><small>The CMS practitioner file has no active edit between '+a+' and '+b+' for '+CFG.qtr+'.</small></div><p class="pt-note">No PTP edit does not guarantee payment. Units can still hit an MUE, the codes may need other modifiers, and commercial payers can run their own edits. A missing edit also does not make a coding combination correct; the policy manual applies either way ('+MAN.replace(' \u00a7E','')+').</p>'}
h+='<p class="pt-note">'+a+' has '+x.n.toLocaleString()+' active column 2 edits. '+b+' has '+y.n.toLocaleString()+'.</p>';
O.innerHTML=h;O.hidden=false;if(E0)E0.hidden=true;if(e&&O.getBoundingClientRect().top>window.innerHeight*0.6)O.parentNode.scrollIntoView({behavior:'smooth',block:'start'})}).catch(function(){msg('The CMS edit data did not load. Check your connection and try again.',1)})}
F.addEventListener('submit',go);
R.querySelectorAll('[data-ex]').forEach(function(b){b.addEventListener('click',function(){var p=b.getAttribute('data-ex').split('+');A.value=p[0];B.value=p[1];go()})});
var q=/[?&]codes=([A-Za-z0-9]{5})[,+ ]([A-Za-z0-9]{5})/.exec(location.search.replace(/%2C|%20|%2B/gi,','));if(q){A.value=q[1];B.value=q[2];go()}
})();
