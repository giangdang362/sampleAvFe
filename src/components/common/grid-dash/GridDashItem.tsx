import React, {
  createContext,
  memo,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { GridDashInternalContext } from "./GridDash";
import { Box } from "@mui/material";
import { useDraggable } from "@dnd-kit/core";

export type GridDashItemContext = {
  setDraggingDisableMode: (mode: "soft" | "hard" | undefined) => void;
} | null;
export const GridDashItemContext = createContext<GridDashItemContext>(null);

export interface GridDashItemProps extends PropsWithChildren {
  id: string;
  column: number;
  span: number;
}

export const GRID_DASH_ITEM_CLASS = "grid-dash--item";
export const GRID_DASH_ITEM_DRAGGABLE_ID_PREFIX = "grid-dash-item-";

const GridDashItem: React.FC<GridDashItemProps> = memo(
  ({ id, span, column, children }) => {
    if (column < 0) throw new Error("column must be >= 0");
    if (span <= 0) throw new Error("span must be > 0");

    const gridDashContext = useContext(GridDashInternalContext);
    if (!gridDashContext)
      throw new Error("GridDashItem must be used inside GridDash");

    const { draggingItemId, isAfterDragging, draggingDisabled } =
      gridDashContext;
    const itemRef = useRef<HTMLDivElement | null>(null);

    const [draggingDisableLocalMode, setDraggingDisableLocalMode] = useState<
      "soft" | "hard"
    >();

    const draggingDisabledLocal =
      isAfterDragging ||
      (draggingDisableLocalMode
        ? draggingDisableLocalMode === "hard"
        : draggingDisabled === "hard");

    const { attributes, listeners, transform, isDragging, setNodeRef } =
      useDraggable({
        id: GRID_DASH_ITEM_DRAGGABLE_ID_PREFIX + id,
        disabled: draggingDisabledLocal,
      });

    const isAfterDraggingLocal = isAfterDragging && draggingItemId === id;
    const style =
      !draggingDisabled && transform
        ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
        : undefined;

    return (
      <GridDashItemContext.Provider
        value={useMemo(
          () => ({ setDraggingDisableMode: setDraggingDisableLocalMode }),
          [setDraggingDisableLocalMode],
        )}
      >
        <Box
          ref={useCallback(
            (elem: HTMLDivElement) => {
              setNodeRef(elem);
              itemRef.current = elem;
            },
            [setNodeRef],
          )}
          sx={{
            position: "absolute",
            transformOrigin: "50% 0",
            scrollMargin: "var(--grid-dash-gap, 0)",
            width: 0,

            "&.is-dragging *": {
              cursor: !draggingDisabled ? "grabbing !important" : undefined,
            },
            "&.is-after-dragging *": {
              cursor: !draggingDisabled ? "grab !important" : undefined,
            },
            "& > *": {
              transition: "transform 0.3s",
            },
            "&.is-dragging > *": {
              transform: "scale(1.02)",
            },
            "&.is-dragging, &.is-after-dragging": {
              zIndex: 2000,
              ".non-interactable-when-dragging": {
                pointerEvents: "none !important",
              },
              ".invisible-when-dragging": {
                opacity: "0 !important",
              },
            },
          }}
          style={style}
          className={`${GRID_DASH_ITEM_CLASS}${isDragging ? " is-dragging" : ""}
            ${isAfterDraggingLocal ? " is-after-dragging" : ""}`}
          data-id={id}
          data-span={span}
          data-column={column}
          {...(draggingDisabledLocal
            ? undefined
            : {
                ...attributes,
                ...listeners,
              })}
        >
          {children}
        </Box>
      </GridDashItemContext.Provider>
    );
  },
);
GridDashItem.displayName = "GridDashItem";

export default GridDashItem;
