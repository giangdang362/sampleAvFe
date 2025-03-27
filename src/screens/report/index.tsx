"use client";

import HeaderMain from "@/components/layout/header";
import { faTruckRampBox } from "@/lib/fas/pro-regular-svg-icons";
import { paths } from "@/paths";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, ButtonBase, Typography } from "@mui/material";
import { useTranslations } from "next-intl";

const Reports = () => {
  const t = useTranslations("report");
  // const createHref = useHref();
  return (
    <Box>
      <HeaderMain title={t("title")} />
      <ButtonBase
        href={paths.admin.sampleRequest}
        sx={{
          mt: "12px",
          border: "1px solid #0000001F",
          padding: "20px 24px",
          display: "flex",
          borderRadius: "16px",
          gap: "18px",
          minWidth: "365px",
          width: "fit-content",
          justifyContent: "flex-start",
        }}
      >
        <Box
          sx={{
            padding: "15px 12px",
            borderRadius: "8px",
            backgroundColor: "#000000DE",
          }}
        >
          <FontAwesomeIcon
            icon={faTruckRampBox}
            style={{
              color: "#fff",
              fontSize: "30px",
            }}
          />
        </Box>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 500,
            fontSize: "18px",
            color: "#000000",
          }}
        >
          {t("sample_request")}
        </Typography>
      </ButtonBase>
    </Box>
  );
};

export default Reports;
