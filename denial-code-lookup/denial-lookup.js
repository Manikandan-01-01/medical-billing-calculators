(function () {
  var q = document.getElementById('dcl-q');
  var cat = document.getElementById('dcl-cat');
  var grp = document.getElementById('dcl-grp');
  var count = document.getElementById('dcl-count');
  var rows = [].slice.call(document.querySelectorAll('#dcl-table tbody tr'));
  function norm(s) { return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ''); }
  function go() {
    var query = (q.value || '').trim().toLowerCase();
    var qn = norm(query);
    var c = cat.value, g = grp.value, n = 0;
    rows.forEach(function (tr) {
      var text = tr.textContent.toLowerCase();
      var code = norm(tr.cells[0].textContent);
      var digits = code.replace(/^[a-z]+/, '');
      var ok = true;
      if (query) {
        ok = text.indexOf(query) !== -1 || code.indexOf(qn) !== -1 || (qn && (code === qn || digits === qn));
      }
      if (ok && c && tr.getAttribute('data-cat') !== c) ok = false;
      if (ok && g && tr.getAttribute('data-grp').split(/\s+/).indexOf(g) === -1) ok = false;
      tr.hidden = !ok;
      if (ok) n++;
    });
    count.textContent = n + ' of ' + rows.length + ' codes';
  }
  q.addEventListener('input', go);
  cat.addEventListener('change', go);
  grp.addEventListener('change', go);
  go();
})();
