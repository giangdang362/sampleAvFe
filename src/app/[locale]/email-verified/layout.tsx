import * as React from "react";
import Box from "@mui/material/Box";
import { Link } from "@/i18n";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <Box
      sx={{
        bgcolor: "var(--mui-palette-background-default)",
        padding: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Link href="/">
        <Box
          component="img"
          src="/logo-header.png"
          sx={{
            width: "100%",
            maxWidth: "180px",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
      </Link>
      <Box
        sx={{
          flex: "1",
          alignItems: "center",
          alignSelf: "center",
          display: "flex",
          justifyContent: "center",
          maxWidth: "450px",
          py: 2,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
