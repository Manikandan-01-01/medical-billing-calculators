(function(){
var R=document.getElementById('mbx-mod');if(!R)return;
var Q=R.querySelector('#md-q'),O=R.querySelector('#md-out'),E0=R.querySelector('#md-empty');
var PM='NCCI Policy Manual 2026, Ch. 1',MLN='CMS MLN1783722 (April 2026)',EM='CMS MLN006764 (May 2026)';
var X59='Medicare wants XE, XP, XS or XU instead of 59 whenever one fits. Use 59 only when no more specific modifier describes the case. Medicare accepts it on either the column 1 or column 2 code.';
var T={
start:{q:'What needs the modifier?',o:[['An E/M visit on the same day as a procedure.','glob'],['Two procedures or services that bundle under an NCCI edit.','ind']]},
glob:{q:'What is the global period of the procedure?',h:'Not sure? Look it up in the <a href="/tools/global-period-calculator/">Global Period Calculator</a>.',o:[['090 days. It is a major surgery.','maj'],['000 or 010 days. It is a minor procedure.','minor'],['XXX. Global surgery rules do not apply.','xxx']]},
maj:{q:'Was the visit where the decision to do the surgery was made?',o:[['Yes. The visit decided on the surgery.','R57'],['No. It was other pre-op work for the surgery.','RnoMaj']]},
minor:{q:'Was the visit only the decision to do the procedure or its usual pre- and post-procedure work?',o:[['Yes. That was all the visit covered.','RnoMin'],['No. The visit addressed more than that.','sig']]},
xxx:{q:'Was the visit only work that is part of the procedure?',h:'This includes the usual pre- and post-procedure work, supervising others who do it, and reading the result.',o:[['Yes. That was all the visit covered.','RnoXXX'],['No. The visit addressed more than that.','sig']]},
sig:{q:'Does the note show a significant, separately identifiable E/M service?',h:'It must go above and beyond the usual work of the procedure. The diagnosis can be the same.',o:[['Yes. The note supports a separate E/M.','R25'],['No. The note does not support it.','RnoSig']]},
ind:{q:'What modifier indicator does the NCCI edit for the pair have?',h:'Not sure? Check the pair in the <a href="/tools/ncci-edit-checker/">NCCI Edit Checker</a>.',o:[['1. A modifier is allowed.','why'],['0. No modifier is allowed.','R0'],['There is no NCCI edit for the pair.','Rnone']]},
why:{q:'Why are the 2 services separate?',o:[['They were at separate encounters on the same day.','enc'],['They were on different anatomic sites.','side'],['A different practitioner did one of them.','RXP'],['They are timed codes done in separate time blocks.','Rtime'],['A diagnostic test led to the decision to treat.','dxb'],['A diagnostic test was done after the treatment ended.','dxa'],['The 2 codes describe different procedures.','Rdiff'],['The 2 services have different diagnoses.','Rdx']]},
enc:{q:'Does a more specific modifier describe the encounter?',h:'Examples are 24, 25, 27, 57, 58, 78, 79 and 91.',o:[['Yes. One of those fits.','Rspec'],['No. None of those fits.','RXE']]},
side:{q:'Does an anatomic modifier describe the sites?',h:'For example, RT and LT for opposite sides, or a finger, toe, eyelid or coronary artery modifier.',o:[['Yes. An anatomic modifier fits.','Ranat'],['No. They were on the same side and no anatomic modifier fits.','site']]},
site:{q:'Were the sites different organs or different anatomic regions?',h:'In limited cases, non-contiguous lesions in different regions of the same organ also count.',o:[['Yes. Different organs, regions or such lesions.','RXS'],['No. Contiguous structures in the same organ or region.','Rcont']]},
dxb:{q:'Does the test meet all 3 conditions?',h:'1. It was done before the treatment and not mixed with it. 2. It gave the information needed to decide on treatment. 3. The treatment would not have required it anyway.',o:[['Yes. It meets all 3.','RXUb'],['No. It is part of the treatment.','Rinh']]},
dxa:{q:'Was the test separate from the finished treatment?',h:'It must come after the treatment ended, not be mixed with it, and not be a required, common or expected follow-up of it.',o:[['Yes. It meets all of that.','RXUa'],['No. It is part of the treatment.','Rinh']]}
};
var RS={
R25:['25','Add modifier 25 to the E/M code',0,['The E/M is significant and separately identifiable from the procedure, so modifier 25 applies.','The E/M and the procedure can share the same diagnosis.','The decision to do a minor procedure is not a separate E/M. Being a new patient alone does not justify one either.','Medicare does not pay G2211 with an E/M billed with modifier 25, unless the same-day service is an AWV, a vaccine administration or a Part B preventive service ('+EM+').'],PM+' \u00a7D and \u00a7E.b'],
R57:['57','Add modifier 57 to the E/M code',0,['An E/M on the same day as a 090-day surgery, done to decide on the surgery, is billed with modifier 57.','NCCI has no edits for this rule because MACs run their own edits.'],PM+' \u00a7D'],
RnoMaj:['None','Do not bill the E/M',1,['Other pre-op E/M services on the day of a major surgery are part of the global payment.','Modifier 25 does not change that.'],PM+' \u00a7D'],
RnoMin:['None','Do not bill the E/M',1,['The decision to do a minor procedure is included in its payment.','Its usual pre- and post-procedure work is included too, for new and established patients.'],PM+' \u00a7D and \u00a7E.b'],
RnoXXX:['None','Do not bill the E/M',1,['Work inherent in an XXX procedure is not a separate E/M.','That includes supervising others who do it and reading its result.'],PM+' \u00a7D'],
RnoSig:['None','Do not bill the E/M',1,['Without a significant, separately identifiable E/M in the record, modifier 25 is not supported.','A modifier is allowed only when the clinical facts justify it.'],PM+' \u00a7E'],
R0:['None','No modifier can bypass this edit',1,['Indicator 0 means no NCCI PTP-associated modifier bypasses the edit, not even 59 or an X modifier.','Medicare pays the column 1 code and denies the column 2 code.','If the procedure was unusually extensive, the manual allows modifier 22 on the column 1 code for MAC review.'],PM+' \u00a7E and \u00a7E.a'],
Rnone:['None','No NCCI modifier is needed',0,['With no PTP edit, there is nothing for 59 or an X modifier to bypass.','Modifiers belong on a claim only when the clinical facts justify them.','Units can still hit an MUE, and other payers can run their own edits.'],PM+' \u00a7E'],
RXP:['XP','Use XP (or 59)',0,['XP means separate practitioner: a service that is distinct because a different practitioner performed it.',X59],MLN],
Rtime:['59 or XE','Use 59 or XE on the timed service',0,['Two timed services in separate, distinct time blocks can be reported with 59 or XE.','The blocks can be back to back or split, for example 10 minutes of one, 15 of the other, then 5 more of the first.','Units are still based on total time, so you cannot bill the minimum time for each service.'],MLN+'; '+PM+' \u00a7E.d'],
RXUb:['XU (or 59)','Use XU (or 59) on the diagnostic code',0,['A diagnostic test that comes first and is the basis for the decision to treat is separate and distinct when it meets all 3 conditions.','If the test is an inherent part of the treatment, do not report it separately.',X59],MLN+'; '+PM+' \u00a7E.d'],
RXUa:['XU (or 59)','Use XU (or 59) on the diagnostic code',0,['A diagnostic test after a finished treatment is separate when it is not mixed with the treatment and is not a required, common or expected follow-up.',X59],MLN+'; '+PM+' \u00a7E.d'],
Rdiff:['None','Do not use 59 or XU for this reason',1,['Different code descriptors are the most common misuse of modifier 59.','If both procedures were at the same site and the same encounter, the codes stay bundled.'],MLN+'; '+PM+' \u00a7E.d'],
Rdx:['None','Different diagnoses are not enough',1,['Different diagnoses are not adequate criteria for 59, XE, XP, XS or XU.','The codes stay bundled unless the services were at different sites, separate encounters or one of the 3 limited cases.'],MLN+'; '+PM+' \u00a7E.d'],
Rspec:['24, 25, 27, 57, 58, 78, 79 or 91','Use the more specific modifier',0,['Use 59 or XE for a separate encounter only when none of 24, 25, 27, 57, 58, 78, 79 or 91 describes it.','For example, an E/M gets 25, never 59.'],MLN],
RXE:['XE (or 59)','Use XE (or 59)',0,['XE means separate encounter: a service that is distinct because it happened at a separate encounter on the same date of service.',X59],MLN+'; '+PM+' \u00a7E.e'],
Ranat:['RT/LT or another anatomic modifier','Use the anatomic modifier, not 59 or XS',0,['Anatomic modifiers are NCCI PTP-associated, so they bypass the edit on their own.','For example, procedures on different sides of the body get RT and LT, not 59 or XS.'],MLN],
RXS:['XS (or 59)','Use XS (or 59)',0,['XS means separate structure: a service that is distinct because it was performed on a separate organ or structure.','It fits different organs or anatomic regions, and in limited cases non-contiguous lesions in different regions of the same organ.',X59],MLN+'; '+PM+' \u00a7E.d'],
Rcont:['None','No modifier: it is one anatomic site',1,['Contiguous structures in the same organ or region are a single anatomic site for NCCI.','For example, the nail, nail bed and nearby soft tissue of one toe are one site. So are the retina and choroid of one eye.'],MLN+'; '+PM+' \u00a7E.d'],
Rinh:['None','Do not report the diagnostic test separately',1,['A diagnostic test that is an inherent part of the treatment, or a required follow-up of it, is not separately reportable.'],MLN+'; '+PM+' \u00a7E.d']
};
var path=[];
function esc(s){return String(s).replace(/[\x26<>"]/g,function(c){return'\x26#'+c.charCodeAt(0)+';'})}
function trail(){if(!path.length)return'';return'<ol class="md-trail">'+path.map(function(p){return'<li>'+esc(T[p[0]].q)+' <strong>'+esc(T[p[0]].o[p[1]][0])+'</strong></li>'}).join('')+'</ol>'}
function cur(){if(!path.length)return'start';var p=path[path.length-1];return T[p[0]].o[p[1]][1]}
function render(scroll){var id=cur(),h=trail();
if(T[id]){var n=T[id];h+='<p class="md-step">Question '+(path.length+1)+'</p><p class="md-q">'+esc(n.q)+'</p>'+(n.h?'<p class="md-help">'+n.h+'</p>':'')+'<div class="md-opts">'+n.o.map(function(o,i){return'<button type="button" class="md-opt" data-i="'+i+'">'+esc(o[0])+'</button>'}).join('')+'</div>';
if(path.length)h+='<div class="md-nav"><button type="button" class="md-link" data-act="back">Back</button><button type="button" class="md-link" data-act="reset">Start over</button></div>';
Q.innerHTML=h;O.hidden=true;O.innerHTML='';if(E0)E0.hidden=false;R.setAttribute('data-res','');return}
var r=RS[id];Q.innerHTML=h+'<div class="md-nav"><button type="button" class="md-link" data-act="back">Back</button><button type="button" class="md-link" data-act="reset">Start over</button></div>';
var o='<div class="md-pay'+(r[2]?' is-no':'')+'"><span>Suggested modifier</span><strong class="md-mod">'+esc(r[0])+'</strong><small>'+esc(r[1])+'</small></div>';
o+='<h3 class="md-h">Why</h3><ul class="md-why">'+r[3].map(function(s){return'<li>'+esc(s)+'</li>'}).join('')+'</ul>';
o+='<p class="md-note">Source: '+esc(r[4])+'. The medical record must support any modifier you use. This is a guide, not coding advice, and payer policy decides non-Medicare claims.</p>';
O.innerHTML=o;O.hidden=false;if(E0)E0.hidden=true;R.setAttribute('data-res',id);
if(scroll&&O.getBoundingClientRect().top>window.innerHeight*0.7)O.scrollIntoView({behavior:'smooth',block:'start'})}
Q.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
if(b.hasAttribute('data-i')){path.push([cur(),+b.getAttribute('data-i')]);render(1)}
else if(b.getAttribute('data-act')=='back'){path.pop();render()}
else if(b.getAttribute('data-act')=='reset'){path=[];render()}});
render();
})();
