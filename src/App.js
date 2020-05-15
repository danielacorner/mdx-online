import React, { useState } from "react";

import { ControlledEditor } from "@monaco-editor/react";
import { Switch, useMediaQuery } from "@material-ui/core";
import { useHistory, useLocation } from "react-router-dom";
import lzString from "lz-string";
import Layout from "./components/Layout";
import qs from "query-string";
import Deck from "./components/Deck";
import styled from "styled-components/macro";
import { useDeck, useWindowSize } from "./utils/customHooks";
import {
  defaultValue,
  THEMES,
  TRANSITION,
  BREAKPOINTS,
} from "./utils/constants";
import ReactMde from "react-mde";
import "react-mde/lib/styles/css/react-mde-all.css";

const PROMPT_HEIGHT_PX = 80;

const EditorAndPreviewStyles = styled.div``;

const ControlsStyles = styled.div``;

const App = () => {
  const history = useHistory();
  const { search } = useLocation();
  // const location = useLocation();
  // const search = location.search

  const { deckDataDecoded } = useDeck();

  const [editorValue, setEditorValue] = useState(
    deckDataDecoded || defaultValue
  );

  const isTabletOrLarger = useMediaQuery(
    `(min-width: ${BREAKPOINTS.TABLET}px)`
  );

  const query = qs.parse(search);

  const isLightThemeInQuery = "t" in query && query.t === THEMES.LIGHT.QUERY;

  const [isLightTheme, setIsLightTheme] = useState(isLightThemeInQuery);

  const [isPreviewVisible, setIsPreviewVisible] = useState(
    window.innerWidth > BREAKPOINTS.DESKTOP
  );

  const handleEditorChange = (ev, value) => {
    const compressed = lzString.compressToEncodedURIComponent(value);
    const query = qs.parse(search);
    query.d = compressed;
    const newHref = `/?${qs.stringify(query)}`;
    history.replace(newHref);
    setEditorValue(value);
  };

  const handleThemeChange = (ev, value) => {
    const newIsLightTheme = !isLightTheme;
    setIsLightTheme(newIsLightTheme);

    // if the url query doesn't contain the current theme,
    // update the url query
    if (newIsLightTheme && !isLightThemeInQuery) {
      query.t = THEMES.LIGHT.QUERY;
      history.replace(`/?${qs.stringify(query)}`);
    } else if (!newIsLightTheme && isLightThemeInQuery) {
      delete query.t;
      history.replace(`/?${qs.stringify(query)}`);
    }
  };

  const windowSize = useWindowSize();
  return (
    <Layout
      isPresentationPage={false}
      pathToDeck={`/deck/?${qs.stringify(query)}`}
    >
      <ControlsStyles
        className="controls"
        css={`
          z-index: 999;
          position: fixed;
          top: ${windowSize.height - (isTabletOrLarger ? 90 : 140)}px;
          left: ${isTabletOrLarger ? 30 : windowSize.width - 160}px;
          display: grid;
          .themeSwitch {
            .dark {
              color: white;
            }
            .light {
              color: black;
            }
          }
          .layoutSwitch .preview {
            color: ${isLightTheme ? "black" : "white"};
          }
        `}
      >
        <div className="layoutSwitch">
          <span className="preview">Preview</span>{" "}
          <Switch
            checked={isPreviewVisible}
            onChange={() => setIsPreviewVisible(!isPreviewVisible)}
          />
        </div>
        <div className="themeSwitch">
          <span className="dark">Dark</span>{" "}
          <Switch onChange={handleThemeChange} />{" "}
          <span className="light">Light</span>
        </div>
      </ControlsStyles>
      <EditorAndPreviewStyles
        css={`
          width: 100%;
          display: grid;
          grid-template-columns: ${isPreviewVisible && isTabletOrLarger
            ? "50vw 50vw"
            : "1fr"};
          grid-template-rows: ${isPreviewVisible && !isTabletOrLarger
            ? "50vh 50vh"
            : "1fr"};
          .editor {
            width: 100%;
            max-width: 100vw;
          }
          .monaco-editor {
            * {
              transition: ${TRANSITION};
            }
          }
          .react-mde {
            * {
              transition: ${TRANSITION};
            }
            display: flex;
            flex-direction: column;
            border: none;
            border-bottom: 1px solid #c8ccd0;
            height: calc(100% - ${PROMPT_HEIGHT_PX}px);
            & > div:not(.mde-header),
            .mde-textarea-wrapper,
            .mde-text,
            textarea {
              height: 100% !important;
            }
            .grip {
              display: none;
            }
            textarea,
            .mde-header,
            .mde-header * {
              background: ${THEMES[isLightTheme ? "LIGHT" : "DARK"].STYLES
                .background};
              color: ${THEMES[isLightTheme ? "LIGHT" : "DARK"].STYLES.color};
            }
          }
        `}
        className="editorAndPreview"
      >
        <div className="editor">
          <div style={{ pointerEvents: "none" }}>
            <ControlledEditor
              height={PROMPT_HEIGHT_PX}
              width={"100%"}
              language="markdown"
              value={`
  <!-- type your slides, in Markdown, separated by "---" -->
  `}
              theme={isLightTheme ? "light" : "dark"}
              options={{ lineNumbers: "off", wordWrap: "on" }}
            />
          </div>
          {/* for touch devices, can't use monaco */}
          {!isTabletOrLarger ? (
            <ReactMde
              value={editorValue}
              onChange={(newValue) => handleEditorChange(null, newValue)}
            />
          ) : (
            <ControlledEditor
              value={editorValue}
              onChange={handleEditorChange}
              height={`calc(${
                isPreviewVisible && !isTabletOrLarger ? 50 : 100
              }vh - ${PROMPT_HEIGHT_PX}px)`}
              width={"100%"}
              language="markdown"
              theme={isLightTheme ? "light" : "dark"}
              options={{ wordWrap: "on" }}
            />
          )}
        </div>
        {isPreviewVisible && <Deck isPreview={true} />}
      </EditorAndPreviewStyles>
    </Layout>
  );
};

export default App;
