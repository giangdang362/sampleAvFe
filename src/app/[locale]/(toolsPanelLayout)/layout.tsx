"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import GlobalStyles from "@mui/material/GlobalStyles";
import HeaderMain, {
  ContextHeaderMainProps,
  HeaderMainContext,
} from "@/components/layout/header";
import ToolsPanel from "@/components/layout/ToolsPanel";
import { DndContext } from "@dnd-kit/core";
import { useDndSensors } from "@/hooks/useDndSensors";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  const [headerMainProps, setHeaderMainProps] =
    React.useState<ContextHeaderMainProps>({});

  const headerMainContextValue = React.useMemo(
    () => ({ updateProps: setHeaderMainProps }),
    [],
  );

  const sensors = useDndSensors();

  return (
    <>
      <GlobalStyles
        styles={(theme) => ({
          body: {
            "--ToolsPanel-zIndex": 1100,
            "--HeaderMain-zIndex": 1200,
            "--AiSearchPopover-zIndex": 1300,
            "--Dragging-zIndex": 1400,
            "--ToolsPanel--TabBar-width": "70px",
            "--ToolsPanel--ImagePanel-width": "clamp(200px, 30vw, 360px)",
            "--ToolsPanel--AiSearchPopover-width": "clamp(220px, 33vw, 400px)",
            "--ToolsPanel--SubPanel-zIndex": 1000,

            backgroundColor: "var(--mui-palette-background-default)",
            display: "flex",
            flexDirection: "column",

            "& > header": {
              margin: "0 !important",
              padding: `${theme.spacing(2)} ${theme.spacing(3)}`,
              borderBottom: "1px solid var(--mui-palette-divider)",
              flexShrink: 0,
              zIndex: "var(--HeaderMain-zIndex)",
            },
          },
        })}
      />
      <DndContext sensors={sensors} autoScroll={false}>
        <HeaderMain title="..." {...headerMainProps} />

        <Box
          flex={1}
          display="flex"
          flexDirection="row"
          sx={{ overflowY: "hidden" }}
        >
          <ToolsPanel />

          <Box component="main" flex={1} px={3} sx={{ overflowY: "auto" }}>
            <HeaderMainContext.Provider value={headerMainContextValue}>
              {children}
            </HeaderMainContext.Provider>
          </Box>
        </Box>
      </DndContext>
    </>
  );
}
