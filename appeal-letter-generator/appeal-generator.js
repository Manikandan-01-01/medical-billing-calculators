/*!
 * Medical Billing 101 – Appeal Letter Generator (vanilla JS, no dependencies).
 * Runs entirely in the browser: nothing is stored (no cookies/localStorage) or sent.
 * Mount: <div data-mbx-alg data-code="CO-97"></div>  (load appeal-data.js and appeal-docx.js first)
 */
(function () {
	'use strict';
	var D = window.MBX_ALG_DATA;
	if (!D || !window.MBX_DOCX) { return; }
	var uid = 0;
	var CODES = {};
	D.codes.forEach(function (c) { CODES[c.code] = c; });

	/* ---------- helpers ---------- */
	function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
	function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
	function fmtDate(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ''); return m ? m[2] + '/' + m[3] + '/' + m[1] : (iso || ''); }
	function money(v) {
		var n = parseFloat(String(v).replace(/[$,\s]/g, ''));
		return isFinite(n) ? '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : String(v);
	}
	function npiValid(n) {
		if (!/^\d{10}$/.test(n)) { return false; }
		var s = '80840' + n, sum = 0;
		for (var i = s.length - 1, dbl = false; i >= 0; i--, dbl = !dbl) {
			var d = +s[i];
			if (dbl) { d *= 2; if (d > 9) { d -= 9; } }
			sum += d;
		}
		return sum % 10 === 0;
	}
	function codeText(c) { return c.code + ' \u00b7 ' + c.label; }

	/* ---------- letter model: blocks of lines of parts ---------- */
	function P(t, b) { return { t: t, b: !!b }; }
	function V(val, label, b) { val = (val || '').trim(); return val ? { t: val, k: 'v', b: !!b } : { t: '[' + label + ']', k: 'ph', b: !!b }; }
	var LABELS = {
		cpt: 'CPT/HCPCS code', icd: 'ICD-10-CM code(s)', paid_cpt: 'related/paid CPT code', mod: 'modifier', auth_no: 'authorization number',
		orig_claim: 'original claim number', orig_date: 'original submission date', other_payer: 'primary payer name', pri_date: 'primary payer EOB date',
		member_id: 'member ID', npi: 'NPI', claim_no: 'claim number', practice: 'practice name', patient: 'patient name'
	};
	function fill(tpl, s) {
		var out = [], re = /\{(\w+)\}/g, last = 0, m;
		while ((m = re.exec(tpl))) {
			if (m.index > last) { out.push(P(tpl.slice(last, m.index))); }
			var val = s[m[1]];
			if (m[1] === 'orig_date' || m[1] === 'pri_date') { val = fmtDate(val); }
			out.push(V(val, LABELS[m[1]] || m[1]));
			last = re.lastIndex;
		}
		if (last < tpl.length) { out.push(P(tpl.slice(last))); }
		return out;
	}
	function para(parts, cls) { return { cls: cls || '', lines: [parts] }; }
	function lines(arr, cls) { return { cls: cls || '', lines: arr }; }
	function splitLines(v, label) {
		v = (v || '').trim();
		return v ? v.split(/\r?\n/).filter(Boolean).map(function (l) { return [V(l, label)]; }) : [[V('', label)]];
	}

	function titleFor(s) {
		var med = s.plan === 'medicare';
		if (s.level === 'recon') { return med ? 'Request for Reopening' : 'Request for Reconsideration'; }
		if (s.level === 'l2') { return med ? 'Request for Reconsideration (Second-Level Appeal)' : 'Second-Level Appeal'; }
		return med ? 'Request for Redetermination' : 'First-Level Appeal';
	}

	function buildLetter(s, st) {
		var c = CODES[s.code], B = [], med = s.plan === 'medicare';
		var dos = s.dos_from ? fmtDate(s.dos_from) + (s.dos_to && s.dos_to !== s.dos_from ? ' \u2013 ' + fmtDate(s.dos_to) : '') : '';
		var carc = c ? 'claim adjustment reason code (CARC) ' + c.num + ' (' + c.code + ')' : 'claim adjustment reason code (CARC) [denial code]';
		var rarc = (s.rarc || '').trim();
		if (rarc) { carc += ' with remark code(s) ' + rarc; }
		var dd = V(fmtDate(s.denial_date), 'denial date');

		// Sender
		var snd = [[V(s.practice, 'Practice name')]].concat(splitLines(s.prac_addr, 'Practice address'));
		if ((s.phone || '').trim()) { snd.push([P('Phone: '), V(s.phone, '')]); }
		B.push(lines(snd));
		B.push(para([P(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }))]));
		B.push(lines([[V(s.payer, 'Payer name')], [P('Attn: Appeals Department')]].concat(splitLines(s.payer_addr, 'Payer appeals address'))));

		// RE block
		var re = [[P('RE: ' + titleFor(s) + (c ? ' \u2013 ' + c.code + ' denial' : ''), true)]];
		re.push([P('Patient: ', true), V(s.patient, 'Patient name'), P('  |  '), P('DOB: ', true), V(fmtDate(s.dob), 'DOB')]);
		re.push([P('Member ID: ', true), V(s.member_id, 'Member ID')].concat(s.plan ? [P('  |  '), P('Plan type: ', true), P(planLabel(s.plan))] : []));
		re.push([P('Claim number: ', true), V(s.claim_no, 'Claim number')]);
		re.push([P('Date(s) of service: ', true), V(dos, 'Date of service')]);
		if ((s.billed || '').trim()) { re.push([P('Billed amount: ', true), P(money(s.billed))]); }
		if ((s.cpt || '').trim() || (s.icd || '').trim()) {
			var l = [];
			if ((s.cpt || '').trim()) { l.push(P('CPT/HCPCS: ', true), P(s.cpt.trim())); }
			if ((s.icd || '').trim()) { if (l.length) { l.push(P('  |  ')); } l.push(P('ICD-10-CM: ', true), P(s.icd.trim())); }
			re.push(l);
		}
		re.push([P('Denial date: ', true), dd]);
		re.push([P('Denial reason: ', true), P(c ? 'CARC ' + c.num + ' (' + c.code + '): ' + c.desc : '[Denial code and description]')].concat(rarc ? [P('  RARC: ' + rarc)] : []));
		re.push([P('Billing provider NPI: ', true), V(s.npi, 'NPI')]);
		B.push(lines(re, 're'));

		B.push(para([P('Dear Appeals Reviewer:')]));

		// Opening
		var o;
		if (med && s.level === 'recon') { o = [P('Please accept this letter as a request to reopen the claim referenced above, which was denied on '), dd, P(' under ' + carc + ', so that the error described below can be corrected and the claim reprocessed.')]; }
		else if (med && s.level === 'l2') { o = [P('Please accept this letter as a request for reconsideration by the Qualified Independent Contractor of the claim referenced above. The service(s) were denied on '), dd, P(' under ' + carc + ', and the redetermination upheld the denial. A copy of the redetermination decision is enclosed.')]; }
		else if (med) { o = [P('Please accept this letter as a request for redetermination of the claim referenced above. The initial determination dated '), dd, P(' denied the service(s) under ' + carc + '.')]; }
		else if (s.level === 'recon') { o = [P('Please accept this letter as a request for reconsideration of the claim referenced above, which was denied on '), dd, P(' under ' + carc + '.')]; }
		else if (s.level === 'l2') { o = [P('Please accept this letter as a second-level appeal of the claim referenced above. The claim was denied on '), dd, P(' under ' + carc + ', and the denial was upheld on first-level review. A copy of that decision is enclosed.')]; }
		else { o = [P('Please accept this letter as a formal first-level appeal of the claim referenced above, which was denied on '), dd, P(' under ' + carc + '.')]; }
		B.push(para(o));

		// Summary
		var sm = [P('On '), V(dos, 'date of service'), P(', '), V(s.practice, 'practice name'), P(' provided the service(s) billed under CPT/HCPCS '), V(s.cpt, 'CPT/HCPCS code')];
		if ((s.icd || '').trim()) { sm.push(P(' with diagnosis code(s) '), V(s.icd, '')); }
		sm.push(P(st.cat === 'pay' ? '. We believe the claim was not paid correctly, for the following reason(s).' : '. We respectfully disagree with the denial, for the following reason(s).'));
		B.push(para(sm));

		// Arguments
		var cat = D.cats[st.cat];
		cat.args.forEach(function (a) { if (st.args[a.id]) { B.push(para(fill(a.text, s))); } });
		if ((s.extra || '').trim()) { s.extra.trim().split(/\n\s*\n/).forEach(function (pp) { B.push(para([V(pp.replace(/\s*\n\s*/g, ' '), '')])); }); }

		// Request
		B.push(para([P('Based on the information above and the enclosed documentation, we respectfully request that ' + (st.cat === 'pay' ? 'claim ' : 'the denial be overturned and that claim ')), V(s.claim_no, 'claim number'),
			P(st.cat === 'pay' ? ' be reprocessed and paid at the correct amount.' : ' be reprocessed for payment.')]));
		if (!med && s.level !== 'recon') { B.push(para([P('If the denial is upheld, please provide a written explanation that cites the specific plan provision, policy or clinical criteria used, and describe any further appeal rights.')])); }
		B.push(para([P('If you need additional information, please contact '), V(s.contact, 'Contact name'), P(/,/.test(s.contact || '') ? ', at ' : ' at '), V(s.phone, 'phone number'), P('. Thank you for your prompt review.')]));

		// Signature
		B.push(lines([[P('Sincerely,')], [P('')], [P('')], [V(s.contact, 'Name, title')], [V(s.practice, 'Practice name')]], 'sig'));

		// Enclosures
		var enc = Object.keys(D.enclosures).filter(function (k) { return st.enc[k]; });
		if (enc.length) { B.push(lines([[P('Enclosures:', true)]].concat(enc.map(function (k, i) { return [P((i + 1) + '. ' + D.enclosures[k])]; })), 'enc')); }
		return B;
	}
	function planLabel(v) { for (var i = 0; i < D.plans.length; i++) { if (D.plans[i][0] === v) { return D.plans[i][1]; } } return v; }

	function toHTML(B, plain) {
		return B.map(function (b) {
			return '<p' + (b.cls && !plain ? ' class="mbx-alg__' + b.cls + '"' : '') + (plain ? ' style="margin:0 0 12pt;font-family:\'Times New Roman\',serif;font-size:12pt"' : '') + '>' + b.lines.map(function (ln) {
				return ln.map(function (p) {
					var h = esc(p.t);
					if (!plain && p.k === 'v') { h = '<mark>' + h + '</mark>'; } else if (!plain && p.k === 'ph') { h = '<span class="mbx-alg__blank">' + h + '</span>'; }
					return p.b ? '<strong>' + h + '</strong>' : h;
				}).join('');
			}).join('<br>') + '</p>';
		}).join('');
	}
	function toText(B) { return B.map(function (b) { return b.lines.map(function (ln) { return ln.map(function (p) { return p.t; }).join(''); }).join('\n'); }).join('\n\n') + '\n'; }

	function toDocx(B) { return window.MBX_DOCX.build(B); }

	/* ---------- UI ---------- */
	var ICON_DOC = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></svg>';
	var ICON_EYE = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M8 11h6"/></svg>';
	var ICON_LOCK = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';

	function init(root) {
		if (root.__mbxAlg) { return; }
		root.__mbxAlg = true;
		var p = 'mbxalg' + (++uid);
		function f(name, label, opt) {
			opt = opt || {};
			var id = p + '-' + name, hint = opt.hint ? '<span class="mbx-alg__hint" id="' + id + '-h">' + opt.hint + '</span>' : '';
			var aria = opt.hint ? ' aria-describedby="' + id + '-h"' : '', ctl;
			if (opt.type === 'select') { ctl = '<select id="' + id + '" name="' + name + '"' + aria + '>' + opt.options.map(function (o) { return '<option value="' + esc(o[0]) + '">' + esc(o[1]) + '</option>'; }).join('') + '</select>'; }
			else if (opt.type === 'textarea') { ctl = '<textarea id="' + id + '" name="' + name + '" rows="' + (opt.rows || 2) + '"' + aria + (opt.ph ? ' placeholder="' + esc(opt.ph) + '"' : '') + '></textarea>'; }
			else { ctl = '<input id="' + id + '" name="' + name + '" type="' + (opt.type || 'text') + '"' + aria + (opt.ph ? ' placeholder="' + esc(opt.ph) + '"' : '') + (opt.attrs || '') + ' autocomplete="off">'; }
			return '<div class="mbx-alg__fld' + (opt.cls ? ' ' + opt.cls : '') + '"' + (opt.need ? ' data-need="' + name + '" hidden' : '') + '><label for="' + id + '">' + label + (opt.opt ? ' <span class="mbx-alg__opt">(optional)</span>' : '') + '</label>' + ctl + hint + '</div>';
		}
		var catOpts = Object.keys(D.cats).map(function (k) { return [k, D.cats[k].label]; });
		root.innerHTML =
			'<div class="mbx-alg__grid">' +
			'<form class="mbx-alg__card mbx-alg__form" novalidate aria-labelledby="' + p + '-ft">' +
			'<h2 id="' + p + '-ft"><span class="mbx-alg__ic">' + ICON_DOC + '</span>Claim details</h2>' +
			'<p class="mbx-alg__privacy">' + ICON_LOCK + '<span>Runs in your browser. Nothing is saved or sent. Use de-identified or sample data if unsure.</span></p>' +
			'<div class="mbx-alg__tools"><button type="button" class="mbx-alg__link" data-act="sample">Fill with sample data</button><a class="mbx-alg__link mbx-alg__jump" href="#' + p + '-pv">Jump to letter preview</a></div>' +
			'<fieldset><legend>Denial</legend>' +
			'<div class="mbx-alg__fld mbx-alg__combo"><label for="' + p + '-code" id="' + p + '-code-l">Denial code (CARC)</label>' +
			'<input id="' + p + '-code" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="' + p + '-lb" aria-describedby="' + p + '-code-h" autocomplete="off" spellcheck="false" placeholder="Search: 97, CO-50, bundled\u2026">' +
			'<ul id="' + p + '-lb" role="listbox" aria-labelledby="' + p + '-code-l" class="mbx-alg__lb" hidden></ul>' +
			'<span class="mbx-alg__hint" id="' + p + '-code-h">Type a code or keyword, then use the arrow keys and Enter.</span><span class="mbx-alg__codeinfo" data-codeinfo></span></div>' +
			'<div class="mbx-alg__two">' + f('rarc', 'Remark code(s)', { opt: 1, ph: 'e.g. N115' }) + f('denial_date', 'Denial date', { type: 'date' }) + '</div>' +
			'<div class="mbx-alg__two">' + f('level', 'Appeal level', { type: 'select', options: [['l1', '1st level appeal'], ['recon', 'Reconsideration (informal review)'], ['l2', '2nd level appeal']] }) +
			f('plan', 'Plan type', { type: 'select', options: [['', 'Select\u2026']].concat(D.plans) }) + '</div>' +
			f('payer', 'Payer', { ph: 'Start typing or pick a payer', attrs: ' list="' + p + '-payers"' }) + '<datalist id="' + p + '-payers">' + D.payers.map(function (x) { return '<option value="' + esc(x) + '">'; }).join('') + '</datalist>' +
			f('payer_addr', 'Payer appeals address', { type: 'textarea', opt: 1, ph: 'From the denial letter / EOB or payer manual' }) +
			'<div class="mbx-alg__note" data-hints aria-live="polite"></div></fieldset>' +
			'<fieldset><legend>Provider / practice</legend>' + f('practice', 'Provider / practice name') +
			'<div class="mbx-alg__two">' + f('npi', 'NPI', { attrs: ' inputmode="numeric" maxlength="10"', hint: '10 digits' }) + f('phone', 'Phone', { type: 'tel', opt: 1 }) + '</div>' +
			f('prac_addr', 'Practice address', { type: 'textarea', ph: 'Street\nCity, ST ZIP' }) + f('contact', 'Contact name & title', { opt: 1, ph: 'e.g. Jane Doe, Billing Manager' }) + '</fieldset>' +
			'<fieldset><legend>Patient &amp; claim</legend>' +
			'<div class="mbx-alg__two">' + f('patient', 'Patient name') + f('member_id', 'Member ID') + '</div>' +
			'<div class="mbx-alg__two">' + f('dob', 'Date of birth', { type: 'date' }) + f('claim_no', 'Claim number') + '</div>' +
			'<div class="mbx-alg__two">' + f('dos_from', 'Date of service', { type: 'date' }) + f('dos_to', 'Through date', { type: 'date', opt: 1 }) + '</div>' +
			'<div class="mbx-alg__two">' + f('billed', 'Billed amount', { attrs: ' inputmode="decimal"', ph: '0.00' }) + f('cpt', 'CPT/HCPCS', { opt: 1, ph: 'e.g. 93000' }) + '</div>' +
			f('icd', 'ICD-10-CM', { opt: 1, ph: 'e.g. R07.9' }) +
			'<div class="mbx-alg__two">' + f('paid_cpt', 'Related / paid CPT', { need: 1, ph: 'e.g. 99213-25' }) + f('mod', 'Modifier', { need: 1, ph: 'e.g. 59, XS, 25' }) +
			f('auth_no', 'Authorization number', { need: 1 }) + f('orig_claim', 'Original claim number', { need: 1 }) +
			f('orig_date', 'Original submission date', { type: 'date', need: 1 }) + f('other_payer', 'Primary / other payer', { need: 1 }) + f('pri_date', 'Primary payer EOB date', { type: 'date', need: 1 }) + '</div>' +
			'</fieldset>' +
			'<fieldset><legend>Appeal argument</legend>' + f('cat', 'Argument type', { type: 'select', options: catOpts, hint: 'Set from the denial code; change it if another argument fits better.' }) +
			'<div class="mbx-alg__checks" data-args role="group" aria-label="Arguments to include"></div>' +
			f('extra', 'Additional details', { type: 'textarea', rows: 3, opt: 1, ph: 'Case-specific facts. A blank line starts a new paragraph.' }) + '</fieldset>' +
			'<fieldset><legend>Enclosures</legend><div class="mbx-alg__checks" data-enc></div></fieldset>' +
			'</form>' +
			'<section class="mbx-alg__card mbx-alg__preview" id="' + p + '-pv" aria-labelledby="' + p + '-pt">' +
			'<div class="mbx-alg__ph"><h2 id="' + p + '-pt"><span class="mbx-alg__ic">' + ICON_EYE + '</span>Letter preview <span class="mbx-alg__live">LIVE</span></h2>' +
			'<div class="mbx-alg__acts"><button type="button" class="mbx-alg__btn mbx-alg__btn--ghost" data-act="copy">Copy</button><button type="button" class="mbx-alg__btn" data-act="docx">Download .docx</button>' +
			'<button type="button" class="mbx-alg__btn mbx-alg__btn--ghost" data-act="print">Print / PDF</button><button type="button" class="mbx-alg__btn mbx-alg__btn--plain" data-act="reset">Reset</button></div></div>' +
			'<p class="mbx-alg__status" role="status" aria-live="polite" data-status></p>' +
			'<div class="mbx-alg__paper" data-paper tabindex="0" role="document" aria-label="Appeal letter preview"></div>' +
			'<p class="mbx-alg__legend"><mark>Highlighted</mark> = your entries \u00b7 <span class="mbx-alg__blank">[Brackets]</span> = still to fill in</p>' +
			'</section></div>' +
			'<p class="mbx-alg__disc"><b>Disclaimer:</b> This is an educational template, not legal or coding advice. Verify every statement against the medical record and the payer\u2019s appeal requirements (form, address, deadline and required documents) before sending.</p>';

		var form = root.querySelector('form'), paper = root.querySelector('[data-paper]'), status = root.querySelector('[data-status]');
		var argsBox = root.querySelector('[data-args]'), encBox = root.querySelector('[data-enc]'), hints = root.querySelector('[data-hints]');
		var cin = root.querySelector('#' + p + '-code'), lb = root.querySelector('#' + p + '-lb'), info = root.querySelector('[data-codeinfo]');
		var el = function (n) { return form.elements[n]; };
		var st = { code: '', cat: 'mednec', args: {}, enc: {}, encTouched: {} };

		Object.keys(D.enclosures).forEach(function (k) {
			encBox.insertAdjacentHTML('beforeend', '<label class="mbx-alg__chk"><input type="checkbox" data-enc-id="' + k + '"> <span>' + esc(D.enclosures[k]) + '</span></label>');
		});

		function renderArgs(defaults) {
			var cat = D.cats[st.cat];
			if (defaults) { st.args = {}; st.args[cat.args[0].id] = true; }
			argsBox.innerHTML = cat.args.map(function (a) {
				return '<label class="mbx-alg__chk"><input type="checkbox" data-arg-id="' + a.id + '"' + (st.args[a.id] ? ' checked' : '') + '> <span>' + esc(a.label) + '</span></label>';
			}).join('');
		}
		function syncNeeds() {
			var need = {};
			D.cats[st.cat].args.forEach(function (a) { if (st.args[a.id]) { a.need.forEach(function (n) { need[n] = 1; }); } });
			form.querySelectorAll('[data-need]').forEach(function (w) { w.hidden = !need[w.getAttribute('data-need')]; });
		}
		function syncEnc() {
			var auto = { eob: 1, claim: 1 };
			if (el('level').value === 'l2') { auto.prior = 1; }
			D.cats[st.cat].args.forEach(function (a) { if (st.args[a.id]) { a.enc.forEach(function (e) { auto[e] = 1; }); } });
			encBox.querySelectorAll('input').forEach(function (i) {
				var k = i.getAttribute('data-enc-id');
				if (!st.encTouched[k]) { i.checked = !!auto[k]; }
				st.enc[k] = i.checked;
			});
		}
		function setCode(code, keepCat) {
			var c = CODES[code];
			st.code = c ? code : '';
			cin.value = c ? codeText(c) : '';
			info.innerHTML = c ? esc('CARC ' + c.num + ': ' + c.desc) + (c.url ? ' <a href="' + esc(c.url) + '" target="_blank" rel="noopener">' + esc(c.code) + ' guide</a>' : '') : '';
			if (c && !keepCat) { st.cat = c.cat; el('cat').value = c.cat; renderArgs(true); }
		}
		function updateHints() {
			var s = el('plan').value, c = CODES[st.code], h = [];
			if (s === 'medicare') {
				h.push('Original Medicare levels: reopening (clerical errors), redetermination by the MAC (request within 120 days of receiving the initial determination), then reconsideration by the QIC (within 180 days of receiving the redetermination). Form CMS-20027 can be used for a redetermination instead of a letter.');
				if (st.cat === 'missing') { h.push('A Medicare claim returned as unprocessable (for example CO-16 with MA130) has no appeal rights. Correct it and submit a new claim instead.'); }
			}
			if (s === 'ma') { h.push('Medicare Advantage: follow the plan\u2019s provider appeal or dispute process. Contracted and non-contracted providers can have different routes and deadlines.'); }
			if (s === 'medicaid' || s === 'mmc') { h.push('Medicaid appeal steps and deadlines vary by state and plan. Check the provider manual.'); }
			if (st.cat === 'pay') { h.push('Many of these codes are payment adjustments, not denials. Appeal only if the amount applied is wrong.'); }
			if (c && c.code === 'CO-29') { h.push('Timely filing denials are usually overturned only with proof of timely submission or a documented exception.'); }
			if (el('level').value === 'l2' && s !== 'medicare') { h.push('Second-level appeals often have their own form, address and deadline. Check the first-level decision letter.'); }
			hints.innerHTML = h.map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('');
			hints.hidden = !h.length;
		}
		var lastBlocks = [];
		function state() {
			var s = {};
			Array.prototype.forEach.call(form.elements, function (e) { if (e.name) { s[e.name] = e.value; } });
			s.code = st.code;
			return s;
		}
		function render() {
			var npi = el('npi').value.trim(), nh = root.querySelector('#' + p + '-npi-h');
			if (!npi) { nh.textContent = '10 digits'; nh.className = 'mbx-alg__hint'; el('npi').removeAttribute('aria-invalid'); }
			else if (npiValid(npi)) { nh.textContent = 'Valid NPI format'; nh.className = 'mbx-alg__hint is-ok'; el('npi').removeAttribute('aria-invalid'); }
			else { nh.textContent = /^\d{10}$/.test(npi) ? 'Check digit does not validate. Re-check the NPI.' : 'NPI must be 10 digits.'; nh.className = 'mbx-alg__hint is-err'; el('npi').setAttribute('aria-invalid', 'true'); }
			syncNeeds(); syncEnc(); updateHints();
			lastBlocks = buildLetter(state(), st);
			paper.innerHTML = toHTML(lastBlocks);
		}
		function say(msg) { status.textContent = ''; setTimeout(function () { status.textContent = msg; }, 30); }

		/* combobox */
		var active = -1, matches = [];
		function filter(q) {
			var n = norm(q);
			matches = D.codes.filter(function (c) { return !n || norm(c.code).indexOf(n) > -1 || c.num.toLowerCase() === n || norm(c.label + ' ' + c.desc).indexOf(n) > -1; });
			matches.sort(function (a, b) { var as = norm(a.code).indexOf(n) === 0 || a.num.toLowerCase().indexOf(n) === 0, bs = norm(b.code).indexOf(n) === 0 || b.num.toLowerCase().indexOf(n) === 0; return as === bs ? 0 : as ? -1 : 1; });
			lb.innerHTML = matches.length ? matches.map(function (c, i) {
				return '<li role="option" id="' + p + '-o' + i + '" aria-selected="false" data-code="' + c.code + '"><b>' + esc(c.code) + '</b> ' + esc(c.label) + (c.url ? '' : '') + '</li>';
			}).join('') : '<li class="mbx-alg__none" aria-disabled="true">No match. Try a number like 50 or a word like \u201cauth\u201d.</li>';
			active = -1; open(true);
		}
		function open(on) { lb.hidden = !on; cin.setAttribute('aria-expanded', on ? 'true' : 'false'); if (!on) { cin.removeAttribute('aria-activedescendant'); } }
		function move(d) {
			if (lb.hidden) { filter(''); }
			if (!matches.length) { return; }
			active = (active + d + matches.length) % matches.length;
			lb.querySelectorAll('[role=option]').forEach(function (o, i) { o.setAttribute('aria-selected', i === active ? 'true' : 'false'); o.classList.toggle('is-active', i === active); });
			var cur = lb.querySelector('#' + p + '-o' + active);
			cin.setAttribute('aria-activedescendant', cur.id);
			cur.scrollIntoView({ block: 'nearest' });
		}
		function choose(code) { setCode(code); open(false); render(); }
		cin.addEventListener('input', function () { filter(cin.value); });
		cin.addEventListener('focus', function () { cin.select(); });
		cin.addEventListener('click', function () { if (lb.hidden) { filter(''); } });
		cin.addEventListener('keydown', function (e) {
			if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
			else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
			else if (e.key === 'Enter') { if (!lb.hidden) { e.preventDefault(); if (active > -1) { choose(matches[active].code); } else if (matches.length === 1) { choose(matches[0].code); } } }
			else if (e.key === 'Escape') { if (!lb.hidden) { e.preventDefault(); open(false); setCode(st.code, true); } }
			else if (e.key === 'Tab' && !lb.hidden) { if (active > -1) { choose(matches[active].code); } else { open(false); } }
		});
		cin.addEventListener('blur', function () { setTimeout(function () { if (!lb.hidden) { open(false); } setCode(st.code, true); }, 150); });
		lb.addEventListener('mousedown', function (e) { var li = e.target.closest('[data-code]'); if (li) { e.preventDefault(); choose(li.getAttribute('data-code')); } });

		/* events */
		form.addEventListener('submit', function (e) { e.preventDefault(); });
		form.addEventListener('input', function (e) { if (e.target !== cin) { render(); } });
		form.addEventListener('change', function (e) {
			var t = e.target;
			if (t.name === 'cat') { st.cat = t.value; renderArgs(true); }
			if (t.hasAttribute('data-arg-id')) { st.args[t.getAttribute('data-arg-id')] = t.checked; }
			if (t.hasAttribute('data-enc-id')) { st.encTouched[t.getAttribute('data-enc-id')] = 1; }
			if (t !== cin) { render(); }
		});

		var SAMPLE = {
			rarc: '', level: 'l1', plan: 'commercial', payer: 'Sample Commercial Payer', payer_addr: 'PO Box 0000\nAnytown, ST 00000',
			practice: 'Sample Family Clinic', npi: '1234567893', phone: '(555) 010-0100', prac_addr: '100 Example Street\nAnytown, ST 00000', contact: 'Jane Doe, Billing Manager',
			patient: 'Sample Patient', member_id: 'SAMPLE-000123', claim_no: 'CLM-SAMPLE-0001', billed: '125', cpt: '99213-25', icd: 'M17.11, I10', paid_cpt: '20610', mod: '25',
			extra: 'In addition to the knee injection, the provider evaluated the patient\u2019s hypertension and adjusted the medication, which is documented separately in the visit note.'
		};
		function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
		function fillSample() {
			var t = new Date(), dos = new Date(t.getFullYear(), t.getMonth(), t.getDate() - 60), den = new Date(t.getFullYear(), t.getMonth(), t.getDate() - 26);
			Object.keys(SAMPLE).forEach(function (k) { if (el(k)) { el(k).value = SAMPLE[k]; } });
			el('dob').value = '1970-01-15'; el('dos_from').value = iso(dos); el('dos_to').value = ''; el('denial_date').value = iso(den);
			setCode('CO-97');
			st.args = { b_25: true }; renderArgs(false);
			st.encTouched = {};
			render(); say('Sample data filled in. Replace it with your claim details.');
		}
		function reset() {
			form.reset(); st.encTouched = {}; setCode(initial); if (!CODES[initial]) { st.cat = 'mednec'; el('cat').value = 'mednec'; renderArgs(true); }
			render(); say('Form cleared.');
		}
		function fname(ext) { return 'appeal-letter' + (st.code ? '-' + st.code : '') + '.' + ext; }
		function copy() {
			var txt = toText(lastBlocks), html = toHTML(lastBlocks, true);
			var done = function () { say('Letter copied to clipboard.'); }, fallback = function () {
				var ta = document.createElement('textarea'); ta.value = txt; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
				document.body.appendChild(ta); ta.select();
				var ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
				document.body.removeChild(ta);
				say(ok ? 'Letter copied to clipboard.' : 'Copy was blocked by the browser. Select the letter text and copy it manually.');
			};
			if (navigator.clipboard && window.ClipboardItem && window.isSecureContext) {
				navigator.clipboard.write([new ClipboardItem({ 'text/plain': new Blob([txt], { type: 'text/plain' }), 'text/html': new Blob([html], { type: 'text/html' }) })]).then(done, function () {
					navigator.clipboard.writeText(txt).then(done, fallback);
				});
			} else if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(txt).then(done, fallback); }
			else { fallback(); }
		}
		function download() {
			var blob = toDocx(lastBlocks), url = URL.createObjectURL(blob), a = document.createElement('a');
			a.href = url; a.download = fname('docx'); document.body.appendChild(a); a.click(); document.body.removeChild(a);
			setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
			say('Downloading ' + fname('docx') + '. Review and edit it before sending.');
		}
		root.addEventListener('click', function (e) {
			var b = e.target.closest('[data-act]'); if (!b) { return; }
			var a = b.getAttribute('data-act');
			if (a === 'sample') { fillSample(); } else if (a === 'copy') { copy(); } else if (a === 'docx') { download(); }
			else if (a === 'print') { window.print(); } else if (a === 'reset') { reset(); }
		});

		// Pre-fill the denial code from data-code or ?code= (code only, never patient data).
		var initial = (root.getAttribute('data-code') || '').toUpperCase();
		try { var q = new URLSearchParams(location.search).get('code'); if (q) { initial = q.toUpperCase(); } } catch (e) { /* old browser */ }
		initial = initial.replace(/^([A-Z]{2})[\s_]?(\w+)$/, '$1-$2');
		if (!CODES[initial]) { var m = D.codes.filter(function (c) { return c.num === initial.replace(/^[A-Z]{2}-?/, ''); })[0]; initial = m ? m.code : ''; }
		el('cat').value = st.cat; renderArgs(true);
		setCode(initial);
		render();
	}

	function boot() { document.querySelectorAll('[data-mbx-alg]').forEach(init); }
	if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', boot); } else { boot(); }
	window.MBXAppeal = { build: buildLetter, toText: toText, toDocx: toDocx, npiValid: npiValid };
})();
