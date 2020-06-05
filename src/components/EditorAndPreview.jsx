import React, { useState, useEffect, useRef } from "react";
import lzString from "lz-string";

import { ControlledEditor } from "@monaco-editor/react";
import Deck from "../components/Deck";
import {
  TRANSITION,
  THEMES,
  BREAKPOINTS,
  defaultValue,
} from "../utils/constants";
import ReactMde from "react-mde";
import styled from "styled-components/macro";
import { useMediaQuery } from "@material-ui/core";
import { useHistory, useLocation } from "react-router";
import { useDeck } from "../utils/customHooks";
import queryString from "query-string";

const TOPMOST_EDITOR_OPTIONS = { lineNumbers: "off", wordWrap: "on" };
const EDITOR_OPTIONS = { wordWrap: "on" };

const PROMPT_HEIGHT_PX = 80;
const UPDATE_HISTORY_INTERVAL = 1 * 1000;
const RELOAD_EDITOR_INTERVAL = 60 * 1000;

const EditorAndPreviewStyles = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: ${(props) =>
    props.isPreviewVisible && props.isTabletOrLarger ? "50vw 50vw" : "1fr"};
  grid-template-rows: ${(props) =>
    props.isPreviewVisible && !props.isTabletOrLarger ? "50vh 50vh" : "1fr"};
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
      background: ${(props) => props.STYLES.background};
      color: ${(props) => props.STYLES.color};
    }
  }
`;

export default function EditorAndPreview({ isPreviewVisible, isLightTheme }) {
  const { replace: replaceHistory } = useHistory();
  const { deckDataDecoded } = useDeck();

  const [editorValue, setEditorValue] = useState(
    deckDataDecoded || defaultValue
  );

  const { search } = useLocation();
  const query = queryString.parse(search);

  const editorValueRef = useRef();
  const queryRef = useRef();
  const lastPositionRef = useRef({ lineNumber: 0, column: 0 });

  // update the url every N seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      const compressed = lzString.compressToEncodedURIComponent(
        editorValueRef.current
      );
      if (queryRef.current) {
        queryRef.current.d = compressed;
        const newHref = `/?${queryString.stringify(queryRef.current)}`;
        replaceHistory(newHref);
      }
    }, UPDATE_HISTORY_INTERVAL);
    return () => {
      clearInterval(intervalId);
    };
  }, [replaceHistory]);

  const handleEditorChange = (ev, value) => {
    const { range } = ev.changes[0];
    lastPositionRef.current = {
      lineNumber: range.endLineNumber,
      column: range.endColumn + 1,
    };
    // save the value
    editorValueRef.current = value;
    // save the query
    queryRef.current = query;
    setEditorValue(value);
  };

  const editorDidMount = (getEditorValue, monaco) => {
    monaco.setPosition(lastPositionRef.current);
    setTimeout(() => {
      monaco.focus();
    });
  };

  const [editorKey, setEditorKey] = useState(Math.random());

  // reload the editor every N minutes to clear its history & free up memory
  useEffect(() => {
    const intervalId = setInterval(() => {
      setEditorKey(Math.random());
    }, RELOAD_EDITOR_INTERVAL);
    return () => {
      clearInterval(intervalId);
    };
  }, [replaceHistory]);

  const isTabletOrLarger = useMediaQuery(
    `(min-width: ${BREAKPOINTS.TABLET}px)`
  );
  const STYLES = THEMES[isLightTheme ? "LIGHT" : "DARK"].STYLES;
  return (
    <EditorAndPreviewStyles
      key={editorKey}
      STYLES={STYLES}
      isPreviewVisible={isPreviewVisible}
      isTabletOrLarger={isTabletOrLarger}
      className="editorAndPreview"
    >
      <div className="editor">
        <div
          style={{
            pointerEvents: "none",
          }}
        >
          <ControlledEditor
            height={PROMPT_HEIGHT_PX}
            width={"100%"}
            language="markdown"
            value={`
  <!-- type your slides, in Markdown, separated by "---" -->
  `}
            theme={isLightTheme ? "light" : "dark"}
            options={TOPMOST_EDITOR_OPTIONS}
          />
        </div>
        {/* for touch devices, can't use monaco */}
        {isTabletOrLarger ? (
          <ControlledEditor
            value={editorValue}
            onChange={handleEditorChange}
            editorDidMount={editorDidMount}
            height={`calc(${
              isPreviewVisible && !isTabletOrLarger ? 50 : 100
            }vh - ${PROMPT_HEIGHT_PX}px)`}
            width={"100%"}
            language="markdown"
            theme={isLightTheme ? "light" : "dark"}
            options={EDITOR_OPTIONS}
          />
        ) : (
          <ReactMde
            value={editorValue}
            onChange={(newValue) => handleEditorChange(newValue)}
          />
        )}
      </div>
      {isPreviewVisible && <Deck />}
    </EditorAndPreviewStyles>
  );
}
