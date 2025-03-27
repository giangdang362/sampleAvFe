import FaIconButton from "@/components/common/FaIconButton";
import { Box, BoxProps, Button, CircularProgress } from "@mui/material";
import { useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DraggableCore, DraggableEventHandler } from "react-draggable";
import { faCheck, faXmark } from "@/lib/fas/pro-solid-svg-icons";
import { useWindowSize } from "@/hooks/windowSize";

type PercentagePosition = {
  x: number;
  y: number;
};

export type CoverSpace = PercentagePosition & {
  width: number;
  height: number;
};

export interface CoverImageProps extends BoxProps {
  isGuest?: boolean;
  src?: string;
  coverSpace?: CoverSpace;
  onCoverSpaceSaved?: (
    coverSpace: CoverSpace,
  ) => (void | boolean) | Promise<void | boolean>;
}

const COVER_IMAGE_RATIO = 6;

const CoverImage: React.FC<CoverImageProps> = ({
  coverSpace,
  src,
  onCoverSpaceSaved,
  sx,
  isGuest = false,
  ...rest
}) => {
  const t = useTranslations("projects.files");
  const tCommon = useTranslations("common");
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [defaultPosition, setDefaultPosition] = useState<
    PercentagePosition | undefined
  >();
  const [isRepositioning, setIsRepositioning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [repositionPosition, setRepositionPosition] = useState<
    (PercentagePosition & { pixelX: number; pixelY: number }) | undefined
  >();

  useLayoutEffect(() => {
    setIsImageLoaded(false);
  }, [src]);

  useEffect(() => {
    if (coverSpace) return;

    if (imageRef.current && containerRef.current && isImageLoaded) {
      const container = containerRef.current;
      const image = imageRef.current;
      const isLandscape = image.width / image.height >= COVER_IMAGE_RATIO;
      setDefaultPosition({
        x: isLandscape
          ? (container.offsetWidth - image.width) / 2 / image.width
          : 0,
        y: !isLandscape
          ? (container.offsetHeight - image.height) / 2 / image.height
          : 0,
      });
    }
  }, [coverSpace, isImageLoaded]);

  const denormalizedCoverSpace: PercentagePosition | undefined = useMemo(() => {
    if (!coverSpace) return;
    return { x: -coverSpace.x / 100, y: -coverSpace.y / 100 };
  }, [coverSpace]);
  const position = denormalizedCoverSpace ?? defaultPosition;

  const handleDragging: DraggableEventHandler = useCallback((_, data) => {
    const container = containerRef.current;
    const image = imageRef.current;
    if (!image || !container) return;

    const isLandscape = image.width / image.height >= COVER_IMAGE_RATIO;
    const coverImageSize = isLandscape
      ? container.offsetWidth
      : container.offsetHeight;
    const trueImageSize = isLandscape ? image.width : image.height;

    setRepositionPosition((prev) => {
      if (!prev) return undefined;

      const pixelX = Math.max(
        Math.min(prev.pixelX + data.deltaX, 0),
        isLandscape ? coverImageSize - trueImageSize : 0,
      );
      const pixelY = Math.max(
        Math.min(prev.pixelY + data.deltaY, 0),
        isLandscape ? 0 : coverImageSize - trueImageSize,
      );

      return {
        pixelX,
        pixelY,
        x: pixelX / image.width,
        y: pixelY / image.height,
      };
    });
  }, []);

  const [windowWidth] = useWindowSize();
  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;

    setRepositionPosition((prev) => {
      if (!prev) return undefined;

      return {
        ...prev,
        pixelX: prev.x * image.width,
        pixelY: prev.y * image.height,
      };
    });
  }, [windowWidth]);

  const handleSave = async () => {
    if (!repositionPosition) return;

    setIsSaving(true);

    const success = await onCoverSpaceSaved?.({
      x: -repositionPosition.x * 100,
      y: -repositionPosition.y * 100,
      // TODO: zoom
      width: 0,
      height: 0,
    });

    if (success !== false) {
      setIsRepositioning(false);
      setRepositionPosition(undefined);
    }

    setIsSaving(false);
  };

  return (
    <Box
      ref={containerRef}
      {...rest}
      sx={[
        {
          position: "relative",
          width: "100%",
          aspectRatio: COVER_IMAGE_RATIO,
          borderRadius: 1.5,
          overflow: "hidden",
          backgroundColor: isImageLoaded
            ? undefined
            : "var(--mui-palette-Skeleton-bg)",

          "& .reposition-button": {
            display: !isGuest ? "block" : "none",
            opacity: 0,
            transition: "opacity 0.3s",
          },
          "&:hover .reposition-button, & .reposition-button:focus-visible": {
            opacity: isImageLoaded && position ? 1 : 0,
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <DraggableCore
        nodeRef={imageRef}
        disabled={!isRepositioning}
        onDrag={handleDragging}
      >
        <Box
          ref={imageRef}
          component="img"
          src={src}
          display="block"
          position="absolute"
          draggable={!isRepositioning}
          onLoad={() => setIsImageLoaded(true)}
          sx={{
            ...(imageRef.current && isImageLoaded
              ? imageRef.current.naturalWidth /
                  imageRef.current.naturalHeight <=
                COVER_IMAGE_RATIO
                ? { width: "100%" }
                : { height: "100%" }
              : undefined),
            userSelect: "none",
            opacity: isImageLoaded && position ? 1 : 0,
          }}
          style={{
            cursor: isRepositioning ? "move" : undefined,
            transform: position
              ? `translate(${(repositionPosition?.x ?? position.x) * 100}%,
                  ${(repositionPosition?.y ?? position.y) * 100}%)`
              : undefined,
          }}
        />
      </DraggableCore>

      {!isSaving ? (
        !isRepositioning ? (
          <Button
            className="reposition-button"
            variant="contained"
            sx={{ position: "absolute", top: 0, right: 0, m: 2 }}
            disabled={!(isImageLoaded && position)}
            onClick={() => {
              const image = imageRef.current;
              if (!image || !position) return;

              setIsRepositioning(true);
              setRepositionPosition({
                ...position,
                pixelX: position.x * image.width,
                pixelY: position.y * image.height,
              });
            }}
          >
            {t("reposition")}
          </Button>
        ) : (
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              right: 0,
              m: 2,
              "& .MuiIconButton-root": {
                bgcolor: "var(--mui-palette-neutral-200)",
                "&:hover": { bgcolor: "var(--mui-palette-neutral-100)" },
                boxShadow: "rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px",
              },
            }}
          >
            <FaIconButton
              icon={faCheck}
              title={tCommon("save")}
              color="success"
              onClick={handleSave}
              wrapperProps={{
                sx: { mr: 1 },
              }}
              tooltipBottomOffset={0}
            />
            <FaIconButton
              icon={faXmark}
              title={tCommon("cancel")}
              color="error"
              onClick={() => {
                setIsRepositioning(false);
                setRepositionPosition(undefined);
              }}
              tooltipBottomOffset={0}
            />
          </Box>
        )
      ) : (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "#ffffff44",
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default CoverImage;
