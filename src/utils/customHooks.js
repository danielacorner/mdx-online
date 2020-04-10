import { useEffect, useRef, useState } from "react";
import { useHistory, useLocation, useParams } from "react-router";
import lzString from "lz-string";
import { defaultValue } from "./constants";

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

export function useSyncDeckWithHash(isPreview, slideIndex) {
  const { search, pathname } = useLocation();
  const deckDataFromLocation = search.slice(1);
  const history = useHistory();

  useEffect(() => {
    history.replace(
      `${isPreview ? "?" + deckDataFromLocation : pathname}#${slideIndex}`
    );
  }, [slideIndex, pathname, history, isPreview, deckDataFromLocation]);
}

export function useDeck() {
  const { deckData } = useParams();
  const { search, hash } = useLocation();
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
