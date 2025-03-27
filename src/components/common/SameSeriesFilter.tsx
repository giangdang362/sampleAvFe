import { Box, Button, styled, Tooltip, Typography } from "@mui/material";
import { useTranslations } from "next-intl";

const colorMap: { [key: string]: { color: string; mode: "light" | "dark" } } = {
  Grey: { color: "#77787b", mode: "dark" },
  White: { color: "#ffffff", mode: "light" },
  Black: { color: "#2d2d2d", mode: "dark" },
  Brown: { color: "#6f4e37", mode: "dark" },
  Beige: { color: "#fff5e1", mode: "light" },
  Red: { color: "#a91d3a", mode: "dark" },
  Green: { color: "#46886c", mode: "dark" },
  Blue: { color: "#3956a6", mode: "dark" },
  Yellow: { color: "#feb941", mode: "light" },
  Pink: { color: "#f70184", mode: "light" },
  Metallic: {
    color:
      "linear-gradient(223.5deg, #888888 -10.18%, #EEEEEE 48.65%, #888888 108.66%)",
    mode: "light",
  },
  Mix: {
    color:
      "linear-gradient(45.5deg, #A91D3A 0%, #FF7539 18.5%, #EBAC3F 33%, #46886C 48%, #55BED6 68.5%, #354D9E 85%, #683DC4 100%)",
    mode: "dark",
  },
};

const FilterBox = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  width: "100%",
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

const FilterButton = styled(Button)<{ selected?: boolean }>(
  ({ theme, selected }) => ({
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    borderColor: "var(--mui-palette-divider)",
    fontWeight: 400,
    wordBreak: "break-word",
    ...(selected
      ? {
          backgroundColor: "var(--mui-palette-primary-main)",
          color: "var(--mui-palette-primary-contrastText)",
          "&:hover": {
            backgroundColor: "var(--mui-palette-secondary-700)",
            borderColor: "var(--mui-palette-primary-300)",
          },
        }
      : undefined),
  }),
);

export type SeriesFilterProduct = {
  color?: string;
  sizeGroup?: string;
  surface?: string;
};

interface SameSeriesFilterProps {
  origin?: API.SeriesData;
  filter: SeriesFilterProduct;
  setFilter: React.Dispatch<React.SetStateAction<SeriesFilterProduct>>;
}

const SameSeriesFilter = ({
  origin,
  filter,
  setFilter,
}: SameSeriesFilterProps) => {
  const t = useTranslations("toolsPanel");
  // const tCommon = useTranslations("common");
  return (
    <Box>
      <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
        {origin?.colors?.map((color) => (
          <Tooltip key={color} title={color}>
            <span>
              <Button
                onClick={() =>
                  setFilter((pre) => ({
                    ...pre,
                    color: pre.color === color ? undefined : color,
                  }))
                }
                sx={{
                  position: "relative",
                  p: 0,
                  minWidth: "unset",
                  width: 31,
                  aspectRatio: 1,
                  borderRadius: 1,
                  background: colorMap[color]?.color
                    ? `${colorMap[color]?.color} !important`
                    : undefined,
                  fontSize: "10%",
                  hyphens: "auto",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    borderRadius: 1,
                    border:
                      filter.color === color
                        ? `4px solid rgba(${colorMap[color]?.mode === "dark" ? "255, 255, 255, 0.5" : "0, 0, 0, 0.25"})`
                        : `1px solid rgba(${colorMap[color]?.mode === "dark" ? "255, 255, 255" : "0, 0, 0"}, 0.12)`,
                  },
                  transition: "filter 0.3s",
                  "&.Mui-disabled": {
                    filter: "grayscale(0.6)",
                    opacity: 0.75,
                  },
                }}
              >
                {colorMap[color]?.color ? "" : color}
              </Button>
            </span>
          </Tooltip>
        ))}
      </Box>
      <Box display="flex" flexDirection="column" alignItems="flex-start">
        {!!origin?.sizeGroup.length && (
          <>
            <Typography
              variant="h6"
              fontSize={14}
              color="var(--mui-palette-secondary-400)"
              mb={1}
            >
              {t("sizes")}
            </Typography>
            <FilterBox>
              {origin?.sizeGroup.map((size) => (
                <FilterButton
                  key={size}
                  variant="outlined"
                  selected={filter.sizeGroup === size}
                  onClick={() => {
                    setFilter((pre) => ({
                      ...pre,
                      sizeGroup: pre.sizeGroup === size ? undefined : size,
                    }));
                  }}
                >
                  {size}
                </FilterButton>
              ))}
            </FilterBox>
          </>
        )}

        {!!origin?.surfaces.length && (
          <>
            <Typography
              variant="h6"
              fontSize={14}
              color="var(--mui-palette-secondary-400)"
              mb={1}
            >
              {t("surfaces")}
            </Typography>
            <FilterBox>
              {origin?.surfaces.map((surface) => (
                <FilterButton
                  key={surface}
                  variant="outlined"
                  selected={filter.surface === surface}
                  onClick={() => {
                    setFilter((pre) => ({
                      ...pre,
                      surface: pre.surface === surface ? undefined : surface,
                    }));
                  }}
                >
                  {surface}
                </FilterButton>
              ))}
            </FilterBox>
          </>
        )}
      </Box>
    </Box>
  );
};

export default SameSeriesFilter;
