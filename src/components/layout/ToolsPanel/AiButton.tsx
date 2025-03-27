import FaIconButton from "@/components/common/FaIconButton";
import { useTranslations } from "next-intl";
import AiIcon from "./AiIcon";
import { Box, Divider, Popover, Typography } from "@mui/material";
import {
  bindPopover,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";
import DragAndDrop, {
  DROPPABLE_ID_PREFIX,
} from "@/components/common/drag-and-drop";
import { useEffect, useRef, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  useGetSearchKeyByImageIdMutation,
  useUploadImageAISearchMutation,
} from "@/services/search";

interface AiButtonProps {
  onImageUploaded?: (imageId: string) => void;
}

function validateImageData(data: unknown): data is { imageId: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    "imageId" in data &&
    typeof data.imageId === "string"
  );
}

const AI_SEARCH_POPUP_DELAY = 400;
const DND_AI_SEARCH_ID = "ai-search";

export default function AiButton({
  onImageUploaded,
}: AiButtonProps): React.JSX.Element {
  const t = useTranslations("toolsPanel");
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);
  const dragOverTimeoutRef = useRef<NodeJS.Timeout>();
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [dragAndDropKey, setDragAndDropKey] = useState(0);
  const draggedOverTarget = useRef<EventTarget>();
  const dropBoxPopoverState = usePopupState({
    variant: "popover",
    popupId: "ai-search-popover",
  });

  const { setNodeRef, active, isOver, over } = useDroppable({
    id: "droppable-open-ai-search-popover",
  });

  const data = active?.data.current;
  useEffect(() => {
    if (dragOverTimeoutRef.current !== undefined) {
      clearTimeout(dragOverTimeoutRef.current);
      dragOverTimeoutRef.current = undefined;
    }

    if (!isOver) return;
    if (!validateImageData(data)) return;

    dragOverTimeoutRef.current = setTimeout(
      () => setIsDraggingOver(true),
      AI_SEARCH_POPUP_DELAY,
    );
  }, [data, isOver]);

  const prevOverRef = useRef(over);
  const prevActiveRef = useRef(active);
  const isDropped = !!prevActiveRef.current && !active;
  if (
    isDropped &&
    prevOverRef.current?.id !== DROPPABLE_ID_PREFIX + DND_AI_SEARCH_ID
  ) {
    setIsDraggingOver(false);
  }
  prevOverRef.current = over;
  prevActiveRef.current = active;

  const [uploadImage, { isLoading: isUploading }] =
    useUploadImageAISearchMutation();
  const [getImageKey, { isLoading: isGettingKey }] =
    useGetSearchKeyByImageIdMutation();
  const isLoading = isUploading || isGettingKey;

  const handleUploadImage = async (files: File[]) => {
    if (!onImageUploaded) return;

    try {
      const file = files[0];
      const res = await uploadImage({ file }).unwrap();

      onImageUploaded(res.key);
      bindPopover(dropBoxPopoverState).onClose();
      setIsDraggingOver(false);
    } catch {}
  };

  const handleGetKey = async ({ imageId }: { imageId: string }) => {
    if (!onImageUploaded) return;

    try {
      const res = await getImageKey({ imageId }).unwrap();
      onImageUploaded(res.key);
      bindPopover(dropBoxPopoverState).onClose();
      setIsDraggingOver(false);
    } catch {}
  };

  return (
    <Box
      ref={setNodeRef}
      py={2}
      position="relative"
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("Files")) {
          e.preventDefault();

          if (!dragOverTimeoutRef.current) {
            dragOverTimeoutRef.current = setTimeout(
              () => setIsDraggingOver(true),
              AI_SEARCH_POPUP_DELAY,
            );
          }
        }
      }}
      onDragEnter={(e) => {
        draggedOverTarget.current = e.target;
      }}
      onDragLeave={(e) => {
        if (draggedOverTarget.current === e.target) {
          setIsDraggingOver(false);
        }

        if (dragOverTimeoutRef.current !== undefined) {
          clearTimeout(dragOverTimeoutRef.current);
          dragOverTimeoutRef.current = undefined;
        }
      }}
    >
      <FaIconButton
        ref={setButtonRef}
        icon={<AiIcon color="#fff" />}
        iconSize={32}
        title={t("aiSearchGuide")}
        sx={{
          p: 1,
          borderRadius: 1,
          bgcolor: "var(--mui-palette-primary-main)",
          "&:hover": {
            bgcolor: "var(--mui-palette-primary-dark)",
          },
          "& .MuiTouchRipple-root": {
            color: "var(--mui-palette-primary-contrastText)",
          },
        }}
        wrapperProps={{
          sx: {
            display: "flex",
            justifyContent: "center",
          },
        }}
        {...bindTrigger(dropBoxPopoverState)}
      />
      <Typography fontSize={12} fontWeight={400} textAlign="center" mt={0.5}>
        {t("aiSearch")}
      </Typography>

      <Popover
        {...bindPopover(dropBoxPopoverState)}
        anchorEl={buttonRef}
        open={bindPopover(dropBoxPopoverState).open || isDraggingOver}
        onClose={() => {
          if (isLoading) return;

          bindPopover(dropBoxPopoverState).onClose();
          setIsDraggingOver(false);
        }}
        TransitionProps={{
          onEntered: () => setDragAndDropKey((prev) => prev + 1),
        }}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: 0,
          horizontal: -20,
        }}
        sx={{
          "& .MuiPopover-paper": {
            zIndex: "--AiSearchPopover-zIndex",
            width: "var(--ToolsPanel--AiSearchPopover-width)",
            border: "1px solid var(--mui-palette-divider)",
          },
        }}
      >
        <Box display="flex" gap={1} px={2.5} py={2}>
          <AiIcon width={24} height={24} />
          <Typography fontWeight="500">{t("aiSearch")}</Typography>
        </Box>

        <Divider />

        <Box p={2.5}>
          <DragAndDrop
            key={dragAndDropKey + ""} // force update droppable hitbox
            variant="contained"
            type="image"
            icon="none"
            maxFile={1}
            instructionText={t("aiSearchDropGuide")}
            customDroppableId={DND_AI_SEARCH_ID}
            validateCustomData={validateImageData}
            onFilesSelected={handleUploadImage}
            onCustomDataDropped={handleGetKey}
            loading={isLoading}
            sx={{
              width: "100%",
              minHeight: 200,
              "& .DnD-InstructionText": {
                fontWeight: "400",
                fontStyle: "italic",
                color: "var(--mui-palette-text-disabled)",
              },
            }}
          />
        </Box>
      </Popover>
    </Box>
  );
}
