#!/usr/bin/env python3
"""Builds one GAS project into _site/, serves it, and rebuilds it on every
save, in one command:

    python3 dev.py                            the training (presentation/)
    python3 dev.py talk1-introducing-owl3     a talk, from talks/
    python3 dev.py talk1-introducing-owl3 8001

Same as: python3 gas/dev.py <project> _site [port], on port 8000 by default.
Only the project named here is watched and rebuilt. The others stay in _site
as they were last built.

This preview does not inline anything, unlike build.py: the talks the Bonus
Content embeds (talks/<talk>.html) only exist once build.py has run.
See gas/README.md for details.
"""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
GAS_DEV = ROOT / "gas" / "dev.py"


def project_dir(name):
    """the project called name: a folder of the repo, or a talk"""
    for candidate in (ROOT / name, ROOT / "talks" / name):
        if (candidate / "config.js").is_file():
            return candidate
    return None


if __name__ == "__main__":
    args = sys.argv[1:]
    project = ROOT / "presentation"
    if args and not args[0].isdigit() and not args[0].startswith("-"):
        project = project_dir(args[0])
        if project is None:
            sys.exit(f"dev.py: no GAS project called {args[0]!r}, "
                     "try presentation or one of the talks/")
        args = args[1:]
    sys.exit(subprocess.call(
        [sys.executable, str(GAS_DEV), str(project), str(ROOT / "_site"), *args]))
