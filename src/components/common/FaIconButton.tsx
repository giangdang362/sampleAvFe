import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import {
  Badge,
  BadgeProps,
  Box,
  BoxProps,
  IconButton,
  IconButtonProps,
  Tooltip,
  TooltipProps,
} from "@mui/material";
import { ReactElement, forwardRef, isValidElement } from "react";

export interface FaIconButtonProps extends Omit<IconButtonProps, "title"> {
  icon: ReactElement | FontAwesomeIconProps["icon"];
  iconSize?: FontAwesomeIconProps["fontSize"];
  title?: string;
  wrapperProps?: BoxProps;
  tooltipProps?: Omit<TooltipProps, "title" | "children">;
  iconProps?: Omit<FontAwesomeIconProps, "icon" | "fontSize">;
  badgeProps?: BadgeProps;
  tooltipBottomOffset?: number;
}

const FaIconButton = forwardRef<HTMLButtonElement, FaIconButtonProps>(
  (
    {
      icon,
      iconSize = "1rem",
      title,
      wrapperProps,
      tooltipProps,
      iconProps,
      badgeProps,
      tooltipBottomOffset,
      ...rest
    },
    ref,
  ) => {
    return (
      <Tooltip
        title={title}
        {...tooltipProps}
        slotProps={{
          ...tooltipProps?.slotProps,
          popper: {
            ...tooltipProps?.slotProps?.popper,
            modifiers: [
              {
                name: "offset",
                options: {
                  offset: [0, tooltipBottomOffset ?? -6],
                },
              },
              ...(tooltipProps?.slotProps?.popper?.modifiers ?? []),
            ],
          },
        }}
      >
        <Box component="span" {...wrapperProps}>
          <IconButton ref={ref} aria-label={title} {...rest}>
            <Badge
              {...badgeProps}
              sx={[
                {
                  "& .MuiBadge-badge": {
                    fontSize: "0.45em",
                    minWidth: "18px",
                    height: "18px",
                    top: "-2px",
                    right: "-2px",
                  },
                },
                ...(Array.isArray(badgeProps?.sx)
                  ? badgeProps?.sx
                  : [badgeProps?.sx]),
              ]}
            >
              {isValidElement(icon) ? (
                <div
                  style={{
                    width: iconProps?.width ?? iconSize,
                    height: iconProps?.height ?? iconSize,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    ...iconProps?.style,
                  }}
                >
                  {icon}
                </div>
              ) : (
                <FontAwesomeIcon
                  icon={icon as FontAwesomeIconProps["icon"]}
                  {...iconProps}
                  style={{
                    fontSize: iconSize,
                    width: iconSize,
                    height: iconSize,
                    ...iconProps?.style,
                  }}
                />
              )}
            </Badge>
          </IconButton>
        </Box>
      </Tooltip>
    );
  },
);
FaIconButton.displayName = "FaIconButton";

export default FaIconButton;
