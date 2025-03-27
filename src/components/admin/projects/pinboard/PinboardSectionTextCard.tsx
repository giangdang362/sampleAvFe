import {
  Box,
  BoxProps,
  ClickAwayListener,
  Divider,
  FormHelperText,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
} from "@mui/material";
import React, {
  useRef,
  useState,
  useEffect,
  useContext,
  useCallback,
  memo,
} from "react";
import "react-image-crop/dist/ReactCrop.css";
import FaIconButton from "@/components/common/FaIconButton";
import { faBold, faSort } from "@/lib/fas/pro-solid-svg-icons";
import {
  faItalic,
  faTrashCan,
  faUnderline,
} from "@/lib/fas/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  useDeletePinboardImageMutation,
  useUpdatePinboardImageMutation,
} from "@/services/pinboards";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { useConfirmDialog } from "@/components/common/UserDialog";
import { PinboardInfoContext } from "./DesignList";
import PinboardSectionCardToolbar from "./PinboardSectionCardToolbar";
import Quill from "quill";
import "quill/dist/quill.core.css";
import { Range } from "quill/core";
import Emitter from "quill/core/emitter";
import { GridDashContext } from "@/components/common/grid-dash/GridDash";
import { GridDashItemContext } from "@/components/common/grid-dash/GridDashItem";

export interface PinboardSectionTextCardProps
  extends Omit<BoxProps, "id" | "content">,
    Pick<API.PinboardImage, "id" | "colSpan"> {
  content: API.PinboardImage["note"];
  onEditModeChange?: (id: string, editMode: boolean) => void;
  onColSpanChange?: (id: string, colSpan: number) => void;
}

const FONT_SIZE_LEVELS = [
  8, 9, 10, 12, 14, 16, 20, 24, 32, 42, 54, 68, 84, 98,
] as const;

const FONT_SIZES = FONT_SIZE_LEVELS.map(
  (level) => `calc(var(--cqw) * ${level / 14})`,
);
const DEFAULT_FONT_SIZE = FONT_SIZES[4];

const Size = Quill.import("attributors/style/size") as any;
if (Size) {
  Size.whitelist = FONT_SIZES;
  Quill.register(Size, true);
}

// this module is to workaround a nasty issue with preserving white spaces (they got stripped out):
// https://github.com/quilljs/quill/issues/1752
// https://github.com/quilljs/quill/issues/2459
// https://github.com/quilljs/quill/issues/1751
class PreserveWhiteSpace {
  constructor(
    private quill: any,
    private options: {},
  ) {
    quill.container.style.whiteSpace = "pre-line";
  }
}
Quill.register("modules/preserveWhiteSpace", PreserveWhiteSpace);

const qlActionButtonTooltipProps = {
  slotProps: {
    popper: {
      modifiers: [
        {
          name: "offset",
          options: {
            offset: [0, 5],
          },
        },
      ],
    },
  },
  PopperProps: { disablePortal: true },
};

const SELECT_ICON_WIDTH = 8;
const SelectIcon = () => (
  <FontAwesomeIcon
    icon={faSort}
    style={{
      position: "absolute",
      right: 0,
      width: SELECT_ICON_WIDTH,
      height: SELECT_ICON_WIDTH,
    }}
  />
);

const textInfoSchema = z.string().max(20000);

