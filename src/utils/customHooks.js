import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useHistory, useLocation } from "react-router";
import lzString from "lz-string";
import { defaultValue as DEFAULT_VALUE, THEMES } from "./constants";
import { useSwipeable } from "react-swipeable";
import qs from "query-string";
import { debounce } from "@material-ui/core";

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
  const { replace } = useHistory();
  const prevSlideIndex = usePrevious(slideIndex);
  useEffect(() => {
    if (slideIndex !== prevSlideIndex) {
      replace(`${pathname + search}#${slideIndex}`);
    }
  }, [slideIndex, pathname, search, replace, prevSlideIndex]);
}

const SEPARATORS = ["---", "\\*\\*\\*"];

export function useDeck() {
  const { search, hash } = useLocation();

  const { d: deckData } = qs.parse(search);
  const deckDataEncoded = deckData || search.slice(1);

  const deckDataDecoded = useMemo(() => lzString.decompressFromEncodedURIComponent(
    deckDataEncoded
  ), [deckDataEncoded]);;

  const slides = useMemo(() => {
    return (deckDataDecoded || DEFAULT_VALUE).split(
      new RegExp(SEPARATORS.join("|"), "g")
    )
  }, [deckDataDecoded]);

  const indexFromHash = hash?.slice(1);
  const [slideIndex, setSlideIndex] = useState(Number(indexFromHash) || 0);

  const stepBack = useCallback(() => setSlideIndex(prev => Math.max(0, prev - 1)), []);
  const stepForward = useCallback(() =>
    setSlideIndex(prev => Math.min(slides.length - 1, prev + 1)), []);

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
  useEventListener("wheel", debounce(handleMouseWheel, 120));
}

export function useChangeSlidesOnSwipe({ stepForward, stepBack }) {
  const swipeConfig = {
    trackMouse: true, // track mouse input
    preventDefaultTouchmoveEvent: true,
  };
  const isTouchDevice = getIsTouchDevice();
  return useSwipeable({
    onSwipedLeft: isTouchDevice ? stepForward : () => { },
    onSwipedRight: isTouchDevice ? stepBack : () => { },
    ...swipeConfig,
  });
}
export function getIsTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export const useTheme = () => {
  const location = useLocation();
  const isLightTheme = location.search.includes("t=l");
  return isLightTheme ? THEMES.LIGHT.STYLES : THEMES.DARK.STYLES;
};

export function useWindowSize() {
  const isClient = typeof window === "object";

  function getSize() {
    return {
      width: isClient ? window.innerWidth : undefined,
      height: isClient ? window.innerHeight : undefined,
    };
  }

  const [windowSize, setWindowSize] = useState(getSize);

  function handleResize() {
    setWindowSize(getSize());
  }

  useEffect(() => {
    if (!isClient) {
      return;
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return windowSize;
}
