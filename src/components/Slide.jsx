import Markdown from "markdown-to-jsx";
import React from "react";
import styled from "styled-components";

import { TRANSITION } from "../utils/constants";

const SlideStyles = styled.div`
  position: relative;
  display: ${(props) => (props.$idx === props.$slideIndex ? `grid` : `none`)};
  height: 100%;
  width: 100%;
  & > div {
    max-width: 100vw;
  }
  transition: ${TRANSITION};
  background: ${(props) => props.$background};
  color: ${(props) => props.$color};
  text-align: center;
  place-items: center;
  font-size: 2em;
  font-family: "Sen", sans-serif;
  user-select: auto;
  padding: 0.5em 0;
  img {
    max-width: min(95vw, 1024px);
    height: auto;
    max-height: min(95vh, 100%);
  }
  a {
    color: hsl(240, 100%, 59%);
  }
  ${(props) => props.$slideCustomCss}
`;

const SINGLE_IMAGE_SLIDE_PROPS = {
  options: {
    overrides: {
      p: {
        component: SingleImageSlidePElementReplacement,
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
};

const MULTI_IMAGE_SLIDE_PROPS = {
  options: {
    overrides: {
      img: {
        component: MultiImageImgElementReplacement,
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
};

export default function Slide({
  slideCustomCss,
  idx,
  slideIndex,
  background,
  color,
  isSingleImageSlideNoText,
  isOneOrMoreImageInSlide,
  slideTextWithoutCss,
}) {
  return (
    <SlideStyles
      $isImageSlide={isSingleImageSlideNoText}
      $slideCustomCss={slideCustomCss}
      $idx={idx}
      $slideIndex={slideIndex}
      $background={background}
      $color={color}
    >
      <Markdown
        {...(isSingleImageSlideNoText
          ? SINGLE_IMAGE_SLIDE_PROPS
          : isOneOrMoreImageInSlide
          ? MULTI_IMAGE_SLIDE_PROPS
          : {})}
        options={{
          overrides: {
            a: {
              props: {
                target: "_blank",
              },
            },
          },
        }}
      >
        {slideTextWithoutCss}
      </Markdown>
    </SlideStyles>
  );
}

function SingleImageSlidePElementReplacement(props) {
  const imgChild = props.children[0];
  return (
    <div
      className="img-wrapper"
      style={{
        backgroundImage: `url(${imgChild.props.src})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
        width: "100%",
        height: "100%",
        backgroundPosition: "center",
      }}
    >
      {props.children}
    </div>
  );
}

function MultiImageImgElementReplacement(props) {
  return (
    <div
      style={{
        backgroundImage: `url(${props.src})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
        width: "100%",
        height: "100%",
        backgroundPosition: "center",
      }}
    >
      <img src={props.src} alt={props.alt} style={{ visibility: "hidden" }} />
    </div>
  );
}
