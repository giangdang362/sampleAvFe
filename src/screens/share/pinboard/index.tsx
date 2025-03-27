"use client";
import DesignList from "@/components/admin/projects/pinboard/DesignList";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useGetShareDataQuery } from "@/services/share";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

const Pinboard = () => {
  const t = useTranslations("pinboard");

  const searchParams = useParams();
  const shareId = searchParams.id + "";
  const { data, isLoading, error } = useGetShareDataQuery({
    id: shareId,
  });
  usePageTitle("share", data && `${data.project?.name} - ${data.name}`);

  return (
    <Stack gap="24px">
      {error &&
      "data" in error &&
      (error.data as { message?: string } | undefined)?.message
        ?.toLowerCase()
        .includes("not_found") ? (
        <Typography variant="body1" sx={{ mt: "80px", textAlign: "center" }}>
          {t("pinboardNotFound")}
        </Typography>
      ) : (
        <>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              variant="h6"
              sx={{
                fontSize: "22px",
                fontWeight: "600",
                lineHeight: "27px",
                mr: 5,
              }}
              noWrap
            >
              {data?.project?.name ?? "..."}
              <span
                style={{
                  color: "var(--mui-palette-text-disabled)",
                  fontWeight: "100",
                }}
              >
                {" / "}
              </span>
              {data?.name ?? "..."}
            </Typography>
          </Box>

          {isLoading ? (
            <CircularProgress sx={{ mx: "auto" }} />
          ) : (
            !!data && <DesignList pinboard={data} readOnly />
          )}
        </>
      )}
    </Stack>
  );
};

export default Pinboard;
