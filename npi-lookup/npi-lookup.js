/* Medical Billing 101 - Free NPI Lookup (vanilla JS, no dependencies).
 *
 * This copy calls the public CMS NPPES NPI Registry API (version 2.1)
 * directly and maps each record into the same card shape as the live site.
 * The live page uses a WordPress REST proxy at /wp-json/mbx/v1/npi only
 * for rate-limiting; no WordPress endpoint is required here.
 *
 * A network connection is required. Serve the page over HTTP (not file://).
 * If a browser blocks the request, use https://npiregistry.cms.hhs.gov/.
 */
(function () {
  var root = document.querySelector('[data-mbx-npi]');
  if (!root) return;
  var form = root.querySelector('form'), out = root.querySelector('.mbx-npi__out');
  var OFFICIAL = 'https://npiregistry.cms.hhs.gov/api/?version=2.1';
  // Same-origin proxy provided by serve.py at the repo root. The official
  // NPPES API does not allow cross-origin browser calls, so a local page
  // has to go through this proxy (or WordPress, on the live site).
  var NPPES = (location.protocol === 'http:' || location.protocol === 'https:')
    ? '/api/npi?version=2.1'
    : OFFICIAL;
  var btn = form.querySelector('button'), H = 'https://medicalbilling101.com/denial-codes/';
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function mode() { return form.querySelector('input[name=mode]:checked').value; }
  function sync() {
    var m = mode();
    [].forEach.call(form.querySelectorAll('[data-m]'), function (r) { r.hidden = r.getAttribute('data-m').split(' ').indexOf(m) < 0; });
  }
  [].forEach.call(form.querySelectorAll('input[name=mode]'), function (r) { r.addEventListener('change', sync); });
  function luhn(n) {
    if (!/^[12]\d{9}$/.test(n)) return false;
    var s = '80840' + n, sum = 0, alt = false;
    for (var i = s.length - 1; i >= 0; i--) { var d = +s[i]; if (alt) { d *= 2; if (d > 9) d -= 9; } sum += d; alt = !alt; }
    return sum % 10 === 0;
  }

  function s(obj, k) {
    var v = obj && obj[k];
    return (v == null || typeof v === 'object') ? '' : String(v);
  }
  function trimRecord(r) {
    var b = r.basic || {};
    var type = s(r, 'enumeration_type');
    var name;
    if (type === 'NPI-2') {
      name = s(b, 'organization_name');
    } else {
      name = [s(b, 'first_name'), s(b, 'middle_name'), s(b, 'last_name'), s(b, 'name_suffix')].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
      if (s(b, 'credential')) name += ', ' + s(b, 'credential');
    }
    var addr = {}, addresses = Array.isArray(r.addresses) ? r.addresses : [];
    for (var i = 0; i < addresses.length; i++) {
      var a = addresses[i];
      if (s(a, 'address_purpose') === 'LOCATION') {
        var zip = s(a, 'postal_code');
        addr = {
          line1: s(a, 'address_1'),
          line2: s(a, 'address_2'),
          city: s(a, 'city'),
          state: s(a, 'state'),
          zip: zip.length === 9 ? zip.slice(0, 5) + '-' + zip.slice(5) : zip,
          phone: s(a, 'telephone_number')
        };
        break;
      }
    }
    var tax = [];
    var taxes = Array.isArray(r.taxonomies) ? r.taxonomies.slice(0, 15) : [];
    taxes.forEach(function (t) {
      tax.push({ code: s(t, 'code'), desc: s(t, 'desc'), state: s(t, 'state'), primary: !!t.primary });
    });
    return {
      npi: s(r, 'number').replace(/\D/g, ''),
      type: type,
      name: name,
      status: s(b, 'status'),
      enumerated: s(b, 'enumeration_date'),
      updated: s(b, 'last_updated'),
      address: addr,
      taxonomies: tax
    };
  }
  function msg(t, cls) { out.textContent = ''; out.appendChild(el('p', 'mbx-npi__msg ' + (cls || ''), t)); }
  function fmtDate(d) { if (!d) return ''; var p = d.split('-'); return p.length === 3 ? p[1] + '/' + p[2] + '/' + p[0] : d; }
  function row(dl, k, v) { if (!v) return; dl.appendChild(el('dt', '', k)); var dd = el('dd'); if (typeof v === 'string') dd.textContent = v; else dd.appendChild(v); dl.appendChild(dd); }
  function link(href, t) { var a = el('a', '', t); a.href = href; return a; }
  function card(r) {
    var c = el('article', 'mbx-npi__card');
    var h = el('h3', '', r.name || 'Name not listed'); c.appendChild(h);
    var tags = el('p', 'mbx-npi__tags');
    tags.appendChild(el('span', 'mbx-npi__tag', 'NPI ' + r.npi));
    tags.appendChild(el('span', 'mbx-npi__tag', r.type === 'NPI-2' ? 'Type 2 · Organization' : 'Type 1 · Individual'));
    tags.appendChild(el('span', 'mbx-npi__tag ' + (r.status === 'A' ? 'is-ok' : 'is-bad'), r.status === 'A' ? 'Active' : 'Not active'));
    c.appendChild(tags);
    var dl = el('dl', 'mbx-npi__dl'), pri = null, oth = [];
    (r.taxonomies || []).forEach(function (t) { if (t.primary && !pri) pri = t; else oth.push(t); });
    if (!pri && oth.length) pri = oth.shift();
    row(dl, 'Primary taxonomy', pri ? pri.code + ' · ' + pri.desc + (pri.state ? ' (' + pri.state + ')' : '') : '');
    row(dl, 'Other taxonomies', oth.map(function (t) { return t.code + ' · ' + t.desc; }).join('; '));
    var a = r.address || {};
    row(dl, 'Practice address', [a.line1, a.line2, [a.city, a.state].filter(Boolean).join(', ') + (a.zip ? ' ' + a.zip : '')].filter(Boolean).join(', '));
    row(dl, 'Phone', a.phone);
    row(dl, 'Enumeration date', fmtDate(r.enumerated));
    row(dl, 'Last updated', fmtDate(r.updated));
    c.appendChild(dl);
    var off = link('https://npiregistry.cms.hhs.gov/provider-view/' + r.npi, 'View official NPPES record');
    off.target = '_blank'; off.rel = 'noopener'; off.className = 'mbx-npi__off';
    c.appendChild(off);
    return c;
  }
  function tips() {
    var d = el('div', 'mbx-npi__tips'), ul = el('ul');
    d.appendChild(el('p', '', 'Billing tips'));
    [['Billing NPI missing on the claim? See ', 'CO-206', 'co-206/'], ['NPI rejected as invalid format? See ', 'CO-207', 'co-207/'], ['NPI does not match the payer\u2019s file? See ', 'CO-208', 'co-208/'], ['Rendering NPI missing or invalid? See ', 'N290', 'n290/'], ['Service not allowed for the provider type or taxonomy? See ', 'CO-8', 'co-8/']].forEach(function (t) {
      var li = el('li', '', t[0]); li.appendChild(link(H + t[2], t[1] + ' fix steps')); ul.appendChild(li);
    });
    d.appendChild(ul); return d;
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var m = mode(), p = {}, v = function (n) { return (form.elements[n].value || '').trim(); };
    if (m === 'npi') {
      var n = v('number').replace(/\D/g, '');
      if (!luhn(n)) return msg('That is not a valid NPI. An NPI has 10 digits, starts with 1 or 2 and must pass the check digit test.', 'is-err');
      p.number = n;
    } else {
      var nm = m === 'ind' ? 'last_name' : 'organization_name';
      if (v(nm).length < 2) return msg(m === 'ind' ? 'Enter a last name (2+ letters).' : 'Enter an organization name (2+ letters).', 'is-err');
      if (!v('state')) return msg('Choose a state.', 'is-err');
      p[nm] = v(nm); p.state = v('state');
      if (m === 'ind') { p.enumeration_type = 'NPI-1'; if (v('first_name')) p.first_name = v('first_name'); }
      else { p.enumeration_type = 'NPI-2'; }
      if (v('city')) p.city = v('city');
      p.limit = 20;
    }
    var qs = Object.keys(p).map(function (k) { return k + '=' + encodeURIComponent(p[k]); }).join('&');
    btn.disabled = true; msg('Searching the NPPES NPI Registry\u2026');
    fetch(NPPES + '&' + qs, { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (x) {
        var j = x.j || {};
        if (j.Errors && j.Errors.length) {
          var d = j.Errors[0] && j.Errors[0].description ? j.Errors[0].description : 'Search not accepted.';
          return msg(d, 'is-err');
        }
        if (!x.ok) return msg('The NPPES NPI Registry did not respond. Please try again in a moment.', 'is-err');
        var res = (j.results || []).map(trimRecord);
        if (!res.length) return msg('No providers matched. Check the spelling, try fewer fields, or add * after 2+ letters (e.g. smi*).');
        out.textContent = '';
        out.appendChild(el('p', 'mbx-npi__count', res.length === 1 ? '1 provider found' : res.length + ' providers found' + (res.length >= 20 ? ' (first 20 shown; add a first name or city to narrow)' : '')));
        res.forEach(function (r) { out.appendChild(card(r)); });
        out.appendChild(tips());
      })
      ['catch'](function () { msg('The NPI Registry could not be reached. From this kit, run python3 serve.py in the repo root and open the URL it prints, or search at https://npiregistry.cms.hhs.gov/.', 'is-err'); })
      .then(function () { btn.disabled = false; });
  });
})();
