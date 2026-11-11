(function(){
var R=document.getElementById('mbx-pce');if(!R)return;
var F=R.querySelector('form'),O=R.querySelector('#pc-out'),S=R.querySelector('#pc-msg'),E0=R.querySelector('#pc-empty');
function $(id){return R.querySelector('#'+id)}
function msg(t,e){S.textContent=t;S.className='pc-msg'+(e?' is-err':'')}
function money(c){var n=Math.abs(c)/100;return(c<0?'-':'')+'$'+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
function cents(v,req){v=String(v==null?'':v).replace(/[$,\s]/g,'');if(v===''){return req?NaN:null}if(!/^\d+(\.\d{1,2})?$/.test(v))return NaN;return Math.round(parseFloat(v)*100)}
function calc(i){var A=i.A,ded=i.dedApplies?Math.min(A,i.D):0,rest=A-ded,share,label;
if(i.type==='coins'){share=Math.round(rest*i.c/100);label='coinsurance'}else{share=Math.min(i.P,rest);label='copay'}
var pre=ded+share,pt=i.M===null?pre:Math.min(pre,i.M),capped=i.M!==null&&pre>i.M;
return{ded:ded,rest:rest,share:share,label:label,pre:pre,pt:pt,plan:A-pt,capped:capped,dedLeft:i.D-ded,oopLeft:i.M===null?null:i.M-pt,wo:i.B===null?null:i.B-A}}
function read(){var t=R.querySelector('input[name=pc-type]:checked').value;
var i={A:cents($('pc-allowed').value,1),D:cents($('pc-ded').value),type:t,c:null,P:null,M:cents($('pc-oop').value),B:cents($('pc-billed').value),dedApplies:$('pc-dapp').checked};
if(i.D===null)i.D=0;
if(t==='coins'){var c=String($('pc-coins').value).replace(/[%\s]/g,'');i.c=c===''?NaN:(/^\d+(\.\d+)?$/.test(c)?parseFloat(c):NaN)}else{i.P=cents($('pc-copay').value);if(i.P===null)i.P=NaN}
return i}
function go(e){if(e)e.preventDefault();var i=read();
if(!(i.A>0)){msg('Enter the allowed amount in dollars, for example 250 or 250.00.',1);O.hidden=true;return}
if(isNaN(i.D)||isNaN(i.M)||isNaN(i.B)){msg('Use dollar amounts only, for example 1500 or 1500.00.',1);O.hidden=true;return}
if(i.type==='coins'&&!(i.c>=0&&i.c<=100)){msg('Enter a coinsurance percent from 0 to 100.',1);O.hidden=true;return}
if(i.type==='copay'&&isNaN(i.P)){msg('Enter the copay in dollars, for example 30.',1);O.hidden=true;return}
if(i.B!==null&&i.B<i.A){msg('The billed charge cannot be less than the allowed amount.',1);O.hidden=true;return}
msg('');var r=calc(i),h='',st=[];
h+='<div class="pc-split"><div class="is-pt"><span>Patient owes</span><strong class="pc-pt">'+money(r.pt)+'</strong></div><div><span>Plan pays</span><strong class="pc-plan">'+money(r.plan)+'</strong></div></div>';
if(i.dedApplies)st.push('Deductible: the patient pays '+money(r.ded)+' of the '+money(i.A)+' allowed amount, because '+money(i.D)+' of the deductible was left.');
else st.push('Deductible: it does not apply to this service, so the patient pays $0.00 toward it.');
if(r.rest===0)st.push('Nothing is left after the deductible, so no '+r.label+' applies.');
else if(i.type==='coins')st.push('Coinsurance: '+i.c+'% of the remaining '+money(r.rest)+' is '+money(r.share)+'.');
else st.push('Copay: '+money(r.share)+(r.share<i.P?' (the copay is capped at the '+money(r.rest)+' left)':'')+'.');
st.push('Before the out-of-pocket limit: '+money(r.ded)+' + '+money(r.share)+' = '+money(r.pre)+'.');
if(i.M!==null)st.push(r.capped?'Out-of-pocket limit: only '+money(i.M)+' was left, so the patient pays '+money(r.pt)+'.':'Out-of-pocket limit: '+money(i.M)+' was left, so it does not change the amount.');
st.push('Plan pays: '+money(i.A)+' \u2212 '+money(r.pt)+' = '+money(r.plan)+'.');
h+='<h3 class="pc-h">How it was worked out</h3><ol class="pc-steps">'+st.map(function(s){return'<li>'+s+'</li>'}).join('')+'</ol>';
h+='<div class="pc-tw"><table class="pc-t"><tbody><tr><th scope="row">Deductible applied</th><td class="pc-ded">'+money(r.ded)+'</td></tr><tr><th scope="row">'+(i.type==='coins'?'Coinsurance':'Copay')+'</th><td class="pc-share">'+money(r.share)+'</td></tr><tr><th scope="row">Deductible left after this claim</th><td class="pc-dleft">'+money(r.dedLeft)+'</td></tr>'+(r.oopLeft===null?'':'<tr><th scope="row">Out-of-pocket limit left</th><td class="pc-oleft">'+money(r.oopLeft)+'</td></tr>')+(r.wo===null?'':'<tr><th scope="row">Billed charge above the allowed amount</th><td class="pc-wo">'+money(r.wo)+'</td></tr>')+'</tbody></table></div>';
if(r.wo)h+='<p class="pc-note">An in-network provider cannot balance bill the patient for the '+money(r.wo)+' above the allowed amount. It is written off as a contractual adjustment. An out-of-network provider may bill it.</p>';
h+='<p class="pc-note">This is an estimate for one covered, in-network service. The plan\u2019s EOB or remittance decides the final amount.</p>';
O.innerHTML=h;O.hidden=false;if(E0)E0.hidden=true;if(e&&O.getBoundingClientRect().top>window.innerHeight*0.6)O.parentNode.scrollIntoView({behavior:'smooth',block:'start'})}
function sync(){var c=R.querySelector('input[name=pc-type]:checked').value==='coins';$('pc-f-coins').hidden=!c;$('pc-f-copay').hidden=c}
R.querySelectorAll('input[name=pc-type]').forEach(function(x){x.addEventListener('change',sync)});
F.addEventListener('submit',go);
var P={hc:{allowed:'12000',ded:'3000',type:'coins',coins:'20',oop:'6850'},mcr:{allowed:'',ded:'283',type:'coins',coins:'20',oop:''},ov:{allowed:'100',ded:'0',type:'copay',copay:'20',oop:''}};
R.querySelectorAll('[data-pre]').forEach(function(b){b.addEventListener('click',function(){var p=P[b.getAttribute('data-pre')];$('pc-allowed').value=p.allowed;$('pc-ded').value=p.ded;R.querySelector('input[name=pc-type][value='+p.type+']').checked=true;$('pc-coins').value=p.coins||'';$('pc-copay').value=p.copay||'';$('pc-oop').value=p.oop;$('pc-billed').value='';$('pc-dapp').checked=true;sync();if(p.allowed)go();else{msg('Medicare Part B 2026 loaded: $283 deductible and 20% coinsurance. Enter the allowed amount.');$('pc-allowed').focus()}})});
sync();
})();
