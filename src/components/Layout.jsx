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
import { useDeck } from "../utils/customHooks";
import { blackColor } from "../utils/constants";

const theme = createMuiTheme({
  palette: {
    primary: blue,
    secondary: indigo,
  },
});

const LayoutStyles = styled.div`
  * {
    box-sizing: border-box;
  }
  display: grid;
  min-height: 100vh;
  max-height: 100vh;
  background: ${blackColor};
`;

const ControlsStyles = styled.div`
  position: fixed;
  top: calc(100vh - 3.4em);
  right: 1em;
  height: 36.5px;
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
    google-cast-launcher,
    [is="google-cast-button"] {
      width: 32.4px;
      height: 32.4px;
    }
  }
  [is="google-cast-button"] {
    padding: 0 4px;
    width: 38.4px;
    border: none;
    background: none;
  }

  .editIcon {
    transform: rotate(0.5turn);
  }
  button.copied {
    pointer-events: none;
    opacity: 0.5;
  }
`;

/**
 * Layout gives the children a specific layout!
 * @param isPresentationPage controls whether it's full-screen
 */
export default function Layout({ isPresentationPage, pathToDeck, children }) {
  const { deckDataEncoded, deckDataDecoded } = useDeck();
  const { pathname, search, hash, href } = useLocation();
  const { origin } = window.location;
  const pathToShare = `${origin}/?deck=${deckDataEncoded}`;

  const pathBackToEdit = "/" + pathname.split("/")[2] + search + hash;
  const shareData = {
    title: "MDX slides online",
    text:
      deckDataDecoded && deckDataDecoded.length > 10
        ? `${deckDataDecoded.slice(0, 10)}...`
        : deckDataDecoded,
    url: href,
  };
  const [, /* isCopied */ setCopied] = useCopyClipboard(pathToShare);
  const [copiedValue, setCopiedValue] = useState();
  const isCopiedValueSameAsCurrentValue = copiedValue === pathToShare;
  const showSnackbar = copiedValue && isCopiedValueSameAsCurrentValue;

  const controlsProps = {
    shareData,
    showSnackbar,
    setCopied,
    pathToShare,
    setCopiedValue,
    isPresentationPage,
    pathBackToEdit,
    pathToDeck,
  };

  return (
    <ThemeProvider theme={theme}>
      <LayoutStyles>
        {children}
        <Controls {...controlsProps} />
      </LayoutStyles>
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

function Controls({
  shareData,
  showSnackbar,
  setCopied,
  pathToShare,
  setCopiedValue,
  isPresentationPage,
  pathBackToEdit,
  pathToDeck,
}) {
  return (
    <ControlsStyles>
      {/* does navigator contain the share api */}
      {Boolean("share" in navigator) ? (
        <Button variant="contained" onClick={() => handleShare(shareData)}>
          Share<ShareIcon />
        </Button>
      ) : null}
      <Button
        variant="contained"
        className={`${showSnackbar ? "copied" : ""}`}
        onClick={() => {
          setCopied(pathToShare);
          setCopiedValue(pathToShare);
          setTimeout(() => setCopiedValue(null), 2500);
        }}
      >
        Copy url
        <FileCopyIcon />
      </Button>

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
              const deckElement = document.querySelector(".presentation-deck");
              deckElement.requestFullscreen().catch((err) => {
                alert(
                  `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
                );
              });
            }}
          >
            <FullScreenIcon style={{ transform: "scale(1.35)" }} />
          </Button>
        </>
      ) : (
        <Link to={pathToDeck}>
          <Button variant="contained" color="primary">
            Present
            <PlayIcon />
          </Button>
        </Link>
      )}

      <Snackbar
        style={{ marginBottom: "4em" }}
        open={showSnackbar}
        autoHideDuration={3000}
      >
        <Alert severity="success">Copied to clipboard!</Alert>
      </Snackbar>
    </ControlsStyles>
  );
}
