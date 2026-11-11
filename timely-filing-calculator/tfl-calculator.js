/*!
 * Medical Billing 101 – Timely Filing / Appeal Deadline Calculator (vanilla JS, no dependencies).
 * Full tool:   <div data-mbx-tfl></div>
 * Mini widget: <div data-mbx-tfl-mini data-preset="medicare-redet" data-url="/tools/timely-filing-calculator/"></div>
 * Runs in the browser only. Nothing is stored or sent.
 */
(function () {
	'use strict';
	var DAY = 864e5, uid = 0;

	/* ---------- date math (UTC calendar dates; no DST drift) ---------- */
	function parse(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ''); if (!m) { return null; } var d = new Date(Date.UTC(+m[1], m[2] - 1, +m[3])); return d.getUTCDate() === +m[3] ? d : null; }
	function iso(d) { return d.toISOString().slice(0, 10); }
	function addDays(d, n) { return new Date(d.getTime() + n * DAY); }
	function dim(y, m) { return new Date(Date.UTC(y, m + 1, 0)).getUTCDate(); }
	// Calendar months; if the day doesn't exist in the target month, use its last day (Jan 31 + 1 month = Feb 28/29).
	function addMonths(d, n) {
		var y = d.getUTCFullYear(), m = d.getUTCMonth() + n, ty = y + Math.floor(m / 12), tm = ((m % 12) + 12) % 12;
		return new Date(Date.UTC(ty, tm, Math.min(d.getUTCDate(), dim(ty, tm))));
	}
	function addLimit(d, n, unit) { return unit === 'days' ? addDays(d, n) : addMonths(d, unit === 'years' ? n * 12 : n); }
	function today() { var t = new Date(); return new Date(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate())); }
	function diffDays(a, b) { return Math.round((b - a) / DAY); }
	function fmt(d, long) { return d.toLocaleDateString('en-US', { timeZone: 'UTC', weekday: long ? 'long' : undefined, month: long ? 'long' : 'short', day: 'numeric', year: 'numeric' }); }
	function compute(o) {
		var start = parse(o.start); if (!start) { return null; }
		var n = parseInt(o.n, 10); if (!(n > 0) || n > 3650) { return null; }
		var base = o.mail ? addDays(start, 5) : start, deadline = addLimit(base, n, o.unit), left = diffDays(o.today || today(), deadline);
		return { start: start, base: base, deadline: deadline, left: left, status: left < 0 ? 'over' : left < 30 ? 'soon' : 'ok', weekend: deadline.getUTCDay() % 6 === 0 };
	}
	function icsEsc(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }
	function fold(line) { var out = [], s = line; while (s.length > 74) { out.push(s.slice(0, 74)); s = ' ' + s.slice(74); } out.push(s); return out.join('\r\n'); }
	function ics(deadline, summary, desc) {
		var stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, ''), d = iso(deadline).replace(/-/g, ''), e = iso(addDays(deadline, 1)).replace(/-/g, '');
		var uidv = 'tfl-' + d + '-' + Math.random().toString(36).slice(2, 10) + '@medicalbilling101.com';
		return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Medical Billing 101//Timely Filing Calculator//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
			'UID:' + uidv, 'DTSTAMP:' + stamp, 'DTSTART;VALUE=DATE:' + d, 'DTEND;VALUE=DATE:' + e, 'SUMMARY:' + icsEsc(summary), 'DESCRIPTION:' + icsEsc(desc), 'TRANSP:TRANSPARENT',
			'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEsc(summary), 'TRIGGER:-P7D', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].map(fold).join('\r\n') + '\r\n';
	}

	/* ---------- presets ---------- */
	var BASIS = { dos: 'Date of service', notice: 'Denial / remittance date', received: 'Date notice received' };
	var TYPES = { claim: 'Claim submission', corrected: 'Corrected claim', appeal: 'Appeal' };
	function PR(id, label, type, basis, n, unit, mail, note, ex) { return { id: id, label: label, type: type, basis: basis, n: n, unit: unit, mail: mail, note: note, ex: !!ex }; }
	var EX = 'Example only. Limits vary by payer and contract; verify yours before relying on this date.';
	var PRESETS = [
		PR('medicare-claim', 'Medicare claim: 12 months (1 calendar year) from DOS', 'claim', 'dos', 1, 'years', false, 'CMS: Medicare fee-for-service claims must be filed within 12 months (1 calendar year) after the date of service (42 CFR 424.44; IOM 100-04, Ch. 1, \u00a770). For institutional claims with a span of dates, use the \u201cthrough\u201d date.'),
		PR('medicare-redet', 'Medicare redetermination: 120 days from receipt', 'appeal', 'notice', 120, 'days', true, 'CMS: request a redetermination within 120 days from the date you receive the initial determination (remittance or MSN). Receipt is presumed to be 5 days after the date on the notice unless there is evidence otherwise (42 CFR 405.942).'),
		PR('medicare-qic', 'Medicare QIC reconsideration: 180 days from receipt', 'appeal', 'notice', 180, 'days', true, 'CMS: request a reconsideration within 180 days from the date you receive the redetermination decision, with the same 5-day receipt presumption (42 CFR 405.962).'),
		PR('ex-90', 'Claim: 90 days from DOS (example)', 'claim', 'dos', 90, 'days', false, EX, 1),
		PR('ex-180', 'Claim: 180 days from DOS (example)', 'claim', 'dos', 180, 'days', false, EX, 1),
		PR('ex-365', 'Claim: 365 days from DOS (example)', 'claim', 'dos', 365, 'days', false, EX, 1),
		PR('ex-corr-90', 'Corrected claim: 90 days from remit (example)', 'corrected', 'notice', 90, 'days', false, EX, 1),
		PR('ex-app-60', 'Appeal: 60 days from denial (example)', 'appeal', 'notice', 60, 'days', false, EX, 1),
		PR('ex-app-180', 'Appeal: 180 days from denial (example)', 'appeal', 'notice', 180, 'days', false, EX, 1)
	];
	var BYID = {}; PRESETS.forEach(function (p) { BYID[p.id] = p; });
	var STATUS = { ok: 'On track', soon: 'Due soon (under 30 days)', over: 'Overdue' };
	function leftText(r) { return r.left > 1 ? r.left + ' days left' : r.left === 1 ? '1 day left' : r.left === 0 ? 'Due today' : 'Overdue by ' + (-r.left) + (r.left === -1 ? ' day' : ' days'); }
	function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
	function unitTxt(n, u) { return n + ' ' + (n === 1 ? u.replace(/s$/, '') : u); }
	function dl(name, text, mime) {
		var url = URL.createObjectURL(new Blob([text], { type: mime })), a = document.createElement('a');
		a.href = url; a.download = name; document.body.appendChild(a); a.click(); document.body.removeChild(a);
		setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
	}
	var ICON_CAL = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M12 14v3l2 1"/></svg>';

	/* ---------- full calculator ---------- */
	function initFull(root) {
		if (root.__mbxTfl) { return; } root.__mbxTfl = true;
		var p = 'mbxtfl' + (++uid);
		var opt = function (o) { return Object.keys(o).map(function (k) { return '<option value="' + k + '">' + esc(o[k]) + '</option>'; }).join(''); };
		root.innerHTML =
			'<div class="mbx-tfl__grid"><form class="mbx-tfl__card" novalidate aria-labelledby="' + p + '-h">' +
			'<h2 id="' + p + '-h"><span class="mbx-tfl__ic">' + ICON_CAL + '</span>Deadline details</h2>' +
			'<p class="mbx-tfl__privacy">Runs in your browser. Nothing is saved or sent.</p>' +
			'<div class="mbx-tfl__fld"><label for="' + p + '-preset">Rule / preset</label><select id="' + p + '-preset" name="preset" aria-describedby="' + p + '-pn"><option value="custom">Custom limit</option>' +
			'<optgroup label="Medicare (CMS rules)">' + PRESETS.filter(function (x) { return !x.ex; }).map(function (x) { return '<option value="' + x.id + '">' + esc(x.label) + '</option>'; }).join('') + '</optgroup>' +
			'<optgroup label="Examples \u2013 verify your contract">' + PRESETS.filter(function (x) { return x.ex; }).map(function (x) { return '<option value="' + x.id + '">' + esc(x.label) + '</option>'; }).join('') + '</optgroup></select>' +
			'<p class="mbx-tfl__pnote" id="' + p + '-pn" data-pnote></p></div>' +
			'<div class="mbx-tfl__two"><div class="mbx-tfl__fld"><label for="' + p + '-type">Deadline type</label><select id="' + p + '-type" name="type">' + opt(TYPES) + '</select></div>' +
			'<div class="mbx-tfl__fld"><label for="' + p + '-basis">Count from</label><select id="' + p + '-basis" name="basis">' + opt(BASIS) + '</select></div></div>' +
			'<div class="mbx-tfl__fld"><label for="' + p + '-start" data-start-l>Date of service</label><input type="date" id="' + p + '-start" name="start" required></div>' +
			'<fieldset class="mbx-tfl__limit"><legend>Filing limit</legend><div class="mbx-tfl__two">' +
			'<div class="mbx-tfl__fld"><label for="' + p + '-n">Number</label><input type="number" id="' + p + '-n" name="n" min="1" max="3650" step="1" inputmode="numeric" value="90"></div>' +
			'<div class="mbx-tfl__fld"><label for="' + p + '-unit">Unit</label><select id="' + p + '-unit" name="unit"><option value="days">Days</option><option value="months">Months</option><option value="years">Years</option></select></div></div></fieldset>' +
			'<label class="mbx-tfl__chk"><input type="checkbox" name="mail" id="' + p + '-mail"> <span>Add the 5-day mail presumption (notice presumed received 5 days after its date)</span></label>' +
			'<div class="mbx-tfl__fld"><label for="' + p + '-ref">Calendar label <span class="mbx-tfl__opt">(optional, no patient names)</span></label><input type="text" id="' + p + '-ref" name="ref" maxlength="60" placeholder="e.g. Payer A appeal, claim batch 12" autocomplete="off"></div>' +
			'<div class="mbx-tfl__acts"><button type="submit" class="mbx-tfl__btn">Calculate</button><button type="button" class="mbx-tfl__btn mbx-tfl__btn--ghost" data-act="reset">Reset</button></div>' +
			'</form>' +
			'<section class="mbx-tfl__card mbx-tfl__out" aria-labelledby="' + p + '-rh"><h2 id="' + p + '-rh">Your deadline</h2><div data-out role="status" aria-live="polite" aria-atomic="true"></div>' +
			'<div class="mbx-tfl__acts" data-icswrap hidden><button type="button" class="mbx-tfl__btn" data-act="ics">Add to calendar (.ics)</button></div>' +
			'<p class="mbx-tfl__fine">Day counting: the day after the start date is day 1. Month and year limits land on the same calendar day; when that day doesn\u2019t exist (for example Feb 29 or the 31st), the last day of the month is used. Some payers count differently or move weekend deadlines; when in doubt, file early.</p></section></div>' +
			'<p class="mbx-tfl__disc"><b>Disclaimer:</b> Educational estimate only. Your payer contract, provider manual or the notice itself controls the actual deadline.</p>';
		var form = root.querySelector('form'), out = root.querySelector('[data-out]'), icsw = root.querySelector('[data-icswrap]'), pnote = root.querySelector('[data-pnote]');
		var E = function (n) { return form.elements[n]; }, last = null;
		function applyPreset(id) {
			var x = BYID[id];
			if (x) { E('type').value = x.type; E('basis').value = x.basis; E('n').value = x.n; E('unit').value = x.unit; E('mail').checked = x.mail; }
			pnote.textContent = x ? x.note : 'Enter the limit from your payer contract or provider manual.';
			pnote.className = 'mbx-tfl__pnote' + (x && x.ex ? ' is-ex' : '');
		}
		function label() { root.querySelector('[data-start-l]').textContent = BASIS[E('basis').value]; }
		function calc(announce) {
			label();
			var o = { start: E('start').value, n: E('n').value, unit: E('unit').value, mail: E('mail').checked }, r = compute(o);
			last = r;
			if (!r) {
				out.innerHTML = '<p class="mbx-tfl__empty">' + (o.start ? 'Enter a limit between 1 and 3650.' : 'Enter a start date to see the deadline.') + '</p>';
				icsw.hidden = true; return;
			}
			var steps = '<li>' + esc(BASIS[E('basis').value]) + ': <b>' + fmt(r.start) + '</b></li>';
			if (o.mail) { steps += '<li>+ 5 days mail presumption = presumed receipt <b>' + fmt(r.base) + '</b></li>'; }
			steps += '<li>+ ' + unitTxt(+o.n, o.unit) + ' = <b>' + fmt(r.deadline) + '</b></li>';
			out.innerHTML = '<div class="mbx-tfl__res is-' + r.status + '"><span class="mbx-tfl__badge">' + STATUS[r.status] + '</span>' +
				'<p class="mbx-tfl__type">' + esc(TYPES[E('type').value]) + ' deadline</p><p class="mbx-tfl__date">' + fmt(r.deadline, true) + '</p>' +
				'<p class="mbx-tfl__left">' + leftText(r) + '</p></div><ol class="mbx-tfl__steps">' + steps + '</ol>' +
				(r.weekend ? '<p class="mbx-tfl__warn">This date falls on a weekend. Don\u2019t count on an extension; file by the prior business day unless your payer\u2019s rules say otherwise.</p>' : '') +
				(BYID[E('preset').value] && BYID[E('preset').value].ex ? '<p class="mbx-tfl__warn">Example limit. Verify it against your contract.</p>' : '');
			icsw.hidden = false;
		}
		form.addEventListener('submit', function (e) { e.preventDefault(); calc(true); });
		form.addEventListener('input', function (e) { if (e.target.name === 'preset') { return; } if (['type', 'basis', 'n', 'unit', 'mail'].indexOf(e.target.name) > -1 && E('preset').value !== 'custom') { E('preset').value = 'custom'; applyPreset('custom'); } calc(); });
		form.addEventListener('change', function (e) { if (e.target.name === 'preset') { applyPreset(e.target.value); } calc(); });
		root.addEventListener('click', function (e) {
			var b = e.target.closest('[data-act]'); if (!b) { return; }
			if (b.getAttribute('data-act') === 'reset') { form.reset(); E('preset').value = 'medicare-claim'; applyPreset('medicare-claim'); calc(); E('preset').focus(); }
			if (b.getAttribute('data-act') === 'ics' && last) {
				var t = TYPES[E('type').value], ref = E('ref').value.trim();
				dl('deadline-' + iso(last.deadline) + '.ics', ics(last.deadline, t + ' deadline' + (ref ? ': ' + ref : ''),
					t + ' deadline calculated with the Medical Billing 101 Timely Filing Calculator: ' + unitTxt(+E('n').value, E('unit').value) + ' from ' + BASIS[E('basis').value].toLowerCase() + ' ' + fmt(last.start) + (E('mail').checked ? ' (+5 days mail presumption)' : '') + '. Verify against your payer rules.'), 'text/calendar;charset=utf-8');
			}
		});
		var pre = root.getAttribute('data-preset'); E('preset').value = BYID[pre] ? pre : 'medicare-claim'; applyPreset(E('preset').value); calc();
	}

	/* ---------- mini widget (denial-code pages) ---------- */
	var MINI = [
		['medicare-redet', 'Medicare (Part A/B)', 'Redetermination due by'],
		['medicare-qic', 'Medicare: QIC reconsideration', 'Reconsideration due by'],
		['ex-app-180', 'Commercial (example: 180 days)', 'Appeal due by']
	];
	function initMini(root) {
		if (root.__mbxTfl) { return; } root.__mbxTfl = true;
		var p = 'mbxtflm' + (++uid), url = root.getAttribute('data-url') || '/tools/timely-filing-calculator/';
		root.innerHTML = '<form class="mbx-tfl-mini__in" novalidate aria-labelledby="' + p + '-h"><p class="mbx-tfl-mini__h" id="' + p + '-h">' + ICON_CAL + ' When is your appeal due?</p>' +
			'<div class="mbx-tfl-mini__row"><div class="mbx-tfl-mini__f"><label for="' + p + '-p">Payer</label><select id="' + p + '-p" name="preset">' + MINI.map(function (m) { return '<option value="' + m[0] + '">' + esc(m[1]) + '</option>'; }).join('') + '</select></div>' +
			'<div class="mbx-tfl-mini__f"><label for="' + p + '-d">Initial determination / EOB date</label><input type="date" id="' + p + '-d" name="start"></div>' +
			'<button type="submit" class="mbx-tfl__btn">Calculate</button></div>' +
			'<div class="mbx-tfl-mini__res" data-out role="status" aria-live="polite"></div>' +
			'<a class="mbx-tfl-mini__more" href="' + esc(url) + '">Open the full Timely Filing Deadline Calculator &rarr;</a></form>';
		var form = root.querySelector('form'), out = root.querySelector('[data-out]');
		var pre = root.getAttribute('data-preset'); if (BYID[pre]) { form.elements.preset.value = pre; }
		function calc() {
			var id = form.elements.preset.value, x = BYID[id], m = MINI.filter(function (q) { return q[0] === id; })[0];
			var r = compute({ start: form.elements.start.value, n: x.n, unit: x.unit, mail: x.mail });
			if (!r) { out.className = 'mbx-tfl-mini__res'; out.innerHTML = 'Pick the date on the denial notice or EOB.'; return; }
			out.className = 'mbx-tfl-mini__res is-' + r.status;
			out.innerHTML = m[2] + ' <b>' + fmt(r.deadline) + '</b> (' + x.n + ' days from ' + (x.mail ? 'receipt; receipt presumed 5 days after notice date' : 'the notice date') + '). <span class="mbx-tfl-mini__left">' + leftText(r) + '.</span>' + (x.ex ? ' Example limit; verify your contract.' : '');
		}
		form.addEventListener('submit', function (e) { e.preventDefault(); calc(); });
		form.addEventListener('change', calc);
		calc();
	}

	function boot() { document.querySelectorAll('[data-mbx-tfl]').forEach(initFull); document.querySelectorAll('[data-mbx-tfl-mini]').forEach(initMini); }
	if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', boot); } else { boot(); }
	window.MBXTFL = { parse: parse, iso: iso, addDays: addDays, addMonths: addMonths, addLimit: addLimit, compute: compute, ics: ics, presets: PRESETS };
})();
