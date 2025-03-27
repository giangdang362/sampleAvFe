import { useCallback, useRef, useState, DragEvent } from "react";

interface DialogController {
  open: boolean;
  onClickOpen: () => void;
  onClose: () => void;
  dragOver: boolean;
  onDragOver: () => void;
  onDragEnter: (e?: DragEvent<HTMLElement>) => void;
  onDragLeave: (e?: DragEvent<HTMLElement>) => void;
}

export default function useDialog(): DialogController {
  const dragOverTimeoutRef = useRef<NodeJS.Timeout>();

  /**
   * Manages the open/closed state of a dialog.
   * @returns {boolean} `true` if the dialog is open, `false` otherwise.
   */
  const [open, setOpen] = useState<boolean>(false);

  /**
   * Tracks whether the user is currently dragging an element over the component.
   */
  const [dragOver, setDragOver] = useState<boolean>(false);

  // https://stackoverflow.com/questions/7110353/html5-dragleave-fired-when-hovering-a-child-element
  const draggedOverTarget = useRef<EventTarget>();

  const onClickOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const onClose = useCallback(() => {
    setOpen(false);
  }, []);

  const onDragOver = useCallback(() => {
    if (!dragOverTimeoutRef.current) {
      dragOverTimeoutRef.current = setTimeout(() => setDragOver(true), 500);
    }
  }, []);

  const onDragEnter = useCallback((e?: DragEvent<HTMLElement>) => {
    if (e) {
      draggedOverTarget.current = e.target;
    }
  }, []);

  const onDragLeave = useCallback((e?: DragEvent<HTMLElement>) => {
    if (!e || draggedOverTarget.current === e.target) {
      setDragOver(false);
    }

    if (dragOverTimeoutRef.current !== undefined) {
      clearTimeout(dragOverTimeoutRef.current);
      dragOverTimeoutRef.current = undefined;
    }
  }, []);

  return {
    open,
    onClickOpen,
    onClose,
    dragOver,
    onDragOver,
    onDragEnter,
    onDragLeave,
  };
}
