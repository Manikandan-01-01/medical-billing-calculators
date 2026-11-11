/*!
 * Medical Billing 101 – minimal .docx writer (store-only ZIP + WordprocessingML). No dependencies.
 * MBX_DOCX.build(blocks) -> Blob. blocks: [{lines:[[{t:'text', b:bold}]]}]
 */
window.MBX_DOCX = (function () {
	'use strict';
	function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
	var CRC = (function () { var t = [], c, n, k; for (n = 0; n < 256; n++) { c = n; for (k = 0; k < 8; k++) { c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; } t[n] = c >>> 0; } return t; })();
	function crc32(u) { var c = 0xFFFFFFFF; for (var i = 0; i < u.length; i++) { c = CRC[(c ^ u[i]) & 255] ^ (c >>> 8); } return (c ^ 0xFFFFFFFF) >>> 0; }
	function zip(files) {
		var enc = new TextEncoder(), parts = [], cen = [], off = 0, now = new Date();
		var dt = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xFFFF, dd = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xFFFF;
		files.forEach(function (f) {
			var name = enc.encode(f[0]), data = enc.encode(f[1]), crc = crc32(data);
			var h = new DataView(new ArrayBuffer(30));
			h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
			h.setUint16(10, dt, true); h.setUint16(12, dd, true); h.setUint32(14, crc, true); h.setUint32(18, data.length, true); h.setUint32(22, data.length, true);
			h.setUint16(26, name.length, true); h.setUint16(28, 0, true);
			var c = new DataView(new ArrayBuffer(46));
			c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(10, 0, true);
			c.setUint16(12, dt, true); c.setUint16(14, dd, true); c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true);
			c.setUint16(28, name.length, true); c.setUint32(42, off, true);
			parts.push(h.buffer, name, data); cen.push(c.buffer, name);
			off += 30 + name.length + data.length;
		});
		var csz = cen.reduce(function (a, b) { return a + b.byteLength; }, 0), e = new DataView(new ArrayBuffer(22));
		e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, csz, true); e.setUint32(16, off, true);
		return new Blob(parts.concat(cen, [e.buffer]), { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
	}
	function xesc(s) { return esc(s).replace(/&#39;/g, '&apos;'); }
	function toDocx(B) {
		var rp = function (b) { return '<w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>' + (b ? '<w:b/>' : '') + '<w:sz w:val="24"/></w:rPr>'; };
		var body = B.map(function (b) {
			return '<w:p><w:pPr><w:spacing w:after="200" w:line="264" w:lineRule="auto"/></w:pPr>' + b.lines.map(function (ln, i) {
				return (i ? '<w:r><w:br/></w:r>' : '') + ln.map(function (p) { return p.t ? '<w:r>' + rp(p.b) + '<w:t xml:space="preserve">' + xesc(p.t) + '</w:t></w:r>' : ''; }).join('');
			}).join('') + '</w:p>';
		}).join('');
		var doc = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' + body +
			'<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr></w:body></w:document>';
		return zip([
			['[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'],
			['_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'],
			['word/document.xml', doc]
		]);
	}

	return { build: toDocx, zip: zip, crc32: crc32 };
})();
