#!/usr/bin/env python3
"""Builds the presentation into standalone pages: index.html, and the talks.

presentation/ is a GAS project (see gas/README.md): the decks and exercises,
topic by topic. talks/ holds two more, the talks its Bonus Content embeds.
This script builds each with gas/build.py, then inlines every stylesheet,
script, font and image into the page, so that each runs on its own - opened
from disk, or served by GitHub Pages:

    python3 build.py [output.html]

writes output.html (index.html by default) and, next to it,
talks/<talk>.html for every talk. Only the Python standard library is needed.
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
TALKS = ROOT / "talks"
DEFAULT_OUT = ROOT / "index.html"

LINK = re.compile(r'<link rel="stylesheet"((?: data-palette="[^"]*")?) href="([^"]+)">')
SCRIPT = re.compile(r'<script src="([^"]+)"></script>')
IMG_SRC = re.compile(r'(<img\b[^>]*?\ssrc=")([^"]+)(")')
CSS_URL = re.compile(r'url\((["\']?)(?!data:|#|https?:)([^"\')]+)\1\)')
ASSET_STRING = re.compile(r'"(assets/[^"]+)"')
# a picture in an exercise's markdown: app.js reads _images/ as assets/tutorials/
MD_IMAGE = re.compile(r'(!\[[^\]]*\]\()_images/([^)\s]+)')
# the talks are pages of their own, next to this one
LOCAL_PAGE = re.compile(r'^talks/[\w-]+\.html$')


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
    page = MD_IMAGE.sub(
        lambda m: m.group(1) + data_uri(base / "assets" / "tutorials" / m.group(2)), page)
    # where the editor of gas/dev.py would save a slide: not this page's business
    page = re.sub(r' data-src="[^"]*" data-src-kind="[^"]*"', "", page)
    markup = SCRIPT.sub("", LINK.sub("", page))
    left = [
        url for url in
        re.findall(r'(?<![\w-])(?:src|href)="(?!data:|#|https?:|mailto:)([^"]+)"', markup)
        if not LOCAL_PAGE.match(url)
    ]
    if left:
        sys.exit(f"build.py: still pointing outside the page: {sorted(set(left))}")
    page = LINK.sub(
        lambda m: f"<style{m.group(1)}>\n{inline_css(base / m.group(2))}\n</style>", page)
    page = SCRIPT.sub(
        lambda m: f"<script>\n{inline_script(base / m.group(1))}\n</script>", page)
    return page


def build(project, out):
    """builds one GAS project into one standalone page, at out"""
    with tempfile.TemporaryDirectory() as tmp:
        site = Path(tmp) / "site"
        code = subprocess.call(
            [sys.executable, str(ROOT / "gas" / "build.py"), str(project), str(site)])
        if code:
            sys.exit(code)
        page = standalone(site / project.name / "index.html")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(page, encoding="utf-8")
    print(f"wrote {out.relative_to(ROOT) if out.is_relative_to(ROOT) else out} "
          f"({len(page) / 1e6:.1f} MB)")


def main():
    args = sys.argv[1:]
    if len(args) > 1:
        sys.exit("usage: python3 build.py [output.html]")
    out = Path(args[0]).resolve() if args else DEFAULT_OUT
    build(PROJECT, out)
    for talk in sorted(TALKS.iterdir()):
        if (talk / "config.js").is_file():
            build(talk, out.parent / "talks" / f"{talk.name}.html")

if __name__ == "__main__":
    main()
