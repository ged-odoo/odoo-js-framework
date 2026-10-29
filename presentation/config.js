window.GAS_CONFIG = {
  palette: "claude",
  title: "Odoo Framework JS",
  favicon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='11.5' fill='none' stroke='%23714B67' stroke-width='5'/%3E%3C/svg%3E",
  defaultDeck: "talk",
  welcomeImage: "assets/welcome-bg.webp",
  program: [
    {
      topic: null,
      items: [
        {
          type: "slides",
          id: "talk",
          label: "Odoo Framework JS",
          acts: [
            { id: "title", title: "Odoo Framework JS", counted: false },
            { id: "ecosystem", title: "The Odoo JS Ecosystem" },
            { id: "owl", title: "Owl" },
            { id: "framework", title: "The Odoo JS Framework" },
            { id: "views", title: "Views and Fields" },
            { id: "advanced", title: "Advanced JS Framework" },
          ],
          presets: [
            {
              id: "training-1",
              label: "Training 1: Owl",
              acts: ["title", "ecosystem", "owl"],
            },
            {
              id: "training-2",
              label: "Training 2: The Odoo JS Framework",
              acts: ["title", "framework"],
            },
            {
              id: "training-3",
              label: "Training 3: Views and Fields",
              acts: ["title", "views"],
            },
            {
              id: "training-4",
              label: "Training 4: Advanced JS Framework",
              acts: ["title", "advanced"],
            },
            {
              id: "overview",
              label: "Odoo JavaScript Overview",
              acts: ["title", "ecosystem"],
              slides: [
                "9e3c0102", // 22. Owl (divider)
                "c3edbcc4", // 23. An introduction to Owl 3
                "12d9fc3b", // 24. What is Owl?
                "a3eca203", // 25. A Counter component
                "657824c5", // 27. Signals
                "7d1f0a6c", // 29. Template syntax
                "0c9b53ae", // 30. Sub components
                "5e46d8b2", // 31. Props, and their validation
                "4b2c7e91", // 32. Derived values: computed
                "b8e0d4a7", // 34. odoo.github.io/owl
              ],
            },
          ],
        },
      ],
    },
  ],
};
