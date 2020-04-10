import React, { useEffect } from "react";
import styled from "styled-components/macro";
import { useEventListener, useDeck } from "../utils/customHooks";
import { useSwipeable } from "react-swipeable";
import Markdown from "markdown-to-jsx";
import Layout from "./Layout";

const SlideStyles = styled.div``;

const DeckStyles = styled.div`
  img {
    /* TODO: size images to fit screen */
  }
`;

export default function Deck({ isPreview }) {
  const {
    slides,
    slideIndex,
    deckDataEncoded,
    deckDataDecoded,
    stepBack,
    stepForward,
    isPresentationMode,
    setIsPresentationMode,
  } = useDeck();

  // sync the hash with the slide index
  useSyncDeckWithHash(isPreview, slideIndex);

  const handleKeyDown = (event) => {
    if (event.key === "ArrowRight") {
      stepForward();
    }
    if (event.key === "ArrowLeft") {
      stepBack();
    }
  };

  useEventListener("keydown", handleKeyDown);

  const swipeConfig = {
    trackMouse: true, // track mouse input
    preventDefaultTouchmoveEvent: true,
  };
  const swipeHandlers = useSwipeable({
    onSwipedLeft: stepForward,
    onSwipedRight: stepBack,
    ...swipeConfig,
  });

  return isPreview ? (
    <DeckWithSlides
      swipeHandlers={swipeHandlers}
      slides={slides}
      slideIndex={slideIndex}
    />
  ) : (
    <Layout
      isPresentationMode={isPresentationMode}
      deckDataDecoded={deckDataDecoded}
      deckDataEncoded={deckDataEncoded}
      setIsPresentationMode={setIsPresentationMode}
      handleBuild={null}
    >
      <DeckWithSlides
        swipeHandlers={swipeHandlers}
        slides={slides}
        slideIndex={slideIndex}
      />
    </Layout>
  );
}

// TODO: use split, join, lastIndexOf to use css{ ;} instead of css{ }css
const STYLE_START = "css{";
const STYLE_END = "}css";

function useSyncDeckWithHash(
  history,
  isPreview,
  deckDataFromLocation,
  pathname,
  slideIndex
) {
  useEffect(() => {
    history.replace(
      `${isPreview ? "?" + deckDataFromLocation : pathname}#${slideIndex}`
    );
  }, [slideIndex, pathname, history, isPreview, deckDataFromLocation]);
}

function DeckWithSlides({ swipeHandlers, slides, slideIndex }) {
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
        console.log("🌟🚨: DeckWithSlides -> slideCustomCss", slideCustomCss);
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
              height: 100vh;
              width: 100%;
              background: hsla(0, 0%, 10%, 1);
              color: white;
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
