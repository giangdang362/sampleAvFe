import {
  faBookOpenAlt as faBookOpenAltDuo,
  faImages as faImagesDuo,
} from "@/lib/fas/pro-duotone-svg-icons";
import {
  faBookOpenAlt as faBookOpenAltLight,
  faImages as faImagesLight,
} from "@/lib/fas/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Divider, Tab, Tabs } from "@mui/material";
import { useTranslations } from "next-intl";
import * as React from "react";
import AiButton from "./AiButton";

interface TabBarProps {
  tabValue?: number;
  onTabChange?: (tabValue: number) => void;
  onAiSearch?: (imageId: string) => void;
}

const iconSize = { width: 26, height: 26 };

export default function TabBar({
  tabValue,
  onTabChange,
  onAiSearch,
}: TabBarProps): React.JSX.Element {
  const t = useTranslations("toolsPanel");

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    onTabChange?.(newValue);
  };

  return (
    <Box
      borderRight="1px solid var(--mui-palette-divider)"
      height="100%"
      sx={{ overflowY: "auto" }}
    >
      <AiButton onImageUploaded={onAiSearch} />

      <Divider sx={{ margin: "auto", width: "70%" }} />

      <Tabs
        orientation="vertical"
        value={tabValue === undefined ? false : tabValue}
        onChange={handleChange}
        sx={{
          width: "70px",
          py: 1,
          "& .MuiTab-root": {
            color: "var(--mui-palette-secondary-400)",
            m: "0 !important",
            px: 1,
            py: 2,
            fontSize: 12,
            fontWeight: 400,
            lineHeight: "normal",
          },
          "& .MuiTabs-indicator": {
            display: "flex",
            alignItems: "center",
            backgroundColor: "transparent",
          },
          "& .MuiTabs-indicatorSpan": (theme) => ({
            width: "100%",
            height: `calc(100% - ${theme.spacing(2)} * 2)`,
            backgroundColor: "var(--mui-palette-primary-main)",
          }),
        }}
        TabIndicatorProps={{
          children: <span className="MuiTabs-indicatorSpan" />,
        }}
      >
        <Tab
          icon={
            <FontAwesomeIcon
              icon={tabValue === 0 ? faBookOpenAltDuo : faBookOpenAltLight}
              style={iconSize}
            />
          }
          label={t("tabs.products")}
        />
        <Tab
          icon={
            <FontAwesomeIcon
              icon={tabValue === 1 ? faImagesDuo : faImagesLight}
              style={iconSize}
            />
          }
          label={t("tabs.images")}
        />
      </Tabs>
    </Box>
  );
}
