import React, { useState } from "react";
import styled from "styled-components/macro";
import { useLocation } from "react-router";
import { Button, Snackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import PlayIcon from "@material-ui/icons/PlayArrow";
import ShareIcon from "@material-ui/icons/Share";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import FullScreenIcon from "@material-ui/icons/Fullscreen";
import { Link } from "react-router-dom";
import { useCopyClipboard } from "@lokibai/react-use-copy-clipboard";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import { blue, indigo } from "@material-ui/core/colors";
import { CastButton } from "react-cast-sender";

const theme = createMuiTheme({
  palette: {
    primary: blue,
    secondary: indigo
  }
});

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
    &.square {
      padding: 0;
    }
    &:not(.square) {
      .MuiSvgIcon-root {
        padding-left: 6px;
      }
    }
    google-cast-launcher {
      width: 32.4px;
      height: 32.4px;
    }
  }
  .editIcon {
    transform: rotate(0.5turn);
  }
  button.copied {
    pointer-events: none;
    opacity: 0.5;
  }
`;

export default function Layout({
  setIsPresentationMode,
  deckDataEncoded,
  deckDataDecoded,
  handleBuild,
  isPresentationMode,
  children
}) {
  const isPresentationPage = Boolean(setIsPresentationMode);
  const { pathname } = useLocation();
  const { origin } = window.location;
  const pathToShare = `${origin}/?deck=${deckDataEncoded}`;

  const pathBackToEdit = "/?" + pathname.split("/")[2];
  const shareData = {
    title: "MDX slides online",
    text:
      deckDataDecoded && deckDataDecoded.length > 10
        ? `${deckDataDecoded.slice(0, 10)}...`
        : deckDataDecoded,
    url: pathToShare
  };
  const [, /* isCopied */ setCopied] = useCopyClipboard(pathToShare);
  const [copiedValue, setCopiedValue] = useState();
  const isCopiedValueSameAsCurrentValue = copiedValue === pathToShare;
  const showSnackbar = copiedValue && isCopiedValueSameAsCurrentValue;

  console.log("🌟🚨: copiedValue", copiedValue);
  console.log("🌟🚨: showSnackbar", showSnackbar);
  return (
    <ThemeProvider theme={theme}>
      <AppStyles>
        {children}
        <ControlsStyles>
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
                setCopied(pathToShare);
                setCopiedValue(pathToShare);
                setTimeout(() => setCopiedValue(null), 2500);
              }}
            >
              Share
              <FileCopyIcon />
            </Button>
          )}
          {isPresentationPage ? (
            <>
              <Link to={pathBackToEdit}>
                <Button variant="contained" color="secondary">
                  <PlayIcon className="editIcon" />
                  Edit
                </Button>
              </Link>
              <Button
                className="square"
                variant="contained"
                color="primary"
                onClick={() => {
                  const deckElement = document.querySelector(
                    ".presentation-deck"
                  );
                  deckElement.requestFullscreen().catch(err => {
                    alert(
                      `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
                    );
                  });
                  setIsPresentationMode(true);
                }}
              >
                <FullScreenIcon style={{ transform: "scale(1.35)" }} />
              </Button>
              <Button variant="contained" className="square">
                <CastButton />
              </Button>
            </>
          ) : (
            <Button variant="contained" color="primary" onClick={handleBuild}>
              Build
              <PlayIcon />
            </Button>
          )}

          <Snackbar open={showSnackbar} autoHideDuration={3000}>
            <Alert severity="success">Copied to clipboard!</Alert>
          </Snackbar>
        </ControlsStyles>
      </AppStyles>
    </ThemeProvider>
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
