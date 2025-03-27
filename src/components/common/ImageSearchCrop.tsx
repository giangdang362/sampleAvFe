import { Box } from "@mui/material";
import {
  FC,
  SVGProps,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import ReactCrop, {
  convertToPixelCrop,
  PercentCrop,
  PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useDebouncedCallback } from "use-debounce";

export type SearchCrop = Omit<PixelCrop, "unit">;

export interface ImageSearchCropProps {
  src: string;
  onChange?: (crop?: SearchCrop) => void;
  maxHeight?: string;
  cornerSize?: number;
  tallImgRatio?: number;
}

const defaultCrop: PercentCrop = {
  unit: "%",
  x: 10,
  y: 10,
  width: 80,
  height: 80,
};

const CornerSvg = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 25 26"
    fill="none"
    {...props}
    style={{
      filter: "drop-shadow(rgb(204, 204, 204) -1px -1px 1px)",
      ...props.style,
    }}
  >
    <path
      stroke="#fff"
      strokeLinejoin="round"
      strokeWidth={4}
      d="M2.25 25.75v-13c0-5.523 4.477-10 10-10h12.5"
    />
  </svg>
);

const ImageSearchCrop: FC<ImageSearchCropProps> = ({
  src,
  onChange,
  maxHeight,
  cornerSize = 25,
  tallImgRatio = 0.5,
}) => {
  const minSize = cornerSize * 2.2;

  const [imgRef, setImgRef] = useState<HTMLImageElement | null>(null);
  const [isImgLoaded, setIsImgLoaded] = useState(false);
  const [imgRatio, setImgRatio] = useState<number>();
  const [crop, setCrop] = useState<PercentCrop>(defaultCrop);
  const [isCropChange, setIsCropChange] = useState(false);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const debouncedOnChange = useDebouncedCallback(
    useCallback((crop?: SearchCrop) => {
      onChangeRef.current?.(crop);
    }, []),
    1100,
  );

  const handleChange = useCallback(
    (completedCrop?: PercentCrop) => {
      if (!imgRef || !isImgLoaded) return;

      const tempCrop = convertToPixelCrop(
        completedCrop ?? defaultCrop,
        imgRef.naturalWidth,
        imgRef.naturalHeight,
      );

      onChangeRef.current?.();
      debouncedOnChange({
        x: Math.ceil(tempCrop.x),
        y: Math.ceil(tempCrop.y),
        width: Math.floor(tempCrop.width),
        height: Math.floor(tempCrop.height),
      });
    },
    [debouncedOnChange, imgRef, isImgLoaded],
  );

  useLayoutEffect(() => {
    if (!imgRef) return;
    setIsImgLoaded(!!imgRef.complete);
    setImgRatio(imgRef.complete ? imgRef.width / imgRef.height : undefined);
    onChangeRef.current?.();
  }, [src, imgRef]);

  useEffect(() => {
    if (!isImgLoaded) return;
  }, [isImgLoaded]);

  useEffect(() => {
    if (!imgRef || !isImgLoaded) return;

    let crop: PercentCrop | undefined;
    if (imgRef.width < minSize || imgRef.height < minSize) {
      const newPercentageCrop = {
        ...defaultCrop,
        ...(imgRef.width < minSize ? { x: 0, width: 100 } : undefined),
        ...(imgRef.height < minSize ? { y: 0, height: 100 } : undefined),
      };
      setCrop(newPercentageCrop);
      crop = newPercentageCrop;
    } else {
      setCrop(defaultCrop);
    }

    handleChange(crop);
  }, [handleChange, imgRef, isImgLoaded, minSize]);

  const [reactCropRef, setReactCropRef] = useState<ReactCrop | null>(null);
  useEffect(() => {
    if (!reactCropRef) return;

    // HACK:
    const originalOnCropPointerDown = reactCropRef.onCropPointerDown;
    reactCropRef.onCropPointerDown = function (e) {
      debouncedOnChange.cancel();
      setIsCropChange(false);
      originalOnCropPointerDown(e);
    };

    return () => {
      reactCropRef.onCropPointerDown = originalOnCropPointerDown;
    };
  }, [debouncedOnChange, reactCropRef]);

  const isTallImg = imgRatio && imgRatio < tallImgRatio;
  const containerWidth = isTallImg ? "fit-content" : "100%";

  return (
    <Box
      sx={{
        width: containerWidth,
        position: "relative",
        "& .ReactCrop__crop-selection": {
          animation: "unset !important",
          backgroundImage: "unset !important",
          zIndex: 1,
        },
        "& .ReactCrop__drag-handle": {
          opacity: 0,
          "&:focus-visible": {
            opacity: 0.7,
          },
          "&.ord-nw, &.ord-ne, &.ord-se, &.ord-sw": {
            width: cornerSize,
            height: cornerSize,
          },
          "&.ord-nw": {
            transform: "translate(-4px, -4px)",
          },
          "&.ord-ne": {
            transform: "translate(4px, -4px)",
          },
          "&.ord-se": {
            transform: "translate(4px, 4px)",
          },
          "&.ord-sw": {
            transform: "translate(-4px, 4px)",
          },
        },
      }}
    >
      <ReactCrop
        ref={setReactCropRef}
        key={isTallImg + ""}
        crop={crop}
        onChange={(_, percentCrop) => {
          setCrop(percentCrop);
          setIsCropChange(true);
        }}
        onComplete={(_, completedCrop) => {
          if (isCropChange) {
            handleChange(completedCrop);
          }
        }}
        minWidth={minSize}
        minHeight={minSize}
        style={{
          display: "block",
          width: containerWidth,
          borderRadius: "12px",
          overflow: "hidden",
          cursor: "initial",
        }}
        keepSelection
      >
        <Box
          ref={setImgRef}
          src={src}
          component={"img"}
          onLoad={(e) => {
            setIsImgLoaded(true);
            setImgRatio(e.currentTarget.width / e.currentTarget.height);
          }}
          onError={() => {
            setIsImgLoaded(true);
            setImgRatio(undefined);
          }}
          sx={{
            borderRadius: "12px",
            ...(isTallImg
              ? { height: maxHeight ?? "100%" }
              : { width: "100%" }),
          }}
          draggable={false}
        />
      </ReactCrop>

      {isImgLoaded && (
        <Box
          position="absolute"
          top={crop.y + "%"}
          left={crop.x + "%"}
          width={crop.width + "%"}
          height={crop.height + "%"}
          sx={{
            "& svg": {
              position: "absolute",
              width: cornerSize,
              height: cornerSize,
            },
          }}
        >
          <CornerSvg style={{ top: -3, left: -3 }} />
          <CornerSvg
            style={{ top: -3, right: -3, transform: "rotate(90deg)" }}
          />
          <CornerSvg
            style={{ bottom: -3, right: -3, transform: "rotate(180deg)" }}
          />
          <CornerSvg
            style={{ bottom: -3, left: -3, transform: "rotate(270deg)" }}
          />
        </Box>
      )}
    </Box>
  );
};

export default ImageSearchCrop;
