import React, {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  PropsWithChildren,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import GridDashItem, {
  GRID_DASH_ITEM_CLASS,
  GRID_DASH_ITEM_DRAGGABLE_ID_PREFIX,
  GridDashItemProps,
} from "./GridDashItem";
import {
  GridDashLayoutedItem,
  GridDashLayoutItem,
  relayoutChangeSpan,
  relayoutDrag,
  reorderLayout,
} from "./gridDashCore";
import { Box } from "@mui/material";
import { useWindowSize } from "@/hooks/windowSize";
import { useDndSensors } from "@/hooks/useDndSensors";
import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragStartEvent,
  useSensor,
} from "@dnd-kit/core";
import { OnlySelfKeyboardSensor } from "@/utils/OnlySelfKeyboardSensor";
import { Coordinates } from "@dnd-kit/core/dist/types";
import { getDiffArray } from "@/utils/diff-array";
import GridDashFooter, {
  GRID_DASH_FOOTER_CLASS,
  GridDashFooterProps,
} from "./GridDashFooter";

export interface GridDashRef {
  getOptimalColumnOrder: () => number[] | undefined;
  changeSpan: (id: string, span: number) => GridDashLayoutedItem[] | undefined;
  forceRelayout: () => void;
}

export interface GridDashProps extends PropsWithChildren {
  columns: number;
  gap?: number | string;
  minHeight?: number | string;
  onLayoutChange?: (layout: GridDashLayoutedItem[]) => void;
  onLayoutComplete?: (layout: GridDashLayoutedItem[]) => void;
  onDraggingStart?: () => void;
  onDraggingStop?: () => void;
  disableReordering?: boolean;
  layoutKey?: string;
  disableDragging?: false | "hard" | "soft";
  onMinHeightOverflowState?: (cause?: "content" | "footer") => void;
}

export type GridDashInternalContext = {
  columns: number;
  gap: string;
  draggingItemId?: string;
  isAfterDragging: boolean;
  draggingDisabled: false | "hard" | "soft";
};
export const GridDashInternalContext =
  createContext<GridDashInternalContext | null>(null);

export type GridDashFooterInternalContext = {
  overflowingFooters: HTMLElement[];
};
export const GridDashFooterInternalContext =
  createContext<GridDashFooterInternalContext | null>(null);

export type GridDashContext = {
  forceRelayout: () => void;
};
export const GridDashContext = createContext<GridDashContext | null>(null);

export const GRID_DASH_COL_WIDTH_VAR = "--grid-dash-col-width";
export const GRID_DASH_GAP_VAR = "--grid-dash-gap";

const ANIMATION_CONFIG = {
  duration: 300,
  easing: "ease",
};
const TRANSITION_DURATION = ANIMATION_CONFIG.duration + "ms";

