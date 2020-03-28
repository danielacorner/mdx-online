import React, { useState } from "react";

import { ControlledEditor } from "@monaco-editor/react";
import styled from "styled-components/macro";
import { Switch, Button } from "@material-ui/core";
import { useHistory, useLocation } from "react-router-dom";

import qs from "query-string";

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

export default () => {
  const parsed = qs.parse(window.location.search);
  const history = useHistory();
  const location = useLocation();
  console.log("⚡🚨: parsed", parsed);
  const [value, setValue] = useState(decodeURI(location.search.slice(1))); // slice off the question mark
  console.log("⚡🚨: location", location.search);
  const [isLightTheme, setIsLightTheme] = useState(false);

  const handleEditorChange = (ev, value) => {
    setValue(value);
    history.push(`/?${encodeURI(value)}`);
  };
  const handleBuild = () => {
    history.push(`/deck/${encodeURI(value)}`);
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
      <ControlledEditor
        value={value}
        onChange={handleEditorChange}
        height={`100vh`}
        language="markdown"
        theme={isLightTheme ? "light" : "dark"}
        options={{ wordWrap: "on" }}
      />
    </AppStyles>
  );
};
