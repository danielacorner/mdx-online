import React, { useState, useEffect } from "react";
import styled from "styled-components/macro";
import { useEventListener } from "../utils/customHooks";
import { useSwipeable } from "react-swipeable";
import Markdown from "markdown-to-jsx";
import { useHistory, useLocation, useParams } from "react-router";
import lzString from "lz-string";
import Layout from "./Layout";

const SlideStyles = styled.div``;

const DeckStyles = styled.div`
  img {
    /* TODO: size images to fit screen */
  }
`;

export default function Deck({ isPreview }) {
  const { deckData } = useParams();
  const history = useHistory();
  const { search, hash, pathname } = useLocation();
  const deckDataFromLocation = search.slice(1);
  const deckDataEncoded = deckData || deckDataFromLocation;
  const deckDataDecoded = lzString.decompressFromEncodedURIComponent(
    deckDataEncoded
  );

  const separators = ["---", "\\*\\*\\*"];
  const slides = (deckDataDecoded || "").split(
    new RegExp(separators.join("|"), "g")
  );

  const indexFromHash = hash && hash.slice(1);
  const [slideIndex, setSlideIndex] = useState(Number(indexFromHash) || 0);
  console.log("🌟🚨: Deck -> slideIndex", slideIndex);

  const stepBack = () => setSlideIndex(Math.max(0, slideIndex - 1));
  const stepForward = () =>
    setSlideIndex(Math.min(slides.length - 1, slideIndex + 1));

  // sync the hash with the slide index
  useEffect(() => {
    history.replace(
      `${isPreview ? "?" + deckDataFromLocation : pathname}#${slideIndex}`
    );
  }, [slideIndex, pathname, history, isPreview, deckDataFromLocation]);

  const handleKeyDown = (event) => {
    if (event.key === "ArrowRight") {
      stepForward();
    }
    if (event.key === "ArrowLeft") {
      stepBack();
    }
  };

  useEventListener("keydown", handleKeyDown);

  const [isPresentationMode, setIsPresentationMode] = useState(false);

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
      />{" "}
    </Layout>
  );
}

function DeckWithSlides({ swipeHandlers, slides, slideIndex }) {
  return (
    <DeckStyles className="presentation-deck" {...swipeHandlers}>
      {slides.map((slide, idx) => {
        /* render all slides, then only show current */
        const Slide = () => <Markdown>{slide}</Markdown>;
        const isImageSlide = slide.includes("](") && slide.includes("![");
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
                max-width: 100%;
                max-height: 100%;
              }
              p {
                ${isImageSlide
                  ? "width: 100%; height: 100%; display: grid; place-items: center;"
                  : ""}
              }
            `}
          >
            <Slide />
          </SlideStyles>
        );
      })}
    </DeckStyles>
  );
}
