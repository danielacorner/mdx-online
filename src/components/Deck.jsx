import React from "react";
import styled from "styled-components/macro";
import {
  useDeck,
  useSyncDeckWithHash,
  useChangeSlidesOnKeydownOrMousewheel,
  useChangeSlidesOnSwipe,
  useTheme,
} from "../utils/customHooks";
import {
  STYLE_START,
  STYLE_END,
  TRANSITION,
  BREAKPOINTS,
} from "../utils/constants";
import Markdown from "markdown-to-jsx";

const SlideStyles = styled.div``;

const DeckStyles = styled.div`
  height: 100%;
  width: 100%;
  max-width: 100vw;
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

const MAX_EXTRA_CHARACTERS_ON_SINGLE_IMAGE_SLIDE = 2;

function DeckContent({ swipeHandlers, slides, slideIndex }) {
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

        const imageTextLength =
          slideText.lastIndexOf(")") - slideText.lastIndexOf("![");
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

        const imageSplit = slideText.split("(");
        const imageUrl = imageSplit?.[1]?.slice(
          0,
          imageSplit?.[1]?.indexOf(")")
        );
        const imageLabel = imageSplit?.[0]?.slice(
          imageSplit?.[0]?.indexOf("[") + 1,
          imageSplit?.[0]?.indexOf("]")
        );

        const Slide = () => (
          <Markdown
            {...(isSingleImageSlideNoText
              ? {
                  options: {
                    overrides: {
                      p: {
                        component: "div",
                        props: {
                          "aria-label": imageLabel,
                          style: {
                            backgroundImage: `url(${imageUrl})`,
                            backgroundRepeat: "no-repeat",
                            backgroundSize: "contain",
                            width: "100%",
                            height: "100%",
                            backgroundPosition: "center",
                          },
                        },
                      },
                      img: {
                        props: {
                          style: {
                            display: `none`,
                          },
                        },
                      },
                    },
                  },
                }
              : isOneOrMoreImageInSlide
              ? {
                  options: {
                    overrides: {
                      img: {
                        component: () => (
                          <div
                            style={{
                              backgroundImage: `url(${imageUrl})`,
                              backgroundRepeat: "no-repeat",
                              backgroundSize: "contain",
                              width: "100%",
                              height: "100%",
                              backgroundPosition: "center",
                            }}
                          >
                            <img
                              src={imageUrl}
                              alt={imageLabel}
                              style={{ visibility: "hidden" }}
                            />
                          </div>
                        ),
                      },
                      p: {
                        component: "div",
                        props: {
                          style: {
                            // default "p" styles
                            marginBlockStart: "1em",
                            marginBlockEnd: "1em",
                            marginInlineStart: "0px",
                            marginInlineEnd: "0px",
                          },
                        },
                      },
                    },
                  },
                }
              : {})}
          >
            {slideTextWithoutCss}
          </Markdown>
        );

        return (
          <SlideStyles
            key={idx}
            isImageSlide={isSingleImageSlideNoText}
            css={`
              display: ${idx === slideIndex ? `grid` : `none`};
              height: 100%;
              width: 100%;
              & > div {
                max-width: 100vw;
              }
              transition: ${TRANSITION};
              background: ${background};
              color: ${color};
              text-align: center;
              place-items: center;
              font-size: 2em;
              font-family: "Sen", sans-serif;
              user-select: none;
              padding: 0.5em 0;
              img {
                max-width: min(95vw, 1024px);
                height: auto;
                max-height: min(95vh, 100%);
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
