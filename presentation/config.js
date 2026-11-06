// This project's own setup, read by gas/assets/app.js (window.GAS_CONFIG).
// See gas/README.md for the shape this object needs, gas/CLAUDE.md for how
// to add slides and exercises to program below.
window.GAS_CONFIG = {
  palette: "claude",
  title: "Odoo Framework JS",
  favicon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='11.5' fill='none' stroke='%23714B67' stroke-width='5'/%3E%3C/svg%3E",

  // the deck shown first, and the one "Home" falls back to
  defaultDeck: "intro",

  welcomeImage: "assets/welcome-bg.webp",

  // links shown in the "Resources" section - hidden entirely if empty
  resources: [
    {
      group: "Owl",
      links: [
        {
          title: "Owl website",
          url: "https://odoo.github.io/owl/",
          note: "Landing page, with the tutorials and the playground",
        },
        {
          title: "Owl documentation",
          url: "https://odoo.github.io/owl/documentation/",
          note: "Reference: components, hooks, templates, reactivity",
        },
        {
          title: "Owl playground",
          url: "https://odoo.github.io/owl/playground/",
          note: "Write and run Owl components in the browser. Used for the Owl exercises",
        },
        {
          title: "Owl repository",
          url: "https://github.com/odoo/owl",
          note: "Source code and issues",
        },
      ],
    },
    {
      group: "Odoo",
      links: [
        {
          title: "Odoo developer documentation",
          url: "https://www.odoo.com/documentation/master/developer.html",
          note: "Framework, views, fields, ORM",
        },
        {
          title: "This presentation's repository",
          url: "https://github.com/ged-odoo/odoo-js-framework",
          note: "The slides, and the addons the exercises start from",
        },
      ],
    },
  ],

  // the sidebar, topic by topic. Each topic runs its presentation first,
  // then the exercises. "slides" points at a <div class="deck">, "project"
  // at an <article class="project">, "view" at a plain <section
  // class="view"> - all three by id, all under sections/.
  program: [
    {
      topic: "The Odoo JS Ecosystem",
      icon: "layers",
      items: [
        { type: "slides", id: "intro", label: "The Odoo JS Ecosystem" },
      ],
    },
    {
      topic: "Owl",
      icon: "owl",
      items: [
        { type: "slides", id: "owl", label: "Components and Signals" },
        { type: "project", id: "getting-started", label: "Getting Started" },
        { type: "slides", id: "owl-app", label: "Building an Application" },
        { type: "project", id: "todo-list", label: "Todo List" },
        { type: "slides", id: "generic-components", label: "Generic Components" },
      ],
    },
    {
      topic: "The Odoo JS Framework",
      icon: "blocks",
      items: [
        { type: "slides", id: "js-framework", label: "JS Framework 101" },
        { type: "project", id: "dashboard", label: "Building a dashboard, part 1" },
        { type: "slides", id: "js-framework-2", label: "Plugins" },
        { type: "project", id: "dashboard-part-2", label: "Building a dashboard, part 2" },
      ],
    },
    {
      topic: "Views and Fields",
      icon: "layout",
      items: [
        { type: "slides", id: "views-fields", label: "Views and Fields" },
        { type: "slides", id: "customizing-views", label: "Customizing views and fields" },
        { type: "project", id: "customizing", label: "Exercises" },
        { type: "project", id: "dental-practice", label: "Project: Dental practice" },
      ],
    },
    {
      topic: "Advanced JS Framework",
      icon: "bolt",
      items: [
        { type: "slides", id: "advanced", label: "JS Framework 201" },
        { type: "slides", id: "customizing-ui", label: "Customizing the UI" },
        { type: "slides", id: "state-management", label: "State Management" },
        { type: "project", id: "clicker", label: "Clicker game" },
      ],
    },
    {
      topic: "The Website Framework",
      icon: "globe",
      items: [
        { type: "slides", id: "website", label: "Interactions" },
        { type: "slides", id: "website-builder", label: "Snippets and the Builder" },
      ],
    },
    {
      // "end" sends a group to the foot of the sidebar, above Resources;
      // "last", below, goes under Resources too. Neither is cut by a preset,
      // unless an item names its own `presets`.
      topic: null,
      at: "end",
      items: [
        // only with the Owl preset, or with no preset at all
        { type: "slides", id: "owl-2-vs-3", label: "Owl 2 vs Owl 3", presets: ["training-1"] },
      ],
    },
    {
      // the two talks, built beside this page (see build.py) and embedded
      // here: a page each, holding the talk in an iframe
      topic: "Bonus Content",
      icon: "star",
      at: "last",
      items: [
        { type: "view", id: "talk1", label: "Talk: Introducing Owl 3" },
        { type: "view", id: "talk2", label: "Talk: Advanced Reactivity" },
      ],
    },
  ],

  // Named cuts of the program, picked on top of the sidebar (see
  // gas/README.md, "Presets"). A preset keeps whole topics, whole items (by
  // id), and single slides (by data-id) from decks it does not keep whole.
  // The groups sent to the foot of the sidebar (`at`) are always kept, but
  // for an item listing `presets`: it is kept by those presets only.
  presets: [
    {
      id: "training-1",
      label: "Training 1: Owl",
      topics: ["The Odoo JS Ecosystem", "Owl"],
    },
    {
      id: "training-2",
      label: "Training 2: The Odoo JS Framework",
      topics: ["The Odoo JS Framework"],
    },
    {
      id: "training-3",
      label: "Training 3: Views and Fields",
      topics: ["Views and Fields"],
    },
    {
      id: "training-4",
      label: "Training 4: Advanced JS Framework",
      topics: ["Advanced JS Framework"],
    },
    {
      id: "training-5",
      label: "Training 5: The Website Framework",
      topics: ["The Website Framework"],
    },
    {
      id: "overview",
      label: "Odoo JavaScript Overview",
      topics: ["The Odoo JS Ecosystem"],
      slides: [
        "c3edbcc4", // An introduction to Owl 3
        "12d9fc3b", // What is Owl?
        "a3eca203", // A Counter component
        "657824c5", // Signals
        "7d1f0a6c", // Template syntax
        "0c9b53ae", // Sub components
        "5e46d8b2", // Props, and their validation
        "4b2c7e91", // Derived values: computed
        "b8e0d4a7", // odoo.github.io/owl
      ],
    },
  ],
};
