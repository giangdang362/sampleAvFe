import ImageDefault from "@/components/common/ImageDefault";
import { pathFile } from "@/config/api";
import { useHref } from "@/hooks/href";
import { paths } from "@/paths";
import { useIsUser } from "@/services/helpers";
import { Box, Button, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import Link from "next/link";

type CardPinBoardProjectProp = {
  pinboardId: string;
  pinName?: string;
  pinImage?: string;
  modifiedTime?: string;
};

const CardPinBoardProject = ({
  pinboardId,
  pinName,
  pinImage,
  modifiedTime,
}: CardPinBoardProjectProp) => {
  const createHref = useHref();
  const isUser = useIsUser();
  const t = useTranslations("projects");

  return (
    <Button
      // target="_blank"
      LinkComponent={Link}
      href={createHref(!isUser ? paths.admin.pinboard : paths.app.pinboard, {
        id: pinboardId,
      })}
      sx={{
        flexDirection: "column",
        alignItems: "flex-start",
        padding: 0,
        borderRadius: "8px !important",
      }}
    >
      <Box width="100%" position="relative" overflow="hidden">
        {pinImage ? (
          <Box
            component="img"
            sx={{
              width: "100%",
              display: "block",
              aspectRatio: "206 / 140",
              borderRadius: "8px",
              objectFit: "cover",
            }}
            alt={pinName ?? ""}
            src={pathFile + "/" + pinImage}
          />
        ) : (
          <ImageDefault
            sx={{
              width: "100%",
              display: "block",
              aspectRatio: "206 / 140",
              borderRadius: "8px",
            }}
          />
        )}
      </Box>
      <Box sx={{ p: "12px 4px 4px 4px" }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontSize: "16px",
            fontWeight: 500,
            display: "-webkit-box",
            overflow: "hidden",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 1,
            color: "#000000DE",
            mb: "4px",
          }}
        >
          {pinName}
        </Typography>

        <Typography color={"#00000061"} fontSize={"12px"} fontWeight={400}>
          {t("dialog.modified", { time: modifiedTime })}
        </Typography>
      </Box>
    </Button>
  );
};

export default CardPinBoardProject;
