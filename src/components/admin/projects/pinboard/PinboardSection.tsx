import { Backdrop, Box, BoxProps, CircularProgress } from "@mui/material";
import React, {
  CSSProperties,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import "react-image-crop/dist/ReactCrop.css";
import PinboardSectionImage from "./PinboardSectionImage";
import {
  useAddImageLibraryToPinBoardMutation,
  useAddProductToPinBoardMutation,
  useAddTextCardMutation,
  useUpdatePinboardSectionMutation,
  useUploadPinboardImagesMutation,
} from "@/services/pinboards";
import { PinboardInfoContext } from "./DesignList";
import { useTranslations } from "next-intl";
import { useContainerPercentageUnit } from "@/hooks/useContainerPercentageUnit";
import GridDash, { GridDashRef } from "@/components/common/grid-dash/GridDash";
import GridDashItem from "@/components/common/grid-dash/GridDashItem";
import { onImageLoad } from "@/utils/image-load";
import { pathFile } from "@/config/api";
import { GridDashLayoutedItem } from "@/components/common/grid-dash/gridDashCore";
import PinboardSectionHeader from "./PinboardSectionHeader";
import { getDiffArray } from "@/utils/diff-array";
import DragAndDrop from "@/components/common/drag-and-drop";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LoadingButton } from "@mui/lab";
import { faTextSize } from "@/lib/fas/pro-regular-svg-icons";
import GridDashFooter from "@/components/common/grid-dash/GridDashFooter";
import {
  PINBOARD_SECTION_HEADER_HEIGHT,
  PINBOARD_SECTION_HEADER_MARGIN_BOTTOM,
  PINBOARD_SECTION_PADDING,
} from "./pageDimension";
import PinboardSectionPageFrame from "./PinboardSectionPageFrame";

const PinboardSectionTextCard = dynamic(
  () => import("./PinboardSectionTextCard"),
  { ssr: false },
);

export interface PinboardSectionProps extends BoxProps {
  section: API.PinboardSection;
  getLastestSection?: (id: string) => Promise<API.PinboardSection>;
}

type LayoutItem = GridDashLayoutedItem & { span: number };
type PartialLayoutItem = Omit<LayoutItem, "span"> &
  Partial<Pick<LayoutItem, "span">>;

const COLUMNS = 4;
const PAGE_RATIO = 1.41;

