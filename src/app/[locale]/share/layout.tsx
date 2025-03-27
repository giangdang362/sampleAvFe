import * as React from "react";
import Box from "@mui/material/Box";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <Box
      sx={{
        bgcolor: "var(--mui-palette-background-default)",
        padding: 3,
      }}
    >
      {children}
    </Box>
  );
}
