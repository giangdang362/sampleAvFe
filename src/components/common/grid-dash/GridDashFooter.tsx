import React, { memo, PropsWithChildren, useContext, useState } from "react";
import { Box } from "@mui/material";
import {
  GridDashFooterInternalContext,
  GridDashInternalContext,
} from "./GridDash";

export interface GridDashFooterProps extends PropsWithChildren {}

export const GRID_DASH_FOOTER_CLASS = "grid-dash--footer";

const GridDashFooter: React.FC<GridDashFooterProps> = memo(({ children }) => {
  const gridDashContext = useContext(GridDashInternalContext);
  const gridDashFooterContext = useContext(GridDashFooterInternalContext);

  if (!gridDashContext || !gridDashFooterContext)
    throw new Error("GridDashFooter must be used inside GridDash");

  const { draggingItemId } = gridDashContext;
  const { overflowingFooters } = gridDashFooterContext;
  const [footerRef, setFooterRef] = useState();

  return (
    <Box
      ref={setFooterRef}
      sx={{
        position: "absolute",
        transformOrigin: "50% 0",
        width: 0,
        transition: "opacity 0.3s",
        "&.hidden": {
          opacity: 0,
        },
        "&.hidden > *": {
          pointerEvents: "none !important",
        },
      }}
      className={`${GRID_DASH_FOOTER_CLASS} ${draggingItemId ? "hidden" : ""}
        ${footerRef && overflowingFooters.includes(footerRef) ? "is-overflowing" : ""}`}
    >
      {children}
    </Box>
  );
});
GridDashFooter.displayName = "GridDashFooter";

export default GridDashFooter;
