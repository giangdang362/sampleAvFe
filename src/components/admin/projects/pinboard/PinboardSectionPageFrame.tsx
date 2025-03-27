import { faCircleExclamation } from "@/lib/fas/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Box,
  BoxProps,
  Button,
  ClickAwayListener,
  styled,
  Tooltip,
  tooltipClasses,
  TooltipProps,
} from "@mui/material";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import "react-image-crop/dist/ReactCrop.css";

export interface PinboardSectionPageFrameProps extends BoxProps {
  pageRatio: number;
  pageBottomPadding?: string;
  overflowCause?: "content" | "footer";
}

const ErrorTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "var(--mui-palette-error-dark)",
  },
});

function PinboardSectionPageFrame({
  pageRatio,
  pageBottomPadding = "0px",
  overflowCause,
  ...rest
}: PinboardSectionPageFrameProps) {
  const t = useTranslations("pinboard.section");
  const [warningMsgOpen, setWarningMsgOpen] = useState(false);

  const handleWarningMsgOpen = () => setWarningMsgOpen(true);
  const handleWarningMsgClose = () => setWarningMsgOpen(false);

  const showWarningBtn = overflowCause === "content";
  useEffect(() => {
    if (!showWarningBtn) {
      setWarningMsgOpen(false);
    }
  }, [showWarningBtn]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      position="absolute"
      width="100%"
      height="100%"
      {...rest}
    >
      <Box
        position="absolute"
        width="100%"
        top={0}
        bottom={0}
        sx={{
          // Accounts for page's bottom padding: if the content do not overflow the page
          // but do overflow the padding, highlight it too
          marginTop: `calc(var(--cqw) * 100 / ${pageRatio} - (${pageBottomPadding}))`,
          transition: "opacity 0.3s, border 0.3s, background-color 0.3s",
        }}
        style={{
          opacity: overflowCause ? 1 : 0,
          backgroundColor:
            overflowCause === "content"
              ? "rgba(var(--mui-palette-error-lightChannel) / 8%)"
              : "var(--mui-palette-common-background)",
        }}
      />
      <Box
        width="100%"
        sx={{
          zIndex: 0,
          aspectRatio: pageRatio,
          border: "1px solid var(--mui-palette-divider)",
        }}
      />

      <ClickAwayListener onClickAway={handleWarningMsgClose}>
        <Box
          position="absolute"
          bottom={0}
          right={0}
          display="flex"
          aria-hidden={!showWarningBtn}
          sx={{
            transition: "opacity 0.3s",
            opacity: showWarningBtn ? 1 : 0,
          }}
        >
          <ErrorTooltip
            onClose={handleWarningMsgClose}
            onOpen={handleWarningMsgOpen}
            open={showWarningBtn && warningMsgOpen}
            enterDelay={0}
            arrow={false}
            placement="bottom-end"
            slotProps={{
              popper: {
                modifiers: [
                  {
                    name: "offset",
                    options: {
                      offset: [0, -8],
                    },
                  },
                ],
              },
            }}
            disableTouchListener
            title={t("contentOverflowWarning")}
          >
            <Button
              onClick={handleWarningMsgOpen}
              sx={{
                padding: 0,
                minWidth: 0,
                borderRadius: "50%",
                transform: "translate(50%, 50%)",
                backgroundColor:
                  "var(--mui-palette-common-background) !important",
              }}
              aria-hidden={!showWarningBtn}
            >
              <FontAwesomeIcon
                icon={faCircleExclamation}
                color="var(--mui-palette-error-dark)"
              />
            </Button>
          </ErrorTooltip>
        </Box>
      </ClickAwayListener>
    </Box>
  );
}

export default PinboardSectionPageFrame;
