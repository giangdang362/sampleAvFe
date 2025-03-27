export type GridDashPreLayoutItem = {
  id: string;
  elem: HTMLElement;
  span: number;
  column: number;
  x: number;
  w: number;
  h: number;
};
export type GridDashLayoutItem = GridDashPreLayoutItem & {
  y: number;
};
export type GridDashLayoutedItem = { id: string; column: number };

export function relayoutChangeSpan(
  id: string,
  newSpan: number,
  sequentialLayout: GridDashLayoutItem[],
  columnedLayout: GridDashLayoutItem[][],
): { layout: GridDashLayoutedItem[] } {
  if (newSpan <= 0) throw new Error("span must be > 0");

  const columns = columnedLayout.length;
  if (newSpan > columns) throw new Error("span must be < number of columns");

  if (sequentialLayout.length === 0) return { layout: [] };

  const item = sequentialLayout.find((layoutItem) => layoutItem.id === id);
  if (!item || newSpan <= item.span) {
    return {
      layout: sequentialLayout.map((layoutItem) => ({
        id: layoutItem.id,
        column: layoutItem.column,
      })),
    };
  }

  const newColumn = Math.min(item.column, columns - newSpan);

  const precedingItems = new Set<string>();
  for (let i = newColumn; i < newColumn + newSpan; i++) {
    const col = columnedLayout[i];
    if (!col) continue;

    let itemPlace: GridDashLayoutItem | undefined;
    for (const colItem of col) {
      if (colItem.id === item.id || colItem.y >= item.y) {
        break;
      }
      itemPlace = colItem;
    }

    if (itemPlace) {
      precedingItems.add(itemPlace.id);
    }
  }

  if (!precedingItems.size) {
    return {
      layout: sequentialLayout.map((layoutItem) => ({
        id: layoutItem.id,
        column: layoutItem.id === item.id ? newColumn : layoutItem.column,
      })),
    };
  }

  const newSequentialLayout: GridDashLayoutedItem[] = [];
  for (const layoutItem of sequentialLayout) {
    if (layoutItem.id === item.id) continue;

    newSequentialLayout.push({ id: layoutItem.id, column: layoutItem.column });

    if (precedingItems.has(layoutItem.id)) {
      precedingItems.delete(layoutItem.id);
      if (precedingItems.size === 0) {
        newSequentialLayout.push({ id: item.id, column: newColumn });
      }
    }
  }

  return { layout: newSequentialLayout };
}

export function reorderLayout(
  sequentialLayout: GridDashLayoutItem[],
  columnedLayout: GridDashLayoutItem[][],
): GridDashLayoutedItem[] {
  const columns = columnedLayout.length;
  const newSequentialLayout: GridDashLayoutItem[] = [];
  let colIndex = 0;
  const rowIndices = Array.from({ length: columns }, () => 0);
  const blockingItems: (GridDashLayoutItem | undefined)[] = Array.from({
    length: columns,
  });

  // TODO: order by lower y to higher

  const inboundSequentialLayout = sequentialLayout.filter(
    (item) => item.column >= 0 && item.column < columns,
  );
  while (newSequentialLayout.length < inboundSequentialLayout.length) {
    const col = columnedLayout[colIndex]!;
    const item = col[rowIndices[colIndex]!];

    if (item && !blockingItems[colIndex]) {
      const nextRowIndex = (rowIndices[colIndex] ?? 0) + 1;

      if (item.span > 1) {
        if (
          colIndex === columns - 1 ||
          item.column + item.span - 1 === colIndex
        ) {
          const containedSpan = Math.min(columns - item.column, item.span);
          if (
            blockingItems.every((blockingItem, i) =>
              i >= item.column && i < item.column + containedSpan - 1
                ? blockingItem?.id === item.id
                : true,
            )
          ) {
            newSequentialLayout.push(item);
            for (let i = item.column; i < item.column + item.span - 1; i++) {
              blockingItems[i] = undefined;
            }
            rowIndices[colIndex] = nextRowIndex;
          }
        } else {
          blockingItems[colIndex] = item;
          rowIndices[colIndex] = nextRowIndex;
        }
      } else {
        newSequentialLayout.push(item);
        rowIndices[colIndex] = nextRowIndex;
      }
    }

    colIndex = (colIndex + 1) % columns;
  }

  return newSequentialLayout;
}

