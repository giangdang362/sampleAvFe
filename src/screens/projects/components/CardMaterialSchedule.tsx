import { paths } from "@/paths";
import {
  Stack,
  Divider,
  Typography,
  Grid,
  Box,
  Button,
  ButtonBase,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import { useTranslations } from "next-intl";

type CardMaterialScheduleProps = {
  dataTag?: API.FolderSections[];
  materialScheduleName?: string;
  materialScheduleId?: string;
  materialScheduleModified?: string;
};

const CardMaterialSchedule = ({
  dataTag,
  materialScheduleName,
  materialScheduleModified,
  materialScheduleId,
}: CardMaterialScheduleProps) => {
  const t = useTranslations("projects");
  return (
    <Box sx={{ textDecoration: "none", color: "GrayText" }}>
      <Divider sx={{ marginBottom: "20px" }} />
      <Grid2
        container
        columns={16}
        columnSpacing={{ xs: 1, sm: 2, md: 2.5 }}
        rowSpacing={{ xs: 1, sm: 2, md: 2.5 }}
        sx={{ position: "relative" }}
      >
        <Grid2 xs={4}>
          <ButtonBase
            sx={{
              flexDirection: "column",
              alignItems: "flex-start",
              position: "static",
              "&::before": {
                content: "''",
                position: "absolute",
                inset: 0,
              },
            }}
            href={`${paths.admin.materialSchedule}/${materialScheduleId}`}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 500,
                color: "#000000DE",
                display: "-webkit-box",
                overflow: "hidden",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
              }}
            >
              {materialScheduleName}
            </Typography>
            <Typography variant="body2" color={"GrayText"}>
              {t("dialog.modified", { time: materialScheduleModified })}
            </Typography>
          </ButtonBase>
        </Grid2>
        <Grid2 xs={12}>
          {dataTag && (
            <Stack>
              <Grid container spacing={1}>
                {dataTag?.map((row, index) => (
                  <Grid item key={index} sx={{ padding: "10px" }}>
                    <Button
                      sx={{
                        px: "10px",
                        py: "4px",
                        borderRadius: "100px",
                        border: "1px solid gray",
                        textAlign: "center",
                        ":hover": {
                          cursor: "pointer",
                          background: "#00000011",
                        },
                      }}
                      href={`${paths.admin.materialSchedule}/${materialScheduleId}?goto=${row.id}`}
                    >
                      <Typography variant="body2" color={"GrayText"}>
                        {row.name ?? ""}
                      </Typography>
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          )}
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default CardMaterialSchedule;
