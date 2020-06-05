import React from "react";

import { Switch, useMediaQuery } from "@material-ui/core";
import styled from "styled-components/macro";
import { BREAKPOINTS, THEMES } from "../utils/constants";
import { useWindowSize } from "../utils/customHooks";
import queryString from "query-string";
import { useLocation, useHistory } from "react-router";

const ControlsStyles = styled.div`
  z-index: 999;
  position: fixed;
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
    color: ${(props) => (props.isLightTheme ? "black" : "white")};
  }
`;

export default function EditorControls({
  isLightTheme,
  isPreviewVisible,
  togglePreview,
  setIsLightTheme,
}) {
  const { replace: replaceHistory } = useHistory();
  const { search } = useLocation();
  const query = queryString.parse(search);
  const isLightThemeInQuery = useIsLightThemeInQuery();

  const handleThemeChange = () => {
    const newIsLightTheme = !isLightTheme;
    setIsLightTheme(newIsLightTheme);
    changeThemeInUrl(
      newIsLightTheme,
      isLightThemeInQuery,
      query,
      replaceHistory
    );
  };
  const windowSize = useWindowSize();

  const isTabletOrLarger = useMediaQuery(
    `(min-width: ${BREAKPOINTS.TABLET}px)`
  );
  return (
    <ControlsStyles
      className="controls"
      style={{
        left: isTabletOrLarger ? 30 : windowSize.width - 160,
        top: windowSize.height - (isTabletOrLarger ? 90 : 140),
      }}
      isLightTheme={isLightTheme}
    >
      <div className="layoutSwitch">
        <span className="preview">Preview</span>{" "}
        <Switch checked={isPreviewVisible} onChange={togglePreview} />
      </div>
      <div className="themeSwitch">
        <span className="dark">Dark</span>{" "}
        <Switch onChange={handleThemeChange} />{" "}
        <span className="light">Light</span>
      </div>
    </ControlsStyles>
  );
}

export function useIsLightThemeInQuery() {
  const { search } = useLocation();
  const query = queryString.parse(search);
  return "t" in query && query.t === THEMES.LIGHT.QUERY;
}

function changeThemeInUrl(
  newIsLightTheme,
  isLightThemeInQuery,
  query,
  replaceHistory
) {
  if (newIsLightTheme && !isLightThemeInQuery) {
    query.t = THEMES.LIGHT.QUERY;
    replaceHistory(`/?${queryString.stringify(query)}`);
  } else if (!newIsLightTheme && isLightThemeInQuery) {
    delete query.t;
    replaceHistory(`/?${queryString.stringify(query)}`);
  }
}
