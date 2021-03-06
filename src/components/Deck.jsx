import React from "react";
import styled from "styled-components/macro";
import {
  useDeck,
  useSyncDeckWithHash,
  useChangeSlidesOnKeydownOrMousewheel,
  useChangeSlidesOnSwipe,
  useTheme,
} from "../utils/customHooks";
import { BREAKPOINTS } from "../utils/constants";
import Slide from "./Slide";

const DeckStyles = styled.div`
  height: 100%;
  width: 100%;
  max-width: 100vw;
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

  const { color, background } = useTheme();
  return (
    <DeckStyles
      className="presentation-deck"
      {...swipeHandlers}
      css={`
        font-size: 0.6em;
        @media (min-width: ${BREAKPOINTS.TABLET}px) {
          font-size: 1em;
        }
      `}
    >
      {slides.map((slideText, idx) => {
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
        const slideTextWithoutCss = doesHaveCss
          ? // remove the css
            textBeforeStyleTag +
            texTAfterStyleTag /* slideText.slice(
              STYLE_TAG_START.length + slideCustomCss.length + STYLE_TAG_END.length + 1
            ) */
          : slideText;

        return (
          <Slide
            key={idx}
            isOneOrMoreImageInSlide={isOneOrMoreImageInSlide}
            isSingleImageSlideNoText={isSingleImageSlideNoText}
            slideCustomCss={slideCustomCss}
            slideTextWithoutCss={slideTextWithoutCss}
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
