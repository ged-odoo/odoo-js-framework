# Odoo Framework JS

A training on the Odoo JavaScript framework, as of Odoo 20 and Owl 3: the
presentations, and the exercises that follow each one. It has six topics,
an overview first, then four that are each a set of presentations followed
by their exercises, and the website last:

1. **The Odoo JS Ecosystem**: the codebases, the architecture, the assets
   and the templates
2. **Owl**: components and signals, building an application, generic
   components. Exercises: Getting Started and Todo List, on the Owl
   playground
3. **The Odoo JS Framework**: the web client, registries, actions, plugins.
   Exercises: Building a dashboard, in two parts
4. **Views and Fields**: what a view is made of, customizing views and
   fields. Exercises: Customizing, and the Dental practice project
5. **Advanced JS Framework**: the framework's own pieces, customizing the
   UI, state management. Exercise: the Clicker game
6. **The Website Framework**: interactions and Colibri, Owl on the website,
   snippets, edit mode and the builder, through a weather snippet built step
   by step

At the foot of the sidebar are Owl 2 vs Owl 3 (shown with no preset, or the
Owl one), Resources, and two talks, Introducing Owl 3 and Advanced
Reactivity, under Bonus Content, each with a link to its replay on YouTube.

**[Open the presentation](https://ged-odoo.github.io/odoo-js-framework/)**

The material comes from the Odoo JS masterclass given at Odoo Experience 2026.

## Presenting

The site serves the whole training as one page, with its styles, scripts,
fonts and images inside. To present offline, save that page, or build it
locally (see below).

The sidebar lists the program topic by topic. The deck you open unfolds into
its slides, with the current one highlighted. The arrow keys move between
slides, and past the last one into the next exercise or deck (or back into
the previous one); on an exercise, the left and right arrows do the same. `f`
goes fullscreen, `m` hides the sidebar, and `Ctrl+K` searches for a slide, an
exercise step or a page to go to. **Print** lays the open deck out one
slide per page, ready to save as a PDF. **Print everything** does the same
for the whole program.

The **Preset** picker, on top of the sidebar, cuts the program down to one
training: Training 1 (the ecosystem and Owl), Training 2 (the JS framework),
Training 3 (views and fields), Training 4 (advanced), Training 5 (the
website), or Odoo JavaScript Overview (the ecosystem, and an introduction to
Owl). Only that preset's
decks, exercises and slides are then shown, counted and printed. The preset
is kept in the url, `?preset=overview`, so a link opens the training on the
same preset. The presets are defined in `presentation/config.js`.

## Doing the exercises

The exercises of topics 3 to 5 start from the addons in `addons/`. Clone this
repository, start Odoo (`20.0` or `master`) with that folder in its addons
path, and install the addon the exercise names:

```
git clone https://github.com/ged-odoo/odoo-js-framework.git
odoo-bin --addons-path=...,odoo-js-framework/addons
```

The finished addons are in `addons_solutions/`, under the same names: point
the addons path there instead to see them working. The Owl exercises run in
the browser, on the [Owl playground](https://odoo.github.io/owl/playground/).

## Building locally

The built pages are not in this repository: GitHub builds them for the site
only. To get them on your machine, you need Python 3.9 or later, and nothing
else to install:

```
git clone https://github.com/ged-odoo/odoo-js-framework.git
cd odoo-js-framework
python3 build.py
```

This writes `index.html` at the root of the clone, and the two talks in
`talks/` (git ignores all three). Open `index.html` in a browser, straight from
the disk: it needs neither a server nor a network connection. Run
`python3 build.py` again after pulling new slides.

## Repository layout

```
build.py          builds index.html and the talks, from presentation/ and talks/
.github/          the action that builds them and deploys them to GitHub Pages
presentation/     the source: a GAS project
  sections/       one folder per topic: its decks (.html), its exercises
                  (.html, with the text in .md), and the pages at the foot
  config.js       the title, the program (the sidebar), the presets
  style.css       the training's own styles
  assets/         the images, the exercises' ones in assets/tutorials/
talks/            the two talks, each a GAS project of its own
addons/           the addons the exercises start from
addons_solutions/ the same addons, finished
gas/              GAS, the slide framework it all runs on
```

## Editing

The slides and exercises are in `presentation/sections/`. Every push to
`main`, merged pull requests included, rebuilds the site and deploys it, with
the `Deploy to GitHub Pages` GitHub Action: the built pages are not
committed. To see changes as you make them,
`python3 gas/dev.py presentation _site` serves the training at
`http://localhost:8000/` and rebuilds it on every save. The talks are not
part of that view: their pages only exist once `build.py` has run.

To add a deck, an exercise or a page, add its file under `sections/` and an
entry for it in the `program` of `config.js`. `gas/README.md` explains the
framework, and `gas/CLAUDE.md` how to write slides with it.
