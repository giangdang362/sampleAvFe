import { onImageLoad } from "@/utils/image-load";
import { Box, Skeleton, SkeletonProps } from "@mui/material";
import {
  DetailedHTMLProps,
  ImgHTMLAttributes,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export type ImageWithSkeletonProps = DetailedHTMLProps<
  ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
> &
  Omit<SkeletonProps, "variant" | "animation" | "component"> & {
    cacheImages?: boolean;
    fillAvailable?: boolean;
    skeletonWidth?: number | string;
    skeletonHeight?: number | string;
  };

const ImageWithSkeleton: React.FC<ImageWithSkeletonProps> = ({
  src,
  width,
  height,
  cacheImages,
  fillAvailable,
  skeletonWidth,
  skeletonHeight,
  ...rest
}) => {
  const imageCacheRef = useRef<{ [key: string]: HTMLImageElement }>({});
  const [isLoaded, setIsLoaded] = useState(() => {
    if (!src) return false;

    const image = createImage(
      src,
      cacheImages ? imageCacheRef.current : undefined,
    );

    return image.complete;
  });
  const [imageRatio, setImageRatio] = useState<number>(0);

  useLayoutEffect(() => {
    if (!src) {
      setIsLoaded(true);
      setImageRatio(0);
      return;
    }

    setIsLoaded(false);
    setImageRatio(0);
    const onLoaded = () => setIsLoaded(true);
    const onSizeLoaded = (width: number, height: number) =>
      setImageRatio(width / height);

    const image = createImage(
      src,
      cacheImages ? imageCacheRef.current : undefined,
    );

    return onImageLoad(image, onLoaded, onSizeLoaded);
  }, [src, cacheImages]);

  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  }>();
  useEffect(() => {
    if (!fillAvailable || !imageRatio || !containerRef) return;

    const resizeObserver = new ResizeObserver(([entry]) => {
      setContainerSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    resizeObserver.observe(containerRef);

    return () => resizeObserver.disconnect();
  }, [containerRef, fillAvailable, imageRatio]);

  if (fillAvailable) {
    let imageWidth: number = 0,
      imageHeight: number = 0;
    if (imageRatio && containerSize) {
      const containerRatio = containerSize.width / containerSize.height;
      if (imageRatio > containerRatio) {
        imageWidth = containerSize.width;
        imageHeight = containerSize.width / imageRatio;
      } else {
        imageWidth = containerSize.height * imageRatio;
        imageHeight = containerSize.height;
      }
    }

    return (
      <Box
        ref={setContainerRef}
        width="100%"
        height="100%"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        {isLoaded ? (
          <Box
            component="img"
            src={src}
            {...rest}
            style={{
              ...rest.style,
              width: imageWidth,
              height: imageHeight,
            }}
          />
        ) : (
          <Skeleton
            variant="rectangular"
            animation="wave"
            {...rest}
            style={{
              ...rest.style,
              width: imageWidth || "100%",
              height: imageHeight || "100%",
            }}
          />
        )}
      </Box>
    );
  }

  return isLoaded ? (
    <Box component="img" src={src} width={width} height={height} {...rest} />
  ) : (
    <Skeleton
      variant="rectangular"
      animation="wave"
      width={(imageRatio ? undefined : skeletonWidth) ?? width}
      height={(imageRatio ? undefined : skeletonHeight) ?? height}
      {...rest}
      sx={[
        ...(Array.isArray(rest.sx) ? rest.sx : [rest.sx]),
        imageRatio
          ? {
              aspectRatio: imageRatio,
              width: skeletonWidth && !width ? "initial !important" : undefined,
              height:
                skeletonHeight && !height ? "initial !important" : undefined,
            }
          : undefined,
      ]}
    />
  );
};

export default ImageWithSkeleton;

const createImage = (
  src: string,
  cache?: { [key: string]: HTMLImageElement },
) => {
  let image: HTMLImageElement;
  if (cache?.[src]) {
    image = cache[src];
  } else {
    image = new Image();
    image.src = src;
  }

  if (cache) {
    cache[src] = image;
  }

  return image;
};