const PinboardSection: React.FC<PinboardSectionProps> = ({
  section,
  getLastestSection,
  ...rest
}) => {
  const pinboardContext = useContext(PinboardInfoContext);
  if (!pinboardContext) throw new Error("Missing pinboard context");

  const t = useTranslations("pinboard");
  const { pinboardId, noteMode, readOnly } = pinboardContext;

  const gridDashRef = useRef<GridDashRef>(null);

  const [disableDragItems, setDisableDragItems] = React.useState<
    { id: string; reason: "editText" | "cropImage" }[]
  >([]);
  const disableDragging =
    disableDragItems.length !== 0 &&
    (disableDragItems.some((item) => item.reason === "cropImage")
      ? "hard"
      : "soft");

  const [displayLayout, setDisplayLayout] = useState<LayoutItem[]>();
  const [layoutUpdateError, setLayoutUpdateError] = useState(false);
  const imageCachesRef = useRef<Record<string, HTMLImageElement>>({});

  const [isLoadingNewImages, setIsLoadingNewImages] = useState(false);
  const currentSectionImagesLength = section.images.filter(
    (item) => item.type === "pin_board_image",
  ).length;
  const lastSectionImagesLength = useRef(currentSectionImagesLength);
  const setLoadingTimeoutRef = useRef<NodeJS.Timeout>();
  if (lastSectionImagesLength.current < currentSectionImagesLength) {
    if (setLoadingTimeoutRef.current !== undefined) {
      clearTimeout(setLoadingTimeoutRef.current);
    }

    setLoadingTimeoutRef.current = setTimeout(() => {
      setIsLoadingNewImages(true);
    }, 1000);
  }
  lastSectionImagesLength.current = currentSectionImagesLength;

  useEffect(() => {
    const images = section.images;
    let canceled = false;

    Promise.all(
      images.flatMap((item) => {
        if (item.type !== "pin_board_image") return [];

        const image = imageCachesRef.current[item.path ?? ""] ?? new Image();
        image.src = pathFile + "/" + item.path;
        imageCachesRef.current[item.path ?? ""] = image;

        return [new Promise((res) => onImageLoad(image, undefined, res))];
      }),
    ).then(() => {
      requestAnimationFrame(() => {
        if (canceled) return;

        clearTimeout(setLoadingTimeoutRef.current);
        setIsLoadingNewImages(false);
        setDisplayLayout((prevLayout) => {
          if (!prevLayout) {
            return extractLayout(images);
          }

          const optimalColumnOrder =
            gridDashRef.current?.getOptimalColumnOrder();

          const { added, removed } = getDiffArray(
            prevLayout.map((item) => item.id),
            images.map((item) => item.id),
          );
          return [
            ...prevLayout.filter((item) => !removed.includes(item.id)),
            ...added.map((item, index) => ({
              id: item,
              span: 1,
              column: optimalColumnOrder?.length
                ? optimalColumnOrder[index % optimalColumnOrder.length]
                : 0,
            })),
          ];
        });
      });
    });

    return () => {
      canceled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section.images.length]);

  const [updateSection] = useUpdatePinboardSectionMutation();

  const handleLayoutChange = (layout: GridDashLayoutedItem[]) => {
    setDisplayLayout((prev) =>
      layout.map((layoutItem) => ({
        ...layoutItem,
        span:
          prev?.find((prevItem) => prevItem.id === layoutItem.id)?.span ?? 1,
      })),
    );
  };

  const isUpdatingSectionRef = useRef(false);
  const isDragging = useRef(false);
  const nextLayoutRef = useRef<PartialLayoutItem[]>();
  const lastLayoutStrRef = useRef<string>();
  const handleLayoutComplete = useCallback(
    async (layout: PartialLayoutItem[]) => {
      if (readOnly) return;

      if (isUpdatingSectionRef.current) {
        nextLayoutRef.current = layout.map((layoutItem) => ({
          ...layoutItem,
          span:
            layoutItem.span ??
            nextLayoutRef.current?.find(
              (prevItem) => prevItem.id === layoutItem.id,
            )?.span,
        }));
        return;
      }

      isUpdatingSectionRef.current = true;
      const startTime = new Date().getTime();
      const convertedLayout = layout.map(({ id, column, span }) => ({
        id,
        xAxis: column / COLUMNS,
        ...(span !== undefined ? { colSpan: span } : undefined),
      }));

      let isError = false;
      try {
        const layoutStr = JSON.stringify(convertedLayout);
        if (layoutStr !== lastLayoutStrRef.current) {
          await updateSection({
            id: pinboardId,
            sectionId: section.id,
            items: convertedLayout,
            updateType: "optimistic",
          }).unwrap();
        }

        lastLayoutStrRef.current = layoutStr;
      } catch {
        isError = true;
        setLayoutUpdateError(true);
      }

      const stopTime = new Date().getTime();

      // Space out api calls
      setTimeout(
        async () => {
          isUpdatingSectionRef.current = false;
          if (nextLayoutRef.current) {
            handleLayoutComplete(nextLayoutRef.current);
            nextLayoutRef.current = undefined;
          } else if (isError || !isDragging.current) {
            const lastestSection = await getLastestSection?.(section.id);
            if (lastestSection) {
              setDisplayLayout(extractLayout(lastestSection.images));
            }
          }
        },
        Math.max(1500 - (stopTime - startTime), 0),
      );
    },
    [getLastestSection, pinboardId, readOnly, section.id, updateSection],
  );

  const handleColSpanChange = useCallback(
    (itemId: string, colSpan: number) => {
      const layout = gridDashRef.current?.changeSpan(itemId, colSpan);
      if (!layout) return;

      setDisplayLayout((prev) =>
        layout.map((layoutItem) => ({
          ...layoutItem,
          span:
            layoutItem.id === itemId
              ? colSpan
              : prev?.find((prevItem) => prevItem.id === layoutItem.id)?.span ??
                1,
        })),
      );
      handleLayoutComplete(
        layout.map((layoutItem) =>
          layoutItem.id === itemId
            ? { ...layoutItem, span: colSpan }
            : layoutItem,
        ),
      );
    },
    [handleLayoutComplete],
  );

  const [uploadFileImages, { isLoading: isUploadingImageFiles }] =
    useUploadPinboardImagesMutation();
  const [uploadImageFromLibrary, { isLoading: isUploadingImageFromLibrary }] =
    useAddImageLibraryToPinBoardMutation();
  const [uploadImageFromProduct, { isLoading: isUploadingImageFromProduct }] =
    useAddProductToPinBoardMutation();
  const [addTextCard, { isLoading: isAddingTextCard }] =
    useAddTextCardMutation();

  const handleUploadImageFiles = (files: File[]) => {
    uploadFileImages({
      id: pinboardId,
      data: { files, sectionId: section.id },
    });
  };
  const handleUploadImageFromLibrary = (id: string) => {
    uploadImageFromLibrary({ pinboardId, fileId: id, sectionId: section.id });
  };
  const handleUploadImageFromProduct = (id: string) => {
    uploadImageFromProduct({
      pinboardId,
      productId: id,
      sectionId: section.id,
    });
  };

  function validateImageData(
    data: unknown,
  ): data is { imageId: string } | { productId: string } {
    return (
      typeof data === "object" &&
      data !== null &&
      "imageId" in data &&
      typeof data.imageId === "string" &&
      (!("productId" in data) ||
        !data.productId ||
        typeof data.productId === "string")
    );
  }

  const handleDraggingStart = () => {
    isDragging.current = true;
    setLayoutUpdateError(false);
  };
  const handleDraggingStop = async () => {
    isDragging.current = false;
  };

  const setDragState = useCallback(
    (
      id: string,
      reason: (typeof disableDragItems)[number]["reason"],
      enableDragging: boolean,
    ) => {
      if (enableDragging) {
        setDisableDragItems((prev) => prev.filter((item) => item.id !== id));
      } else {
        setDisableDragItems((prev) => [...prev, { id, reason }]);
      }
    },
    [],
  );

  const handleCropStateChange = useCallback(
    (id: string, cropMode: boolean) => {
      setDragState(id, "cropImage", !cropMode);
    },
    [setDragState],
  );

  const handleEditModeChange = useCallback(
    (id: string, editMode: boolean) => {
      setDragState(id, "editText", !editMode);
    },
    [setDragState],
  );

  const [overflowCause, setOverflowCause] = useState<
    "content" | "footer" | undefined
  >();

  const [pageBoxRef, setPageBoxRef] = useState<HTMLDivElement | null>(null);
  const cqw = useContainerPercentageUnit(pageBoxRef);
  const notContentTotalHeight =
    PINBOARD_SECTION_PADDING * 2 +
    PINBOARD_SECTION_HEADER_HEIGHT +
    PINBOARD_SECTION_HEADER_MARGIN_BOTTOM;
  const gridDashMinHeight = `calc(var(--cqw) * (100 / ${PAGE_RATIO} - ${notContentTotalHeight}))`;

  return (
    <Box
      ref={setPageBoxRef}
      position="relative"
      {...rest}
      style={
        {
          "--cqw": cqw(1),
          ...rest.style,
        } as CSSProperties
      }
    >
      <PinboardSectionPageFrame
        pageRatio={PAGE_RATIO}
        pageBottomPadding={`calc(var(--cqw) * ${PINBOARD_SECTION_PADDING})`}
        overflowCause={readOnly ? undefined : overflowCause}
      />

      <Box
        sx={{
          "& .DnD-InstructionText": {
            whiteSpace: "pre-wrap",
            color: "var(--mui-palette-text-disabled)",
          },
          padding: `calc(var(--cqw) * ${PINBOARD_SECTION_PADDING})`,
          overflow: "hidden",

          "& .grid-dash--footer": {
            transition: "opacity 0.3s, background-color 0.3s",
            backgroundColor: "var(--mui-palette-common-background)",
            "&.is-overflowing": {
              backgroundColor:
                "rgba(var(--mui-palette-common-backgroundChannel), 60%)",
              "& > *": { opacity: 0.6 },
            },
          },
        }}
      >
        <PinboardSectionHeader
          sectionId={section.id}
          sectionName={section.name}
          mb={`calc(var(--cqw) * ${PINBOARD_SECTION_HEADER_MARGIN_BOTTOM})`}
        />

        {displayLayout ? (
          <GridDash
            ref={gridDashRef}
            layoutKey={noteMode + ""}
            columns={COLUMNS}
            gap="calc(var(--cqw) * 1.5)"
            onLayoutChange={handleLayoutChange}
            onLayoutComplete={handleLayoutComplete}
            onDraggingStart={handleDraggingStart}
            onDraggingStop={handleDraggingStop}
            disableReordering={layoutUpdateError}
            disableDragging={readOnly ? "hard" : disableDragging}
            minHeight={gridDashMinHeight}
            onMinHeightOverflowState={setOverflowCause}
          >
            {displayLayout.flatMap((layoutItem) => {
              const image = section.images.find(
                (image) => image.id === layoutItem.id,
              );

              if (!image) return [];

              return [
                <GridDashItem
                  key={image.id}
                  id={image.id}
                  span={layoutItem.span}
                  column={layoutItem.column}
                >
                  {image.type === "pin_board_text" ? (
                    <PinboardSectionTextCard
                      id={image.id}
                      content={image.note}
                      colSpan={layoutItem.span}
                      onEditModeChange={handleEditModeChange}
                      onColSpanChange={handleColSpanChange}
                    />
                  ) : (
                    <PinboardSectionImage
                      id={image.id}
                      path={image.path}
                      note={image.note}
                      link={image.link}
                      colSpan={layoutItem.span}
                      onCropStateChange={handleCropStateChange}
                      onColSpanChange={handleColSpanChange}
                    />
                  )}
                </GridDashItem>,
              ];
            })}

            {!readOnly && (
              <GridDashFooter>
                <DragAndDrop
                  type="image"
                  icon="large"
                  loading={
                    isUploadingImageFiles ||
                    isUploadingImageFromLibrary ||
                    isUploadingImageFromProduct
                  }
                  sx={{
                    width: "100%",
                    "& .DnD-Icon": {
                      width: "calc(var(--cqw) * 5)",
                      height: "unset",
                      aspectRatio: 1,
                    },
                    "& .DnD-InstructionText": {
                      fontSize: "var(--cqw)",
                    },
                  }}
                  instructionText={t.rich("imageUploadInstruction")}
                  onFilesSelected={handleUploadImageFiles}
                  customDroppableId={"section-" + section.id}
                  validateCustomData={validateImageData}
                  onCustomDataDropped={(data) => {
                    if ("productId" in data && data.productId) {
                      handleUploadImageFromProduct(data.productId);
                      return;
                    }

                    if ("imageId" in data && data.imageId) {
                      handleUploadImageFromLibrary(data.imageId);
                    }
                  }}
                />
              </GridDashFooter>
            )}

            {!readOnly && (
              <GridDashFooter>
                <LoadingButton
                  variant="outlined"
                  startIcon={
                    <FontAwesomeIcon
                      icon={faTextSize}
                      style={{
                        width: "calc(var(--cqw) * 1.5)",
                        height: "calc(var(--cqw) * 1.5)",
                      }}
                    />
                  }
                  fullWidth
                  sx={{
                    color: "var(--mui-palette-text-disabled)",
                    fontWeight: 500,
                    fontSize: "var(--cqw)",
                    borderColor: "var(--mui-palette-divider) !important",
                    "&.MuiButton-outlined": {
                      py: 2,
                    },
                  }}
                  loading={isAddingTextCard}
                  onClick={() =>
                    addTextCard({ pinboardId, sectionId: section.id })
                  }
                >
                  {t("addTextCard")}
                </LoadingButton>
              </GridDashFooter>
            )}
          </GridDash>
        ) : (
          <Box height={gridDashMinHeight} />
        )}

        <Backdrop
          open={!displayLayout || isLoadingNewImages}
          sx={{
            position: "absolute",
            alignItems: "flex-start",
            backgroundColor: "rgb(255 255 255 / 35%)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              aspectRatio: PAGE_RATIO,
            }}
          >
            <CircularProgress />
          </Box>
        </Backdrop>
      </Box>
    </Box>
  );
};

export default PinboardSection;

function extractLayout(items: API.PinboardImage[]): LayoutItem[] {
  return items.map((item) => ({
    id: item.id,
    column: Math.round(item.xAxis / 0.25),
    span: item.colSpan,
  }));
}
