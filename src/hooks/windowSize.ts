import { useState, useRef, useLayoutEffect } from "react";

export function useWindowSize() {
  const [size, setSize] = useState([0, 0]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useLayoutEffect(() => {
    function updateSize() {
      if (timeoutRef.current !== undefined) {
        clearTimeout(timeoutRef.current);
      }

      const timeout = setTimeout(() => {
        setSize([window.innerWidth, window.innerHeight]);
      }, 250);
      timeoutRef.current = timeout;
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return size;
}