const GridDash = forwardRef<GridDashRef, GridDashProps>(
  (
    {
      columns,
      gap = 0,
      minHeight = 0,
      onLayoutChange,
      onLayoutComplete,
      onDraggingStart: onExternalDraggingStart,
      onDraggingStop: onExternalDraggingStop,
      disableReordering,
      layoutKey: externalLayoutKey,
      disableDragging = false,
      onMinHeightOverflowState,
      children,
    },
    ref,
  ) => {
    if (columns <= 0) throw new Error("columns must be > 0");

    gap = typeof gap === "number" ? `${gap}px` : gap;
    minHeight = typeof minHeight === "number" ? `${minHeight}px` : minHeight;
    const itemReactElems: React.ReactElement<GridDashItemProps>[] = [];
    const itemFooters: React.ReactElement<GridDashFooterProps>[] = [];
    const itemOrder: string[] = [];
    const serializedItemProps = JSON.stringify(
      Children.map(children, (child) => {
        if (!isValidElement(child)) return;

        if (child.type === GridDashItem) {
          const item = child as React.ReactElement<GridDashItemProps>;
          const props = item.props;
          itemReactElems.push(item);
          itemOrder.push(props.id);

          return { id: props.id, span: props.span, column: props.column };
        }

        if (child.type === GridDashFooter) {
          const item = child as React.ReactElement<GridDashFooterProps>;
          itemFooters.push(item);
        }
      })?.filter(Boolean),
    );
    itemReactElems.sort((a, b) => a.props.id.localeCompare(b.props.id));

    if (itemFooters.length > columns) {
      throw new Error("more footers than columns");
    }

    const [isLoading, setIsLoading] = useState(true);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const colWidthRef = useRef<HTMLDivElement>(null);
    const gapRef = useRef<HTMLDivElement>(null);
    const minHeightRef = useRef<HTMLDivElement>(null);
    const dragPlaceholderRef = useRef<HTMLDivElement>(null);

    const columnedLayoutRef = useRef<GridDashLayoutItem[][]>();
    const sequentialLayoutRef = useRef<GridDashLayoutItem[]>();
    const footerLayoutRef = useRef<{ column: number; y: number }[]>([]);
    const [layoutKey, setLayoutKey] = useState(0);

    const forceRelayout = useCallback(() => {
      setLayoutKey((prev) => prev + 1);
    }, []);

    useImperativeHandle(ref, () => ({
      getOptimalColumnOrder: () => {
        if (!columnedLayoutRef.current) return undefined;
        return getOptimalColumnOrder(columnedLayoutRef.current);
      },
      changeSpan: (id: string, span: number) => {
        if (!columnedLayoutRef.current) return undefined;
        if (!sequentialLayoutRef.current) return undefined;

        return relayoutChangeSpan(
          id,
          span,
          sequentialLayoutRef.current,
          columnedLayoutRef.current,
        ).layout;
      },
      forceRelayout,
    }));

    const disableReorderingRef = useRef(disableReordering);
    disableReorderingRef.current = disableReordering;

    const [draggingItemId, setDraggingItemId] = useState<string>();
    const [isAfterDragging, setIsAfterDragging] = useState(false);
    const isDragging = draggingItemId !== undefined;
    const isDraggingWithoutTransitionRef = useRef(false);
    const nextLayoutRef = useRef<GridDashLayoutedItem[]>();
    const delayedFinishDraggingCallback = useRef<() => void>();

    const [windowWidth] = useWindowSize();

    const onLayoutChangeRef = useRef(onLayoutChange);
    onLayoutChangeRef.current = onLayoutChange;
    const onLayoutCompleteRef = useRef(onLayoutComplete);
    onLayoutCompleteRef.current = onLayoutComplete;
    const onMinHeightOverflowStateRef = useRef(onMinHeightOverflowState);
    onMinHeightOverflowStateRef.current = onMinHeightOverflowState;

    const updateDraggingPlaceholder = useCallback(() => {
      const dragPlaceholder = dragPlaceholderRef.current;
      const sequentialLayout = sequentialLayoutRef.current;
      if (!(dragPlaceholder && sequentialLayout)) return;

      const id = dragPlaceholder.dataset.id;
      if (!id) return;

      const item = sequentialLayout.find((item) => item.id === id);
      if (!item) return;

      dragPlaceholder.style.top = item.y + "px";
      dragPlaceholder.style.left = item.x + "px";
      dragPlaceholder.style.width = item.w + "px";
      dragPlaceholder.style.height = item.h + "px";
    }, []);

    const lastSerializedItemProps = useRef<string>();

    const [overflowingFooters, setOverflowingFooters] = useState<HTMLElement[]>(
      [],
    );

    useEffect(
      () => {
        // windowWidth is 0 on first render
        if (windowWidth === 0) return;
        if (!wrapperRef.current || !colWidthRef.current || !gapRef.current)
          return;

        const wrapper = wrapperRef.current;
        const dragPlaceholder = dragPlaceholderRef.current;
        const colWidth = colWidthRef.current.offsetWidth;
        const gap = gapRef.current.offsetWidth;
        const minHeight = minHeightRef.current?.offsetHeight;

        const itemElemsWithoutOrder = Object.fromEntries(
          Array.from(
            wrapper.querySelectorAll<HTMLElement>(`.${GRID_DASH_ITEM_CLASS}`),
          )
            .map((elem) => [elem.dataset.id, elem] as const)
            .filter(([id]) => !!id) as [string, HTMLElement][],
        );
        const itemElems = itemOrder
          .map((id) => itemElemsWithoutOrder[id])
          .filter((item) => !!item);

        const { added } = getDiffArray(
          sequentialLayoutRef.current?.map((item) => item.elem) ?? [],
          itemElems,
        );
        const firstRender = sequentialLayoutRef.current === undefined;

        let highestAddedItem = added[0];
        let minHeightOverflowCause: "content" | "footer" | undefined;

        const currentColsHeights: number[] = Array.from(
          { length: columns },
          () => 0,
        );
        columnedLayoutRef.current = Array.from({ length: columns }, () => []);
        sequentialLayoutRef.current = [];
        let fullHeight = currentColsHeights[0] ?? 0;

        for (const itemElem of itemElems ?? []) {
          const id = itemElem.getAttribute("data-id");
          const spanStr = itemElem.getAttribute("data-span");
          const columnStr = itemElem.getAttribute("data-column");
          if (!id || !spanStr || !columnStr) continue;

          const span = Number(spanStr);
          const column = Number(columnStr);

          const oldWidth = parseInt(itemElem.style.width);
          const newWidth = colWidth * span + gap * (span - 1);
          itemElem.style.width = newWidth + "px";

          // Must be behind newWidth
          const newHeight = itemElem.offsetHeight;

          let itemPlace = currentColsHeights[column]
            ? currentColsHeights[column] + gap
            : 0;
          for (let i = column + 1; i < column + span; i++) {
            const currentColsHeight = currentColsHeights[i];
            const newItemPlace = currentColsHeight
              ? currentColsHeight + gap
              : 0;

            if (itemPlace < newItemPlace) {
              itemPlace = newItemPlace;
            }
          }

          const startTransforms: string[] = [];
          const endTransforms: string[] = [];
          const placeholderId = dragPlaceholder?.dataset.id;

          const transformElement =
            (isDraggingWithoutTransitionRef.current ||
              !!delayedFinishDraggingCallback.current) &&
            dragPlaceholder &&
            placeholderId === id
              ? dragPlaceholder
              : itemElem;

          if (added.includes(itemElem)) {
            startTransforms.push("scale(0)");
            endTransforms.push("scale(1)");

            if (
              !highestAddedItem ||
              highestAddedItem.offsetTop > transformElement.offsetTop
            ) {
              highestAddedItem = itemElem;
            }
          } else if (
            !Number.isNaN(oldWidth) &&
            oldWidth !== newWidth &&
            newWidth !== 0
          ) {
            itemElem
              .querySelectorAll<HTMLElement>(".with-width-transition")
              .forEach((el) => {
                const elTransformOrigin = el.style.transformOrigin;
                el.style.transformOrigin = "0 0";
                const animation = el.animate(
                  [
                    { transform: `scale(${oldWidth / newWidth})` },
                    { transform: "scale(1)" },
                  ],
                  ANIMATION_CONFIG,
                );

                animation.onfinish = () => {
                  el.style.transformOrigin = elTransformOrigin;
                };
              });

            itemElem
              .querySelectorAll<HTMLElement>(".with-pos-x-transition")
              .forEach((el) => {
                el.animate(
                  [
                    { transform: `translateX(${oldWidth - newWidth}px)` },
                    { transform: "translateX(0)" },
                  ],
                  ANIMATION_CONFIG,
                );
              });
          }

          const oldTop = parseInt(transformElement.style.top);
          const newTop = itemPlace;
          transformElement.style.top = newTop + "px";
          if (!Number.isNaN(oldTop) && oldTop !== newTop) {
            startTransforms.push(`translateY(${oldTop - newTop}px)`);
            endTransforms.push("translateY(0)");
          }

          const oldLeft = parseInt(transformElement.style.left);
          const newLeft = (colWidth + gap) * column;
          transformElement.style.left = newLeft + "px";
          if (!Number.isNaN(oldLeft) && oldLeft !== newLeft) {
            startTransforms.push(`translateX(${oldLeft - newLeft}px)`);
            endTransforms.push("translateX(0)");
          }

          transformElement.animate(
            [
              { transform: startTransforms.join(" ") },
              { transform: endTransforms.join(" ") },
            ],
            { ...ANIMATION_CONFIG, composite: "add" },
          );

          if (minHeight && itemPlace + newHeight > minHeight) {
            minHeightOverflowCause = "content";
          }

          const itemLayout = {
            id,
            span,
            column,
            elem: itemElem,
            x: column * (colWidth + gap),
            y: itemPlace,
            w: newWidth,
            h: newHeight,
          };
          sequentialLayoutRef.current.push(itemLayout);
          for (let i = column; i < column + span; i++) {
            const newColsHeight = itemPlace + newHeight;

            if (newColsHeight > fullHeight) {
              fullHeight = newColsHeight;
            }

            currentColsHeights[i] = newColsHeight;
            columnedLayoutRef.current[i]?.push(itemLayout);
          }
        }

        const optimalColumnOrder = getOptimalColumnOrder(
          columnedLayoutRef.current,
        );
        const serializedItemPropsChanged =
          lastSerializedItemProps.current !== serializedItemProps;
        lastSerializedItemProps.current = serializedItemProps;
        const claimedCols = Array.from({ length: columns }, () => false);
        const overflowingFooters: HTMLElement[] = [];

        wrapper
          .querySelectorAll<HTMLElement>(`.${GRID_DASH_FOOTER_CLASS}`)
          .forEach((footerElem, index) => {
            footerElem.style.width = colWidth + "px";
            const prevColumn = footerLayoutRef.current[index]?.column;
            const prevTop = footerLayoutRef.current[index]?.y;
            const prevColumnLayout = columnedLayoutRef.current?.[prevColumn];
            const prevLastItemInCol =
              prevColumnLayout?.[prevColumnLayout.length - 1];
            const prevColCurrentTop = prevLastItemInCol
              ? prevLastItemInCol.y + prevLastItemInCol.h + gap
              : 0;

            let column = prevColumn;
            if (
              (minHeight &&
                prevColCurrentTop + footerElem.offsetHeight > minHeight) ||
              (prevColCurrentTop !== prevTop &&
                (serializedItemPropsChanged || prevColumn === undefined)) ||
              claimedCols[column]
            ) {
              let indexOffset = 0;
              do {
                column =
                  optimalColumnOrder[indexOffset % optimalColumnOrder.length];
                indexOffset++;
              } while (claimedCols[column]);
            }
            claimedCols[column] = true;

            const columnLayout = columnedLayoutRef.current?.[column];
            const lastItemInCol = columnLayout?.[columnLayout.length - 1];

            const startTransforms: string[] = [];
            const endTransforms: string[] = [];

            const oldTop = parseInt(footerElem.style.top);
            const newTop = lastItemInCol
              ? lastItemInCol.y + lastItemInCol.h + gap
              : 0;
            footerElem.style.top = newTop + "px";
            if (!Number.isNaN(oldTop) && oldTop !== newTop) {
              startTransforms.push(`translateY(${oldTop - newTop}px)`);
              endTransforms.push("translateY(0)");
            }

            const oldLeft = parseInt(footerElem.style.left);
            const newLeft = (colWidth + gap) * column;
            footerElem.style.left = newLeft + "px";
            if (!Number.isNaN(oldLeft) && oldLeft !== newLeft) {
              startTransforms.push(`translateX(${oldLeft - newLeft}px)`);
              endTransforms.push("translateX(0)");
            }

            footerElem.animate(
              [
                { transform: startTransforms.join(" ") },
                { transform: endTransforms.join(" ") },
              ],
              { ...ANIMATION_CONFIG, composite: "add" },
            );

            const newColHeight = newTop + footerElem.offsetHeight;
            if (newColHeight > fullHeight) {
              fullHeight = newColHeight;
            }

            if (minHeight && newColHeight > minHeight) {
              if (!minHeightOverflowCause) {
                minHeightOverflowCause = "footer";
              }

              overflowingFooters.push(footerElem);
            }

            footerLayoutRef.current[index] = { column, y: newTop };
          });

        setOverflowingFooters(overflowingFooters);

        if (
          !isDraggingWithoutTransitionRef.current &&
          !disableReorderingRef.current
        ) {
          const layout = reorderLayout(
            sequentialLayoutRef.current,
            columnedLayoutRef.current,
          );
          onLayoutChangeRef.current?.(layout);
          onLayoutCompleteRef.current?.(layout);
        }

        updateDraggingPlaceholder();

        if (minHeight && minHeight > fullHeight) {
          wrapper.style.height = minHeight + "px";
        } else {
          wrapper.style.height = fullHeight + "px";
        }
        onMinHeightOverflowStateRef.current?.(minHeightOverflowCause);

        delayedFinishDraggingCallback.current?.();
        delayedFinishDraggingCallback.current = undefined;

        setIsLoading(false);

        if (!firstRender && highestAddedItem) {
          const onHeightTransitionFinish = () => {
            highestAddedItem.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
          };

          wrapper.addEventListener("transitionend", onHeightTransitionFinish, {
            once: true,
          });

          return () => {
            wrapper.removeEventListener(
              "transitionend",
              onHeightTransitionFinish,
            );
          };
        }
      },
      // itemOrder is ignored as we use serializedItemProps to check for items changed
      [
        windowWidth,
        serializedItemProps,
        layoutKey,
        externalLayoutKey,
        columns,
        gap,
        updateDraggingPlaceholder,
      ],
    );

    const onExternalDraggingStartRef = useRef(onExternalDraggingStart);
    onExternalDraggingStartRef.current = onExternalDraggingStart;
    const onExternalDraggingStopRef = useRef(onExternalDraggingStop);
    onExternalDraggingStopRef.current = onExternalDraggingStop;

    const onDraggingStart = useCallback(
      (id: string) => {
        const dragPlaceholder = dragPlaceholderRef.current;
        if (!dragPlaceholder) return;

        dragPlaceholder.dataset.id = id;
        updateDraggingPlaceholder();

        setDraggingItemId(id);
        isDraggingWithoutTransitionRef.current = true;
        onExternalDraggingStartRef.current?.();
      },
      [updateDraggingPlaceholder],
    );
    const onDragging = useCallback((id: string, delta: Coordinates) => {
      if (!isDraggingWithoutTransitionRef.current) return;

      if (!gapRef.current) return;
      const gap = gapRef.current.offsetWidth;

      if (!colWidthRef.current) return;
      const colWidth = colWidthRef.current.offsetWidth;

      const sequentialLayout = sequentialLayoutRef.current;
      const columnedLayout = columnedLayoutRef.current;
      if (!columnedLayout || !sequentialLayout) return;

      const draggingItem = sequentialLayout.find((item) => item.id === id);
      if (!draggingItem) return;

      const newLayout = relayoutDrag(
        sequentialLayout,
        columnedLayout,
        draggingItem,
        delta,
        gap,
        colWidth,
      );
      if (newLayout) {
        onLayoutChangeRef.current?.(newLayout);
        nextLayoutRef.current = newLayout;
      }
    }, []);
    const onDraggingEnd = useCallback((id: string, delta: Coordinates) => {
      const finishDragging = () => {
        const draggingItem = sequentialLayoutRef.current?.find(
          (item) => item.id === id,
        );
        if (draggingItem) {
          const draggingElem = draggingItem.elem;
          const startTransforms: string[] = [];

          const oldTop = parseInt(draggingElem.style.top);
          const newTop = draggingItem.y;
          draggingElem.style.top = newTop + "px";
          if (!Number.isNaN(oldTop) && oldTop !== newTop) {
            startTransforms.push(`translateY(${oldTop + delta.y - newTop}px)`);
          } else {
            startTransforms.push(`translateY(${delta.y}px)`);
          }

          const oldLeft = parseInt(draggingElem.style.left);
          const newLeft = draggingItem.x;
          draggingElem.style.left = newLeft + "px";
          if (!Number.isNaN(oldLeft) && oldLeft !== newLeft) {
            startTransforms.push(
              `translateX(${oldLeft + delta.x - newLeft}px)`,
            );
          } else {
            startTransforms.push(`translateX(${delta.x}px)`);
          }

          const animation = draggingElem.animate(
            [
              { transform: startTransforms.join(" ") },
              { transform: "translate(0, 0)" },
            ],
            ANIMATION_CONFIG,
          );

          animation.onfinish = () => {
            setIsAfterDragging(false);

            if (isDraggingWithoutTransitionRef.current) return;

            setDraggingItemId(undefined);
            onExternalDraggingStopRef.current?.();

            const dragPlaceholder = dragPlaceholderRef.current;
            if (dragPlaceholder) {
              delete dragPlaceholder.dataset.id;
            }
          };
        }
      };

      setIsAfterDragging(true);
      isDraggingWithoutTransitionRef.current = false;

      const currLayoutStr = JSON.stringify(
        sequentialLayoutRef.current?.map((item) => item.id),
      );
      const nextLayoutStr = JSON.stringify(
        nextLayoutRef.current?.map((item) => item.id),
      );
      if (!nextLayoutRef.current || currLayoutStr === nextLayoutStr) {
        finishDragging();
        delayedFinishDraggingCallback.current = undefined;
      } else {
        delayedFinishDraggingCallback.current = finishDragging;
      }

      if (nextLayoutRef.current) {
        onLayoutCompleteRef.current?.(nextLayoutRef.current);
        nextLayoutRef.current = undefined;
      }
    }, []);

    const sensors = useDndSensors(
      // using Escape as cancel key when moving an item makes the item freezes in place
      useSensor(OnlySelfKeyboardSensor, {
        keyboardCodes: {
          start: ["Space", "Enter"],
          cancel: [],
          end: ["Space", "Enter", "Escape"],
        },
      }),
    );

    return (
      <Box
        ref={wrapperRef}
        className="grid-dash"
        position="relative"
        sx={{
          transition: `height ${TRANSITION_DURATION}`,
          height: minHeight,
          opacity: isLoading ? 0 : 1,
        }}
        style={
          {
            [GRID_DASH_COL_WIDTH_VAR]: `calc((100% - ${gap} * ${columns - 1}) / ${columns})`,
            [GRID_DASH_GAP_VAR]: gap,
          } as React.CSSProperties
        }
      >
        <div
          ref={colWidthRef}
          className="grid-dash--col-width"
          style={{ width: `var(${GRID_DASH_COL_WIDTH_VAR})` }}
        />
        <div
          ref={gapRef}
          className="grid-dash--gap"
          style={{ width: `var(${GRID_DASH_GAP_VAR})` }}
        />
        <div
          ref={minHeightRef}
          className="grid-dash--min-height"
          style={{ height: minHeight }}
        />
        <div
          ref={dragPlaceholderRef}
          className="grid-dash--drag-placeholder"
          style={{
            display: isDragging ? "block" : "none",
            position: "absolute",
            border: "2px dashed var(--mui-palette-neutral-300)",
            borderRadius: 0.5,
            transition: `transform ${TRANSITION_DURATION}`,
          }}
        />
        <GridDashInternalContext.Provider
          value={useMemo(
            () => ({
              columns,
              gap,
              draggingItemId,
              isAfterDragging,
              draggingDisabled: disableDragging,
            }),
            [columns, gap, draggingItemId, isAfterDragging, disableDragging],
          )}
        >
          <GridDashContext.Provider
            value={useMemo(() => ({ forceRelayout }), [forceRelayout])}
          >
            <DndContext
              sensors={sensors}
              onDragStart={useCallback(
                (e: DragStartEvent) => {
                  if (typeof e.active.id !== "string") return;
                  if (disableDragging) return;
                  if (isDragging) return;

                  const id = e.active.id.slice(
                    GRID_DASH_ITEM_DRAGGABLE_ID_PREFIX.length,
                  );
                  onDraggingStart(id);
                },
                [disableDragging, isDragging, onDraggingStart],
              )}
              onDragMove={useCallback(
                (e: DragMoveEvent) => {
                  if (typeof e.active.id !== "string") return;
                  if (disableDragging) return;
                  if (!isDragging) return;

                  const id = e.active.id.slice(
                    GRID_DASH_ITEM_DRAGGABLE_ID_PREFIX.length,
                  );
                  onDragging(id, e.delta);
                },
                [disableDragging, isDragging, onDragging],
              )}
              onDragEnd={useCallback(
                (e: DragEndEvent) => {
                  if (typeof e.active.id !== "string") return;
                  if (!isDragging) return;

                  const id = e.active.id.slice(
                    GRID_DASH_ITEM_DRAGGABLE_ID_PREFIX.length,
                  );
                  onDraggingEnd(id, e.delta);
                },
                [isDragging, onDraggingEnd],
              )}
            >
              {itemReactElems}
            </DndContext>

            <GridDashFooterInternalContext.Provider
              value={useMemo(
                () => ({ overflowingFooters }),
                [overflowingFooters],
              )}
            >
              {itemFooters}
            </GridDashFooterInternalContext.Provider>
          </GridDashContext.Provider>
        </GridDashInternalContext.Provider>
      </Box>
    );
  },
);
GridDash.displayName = "GridDash";

export default GridDash;

function getOptimalColumnOrder(columnedLayout: GridDashLayoutItem[][]) {
  return columnedLayout
    .map((col, index) => {
      const lastItem = col[col.length - 1];
      return {
        height: lastItem ? lastItem.y + lastItem.h : 0,
        column: index,
      };
    })
    .sort((a, b) => a.height - b.height)
    .map((item) => item.column);
}
