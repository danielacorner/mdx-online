import React, { useState } from "react";

import { useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import queryString from "query-string";
import { BREAKPOINTS } from "./utils/constants";
import "react-mde/lib/styles/css/react-mde-all.css";
import EditorAndPreview from "./components/EditorAndPreview";
import EditorControls, {
  useIsLightThemeInQuery,
} from "./components/EditorControls";

export default function App() {
  const { search, hash } = useLocation();

  const query = queryString.parse(search);
  const isLightThemeInQuery = useIsLightThemeInQuery(query);

  const [isLightTheme, setIsLightTheme] = useState(isLightThemeInQuery);

  const [isPreviewVisible, setIsPreviewVisible] = useState(
    window.innerWidth > BREAKPOINTS.DESKTOP
  );

  const togglePreview = () => setIsPreviewVisible((prev) => !prev);

  return (
    <Layout
      isPresentationPage={false}
      pathToDeck={`/deck/?${queryString.stringify(query)}${hash}`}
    >
      <EditorControls
        setIsLightTheme={setIsLightTheme}
        isLightTheme={isLightTheme}
        isPreviewVisible={isPreviewVisible}
        togglePreview={togglePreview}
      />
      <EditorAndPreview
        isLightTheme={isLightTheme}
        isPreviewVisible={isPreviewVisible}
      />
    </Layout>
  );
}
