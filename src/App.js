import React, { useState } from "react";

import { ControlledEditor } from "@monaco-editor/react";
import { Switch } from "@material-ui/core";
import { useHistory, useLocation } from "react-router-dom";
import lzString from "lz-string";
import Layout from "./components/Layout";
import qs from "query-string";

const defaultValue = `hello
---
world`;

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
      <div className="controls">
        <div className="themeSwitch">
          <span className="dark">Dark</span>{" "}
          <Switch onChange={() => setIsLightTheme(!isLightTheme)} />{" "}
          <span className="light">Light</span>
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
    </Layout>
  );
};
