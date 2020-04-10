import { useEffect, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router";
import lzString from "lz-string";
import { defaultValue, THEMES } from "./constants";
import { useSwipeable } from "react-swipeable";
import qs from "query-string";

// https://usehooks.com/useEventListener/
const isWindowAvailable = typeof window !== `undefined`;
const windowIfAvailable = isWindowAvailable ? window : null;
export function useEventListener(
  eventName,
  handler,
  element = windowIfAvailable
) {
  // Create a ref that stores handler
  const savedHandler = useRef();

  // Update ref.current value if handler changes.
  // This allows our effect below to always get latest handler ...
  // ... without us needing to pass it in effect deps array ...
  // ... and potentially cause effect to re-run every render.
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(
    () => {
      // Make sure element supports addEventListener
      // On
      const isSupported = element && element.addEventListener;
      if (!isSupported) return;

      // Create event listener that calls handler function stored in ref
      const eventListener = (event) => savedHandler.current(event);

      // Add event listener
      element.addEventListener(eventName, eventListener);

      // Remove event listener on cleanup
      return () => {
        element.removeEventListener(eventName, eventListener);
      };
    },
    [eventName, element] // Re-run if eventName or element changes
  );
}

export function usePrevious(value) {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = useRef();

  // Store current value in ref
  useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes

  // Return previous value (happens before update in useEffect above)
  return ref.current;
}

export function useSyncDeckWithHash(slideIndex) {
  const { search, pathname } = useLocation();
  const history = useHistory();
  useEffect(() => {
    history.replace(`${pathname + search}#${slideIndex}`);
  }, [slideIndex, pathname, search, history]);
}

export function useDeck() {
  const { search, hash } = useLocation();
  const query = qs.parse(search);
  const deckData = query.d;
  const deckDataFromLocation = search.slice(1);
  const deckDataEncoded = deckData || deckDataFromLocation;
  const deckDataDecoded = lzString.decompressFromEncodedURIComponent(
    deckDataEncoded
  );
  const separators = ["---", "\\*\\*\\*"];

  const indexFromHash = hash && hash.slice(1);
  const [slideIndex, setSlideIndex] = useState(Number(indexFromHash) || 0);
  const slides = (deckDataDecoded || defaultValue).split(
    new RegExp(separators.join("|"), "g")
  );

  const stepBack = () => setSlideIndex(Math.max(0, slideIndex - 1));
  const stepForward = () =>
    setSlideIndex(Math.min(slides.length - 1, slideIndex + 1));

  const [isPresentationMode, setIsPresentationMode] = useState(false);

  return {
    slides,
    slideIndex,
    deckDataEncoded,
    deckDataDecoded,
    stepBack,
    stepForward,
    isPresentationMode,
    setIsPresentationMode,
  };
}

export function useChangeSlidesOnKeydownOrMousewheel({
  stepForward,
  stepBack,
}) {
  const handleKeyDown = (event) => {
    if (["ArrowRight", "ArrowDown"].includes(event.key)) {
      stepForward();
    }
    if (["ArrowLeft", "ArrowUp"].includes(event.key)) {
      stepBack();
    }
  };
  useEventListener("keydown", handleKeyDown);

  const handleMouseWheel = (event) => {
    if (event.deltaY > 0) {
      stepForward();
    }
    if (event.deltaY < 0) {
      stepBack();
    }
  };
  useEventListener("wheel", handleMouseWheel);
}

export function useChangeSlidesOnSwipe({ stepForward, stepBack }) {
  const swipeConfig = {
    trackMouse: true, // track mouse input
    preventDefaultTouchmoveEvent: true,
  };
  return useSwipeable({
    onSwipedLeft: stepForward,
    onSwipedRight: stepBack,
    ...swipeConfig,
  });
}

export const useTheme = () => {
  const location = useLocation();
  const isLightTheme = location.search.includes("t=l");
  return isLightTheme ? THEMES.LIGHT.STYLES : THEMES.DARK.STYLES;
};
