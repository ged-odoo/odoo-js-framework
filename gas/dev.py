#!/usr/bin/env python3
"""Local dev convenience for a GAS project: builds it, serves it, and keeps
rebuilding in the background as you edit, in one command.

    python3 gas/dev.py <project-dir> <site-dir> [port]

default port 8000. Always watches and rebuilds - "Edit source" (?mode=edit,
see gas/README.md) saves straight to a project's real files and relies on
that rebuild to show up, so there's no static, watch-less mode to fall out
of sync with a save; --watch is still accepted (and ignored) for anyone's
muscle memory.

Then open http://localhost:<port>/ - <site-dir>'s own root redirects to
the project (see gas/build.py).

Only the standard library is used.
"""

import functools
import http.server
import json
import re
import sys
import threading
import urllib.parse
from pathlib import Path

GAS_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(GAS_DIR))
import build as gas_build  # noqa: E402 - needs sys.path set first

# ---------- ?mode=edit's "Edit source" - reads/writes real project files ----------
#
# Only dev.py runs an actual server (the published site, and a plain
# build.py + http.server, don't), so this is the one place a save can
# happen at all. app.js talks to it as a small JSON API; see gas/CLAUDE.md
# for the four addressing "kind"s (html-block / markdown-file /
# markdown-heading / markdown-solution) and gas/build.py's stamp_source for
# where a page learns its own file and kind (data-src/data-src-kind).

STEP_HEADING = re.compile(r"^## (.+)$", re.M)
DETAILS = re.compile(r"<details>[\s\S]*?</details>")


class SourceError(Exception):
    pass


def resolve_project_path(project_dir, rel_path):
    """<rel_path> (as sent by the client, relative to the project - the same
    shape build.py already stamps onto every page) resolved against the real
    project directory on disk, refusing to leave it (a rogue or buggy
    ../../ would otherwise read/write anywhere on the machine)."""
    if not rel_path:
        raise SourceError("no file given")
    base = Path(project_dir).resolve()
    target = (base / rel_path).resolve()
    if target != base and base not in target.parents:
        raise SourceError(f"{rel_path}: not under the project directory")
    if not target.is_file():
        raise SourceError(f"{rel_path}: no such file")
    return target


def find_html_block(text, data_id):
    """the single <article>/<section> tagged data-id="<data_id>", start to
    end (its own closing tag) - a slide, or a plain (non-markdown) project
    or view. Raises if it's missing, or not unique (ids are meant to be
    unique within a project; a save must never guess between two matches)."""
    pattern = re.compile(r'<(article|section)\b[^>]*\bdata-id="' + re.escape(data_id) + r'"[^>]*>[\s\S]*?</\1>')
    matches = list(pattern.finditer(text))
    if not matches:
        raise SourceError(f'no element with data-id="{data_id}"')
    if len(matches) > 1:
        raise SourceError(f'more than one element with data-id="{data_id}" - not touching either')
    m = matches[0]
    return m.start(), m.end()


def find_step(text, heading):
    """an exercise's own "## <heading>" line up to (not including) the next
    "## " heading, or the end of the file - one numbered step's whole text."""
    headings = list(STEP_HEADING.finditer(text))
    for i, m in enumerate(headings):
        if m.group(1).strip() == heading:
            end = headings[i + 1].start() if i + 1 < len(headings) else len(text)
            return m.start(), end
    raise SourceError(f'no "## {heading}" heading')


def find_solution(text, heading):
    """the single <details>...</details> (a solution) inside the step
    "## <heading>" - same step-scoping as find_step, then the first details
    block found in it (an exercise step has exactly one, per gas/CLAUDE.md)."""
    start, end = find_step(text, heading)
    m = DETAILS.search(text, start, end)
    if not m:
        raise SourceError(f'no <details> (solution) under "## {heading}"')
    return m.start(), m.end()


def find_span(text, kind, data_id, heading):
    """(start, end) of the span `kind` addresses in `text`. Raises
    SourceError if kind is unknown or nothing matches. "markdown-file" has
    no span of its own - the whole file is the unit - callers handle it
    before ever reaching here."""
    if kind == "html-block":
        return find_html_block(text, data_id)
    if kind == "markdown-heading":
        return find_step(text, heading)
    if kind == "markdown-solution":
        return find_solution(text, heading)
    raise SourceError(f"unknown kind {kind!r}")


