import React, { useState } from "react";
import styled from "styled-components";
import { useEffect } from "react";
import { IconButton } from "@material-ui/core";
import { ArrowBackIos, ArrowForwardIos } from "@material-ui/icons";

export function SlideIndicator({
  slideIndex,
  numSlides,
  stepBack,
  stepForward,
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    let timer = setTimeout(() => {
      setShow(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [slideIndex]);

  return (
    <Styles
      onMouseEnter={() => {
        setShow(true);
      }}
      onMouseLeave={() => {
        setShow(false);
      }}
      $show={show}
    >
      <IconButton onClick={stepBack}>
        <ArrowBackIos />
      </IconButton>
      <div>{`${slideIndex + 1}/${numSlides}`}</div>
      <IconButton onClick={stepForward}>
        <ArrowForwardIos />
      </IconButton>
    </Styles>
  );
}
const Styles = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25em;
  padding: 0.25em;
  position: absolute;
  top: 0.25em;
  right: 0.25em;
  color: white;
  font-size: 2.5em;
  line-height: 0;
  transition: opacity 0.1s ease-in-out;
  opacity: ${(props) => (props.$show ? 1 : 0.1)};
  z-index: 999;
  svg {
    color: white;
  }
  .MuiIconButton-root:hover {
    color: #e8912d;
  }
`;
