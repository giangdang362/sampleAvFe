import React, { memo, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS, Transform } from "@dnd-kit/utilities";
import { Box, BoxProps } from "@mui/material";

export interface SortableItemProps extends Omit<BoxProps, "id"> {
  id: string;
}

const SortableItem = ({ id, ...rest }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    node,
    transform,
    transition,
    active,
    over,
    isDragging,
  } = useSortable({ id });

  const prevTransform = useRef<Transform>();
  if (transform) {
    prevTransform.current = transform;
  }
  const prevOffsetTop = useRef<number>();
  prevOffsetTop.current = node.current?.offsetTop;

  const prevIsDragging = useRef(false);
  const isDraggingChanged = prevIsDragging.current !== isDragging;

  if (isDragging && node.current) {
    node.current.style.zIndex = "1000";
  }

  if (isDraggingChanged && !isDragging) {
    requestAnimationFrame(() => {
      if (node.current) {
        const offsetY =
          (prevOffsetTop.current ?? 0) +
          (prevTransform.current?.y ?? 0) -
          node.current.offsetTop;

        const animation = node.current.animate(
          {
            transform: [
              `translate3d(0px, ${offsetY}px, 0px)`,
              "translate3d(0px, 0px, 0px)",
            ],
          },
          { duration: 200, easing: "ease-out" },
        );

        animation.onfinish = () => {
          if (node.current) {
            node.current.style.zIndex = "";
          }
        };
      }
    });
  }

  prevIsDragging.current = isDragging;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: over || active?.id === id ? transition : undefined,
  } as const;

  return (
    <Box
      ref={setNodeRef}
      position="relative"
      {...attributes}
      {...listeners}
      {...rest}
      className={(rest.className ?? "") + (isDragging ? " is-dragging" : "")}
      style={{ ...style, ...rest.style }}
    />
  );
};

export default memo(SortableItem);
