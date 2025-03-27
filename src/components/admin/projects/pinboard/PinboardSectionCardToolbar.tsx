import { Box, BoxProps } from "@mui/material";
import React from "react";
import "react-image-crop/dist/ReactCrop.css";
import FaIconButton, {
  FaIconButtonProps,
} from "@/components/common/FaIconButton";
import { faCropSimple, faTrashCan } from "@/lib/fas/pro-regular-svg-icons";
import { useTranslations } from "next-intl";

export interface SectionCardToolbarProps<T extends "image" | "text">
  extends BoxProps {
  type: T;
  activeColSpan?: number;
  onDelete?: () => void;
  onColSpanChanged?: (colSpan: number) => void;
  onCrop?: T extends "image" ? () => void : never;
}

const toolbarTooltipProps: FaIconButtonProps["tooltipProps"] = {
  PopperProps: { style: { zIndex: 10_000 } },
  slotProps: {
    popper: {
      modifiers: [{ name: "offset", options: { offset: [0, 6] } }],
    },
  },
};

function SectionCardToolbar<T extends "image" | "text">({
  type,
  activeColSpan,
  onDelete,
  onCrop,
  onColSpanChanged,
  sx,
  className,
  ...rest
}: SectionCardToolbarProps<T>) {
  const t = useTranslations("pinboard");

  return (
    <Box
      className={`pinboard-card-toolbar non-interactable-when-dragging invisible-when-dragging ${className}`}
      bgcolor="rgba(var(--mui-palette-primary-mainChannel) / 0.6)"
      color="var(--mui-palette-common-white)"
      borderRadius="calc(var(--cqw) * 0.6)"
      p="calc(var(--cqw) * 0.3)"
      {...rest}
      sx={[
        {
          display: "flex",
          zIndex: 800,
          backdropFilter: "blur(6px)",
          "& > span": { display: "flex" },
          "& .MuiIconButton-root": {
            p: "calc(var(--cqw) * 0.6)",
            borderRadius: "calc(var(--cqw) * 0.3)",
            "&.active-colspan": {
              bgcolor: "var(--mui-palette-primary-main)",
            },
            "&:hover": {
              bgcolor: "var(--mui-palette-action-focus)",
            },
            "&.active-colspan:hover": {
              bgcolor: "rgba(var(--mui-palette-primary-mainChannel) / 0.65)",
            },
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <FaIconButton
        icon={faTrashCan}
        sx={{ color: "inherit" }}
        iconSize="var(--cqw)"
        onClick={onDelete}
        title={t("card.deleteCard", { type })}
        tooltipProps={toolbarTooltipProps}
      />
      {type === "image" && (
        <FaIconButton
          icon={faCropSimple}
          sx={{ color: "inherit" }}
          iconSize="var(--cqw)"
          onClick={onCrop}
          title={t("image.cropImage")}
          tooltipProps={toolbarTooltipProps}
        />
      )}
      <FaIconButton
        icon={
          <div
            style={{
              aspectRatio: "2 / 3",
              height: "100%",
              border: "1px solid",
              borderRadius: "2px",
            }}
          />
        }
        sx={{ color: "inherit" }}
        iconSize="var(--cqw)"
        className={activeColSpan === 1 ? "active-colspan" : ""}
        onClick={() => onColSpanChanged?.(1)}
        title={t("card.changeCardSize", { type })}
        tooltipProps={toolbarTooltipProps}
      />
      <FaIconButton
        icon={
          <div
            style={{
              width: "100%",
              height: "100%",
              border: "1px solid",
              borderRadius: "2px",
            }}
          />
        }
        sx={{ color: "inherit" }}
        iconSize="var(--cqw)"
        className={activeColSpan === 2 ? "active-colspan" : ""}
        onClick={() => onColSpanChanged?.(2)}
        title={t("card.changeCardSize", { type })}
        tooltipProps={toolbarTooltipProps}
      />
      <FaIconButton
        icon={
          <div
            style={{
              width: "100%",
              height: "100%",
              border: "1px solid",
              borderRadius: "2px",
            }}
          />
        }
        sx={{ color: "inherit" }}
        iconProps={{
          style: {
            aspectRatio: "4 / 3",
            width: "unset",
            height: "var(--cqw)",
          },
        }}
        className={activeColSpan === 3 ? "active-colspan" : ""}
        onClick={() => onColSpanChanged?.(3)}
        title={t("card.changeCardSize", { type })}
        tooltipProps={toolbarTooltipProps}
      />
      <FaIconButton
        icon={
          <div
            style={{
              width: "100%",
              height: "100%",
              border: "1px solid",
              borderRadius: "2px",
            }}
          />
        }
        sx={{ color: "inherit" }}
        iconProps={{
          style: {
            aspectRatio: "5 / 3",
            width: "unset",
            height: "var(--cqw)",
          },
        }}
        className={activeColSpan === 4 ? "active-colspan" : ""}
        onClick={() => onColSpanChanged?.(4)}
        title={t("card.changeCardSize", { type })}
        tooltipProps={toolbarTooltipProps}
      />
    </Box>
  );
}

export default SectionCardToolbar;
