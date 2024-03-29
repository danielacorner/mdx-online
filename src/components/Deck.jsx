import React from "react";
import styled from "styled-components";
import {
  useDeck,
  useSyncDeckWithHash,
  useChangeSlidesOnKeydownOrMousewheel,
  useChangeSlidesOnSwipe,
  useTheme,
  getIsTouchDevice,
} from "../utils/customHooks";
import { BREAKPOINTS } from "../utils/constants";
import Slide from "./Slide";
import { SlideIndicator } from "./SlideIndicator";
import { useMeasure } from "react-use";
const GLOBAL_STYLE_TAG_START = "global{";
const GLOBAL_STYLE_TAG_END = "}global";

const DeckStyles = styled.div`
  height: 100%;
  width: 100%;
  max-width: 90vmin;
  max-height: 100vmin;
  margin: auto;
  position: relative;
  code {
    color: #e8912d;
    font-size: 0.9em;
  }
  ul,
  ol {
    margin: auto;
    width: fit-content;
    li {
      text-align: left;
      margin-bottom: 1em;
    }
  }
  &.shrink {
    transform: scale(0.8);
    transform-origin: top center;
  }
  ${(p) => p.css}
`;

const MAX_EXTRA_CHARACTERS_ON_SINGLE_IMAGE_SLIDE = 2;

export default function Deck() {
  const { slides, slideIndex, stepBack, stepForward } = useDeck();

  // sync the hash with the slide index
  useSyncDeckWithHash(slideIndex);

  // change slides on arrow up, down, left, right
  useChangeSlidesOnKeydownOrMousewheel({ stepForward, stepBack });

  // change slides on swipe left, right
  const swipeHandlers = useChangeSlidesOnSwipe({ stepForward, stepBack });
  const isTouchDevice = getIsTouchDevice();
  const { color, background } = useTheme();
  const globalCss = slides.reduce((acc, slideText) => {
    const cssStartIndex =
      slideText.indexOf(GLOBAL_STYLE_TAG_START) ||
      slideText.indexOf(GLOBAL_STYLE_TAG_START.toUpperCase());
    const cssEndIndex =
      slideText.indexOf(GLOBAL_STYLE_TAG_END) ||
      slideText.indexOf(GLOBAL_STYLE_TAG_END.toUpperCase());
    const doesHaveCss = cssStartIndex !== -1;

    const slideCustomCss = doesHaveCss
      ? slideText.slice(
          cssStartIndex + GLOBAL_STYLE_TAG_START.length,
          cssEndIndex
        )
      : ``;
    return acc + slideCustomCss;
  }, "");
  const [ref, dimensions] = useMeasure();
  const shrink = dimensions.width < BREAKPOINTS.TABLET;
  return (
    <DeckStyles
      ref={ref}
      className={`presentation-deck ${shrink ? "shrink" : ""}`}
      {...(isTouchDevice ? swipeHandlers : {})}
      css={`
        font-size: 0.6em;
        @media (min-width: ${BREAKPOINTS.TABLET}px) {
          font-size: 1em;
        }
        ${globalCss}
      `}
    >
      <SlideIndicator
        {...{ slideIndex, numSlides: slides.length, stepBack, stepForward }}
      />
      {slides.map((originalSlideText, idx) => {
        let slideText = originalSlideText;

        // render all slides, then only show current
        const isOneOrMoreImageInSlide =
          slideText.includes("](") && slideText.includes("![");

        const firstImageText = !isOneOrMoreImageInSlide
          ? ""
          : slideText.slice(
              slideText.indexOf("!["),
              slideText.lastIndexOf(")") + 1
            );

        const imageTextLength = firstImageText.length;

        const numCharsOtherThanImageText = Math.abs(
          imageTextLength - slideText.length
        );

        const isSingleImageSlideNoText =
          isOneOrMoreImageInSlide &&
          // no more than a couple characters on either side of the image link
          // for a full-page image slide
          numCharsOtherThanImageText <=
            MAX_EXTRA_CHARACTERS_ON_SINGLE_IMAGE_SLIDE;

        // add <style></style> at top of slide for custom css
        const STYLE_TAG_START = "css{";
        const STYLE_TAG_END = "}css";
        const cssStartIndex =
          slideText.indexOf(STYLE_TAG_START) ||
          slideText.indexOf(STYLE_TAG_START.toUpperCase());
        const cssEndIndex =
          slideText.indexOf(STYLE_TAG_END) ||
          slideText.indexOf(STYLE_TAG_END.toUpperCase());
        const doesHaveCss = cssStartIndex !== -1;

        const slideCustomCss = doesHaveCss
          ? slideText.slice(cssStartIndex + STYLE_TAG_START.length, cssEndIndex)
          : ``;
        const textBeforeStyleTag = slideText.slice(0, cssStartIndex);
        const texTAfterStyleTag = slideText.slice(
          cssEndIndex + STYLE_TAG_START.length
        );
        slideText = doesHaveCss
          ? // remove the css
            textBeforeStyleTag + texTAfterStyleTag /* slideText.slice(
              STYLE_TAG_START.length + slideCustomCss.length + STYLE_TAG_END.length + 1
            ) */
          : slideText;

        const globalcssStartIndex =
          slideText.indexOf(GLOBAL_STYLE_TAG_START) === 0
            ? 0
            : slideText.indexOf(GLOBAL_STYLE_TAG_START);
        const globalcssEndIndex =
          slideText.indexOf(GLOBAL_STYLE_TAG_END) === 0
            ? 0
            : slideText.indexOf(GLOBAL_STYLE_TAG_END);
        const doesHaveGlobalCss = globalcssStartIndex !== -1;
        const textBeforeGlobalStyleTag = slideText.slice(
          0,
          globalcssStartIndex
        );
        const texTAfterGlobalStyleTag = slideText.slice(
          globalcssEndIndex + GLOBAL_STYLE_TAG_START.length
        );

        slideText = doesHaveGlobalCss
          ? textBeforeGlobalStyleTag + texTAfterGlobalStyleTag
          : slideText;

        return (
          <Slide
            key={idx}
            isOneOrMoreImageInSlide={isOneOrMoreImageInSlide}
            isSingleImageSlideNoText={isSingleImageSlideNoText}
            slideCustomCss={slideCustomCss}
            slideTextWithoutCss={slideText}
            slideIndex={slideIndex}
            color={color}
            background={background}
            idx={idx}
          />
        );
      })}
    </DeckStyles>
  );
}
