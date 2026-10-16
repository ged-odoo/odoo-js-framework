#!/usr/bin/env python3
"""Builds the presentation into one standalone page: index.html.

presentation/ is a GAS project (see gas/README.md): one deck, in parts. This
script builds it with gas/build.py, then inlines every stylesheet, script,
font and image into the page, so that index.html runs on its own - opened
from disk, or served by GitHub Pages - with nothing next to it:

    python3 build.py [output.html]

Only the Python standard library is needed.
"""

import base64
import mimetypes
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PROJECT = ROOT / "presentation"
DEFAULT_OUT = ROOT / "index.html"

LINK = re.compile(r'<link rel="stylesheet"((?: data-palette="[^"]*")?) href="([^"]+)">')
SCRIPT = re.compile(r'<script src="([^"]+)"></script>')
IMG_SRC = re.compile(r'(<img\b[^>]*?\ssrc=")([^"]+)(")')
CSS_URL = re.compile(r'url\((["\']?)(?!data:|#|https?:)([^"\')]+)\1\)')
ASSET_STRING = re.compile(r'"(assets/[^"]+)"')

# gas numbers the dividers "Act n of m", as befits a talk. This deck's parts
# are topics: they read as parts.
RELABEL = """<script>
for (const eyebrow of document.querySelectorAll(".slide.divider .divider-eyebrow")) {
  eyebrow.textContent = eyebrow.textContent.replace(/^Act /, "Part ");
}
</script>
"""


def data_uri(path):
    kind = mimetypes.guess_type(path.name)[0]
    if kind is None:
        kind = {".woff2": "font/woff2", ".webp": "image/webp"}.get(path.suffix)
    if kind is None:
        sys.exit(f"build.py: no media type for {path}")
    return f"data:{kind};base64,{base64.b64encode(path.read_bytes()).decode('ascii')}"


def inline_css(path):
    css = path.read_text(encoding="utf-8")
    return CSS_URL.sub(lambda m: f'url("{data_uri(path.parent / m.group(2))}")', css)


def inline_script(path):
    js = path.read_text(encoding="utf-8")
    if path.name == "config.js":
        js = ASSET_STRING.sub(lambda m: f'"{data_uri(path.parent / m.group(1))}"', js)
    if "</script" in js.lower():
        sys.exit(f"build.py: {path} holds a </script, it cannot be inlined")
    return js


def standalone(page_path):
    """the built page, with everything it loads inside it"""
    base = page_path.parent
    page = page_path.read_text(encoding="utf-8")
    # the page's own markup first: once the scripts are in, their strings
    # would look like markup too
    page = IMG_SRC.sub(
        lambda m: m.group(1) + data_uri(base / m.group(2)) + m.group(3), page)
    # where the editor of gas/dev.py would save a slide: not this page's business
    page = re.sub(r' data-src="[^"]*" data-src-kind="[^"]*"', "", page)
    markup = SCRIPT.sub("", LINK.sub("", page))
    left = re.findall(r'(?<![\w-])(?:src|href)="(?!data:|#|https?:|mailto:)([^"]+)"', markup)
    if left:
        sys.exit(f"build.py: still pointing outside the page: {sorted(set(left))}")
    page = LINK.sub(
        lambda m: f"<style{m.group(1)}>\n{inline_css(base / m.group(2))}\n</style>", page)
    page = SCRIPT.sub(
        lambda m: f"<script>\n{inline_script(base / m.group(1))}\n</script>", page)
    return page.replace("</body>", RELABEL + "</body>")


def main():
    args = sys.argv[1:]
    if len(args) > 1:
        sys.exit("usage: python3 build.py [output.html]")
    out = Path(args[0]).resolve() if args else DEFAULT_OUT
    with tempfile.TemporaryDirectory() as tmp:
        site = Path(tmp) / "site"
        code = subprocess.call(
            [sys.executable, str(ROOT / "gas" / "build.py"), str(PROJECT), str(site)])
        if code:
            sys.exit(code)
        page = standalone(site / PROJECT.name / "index.html")
    out.write_text(page, encoding="utf-8")
    print(f"wrote {out.relative_to(ROOT) if out.is_relative_to(ROOT) else out} "
          f"({len(page) / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