const PinboardSectionTextCard: React.FC<PinboardSectionTextCardProps> = ({
  onEditModeChange,
  onColSpanChange,
  sx,
  id,
  content,
  colSpan,
  ...rest
}) => {
  const text = { id, content, colSpan };

  const pinboardContext = useContext(PinboardInfoContext);
  if (!pinboardContext) throw new Error("Missing pinboard context");
  const { pinboardId, readOnly } = pinboardContext;

  const t = useTranslations("pinboard");
  const gridDashContext = useContext(GridDashContext);
  const gridDashItemContext = useContext(GridDashItemContext);
  const [editMode, setEditMode] = useState(false);
  const [isError, setIsError] = useState(false);

  const [updatePinboardTextCard] = useUpdatePinboardImageMutation();

  useEffect(() => {
    gridDashContext?.forceRelayout();
  }, [editMode, isError, gridDashContext]);

  const [deleteTextCard] = useDeletePinboardImageMutation();
  const { openDialog } = useConfirmDialog();
  const handleDeleteTextCard = async (callback?: () => void) => {
    openDialog({
      type: "confirm",
      mainColor: "error",
      title: t("card.deleteCard", { type: "text" }),
      content: t("text.deleteTextContent"),
      confirmButtonLabel: t("card.deleteCard", { type: "text" }),
      icon: faTrashCan,
      onConfirm: async () => {
        try {
          await deleteTextCard({
            id: pinboardId,
            imageIds: [text.id],
          }).unwrap();

          callback?.();
        } catch {}
      },
    });
    return;
  };

  const [quillContainer, setQuillContainer] = useState<HTMLDivElement | null>(
    null,
  );
  const [quillToolbar, setQuillToolbar] = useState<HTMLDivElement | null>(null);
  const [quill, setQuill] = useState<Quill>();
  const quillFontSizeSelectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (!quillContainer || !quillToolbar) return;

    const quill = new Quill(quillContainer, {
      formats: ["size", "bold", "italic", "underline"],
      modules: {
        preserveWhiteSpace: true,
        toolbar: quillToolbar,
      },
    });
    quill.disable();
    setQuill(quill);
  }, [quillContainer, quillToolbar]);

  useEffect(() => {
    if (readOnly) return;
    if (!quill || !quillContainer) return;
    quillContainer
      .querySelector(".ql-editor")
      ?.setAttribute("data-placeholder", t("text.placeholder"));
  }, [quill, quillContainer, readOnly, t]);

  const handleEditorChange = useCallback(
    (
      ...args:
        | [(typeof Emitter)["events"]["TEXT_CHANGE"]]
        | [(typeof Emitter)["events"]["SELECTION_CHANGE"], Range]
    ) => {
      if (!quill || !quillFontSizeSelectRef.current) return;
      const [eventName] = args;

      setFontSize(quillFontSizeSelectRef.current.value);
      if (eventName === "text-change") {
        setIsError(false);
      }

      if (eventName !== "selection-change") return;

      const [_, range] = args;
      if (!range?.length) return;

      const delta = quill.getContents(range.index, range.length);
      let mixedFontSize = false;
      const fontSizeSet = new Set<string>();
      for (const op of delta.ops) {
        if (!op.insert || op.insert === "\n") continue;

        fontSizeSet.add((op.attributes?.size as string | undefined) ?? "");
        if (fontSizeSet.size >= 2) {
          mixedFontSize = true;
          break;
        }
      }

      if (mixedFontSize) {
        setFontSize("");
      }
    },
    [quill],
  );

  useEffect(() => {
    if (!quill) return;

    quill.on("editor-change", handleEditorChange);
    return () => {
      quill.off("editor-change", handleEditorChange);
    };
  }, [quill, handleEditorChange]);

  useEffect(() => {
    if (!quillContainer) return;

    const resizeObserver = new ResizeObserver(() => {
      gridDashContext?.forceRelayout();
    });
    resizeObserver.observe(quillContainer);
    return () => {
      resizeObserver.disconnect();
    };
  }, [quillContainer, gridDashContext]);

  useEffect(() => {
    if (!quill) return;
    const delta = quill.clipboard.convert({ html: text.content ?? "" });
    quill.setContents(delta);
  }, [quill, text.content]);

  const currentContentRef = useRef(text.content);
  currentContentRef.current = text.content;
  const handleSaveText = useCallback(() => {
    if (!quill) return true;

    const textContent = quill.getText();
    const isEmpty = !textContent.trim();
    const content = isEmpty ? "" : quill.getSemanticHTML();

    if (isEmpty) {
      quill.setText("");
    }

    const { success } = textInfoSchema.safeParse(content);
    if (success) {
      setIsError(false);

      if ((currentContentRef.current ?? "") !== content) {
        updatePinboardTextCard({
          id: pinboardId,
          imageId: text.id,
          note: content,
          updateType: "optimistic",
        });
      }

      return true;
    }

    setIsError(true);
    if (quillContainer) {
      quillContainer.scrollIntoView({ block: "end" });
    }

    return false;
  }, [quill, quillContainer, updatePinboardTextCard, pinboardId, text.id]);

  const activeEditBoxRef = useRef<HTMLDivElement>();
  const currentEditModeRef = useRef(editMode);
  currentEditModeRef.current = editMode;
  const onEditModeChangeRef = useRef(onEditModeChange);
  onEditModeChangeRef.current = onEditModeChange;

  const setDraggingDisableMode = gridDashItemContext?.setDraggingDisableMode;

  const setEditModeAndReport = useCallback(
    (newEditMode: boolean) => {
      if (currentEditModeRef.current === newEditMode) return;

      let willChangeMode = true;
      if (!newEditMode) {
        willChangeMode = handleSaveText();
        activeEditBoxRef.current?.focus();
      }

      if (willChangeMode) {
        setEditMode(newEditMode);
        onEditModeChangeRef.current?.(text.id, newEditMode);

        quill?.enable(newEditMode);

        if (newEditMode) {
          requestAnimationFrame(() => quill?.focus());
        }

        setDraggingDisableMode?.(newEditMode ? "hard" : undefined);
      }
    },
    [handleSaveText, quill, setDraggingDisableMode, text.id],
  );

  const handleEditorKeydown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const key = e.key;
    const target = e.currentTarget;

    if (key === "Enter" || key === " ") {
      requestAnimationFrame(() => {
        target.click();
      });
    }

    if (key === "Escape") {
      setEditModeAndReport(false);
    }
  };

  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [fontSizeSelectTooltipOpened, setFontSizeSelectTooltipOpened] =
    useState(false);

  const onFontSizeChange = (e: SelectChangeEvent<string>) => {
    if (quillFontSizeSelectRef.current) {
      quillFontSizeSelectRef.current.selectedIndex = FONT_SIZES.indexOf(
        e.target.value as any,
      );
      quillFontSizeSelectRef.current.dispatchEvent(new Event("change"));
      setFontSize(e.target.value);

      requestAnimationFrame(() => {
        quill?.focus();
      });
    }
  };

  return (
    <>
      <Box
        {...rest}
        sx={[
          {
            borderRadius: 0.5,
            "& .pinboard-card-toolbar": {
              transition: "opacity 0.3s",
              opacity: 0,
            },
            "&:hover .pinboard-card-toolbar, & .pinboard-card-toolbar:focus-within":
              {
                opacity: 1,
              },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <ClickAwayListener
          mouseEvent="onMouseDown"
          touchEvent="onTouchStart"
          onClickAway={() => setEditModeAndReport(false)}
        >
          <Box
            ref={activeEditBoxRef}
            className="non-interactable-when-dragging"
            sx={{
              backgroundColor: "var(--mui-palette-background-default)",
              borderRadius: "inherit",
              outlineOffset: "calc(var(--cqw) * 0.5)",
              "& .ql-container": {
                fontFamily: "inherit",
                scrollMargin: "100px",

                "& .ql-editor": {
                  whiteSpace: "pre-line",
                  wordWrap: "break-word",
                  "&::before": {
                    left: 0,
                    right: 0,
                  },
                  p: 0,
                  fontSize: "calc(var(--cqw) * 1)",
                  cursor: readOnly ? undefined : "text",
                },
              },
              "& .MuiIconButton-root.ql-active": {
                backgroundColor: "var(--mui-palette-primary-200)",
                color: "var(--mui-palette-common-black)",
              },
              "&:before": editMode
                ? {
                    content: "''",
                    position: "absolute",
                    top: 0,
                    left: "calc(var(--cqw) * -0.5)",
                    width: "calc(100% + var(--cqw) * 1)",
                    height: "calc(100% + var(--cqw) * 0.5)",
                    backgroundColor: "var(--mui-palette-common-background)",
                    borderRadius: 0.5,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                    clipPath: "inset(0px -15px -15px -15px)",
                    boxShadow: "0px 0px 8px 4px rgba(0, 0, 0, 0.32)",
                  }
                : undefined,
            }}
            {...(!readOnly
              ? {
                  tabIndex: 0,
                  role: "button",
                  onKeyDown: handleEditorKeydown,
                  onClick: () => {
                    setEditModeAndReport(true);
                  },
                }
              : undefined)}
          >
            <Box
              sx={{
                position: "absolute",
                left: "calc(var(--cqw) * -0.5)",
                bottom: "calc(100% - 1px)",
                zIndex: 1100,
                width: "calc(100% + var(--cqw) * 1)",
                backgroundColor: "var(--mui-palette-common-background)",
                p: "calc(var(--cqw) * 0.5)",
                borderRadius: 0.5,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                display: editMode ? "block" : "none",
                "&:before": {
                  zIndex: -1,
                  content: "''",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  borderTopLeftRadius: "inherit",
                  borderTopRightRadius: "inherit",
                  clipPath: "inset(-15px -15px 1px -15px)",
                  boxShadow: "0px 0px 8px 4px rgba(0, 0, 0, 0.12)",
                },
              }}
            >
              <Box ref={setQuillToolbar}>
                {/* Only for quill to manage */}
                <select
                  ref={quillFontSizeSelectRef}
                  className="ql-size"
                  defaultValue={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  style={{ display: "none" }}
                >
                  {FONT_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>

                <Tooltip
                  title={t("text.fontSize")}
                  open={fontSizeSelectTooltipOpened}
                  PopperProps={{ disablePortal: true }}
                >
                  <Select
                    value={fontSize}
                    onChange={onFontSizeChange}
                    size="small"
                    sx={{
                      minWidth: 45,
                      fontSize: "12px",
                      mr: 0.5,
                      "& .MuiSelect-select": (theme) => ({
                        p: 0.5,
                        pr: `calc(${SELECT_ICON_WIDTH}px + ${theme.spacing(0.5)}) !important`,
                        zIndex: 1,
                      }),
                      "& .svg-inline--fa": {
                        mr: 0.5,
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "transparent",
                      },
                    }}
                    IconComponent={SelectIcon}
                    onMouseEnter={() => setFontSizeSelectTooltipOpened(true)}
                    onMouseLeave={() => setFontSizeSelectTooltipOpened(false)}
                    onOpen={() => setFontSizeSelectTooltipOpened(false)}
                  >
                    {FONT_SIZES.map((size, index) => (
                      <MenuItem key={size} value={size}>
                        {FONT_SIZE_LEVELS[index]}
                      </MenuItem>
                    ))}
                  </Select>
                </Tooltip>
                <FaIconButton
                  className="ql-bold"
                  title={t("text.boldTooltip")}
                  icon={faBold}
                  iconSize="12px"
                  color="primary"
                  sx={{ p: 0.75, m: 0.25 }}
                  tooltipProps={qlActionButtonTooltipProps}
                />
                <FaIconButton
                  className="ql-italic"
                  title={t("text.italicTooltip")}
                  icon={faItalic}
                  iconSize="12px"
                  color="primary"
                  sx={{ p: 0.75, m: 0.25 }}
                  tooltipProps={qlActionButtonTooltipProps}
                />
                <FaIconButton
                  className="ql-underline"
                  title={t("text.underlineTooltip")}
                  icon={faUnderline}
                  iconSize="12px"
                  color="primary"
                  sx={{ p: 0.75, m: 0.25 }}
                  tooltipProps={qlActionButtonTooltipProps}
                />
              </Box>

              <Divider sx={{ mt: 0.5 }} />
            </Box>

            <Box ref={setQuillContainer} />

            {isError && (
              <FormHelperText error sx={{ mt: 2 }}>
                {t("text.errorText")}
              </FormHelperText>
            )}
          </Box>
        </ClickAwayListener>

        {!readOnly && !editMode && (
          <PinboardSectionCardToolbar
            type="text"
            position="absolute"
            top="calc(var(--cqw) / 2)"
            right="calc(var(--cqw) / 2)"
            ml="calc(var(--cqw) / 2)"
            activeColSpan={text.colSpan}
            onDelete={handleDeleteTextCard}
            onColSpanChanged={(colSpan) =>
              colSpan !== text.colSpan && onColSpanChange?.(text.id, colSpan)
            }
          />
        )}
      </Box>
    </>
  );
};

export default memo(PinboardSectionTextCard);
