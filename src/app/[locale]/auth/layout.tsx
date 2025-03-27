import Box from "@mui/material/Box";
import { ReactNode } from "react";

export interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        height: "100%",
      }}
    >
      <Box
        component="img"
        src="/logo-login-page.png"
        sx={{
          position: { xs: "static", md: "absolute" },
          mt: 4,
          ml: 4,
          height: "30px",
          width: "fit-content",
          filter: { xs: "invert(1)", md: "none" },
        }}
      />
      <Box display="flex" flex="1">
        <Box
          component="img"
          src="/left-background-login.png"
          sx={{
            height: "100%",
            width: { xs: 0, md: "40%" },
            objectFit: "cover",
            objectPosition: "50% 0%",
          }}
        />
        <Box
          sx={{
            flex: 1,
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflowY: "auto",
            px: 2,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
