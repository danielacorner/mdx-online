import React, { useState } from "react";

import { ControlledEditor } from "@monaco-editor/react";
import styled from "styled-components/macro";
import { Switch, Button } from "@material-ui/core";
import { useHistory, useLocation } from "react-router-dom";
import lzString from "lz-string";

const CONTROLS_HEIGHT = 20;
const AppStyles = styled.div`
  * {
    box-sizing: border-box;
  }
  .controls {
    /* position: relative;
    height: ${CONTROLS_HEIGHT}px;
    display: flex;
    padding: 0.5em;
    align-items: center;
    justify-content: space-around; */
  }
  .buildBtn {
    position: fixed;
    bottom: ${CONTROLS_HEIGHT}px;
    right: ${CONTROLS_HEIGHT}px;
    z-index: 999;
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

const defaultValue = `hello
---
world`;

export default () => {
  const history = useHistory();
  const { search } = useLocation();
  const deckData = search.slice(1);
  const decompressed = lzString.decompressFromEncodedURIComponent(deckData);
  const [value, setValue] = useState(decompressed || defaultValue);
  const compressed = lzString.compressToEncodedURIComponent(value);

  const [isLightTheme, setIsLightTheme] = useState(false);

  const handleEditorChange = (ev, value) => {
    history.push(`/?${compressed}`);
    setValue(value);
  };
  const handleBuild = () => {
    history.push(`/deck/${compressed}`);
  };

  return (
    <AppStyles>
      <div className="controls">
        <div className="themeSwitch">
          <span className="dark">Dark</span>{" "}
          <Switch onChange={() => setIsLightTheme(!isLightTheme)} />{" "}
          <span className="light">Light</span>
        </div>
        <div className="buildBtn">
          <Button variant="contained" color="primary" onClick={handleBuild}>
            Build
          </Button>
        </div>
      </div>
      <div style={{ pointerEvents: "none" }}>
        <ControlledEditor
          height={`3em`}
          language="markdown"
          value={`
          <!-- type your slides, separated by "---" -->
          `}
          options={{ lineNumbers: "off" }}
        />
      </div>
      <ControlledEditor
        value={value}
        onChange={handleEditorChange}
        height={`calc(100vh - 3em)`}
        language="markdown"
        theme={isLightTheme ? "light" : "dark"}
        options={{ wordWrap: "on" }}
      />
    </AppStyles>
  );
};