export function relayoutDrag(
  sequentialLayout: GridDashLayoutItem[],
  columnedLayout: GridDashLayoutItem[][],
  draggingItem: GridDashLayoutItem,
  dragDelta: { x: number; y: number },
  gap: number,
  colWidth: number,
): GridDashLayoutedItem[] | undefined {
  const id = draggingItem.id;
  const draggingElemRealY = draggingItem.elem.offsetTop + dragDelta.y;
  const draggingElemRealX = draggingItem.elem.offsetLeft + dragDelta.x;
  const draggingElemRealYCenter = draggingElemRealY + draggingItem.h / 2;
  const draggingElemRealXFirstColCenter = draggingElemRealX + colWidth / 2;

  const maxCol = columnedLayout.length - 1;
  const halfGap = gap / 2;
  const fullColRangeWidth = halfGap + colWidth + halfGap; // left gap + col width + right gap
  const draggingElemCurrentCol = Math.max(
    Math.min(
      Math.floor(
        (draggingElemRealXFirstColCenter + halfGap) / fullColRangeWidth,
      ),
      maxCol - draggingItem.span + 1,
    ),
    0,
  );

  if (draggingElemCurrentCol !== draggingItem.column) {
    const aboveItemIds = new Set<string>();

    for (
      let i = draggingElemCurrentCol;
      i < draggingElemCurrentCol + draggingItem.span;
      i++
    ) {
      const col = columnedLayout[i]!;
      if (!col || col.length === 0) continue;

      let prevItem: GridDashLayoutItem | undefined;
      for (let j = 0; j < col.length; j++) {
        const item = col[j]!;

        if (item.id === id) {
          break;
        }

        const prevGap = prevItem ? prevItem.y + prevItem.h + gap : 0;
        const currGap = item.y + item.h + gap;
        if (
          Math.abs(prevGap - draggingElemRealY) <=
          Math.abs(currGap - draggingElemRealY)
        ) {
          break;
        }

        prevItem = item;
      }

      if (prevItem) {
        aboveItemIds.add(prevItem.id);
      }
    }

    if (aboveItemIds.size === 0) {
      let draggingItemInserted = false;

      return sequentialLayout.flatMap((item, index) => {
        const draggingLayoutedItem = { id, column: draggingElemCurrentCol };
        const layoutedItem = { id: item.id, column: item.column };
        const willInsertLast =
          !draggingItemInserted && index === sequentialLayout.length - 1;

        if (item.id === id) {
          return willInsertLast ? [draggingLayoutedItem] : [];
        }

        if (
          !draggingItemInserted &&
          (item.y !== 0 || item.column >= draggingElemCurrentCol)
        ) {
          draggingItemInserted = true;
          return [draggingLayoutedItem, layoutedItem];
        }

        return willInsertLast
          ? [layoutedItem, draggingLayoutedItem]
          : [layoutedItem];
      });
    }

    const newLayout: GridDashLayoutedItem[] = [];
    for (const item of sequentialLayout) {
      if (item.id === id) continue;

      newLayout.push({
        id: item.id,
        column: item.column,
      });

      if (aboveItemIds.has(item.id)) {
        aboveItemIds.delete(item.id);

        if (aboveItemIds.size === 0) {
          newLayout.push({
            id: draggingItem.id,
            column: draggingElemCurrentCol,
          });
        }
      }
    }

    return newLayout;
  }

  const swapDirection = Math.sign(
    draggingElemRealYCenter - (draggingItem.y + draggingItem.h / 2),
  );
  if (swapDirection === 0) return;

  const swapItems: GridDashLayoutItem[] = [];
  const aboveSwapItems: (GridDashLayoutItem | undefined)[] = [];
  for (
    let i = draggingItem.column;
    i < draggingItem.column + draggingItem.span;
    i++
  ) {
    const col = columnedLayout[i];
    if (!col) continue;

    const draggingItemIndex = col.findIndex((item) => item.id === id);
    if (draggingItemIndex === -1) continue;

    const item = col[draggingItemIndex + swapDirection];
    if (!item) continue;

    const firstSwapItem = swapItems[0];
    const aboveSwapItem =
      col[draggingItemIndex + (swapDirection === -1 ? -2 : -1)];

    if (!firstSwapItem) {
      swapItems.push(item);
      aboveSwapItems.push(aboveSwapItem);
      continue;
    }

    if (swapDirection === -1) {
      if (firstSwapItem.y < item.y) {
        swapItems.splice(0, swapItems.length, item);
        aboveSwapItems.splice(0, aboveSwapItems.length, aboveSwapItem);
      }

      if (firstSwapItem.y === item.y) {
        swapItems.push(item);
        aboveSwapItems.push(aboveSwapItem);
      }
    } else {
      if (firstSwapItem.y > item.y) {
        swapItems.splice(0, swapItems.length, item);
        aboveSwapItems.splice(0, aboveSwapItems.length, aboveSwapItem);
      }

      if (firstSwapItem.y === item.y) {
        swapItems.push(item);
        aboveSwapItems.push(aboveSwapItem);
      }
    }
  }

  let topSwapSpace = 0;
  let bottomSwapSpace = 0;
  if (swapDirection === -1) {
    // draggingItem is at the top of the col
    if (draggingItem.y === 0) {
      return;
    }

    topSwapSpace = aboveSwapItems.reduce(
      (max, item) => Math.max(max, item ? item.y + item.h + gap : 0),
      0,
    );
    bottomSwapSpace = draggingItem.y + draggingItem.h;
  } else {
    // draggingItem is at the bottom of the col
    if (!swapItems.length) {
      return;
    }

    let swapItemAfterSwapPlace = 0;
    for (let i = 0; i < swapItems.length; i++) {
      const swapItem = swapItems[i];
      if (!swapItem) continue;

      const aboveSwapItem = aboveSwapItems[i];

      let swapItemAfterSwapY = aboveSwapItem
        ? aboveSwapItem.y + aboveSwapItem.h + gap
        : 0;
      for (let j = swapItem.column; j < swapItem.column + swapItem.span; j++) {
        if (j === draggingItem.column) continue;

        const col = columnedLayout[j];
        if (!col) continue;

        let lastItem: GridDashLayoutItem | undefined;
        for (const item of col) {
          if (item.id === id) continue;

          if (item.id === swapItem.id) {
            swapItemAfterSwapY = Math.max(
              swapItemAfterSwapY,
              lastItem ? lastItem.y + lastItem.h + gap : 0,
            );

            break;
          }

          lastItem = item;
        }
      }

      swapItemAfterSwapPlace = Math.max(
        swapItemAfterSwapPlace,
        swapItemAfterSwapY + swapItem.h,
      );
    }

    topSwapSpace = draggingItem.y;
    bottomSwapSpace = swapItemAfterSwapPlace + gap + draggingItem.h;
  }

  const swapSpaceYCenter = topSwapSpace + (bottomSwapSpace - topSwapSpace) / 2;
  let moveDirection: "up" | "down";

  if (draggingElemRealYCenter > swapSpaceYCenter) {
    if (swapDirection !== 1) return;
    if (swapItems.some((item) => draggingItem.y >= item.y + item.h + gap))
      return;
    moveDirection = "down";
  } else {
    if (swapDirection !== -1) return;
    if (
      swapItems.some((item) => draggingItem.y + draggingItem.h + gap <= item.y)
    )
      return;
    moveDirection = "up";
  }

  if (swapItems.length) {
    const swapItemIds = new Set(swapItems.map((item) => item.id));

    const newLayout: GridDashLayoutedItem[] = [];
    for (const item of sequentialLayout) {
      if (item.id === id) continue;

      if (moveDirection === "up" && swapItemIds.has(item.id)) {
        newLayout.push({
          id: draggingItem.id,
          column: draggingItem.column,
        });
        swapItemIds.clear();
      }

      newLayout.push({
        id: item.id,
        column: item.column,
      });

      if (moveDirection === "down" && swapItemIds.has(item.id)) {
        swapItemIds.delete(item.id);

        if (swapItemIds.size === 0) {
          newLayout.push({
            id: draggingItem.id,
            column: draggingItem.column,
          });
        }
      }
    }

    return newLayout;
  }
}
