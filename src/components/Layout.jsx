import React, { useState } from "react";
import styled from "styled-components/macro";
import { useLocation } from "react-router";
import { Button, Snackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import PlayIcon from "@material-ui/icons/PlayArrow";
import ShareIcon from "@material-ui/icons/Share";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import { Link } from "react-router-dom";
import { useCopyClipboard } from "@lokibai/react-use-copy-clipboard";

const CONTROLS_HEIGHT = 20;

const AppStyles = styled.div`
  * {
    box-sizing: border-box;
  }
min-height:100vh;
  .controls {
    /* position: relative;
    height: ${CONTROLS_HEIGHT}px;
    display: flex;
    padding: 0.5em;
    align-items: center;
    justify-content: space-around; */
  }

  .themeSwitch {
    z-index: 999;
    position: fixed;
    bottom: ${CONTROLS_HEIGHT}px;
    left: ${CONTROLS_HEIGHT}px;
    .dark {
      color: white;
    }
    .light {
      color: black;
    }
  }
`;

export default ({
  isPresentationMode,
  deckDataDecoded,
  setIsPresentationMode,
  children
}) => {
  return (
    <AppStyles>
      {children}
      {!isPresentationMode && (
        <Controls
          deckDataDecoded={deckDataDecoded}
          setIsPresentationMode={setIsPresentationMode}
        />
      )}
    </AppStyles>
  );
};

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
  .editIcon {
    transform: rotate(0.5turn);
  }
  button.copied {
    pointer-events: none;
    opacity: 0.5;
  }
`;

function Controls({ setIsPresentationMode, deckDataDecoded, handleBuild }) {
  const { pathname, search } = useLocation();
  const { href } = window.location;
  const pathBackToEdit = "/?" + pathname.split("/")[2];
  const shareData = {
    title: "MDX slides online",
    text:
      deckDataDecoded && deckDataDecoded.length > 10
        ? `${deckDataDecoded.slice(0, 10)}...`
        : deckDataDecoded,
    url: href
  };
  const [, /* isCopied */ setCopied] = useCopyClipboard(href);
  const [copiedValue, setCopiedValue] = useState();
  const isCopiedValueSameAsCurrentValue =
    copiedValue === `${window.location.origin}${pathname}${search}`;
  const showSnackbar = copiedValue && isCopiedValueSameAsCurrentValue;
  return (
    <ControlsStyles>
      <Link to={pathBackToEdit}>
        <Button variant="contained">
          <PlayIcon className="editIcon" />
          Edit
        </Button>
      </Link>
      {setIsPresentationMode ? (
        <Button variant="contained" onClick={() => setIsPresentationMode(true)}>
          Present
          <PlayIcon />
        </Button>
      ) : (
        <Button variant="contained" color="primary" onClick={handleBuild}>
          Build
        </Button>
      )}
      {Boolean("share" in navigator) ? (
        <Button variant="contained" onClick={() => handleShare(shareData)}>
          Share
          <ShareIcon />
        </Button>
      ) : (
        <Button
          variant="contained"
          className={`${showSnackbar ? "copied" : ""}`}
          onClick={() => {
            setCopied(href);
            setCopiedValue(href);
            console.log("🌟🚨: Controls -> href", href);
          }}
        >
          Copy url
          <FileCopyIcon />
        </Button>
      )}

      <Snackbar open={showSnackbar} autoHideDuration={6000}>
        <Alert severity="success">Copied to clipboard!</Alert>
      </Snackbar>
    </ControlsStyles>
  );
}
async function handleShare(shareData) {
  try {
    const sharePromise = await navigator.share(shareData);
    return sharePromise;
  } catch (err) {
    alert(err);
  }
}
