"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import GlobalStyles from "@mui/material/GlobalStyles";
import { useTranslations } from "next-intl";
import { adminNavItems } from "@/hooks/menu";
import SearchHeader from "@/components/layout/SearchHeader";
import SideNav from "@/components/layout/SideNav";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  const t = useTranslations();
  const [showMobileNavbar, setShowMobileNavbar] = React.useState(false);

  return (
    <>
      <GlobalStyles
        styles={{
          body: {
            "--MainNav-height": "56px",
            "--MainNav-zIndex": 1000,
            "--SideNav-width": "280px",
            "--SideNav-zIndex": 1100,
            "--MobileNav-width": "320px",
            "--MobileNav-zIndex": 1100,
          },
        }}
      />
      <SearchHeader
        onToggleNavbar={() => setShowMobileNavbar((prev) => !prev)}
      />
      <Box
        sx={{
          bgcolor: "var(--mui-palette-background-default)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          minHeight: "100%",
        }}
      >
        <SideNav
          navItems={adminNavItems(t)}
          showOnMobile={showMobileNavbar}
          setShowOnMobile={setShowMobileNavbar}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            pl: { lg: "var(--SideNav-width)" },
          }}
        >
          <Box sx={{ px: "24px", height: "100%" }}>{children}</Box>
        </Box>
      </Box>
    </>
  );
}
