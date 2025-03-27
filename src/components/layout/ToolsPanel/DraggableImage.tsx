import ImageDefault from "@/components/common/ImageDefault";
import { DragOverlay, useDraggable } from "@dnd-kit/core";
import { Box, BoxProps, Tooltip, Typography } from "@mui/material";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import ImageWithSkeleton from "@/components/common/ImageWithSkeleton";

export interface DraggableImageProps {
  id: string;
  url?: string;
  imageName?: string;
  data?: any;
  info?: {
    title: string | null;
    subtitle: string | null;
    content: string | null;
  };
  dragUrl?: string | string[];
  onDragStart?: () => void;
  onDragStop?: () => void;
  containerProps?: BoxProps;
  sx?: BoxProps["sx"];
}

const SCROLL_THRESHOLD = 10;
const MAX_SCROLL_SPEED = 10;

const DraggableImage: React.FC<DraggableImageProps> = ({
  id,
  url,
  dragUrl,
  data,
  info,
  onDragStart,
  onDragStop,
  imageName,
  containerProps,
  sx,
}) => {
  const dragUrls = Array.isArray(dragUrl) ? dragUrl : [dragUrl ?? url];
  if (!dragUrls.length) dragUrls.push("");
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
    node,
    over,
    transform,
  } = useDraggable({
    id: "draggable-" + id,
    data,
  });

  const onDragStartRef = useRef(onDragStart);
  onDragStartRef.current = onDragStart;
  const onDragStopRef = useRef(onDragStop);
  onDragStopRef.current = onDragStop;

  const alreadyDraggedBeforeRef = useRef(false);
  useEffect(() => {
    if (isDragging) {
      alreadyDraggedBeforeRef.current = true;
      onDragStartRef.current?.();
    } else if (alreadyDraggedBeforeRef.current) {
      onDragStopRef.current?.();
    }
  }, [isDragging]);

  const startNodeBoundingRectRef = useRef<DOMRect>();

  useEffect(() => {
    if (!isDragging || !node.current || !transform) {
      startNodeBoundingRectRef.current = undefined;
      return;
    }

    const main = document.querySelector("main");
    if (!main) return;

    const mainBoundingRect = main.getBoundingClientRect();
    const nodeBoundingRect =
      startNodeBoundingRectRef.current ?? node.current.getBoundingClientRect();
    startNodeBoundingRectRef.current = nodeBoundingRect;

    if (nodeBoundingRect.left + transform.x < mainBoundingRect.left) return;
    if (nodeBoundingRect.right + transform.x > mainBoundingRect.right) return;

    const distanceToTop =
      nodeBoundingRect.top + transform.y - mainBoundingRect.top;
    const distanceToBottom =
      mainBoundingRect.bottom - (nodeBoundingRect.bottom + transform.y);

    let distance = 0;
    let direction = 0;
    if (
      distanceToTop <= SCROLL_THRESHOLD &&
      (!(distanceToBottom <= SCROLL_THRESHOLD) ||
        distanceToTop <= distanceToBottom)
    ) {
      distance = distanceToTop;
      direction = -1;
    } else if (distanceToBottom <= SCROLL_THRESHOLD) {
      distance = distanceToBottom;
      direction = 1;
    }

    if (distance !== 0) {
      let scrollFrame: number | undefined;
      const scroll = () => {
        main.scrollTop +=
          direction * (1 - distance / SCROLL_THRESHOLD) * MAX_SCROLL_SPEED;
        scrollFrame = requestAnimationFrame(scroll);
      };
      scrollFrame = requestAnimationFrame(scroll);

      return () => {
        if (scrollFrame !== undefined) {
          cancelAnimationFrame(scrollFrame);
        }
      };
    }
  }, [isDragging, node, transform]);

  const maxFile =
    over?.data.current &&
    "maxFile" in over.data.current &&
    typeof over.data.current.maxFile === "number"
      ? over.data.current.maxFile
      : Infinity;

  return (
    <>
      <Box
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        width="100%"
        height="100%"
        position="relative"
        borderRadius="inherit"
        {...containerProps}
        sx={[
          {
            "-webkitTouchCallout": "none",
            "&:hover .show-on-hover": {
              opacity: 1,
            },
          },
          ...(Array.isArray(containerProps?.sx)
            ? containerProps.sx
            : [containerProps?.sx]),
        ]}
      >
        {url ? (
          <ImageWithSkeleton
            width="100%"
            height="100%"
            src={url}
            draggable={false}
            sx={[
              {
                display: "block",
                borderRadius: "inherit",
                zIndex: "2",
                position: "relative",
                objectFit: "cover",
              },
              ...(Array.isArray(sx) ? sx : [sx]),
            ]}
          />
        ) : (
          <ImageDefault
            fontSizeIcon="2em"
            zIndex="1"
            position="relative"
            sx={[
              {
                width: "100%",
                height: "100%",
                borderRadius: "inherit",
              },
              ...(Array.isArray(sx) ? sx : [sx]),
            ]}
          />
        )}

        {info && (
          <Box
            className="show-on-hover show-on-focus"
            display="flex"
            flexDirection="column"
            position="absolute"
            justifyContent="flex-end"
            width="100%"
            height="60%"
            bottom={0}
            px={1.5}
            py={1}
            sx={{
              zIndex: 3,
              background:
                "linear-gradient(180deg, rgba(102, 102, 102, 0) 0%, #000000 100%)",
              borderBottomLeftRadius: "inherit",
              borderBottomRightRadius: "inherit",
              textAlign: "start",
              opacity: 0,
              transition: "opacity 0.3s",
              userSelect: "none",
            }}
          >
            <Tooltip
              title={
                <span>
                  {info.subtitle}
                  <br />
                  {info.title}
                  <br />
                  {info.content}
                </span>
              }
            >
              <Box>
                <Typography
                  color="white"
                  fontSize="clamp(6px, 0.8vw, 10px)"
                  fontWeight="500"
                  lineHeight={1.1}
                  width="100%"
                  textTransform="uppercase"
                  noWrap
                >
                  {info.subtitle}
                </Typography>
                <Typography
                  color="white"
                  fontSize="clamp(8px, 1vw, 12px)"
                  fontWeight="600"
                  lineHeight={1.3}
                  width="100%"
                  noWrap
                  mb={0.5}
                >
                  {info.title}
                </Typography>
                <Typography
                  color="white"
                  fontSize="clamp(6px, 0.8vw, 10px)"
                  lineHeight={1.1}
                  width="100%"
                  noWrap
                >
                  {info.content}
                </Typography>
              </Box>
            </Tooltip>
          </Box>
        )}
      </Box>
      {isDragging &&
        createPortal(
          <DragOverlay
            style={{
              zIndex: "var(--Dragging-zIndex)",
              cursor: "grabbing",
              opacity: 0.9,
            }}
            dropAnimation={null}
          >
            {dragUrls?.map((url, i) => (
              <Box
                key={url + "" + i}
                component={url ? "img" : "div"}
                display="flex"
                position="absolute"
                alignItems="center"
                justifyContent="center"
                zIndex={dragUrls.length - i}
                bgcolor={"var(--mui-palette-action-disabledBackground)"}
                top={`${-(18 / dragUrls.length) * i}px`}
                right={`${-(18 / dragUrls.length) * i}px`}
                width="100%"
                height="100%"
                src={url}
                sx={{
                  boxShadow:
                    "rgba(0, 0, 0, 0.3) 0px 1px 2px 0px, rgba(0, 0, 0, 0.15) 0px 1px 3px 1px",
                  transformOrigin: "100% 100%",
                  transform: `rotate(${(15 / dragUrls.length) * i}deg)`,
                  textAlign: "center",
                  p: !url && i === 0 && imageName ? 1 : 0,
                  opacity: i < maxFile ? 1 : 0,
                  transition: "opacity 0.3s",
                  userSelect: "none",
                  "-webkitTouchCallout": "none",
                }}
              >
                {!url ? i === 0 && imageName : undefined}
              </Box>
            ))}
          </DragOverlay>,
          document.body,
        )}
    </>
  );
};

export default DraggableImage;
