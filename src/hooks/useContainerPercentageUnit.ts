import { useLayoutEffect, useState } from "react";

export const useContainerPercentageUnit = (element: HTMLElement | null) => {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    if (!element) return;

    const handleSize = () => setWidth(element.offsetWidth);
    handleSize();
    const resizeObserver = new ResizeObserver(handleSize);
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [element]);

  return (value: number) => (value * width) / 100 + "px";
};
