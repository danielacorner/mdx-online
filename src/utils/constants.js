export const defaultValue = `# My Sweet Deck
## 😎✨🆒
---
Check out the [Markdown Cheat Sheet](https://www.markdownguide.org/cheat-sheet/)
---
![A random image](https://picsum.photos/250/500)`;

export const STYLE_START = "css{";
export const STYLE_END = "}css";

export const blackColor = "hsla(0, 0%, 10%, 1)";

export const THEMES = {
  LIGHT: {
    QUERY: "l",
    STYLES: { background: "white", color: blackColor },
  },
  DARK: {
    QUERY: null, // default
    STYLES: { background: blackColor, color: "white" },
  },
};

const transitionProperties = ["background", "background-color", "color"];

export const TRANSITION = transitionProperties
  .map((prop) => `${prop} 0.6s cubic-bezier(0.075, 0.82, 0.165, 1)`)
  .join(",");

export const BREAKPOINTS = {
  DESKTOP: 1200,
  TABLET: 960,
};
