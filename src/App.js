import React, { useState } from "react";

import { ControlledEditor } from "@monaco-editor/react";
import { Switch, useMediaQuery } from "@material-ui/core";
import { useHistory, useLocation } from "react-router-dom";
import lzString from "lz-string";
import Layout from "./components/Layout";
import qs from "query-string";
import Deck from "./components/Deck";
import styled from "styled-components/macro";

const defaultValue = `My Sweet Deck 😎🆒
---
[Markdown Cheat Sheet](https://www.markdownguide.org/cheat-sheet/)
---
![A random image](https://picsum.photos/250/500)`;
const PROMPT_HEIGHT_EM = 5;

const CONTROLS_HEIGHT = 20;

const EditorAndPreviewStyles = styled.div``;

const ControlsStyles = styled.div``;

export default () => {
  const history = useHistory();
  const { search } = useLocation();
  const deckData = search.slice(1);
  const deckDataDecoded = lzString.decompressFromEncodedURIComponent(deckData);
  const [value, setValue] = useState(deckDataDecoded || defaultValue);

  const isDesktopOrLarger = useMediaQuery(`(min-width: 1000px)`);
  const [isLightTheme, setIsLightTheme] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(isDesktopOrLarger);

  const query = qs.parse(search);
  if ("deck" in query) {
    history.push(`/deck/${query.deck}`);
  }

  const handleEditorChange = (ev, value) => {
    const compressed = lzString.compressToEncodedURIComponent(value);
    history.push(`/?${compressed}`);
    setValue(value);
  };
  const handleBuild = () => {
    const compressed = lzString.compressToEncodedURIComponent(value);
    history.push(`/deck/${compressed}`);
  };

  return (
    <Layout
      isPresentationMode={false}
      deckDataDecoded={deckDataDecoded}
      deckDataEncoded={deckData}
      setIsPresentationMode={null}
      handleBuild={handleBuild}
    >
      <ControlsStyles
        className="controls"
        css={`
          z-index: 999;
          position: fixed;
          bottom: ${CONTROLS_HEIGHT}px;
          left: ${CONTROLS_HEIGHT}px;
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
          <Switch onChange={() => setIsPreviewVisible(!isPreviewVisible)} />
        </div>
        <div className="themeSwitch">
          <span className="dark">Dark</span>{" "}
          <Switch onChange={() => setIsLightTheme(!isLightTheme)} />{" "}
          <span className="light">Light</span>
        </div>
      </ControlsStyles>
      <EditorAndPreviewStyles
        css={`
          width: 100%;
          display: grid;
          grid-template-columns: ${isPreviewVisible ? "50vw 50vw" : "1fr"};
          .editor {
            width: 100%;
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
            height={`calc(100vh - ${PROMPT_HEIGHT_EM}em)`}
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
