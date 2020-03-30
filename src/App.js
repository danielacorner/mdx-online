import React, { useState } from "react";

import { ControlledEditor } from "@monaco-editor/react";
import { Switch } from "@material-ui/core";
import { useHistory, useLocation } from "react-router-dom";
import lzString from "lz-string";
import Layout from "./components/Layout";
import qs from "query-string";
import styled from "styled-components/macro";

const StyledDiv = styled.div``;

const defaultValue = `# My Sweet Deck
## 😎✨🆒
---
Check out the [Markdown Cheat Sheet](https://www.markdownguide.org/cheat-sheet/)
---
![A random image](https://picsum.photos/250/500)`;
const PROMPT_HEIGHT_EM = 5;

export default () => {
  const history = useHistory();
  const { search } = useLocation();
  const deckData = search.slice(1);
  const deckDataDecoded = lzString.decompressFromEncodedURIComponent(deckData);
  const [value, setValue] = useState(deckDataDecoded || defaultValue);

  const [isLightTheme, setIsLightTheme] = useState(false);

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
      <StyledDiv
        className="controls"
        css={`
          .themeSwitch {
            z-index: 999;
            position: fixed;
            bottom: 1em;
            left: 1em;
            .dark {
              color: white;
            }
            .light {
              color: black;
            }
          }
        `}
      >
        <div className="themeSwitch">
          <span className="dark">Dark</span>{" "}
          <Switch onChange={() => setIsLightTheme(!isLightTheme)} />{" "}
          <span className="light">Light</span>
        </div>
      </StyledDiv>
      <div style={{ pointerEvents: "none" }}>
        <ControlledEditor
          height={`${PROMPT_HEIGHT_EM}em`}
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
        language="markdown"
        theme={isLightTheme ? "light" : "dark"}
        options={{ wordWrap: "on" }}
      />
    </Layout>
  );
};
