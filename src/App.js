import React, { useState } from "react";

import { ControlledEditor } from "@monaco-editor/react";
import { Switch, useMediaQuery } from "@material-ui/core";
import { useHistory, useLocation } from "react-router-dom";
import lzString from "lz-string";
import Layout from "./components/Layout";
import qs from "query-string";
import Deck from "./components/Deck";
import styled from "styled-components/macro";
import { useDeck } from "./utils/customHooks";
import { defaultValue, THEMES, TRANSITION } from "./utils/constants";

const PROMPT_HEIGHT_EM = 5;

const EditorAndPreviewStyles = styled.div``;

const ControlsStyles = styled.div``;

export default () => {
  const history = useHistory();
  const { search } = useLocation();

  const { deckDataDecoded } = useDeck();

  const [value, setValue] = useState(deckDataDecoded || defaultValue);

  const isTabletOrLarger = useMediaQuery(`(min-width: 768px)`);

  const query = qs.parse(search);

  const isLightThemeInQuery = "t" in query && query.t === THEMES.LIGHT.QUERY;

  const [isLightTheme, setIsLightTheme] = useState(isLightThemeInQuery);

  const [isPreviewVisible, setIsPreviewVisible] = useState(
    window.innerWidth > 1000
  );

  const handleEditorChange = (ev, value) => {
    const compressed = lzString.compressToEncodedURIComponent(value);
    const query = qs.parse(search);
    query.d = compressed;
    const newHref = `/?${qs.stringify(query)}`;
    history.replace(newHref);
    setValue(value);
  };

  const handleThemeChange = (ev, value) => {
    const newIsLightTheme = !isLightTheme;
    setIsLightTheme(newIsLightTheme);

    if (newIsLightTheme && !isLightThemeInQuery) {
      query.t = THEMES.LIGHT.QUERY;
      history.replace(`/?${qs.stringify(query)}`);
    } else if (!newIsLightTheme && isLightThemeInQuery) {
      delete query.t;
      history.replace(`/?${qs.stringify(query)}`);
    }
  };

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
          bottom: 60px;
          right: 20px;
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
          }
          .monaco-editor {
            * {
              transition: ${TRANSITION};
            }
          }
        `}
        className="editorAndPreview"
      >
        <div className="editor">
          <div style={{ pointerEvents: "none" }}>
            <ControlledEditor
              height={`${PROMPT_HEIGHT_EM}em`}
              width={"100%"}
              language="markdown"
              value={`
  <!-- type your slides, in Markdown, separated by "---" -->
  `}
              options={{ lineNumbers: "off", wordWrap: "on" }}
            />
          </div>
          <ControlledEditor
            value={value}
            onChange={handleEditorChange}
            height={`calc(${
              isPreviewVisible && !isTabletOrLarger ? 50 : 100
            }vh - ${PROMPT_HEIGHT_EM}em)`}
            width={"100%"}
            language="markdown"
            theme={isLightTheme ? "light" : "dark"}
            options={{ wordWrap: "on" }}
          />
        </div>
        {isPreviewVisible && <Deck isPreview={true} />}
      </EditorAndPreviewStyles>
    </Layout>
  );
};
