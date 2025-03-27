export function onImageLoad(
  image: HTMLImageElement,
  onLoadedCallback?: () => void,
  onSizeLoadedCallback?: (width: number, height: number) => void,
): () => void {
  if (!onLoadedCallback && !onSizeLoadedCallback) {
    return () => {};
  }

  if (image.complete) {
    onLoadedCallback?.();
    onSizeLoadedCallback?.(image.naturalWidth, image.naturalHeight);
    return () => {};
  }

  let sizeLoaded = false;
  let sizePoll: NodeJS.Timer | undefined;
  if (onSizeLoadedCallback) {
    sizePoll = setInterval(function () {
      if (image.naturalWidth) {
        clearInterval(sizePoll);
        sizeLoaded = true;
        onSizeLoadedCallback(image.naturalWidth, image.naturalHeight);
      }
    }, 10);
  }

  const onLoaded = () => {
    if (sizePoll !== undefined) {
      clearInterval(sizePoll);

      if (!sizeLoaded) {
        onSizeLoadedCallback?.(image.naturalWidth, image.naturalHeight);
      }
    }
    onLoadedCallback?.();
  };

  image.addEventListener("load", onLoaded, { once: true });
  image.addEventListener("error", onLoaded, { once: true });

  return () => {
    if (sizePoll !== undefined) {
      clearInterval(sizePoll);
    }

    image.removeEventListener("load", onLoaded);
    image.removeEventListener("error", onLoaded);
  };
}
