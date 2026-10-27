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
                "9e3c0102", // 17. Owl (divider)
                "c3edbcc4", // 18. An introduction to Owl 3
                "8c553a2a", // 19. Goals
                "12d9fc3b", // 20. What is Owl?
                "a3eca203", // 21. A Counter component
                "f2902aa5", // 22. Rendering context
                "657824c5", // 23. Signals
                "91cdaddf", // 24. Event handling
                "7d1f0a6c", // 25. Template syntax
                "0c9b53ae", // 26. Sub components
                "5e46d8b2", // 27. Props, and their validation
                "4b2c7e91", // 28. Derived values: computed
                "b8e0d4a7", // 30. odoo.github.io/owl
                "9e3c0103", // 47. The Odoo JS Framework (divider)
                "20b72e9c", // 50. Building blocks
                "1a7c9e42", // 51. Web client
                "4b8d2f61", // 53. Registries
                "b3e91d47", // 56. Everything on screen is an action
                "c48ea30f", // 59. Talking to the server
              ],
            },
          ],
        },
      ],
    },
  ],
};