def read_source(project_dir, file, kind, data_id, heading):
    """the current text of the span `kind` addresses in `file` - the whole
    file itself for "markdown-file". Raises SourceError on any problem."""
    path = resolve_project_path(project_dir, file)
    text = path.read_text(encoding="utf-8")
    if kind == "markdown-file":
        return text
    start, end = find_span(text, kind, data_id, heading)
    return text[start:end]


def write_source(project_dir, file, kind, data_id, heading, new_text):
    """replaces the span `kind` addresses in `file` with `new_text` (the
    whole file for "markdown-file") - re-reading and re-finding the span
    fresh each time, never trusting a span position a client might have
    cached from an earlier read that's since gone stale."""
    path = resolve_project_path(project_dir, file)
    if kind == "markdown-file":
        path.write_text(new_text, encoding="utf-8")
        return
    text = path.read_text(encoding="utf-8")
    start, end = find_span(text, kind, data_id, heading)
    path.write_text(text[:start] + new_text + text[end:], encoding="utf-8")


class Handler(http.server.SimpleHTTPRequestHandler):
    """Serves site_dir like the plain SimpleHTTPRequestHandler always did,
    plus the small /api/source JSON API "Edit source" (?mode=edit) talks to
    - project_dir is a class attribute (set once in main(), below) rather
    than a constructor argument, since BaseHTTPRequestHandler's own __init__
    already runs the request before a subclass could intervene."""

    project_dir = None

    def _send_json(self, status, obj):
        body = json.dumps(obj).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path.startswith("/api/source"):
            query = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            file = (query.get("file") or [""])[0]
            kind = (query.get("kind") or [""])[0]
            data_id = (query.get("id") or [""])[0]
            heading = (query.get("heading") or [""])[0]
            try:
                source = read_source(self.project_dir, file, kind, data_id, heading)
            except SourceError as error:
                return self._send_json(404, {"ok": False, "error": str(error)})
            return self._send_json(200, {"ok": True, "source": source})
        return super().do_GET()

    def do_POST(self):
        if self.path != "/api/source":
            return self._send_json(404, {"ok": False, "error": "not found"})
        length = int(self.headers.get("Content-Length", 0))
        try:
            body = json.loads(self.rfile.read(length))
        except ValueError:
            return self._send_json(400, {"ok": False, "error": "bad JSON body"})
        try:
            write_source(
                self.project_dir,
                body.get("file", ""),
                body.get("kind", ""),
                body.get("id", ""),
                body.get("heading", ""),
                body.get("source", ""),
            )
        except SourceError as error:
            return self._send_json(409, {"ok": False, "error": str(error)})
        return self._send_json(200, {"ok": True})


def main():
    argv = sys.argv[1:]
    positional = [a for a in argv if not a.startswith("--")]
    if len(positional) < 2:
        sys.exit("usage: dev.py <project-dir> <site-dir> [port]")
    project_dir, site_dir = positional[0], positional[1]
    port = int(positional[2]) if len(positional) > 2 else 8000

    # one build up front, so the first request has something to serve before
    # the watcher thread's own first pass (below) even gets scheduled
    try:
        gas_build.build(project_dir, site_dir)
    except gas_build.BuildError as error:
        sys.exit(f"dev.py: {error}")

    # a thread, not a subprocess: a subprocess would keep running on its own
    # if dev.py is killed outright (a daemon thread can't - it dies the
    # moment this process does, which is the point). Always on, not behind
    # --watch: "Edit source" (?mode=edit) saves straight to a project's real
    # files and relies on this to show up, so dev.py never serves a stale
    # build a save just wrote past.
    watcher = threading.Thread(
        target=gas_build.watch, args=(project_dir, site_dir), daemon=True
    )
    watcher.start()

    Handler.project_dir = project_dir
    handler = functools.partial(Handler, directory=site_dir)
    http.server.ThreadingHTTPServer.allow_reuse_address = True
    with http.server.ThreadingHTTPServer(("", port), handler) as httpd:
        print(f"serving {site_dir} at http://localhost:{port}/ (watching for changes)")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print()


if __name__ == "__main__":
    main()
