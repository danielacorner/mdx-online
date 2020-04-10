import React from "react";
import styled from "styled-components/macro";
import {
  useDeck,
  useSyncDeckWithHash,
  useChangeSlidesOnKeydownOrMousewheel,
  useChangeSlidesOnSwipe,
  useTheme,
} from "../utils/customHooks";
import { STYLE_START, STYLE_END, TRANSITION } from "../utils/constants";
import Markdown from "markdown-to-jsx";

const SlideStyles = styled.div``;

const DeckStyles = styled.div`
  height: 100%;
  img {
    /* TODO: size images to fit screen */
  }
`;

export default function Deck() {
  const { slides, slideIndex, stepBack, stepForward } = useDeck();

  // sync the hash with the slide index
  useSyncDeckWithHash(slideIndex);

  // change slides on arrow up, down, left, right
  useChangeSlidesOnKeydownOrMousewheel({ stepForward, stepBack });

  // change slides on swipe left, right
  const swipeHandlers = useChangeSlidesOnSwipe({ stepForward, stepBack });

  return (
    <DeckContent
      swipeHandlers={swipeHandlers}
      slides={slides}
      slideIndex={slideIndex}
    />
  );
}

// TODO: use split, join, lastIndexOf to use css{ ;} instead of css{ }css

function DeckContent({ swipeHandlers, slides, slideIndex }) {
  const { color, background } = useTheme();
  return (
    <DeckStyles className="presentation-deck" {...swipeHandlers}>
      {slides.map((slideText, idx) => {
        // render all slides, then only show current
        const isImageSlide =
          slideText.includes("](") && slideText.includes("![");

        // add <style></style> at top of slide for custom css
        const cssStartIndex = slideText.indexOf(STYLE_START);
        const cssEndIndex = slideText.indexOf(STYLE_END);
        const doesHaveCss = cssStartIndex !== -1;

        const slideCustomCss = doesHaveCss
          ? slideText.slice(cssStartIndex + STYLE_START.length, cssEndIndex)
          : ``;
        const slideTextWithoutCss = doesHaveCss
          ? slideText.slice(
              STYLE_START.length + slideCustomCss.length + STYLE_END.length + 1
            )
          : slideText;
        const Slide = () => <Markdown>{slideTextWithoutCss}</Markdown>;

        // TODO: split out images and render separately
        // TODO: set image height/width based on max(container height, container width)

        return (
          <SlideStyles
            key={idx}
            isImageSlide={isImageSlide}
            css={`
              display: ${idx === slideIndex ? `grid` : `none`};
              height: 100%;
              width: 100%;
              transition: ${TRANSITION};
              background: ${background};
              color: ${color};
              text-align: center;
              place-items: center;
              font-size: 2em;
              font-family: "Sen", sans-serif;
              user-select: none;
              padding: 1em;
              img {
                max-width: 1024px;
                max-height: 100%;
                min-height: 50vh;
              }
              p {
                ${isImageSlide
                  ? `
                  width: 100%;
                  height: 100%;
                  display: grid;
                  place-items: center;
                  align-content: center;
                  `
                  : ""}
              }
              ${slideCustomCss}
            `}
          >
            <Slide />
          </SlideStyles>
        );
      })}
    </DeckStyles>
  );
}
