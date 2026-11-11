#!/usr/bin/env python3
"""Serve this kit and proxy NPI lookups to the public CMS NPPES API.

The official NPPES API does not send CORS headers, so a browser page cannot
call it directly. This server serves the files and forwards GET /api/npi?...
to https://npiregistry.cms.hhs.gov/api/?version=2.1.

Usage (from this directory):

    python3 serve.py

Then open http://127.0.0.1:8765/
"""
from __future__ import annotations

import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlencode, urlparse
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

ROOT = Path(__file__).resolve().parent
NPPES = "https://npiregistry.cms.hhs.gov/api/"
ALLOWED = {
    "number",
    "first_name",
    "last_name",
    "organization_name",
    "state",
    "city",
    "limit",
    "enumeration_type",
    "version",
}


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args):
        # Log method and path without the query string (name searches stay off the console).
        sys_stderr = __import__("sys").stderr
        path = self.path.split("?", 1)[0]
        sys_stderr.write("%s - %s %s\n" % (self.address_string(), self.command, path))

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path.rstrip("/") == "/api/npi":
            return self._proxy_npi(parsed.query)
        return super().do_GET()

    def _proxy_npi(self, query: str) -> None:
        raw = parse_qs(query, keep_blank_values=False)
        extra = set(raw) - ALLOWED
        if extra:
            return self._json(400, b'{"Errors":[{"description":"Unexpected query parameter."}]}')
        q = {}
        for key, values in raw.items():
            q[key] = values[0]
        q.setdefault("version", "2.1")
        url = NPPES + "?" + urlencode(q)
        req = Request(
            url,
            headers={
                "Accept": "application/json",
                "User-Agent": "MedicalBilling101-calculators-kit/1.0 (+https://medicalbilling101.com/tools/npi-lookup/)",
            },
        )
        try:
            with urlopen(req, timeout=8) as resp:
                body = resp.read()
                status = resp.getcode() or 200
        except HTTPError as e:
            body = e.read() or b'{"Errors":[{"description":"The NPPES NPI Registry did not respond."}]}'
            status = e.code
        except URLError:
            return self._json(502, b'{"Errors":[{"description":"The NPPES NPI Registry did not respond. Please try again in a moment."}]}')
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _json(self, status: int, body: bytes) -> None:
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main() -> None:
    parser = argparse.ArgumentParser(description="Serve the calculator kit and proxy NPI lookups.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()
    httpd = ThreadingHTTPServer((args.host, args.port), Handler)
    print("Serving %s" % ROOT)
    print("Open http://%s:%s/" % (args.host, args.port))
    print("Stop with Ctrl+C")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped")
        httpd.server_close()


if __name__ == "__main__":
    main()
