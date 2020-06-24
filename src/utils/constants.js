export const defaultValue = `
# MD deck builder
# 🐱‍🚀

---

Check out the [MarkDown Cheat Sheet](https://www.markdownguide.org/cheat-sheet/)

---

![A random image](https://picsum.photos/250/500)

---

css{h1{font-size: 9px} p{font-size: 99px}}css

# now with

custom styles!

---

css{
    div:first-child{
        animation: 0.5s ease-in-out infinite spinning;
    }
    @keyframes spinning {
        from {
            transform: rotate(90deg);
        }
        50% {
            transform: scale(0.5) rotate(60deg);
        }
        to {
            transform: rotate(0deg);
        }
    }
}css

![](https://emojis.slackmojis.com/emojis/images/1547582922/5197/party_blob.gif?1547582922)
`;

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
