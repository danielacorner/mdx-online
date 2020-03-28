import React, { useState, useEffect } from "react";
import styled from "styled-components/macro";
import { useEventListener } from "../utils/customHooks";
import { useSwipeable } from "react-swipeable";
import Markdown from "markdown-to-jsx";
import { useHistory, useLocation, useParams } from "react-router";
import { Button } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import PresentIcon from "@material-ui/icons/PlayArrow";
import jsscompress from "js-string-compression";

const SlideStyles = styled.div`
  height: 100vh;
  width: 100vw;
  background: hsla(0, 0%, 10%, 1);
  color: white;
  display: grid;
  place-items: center;
  font-size: 3em;
  font-family: "Sen", sans-serif;
  user-select: none;
`;

const DeckStyles = styled.div``;

export default function Deck() {
  var hm = new jsscompress.Hauffman();
  const { deckData } = useParams();
  const history = useHistory();
  const { search, hash, pathname } = useLocation();
  const deckDataFromLocation = search.slice(1);
  const deckDataDecoded = deckData || decodeURI(deckDataFromLocation);

  const separators = ["---", "\\*\\*\\*"];
  const slides = deckDataDecoded.split(new RegExp(separators.join("|"), "g"));

  const indexFromHash = hash && hash.slice(1);
  const [slideIndex, setSlideIndex] = useState(Number(indexFromHash) || 0);

  const stepBack = () => setSlideIndex(Math.max(0, slideIndex - 1));
  const stepForward = () =>
    setSlideIndex(Math.min(slides.length - 1, slideIndex + 1));

  // sync the hash with the slide index
  useEffect(() => {
    history.push(`${pathname}#${slideIndex}`, { replace: true });
  }, [slideIndex, pathname, history]);

  const handleKeyDown = event => {
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
    preventDefaultTouchmoveEvent: true
  };
  const swipeHandlers = useSwipeable({
    onSwipedLeft: stepForward,
    onSwipedRight: stepBack,
    ...swipeConfig
  });

  return (
    <DeckStyles {...swipeHandlers}>
      <SlideStyles>
        <Markdown>{slides[slideIndex]}</Markdown>
      </SlideStyles>
      {!isPresentationMode && (
        <Controls setIsPresentationMode={setIsPresentationMode} />
      )}
    </DeckStyles>
  );
}

const ControlsStyles = styled.div`
  position: fixed;
  bottom: 1em;
  right: 1em;
  display: grid;
  grid-auto-flow: column;
  grid-gap: 0.5em;
  a {
    text-decoration: none;
  }
  .MuiButton-root {
    padding: 6px 12px;
  }
  .MuiSvgIcon-root {
    padding-left: 6px;
  }
`;

function Controls({ setIsPresentationMode }) {
  const { pathname } = useLocation();
  const pathBackToEdit = "/" + pathname.split("/")[2];
  return (
    <ControlsStyles>
      <a href={pathBackToEdit}>
        <Button variant="contained">
          Edit
          <EditIcon />
        </Button>
      </a>
      <Button variant="contained" onClick={() => setIsPresentationMode(true)}>
        Present
        <PresentIcon />
      </Button>
    </ControlsStyles>
  );
}
