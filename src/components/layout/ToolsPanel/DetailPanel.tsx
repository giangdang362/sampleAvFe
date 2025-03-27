import FaIconButton from "@/components/common/FaIconButton";
import MessageLine from "@/components/common/MessageLine";
import { pathFile } from "@/config/api";
import { faChevronLeft } from "@/lib/fas/pro-light-svg-icons";
import { useSearchInfiniteProductsBySeriesQuery } from "@/services/search";
import {
  Box,
  BoxProps,
  Button,
  CircularProgress,
  Divider,
  Tooltip,
  Typography,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/query";
import { useTranslations } from "next-intl";
import * as React from "react";
import DraggableImage from "./DraggableImage";
import ImageDefault from "@/components/common/ImageDefault";
import ImageWithSkeleton from "@/components/common/ImageWithSkeleton";
import { useInfiniteQueryPage } from "@/hooks/infinite-scroll/useInfiniteQueryPage";
import SameSeriesFilter from "@/components/common/SameSeriesFilter";
import { paths } from "@/paths";
import { useInfiniteSentry } from "@/hooks/infinite-scroll/useInfiniteSentry";

const LIMIT = 30;

export interface DetailPanelProps extends BoxProps {
  detail?: API.SearchProduct;
  topOffset?: number;
  opened?: boolean;
  onClose?: (temporary?: boolean) => void;
  onRequestOpen?: () => void;
  onProductImageSelected?: (product: API.SearchProduct) => void;
}

export default function DetailPanel({
  detail,
  topOffset = 0,
  opened,
  onClose,
  onRequestOpen,
  onProductImageSelected,
  ...rest
}: DetailPanelProps): React.JSX.Element {
  const t = useTranslations("toolsPanel");
  const tCommon = useTranslations("common");
  const [filter, setFilter] = React.useState<{
    color?: string;
    sizeGroup?: string;
    surface?: string;
  }>({});

  const prevDetail = React.useRef(detail?.id);
  const isDetailChanged = prevDetail.current !== detail?.id;
  prevDetail.current = detail?.id;

  if (isDetailChanged) {
    setFilter({});
  }

  const fullFilter = {
    series: detail?.series ?? "",
    model: detail?.model ?? "",
    excludeId: detail?.id,
    ...(isDetailChanged ? undefined : filter),
  };
  const { page, nextPage } = useInfiniteQueryPage(fullFilter);

  const skipBySeries = !(detail?.series && detail?.model);
  const { data, currentData, isFetching, isError } =
    useSearchInfiniteProductsBySeriesQuery(
      skipBySeries
        ? skipToken
        : {
            ...fullFilter,
            page,
            limit: LIMIT,
          },
    );
  const fullData = currentData?.data;

  const hasNextPage = !isError && (data ? data.page < data.pageCount : true);
  const sentryRef = useInfiniteSentry({
    loading: isFetching,
    hasNextPage,
    onLoadMore: nextPage,
    disabled: isError,
  });

  return (
    <Box
      component="aside"
      position="fixed"
      height="100%"
      top={0}
      left="calc(var(--ToolsPanel--TabBar-width) + var(--ToolsPanel--ImagePanel-width))"
      pt={`${topOffset + 50}px`}
      pb="30px"
      zIndex="var(--ToolsPanel--SubPanel-zIndex)"
      {...rest}
      sx={[
        {
          transition: "transform 0.3s",
          transform: `translateX(${opened ? 0 : -100}%)`,
        },
        ...(Array.isArray(rest.sx) ? rest.sx : [rest.sx]),
      ]}
    >
      <Box
        width="clamp(200px, 28vw, 350px)"
        height="100%"
        bgcolor="var(--mui-palette-background-default)"
        position="relative"
        sx={{
          borderTopRightRadius: 12,
          borderBottomRightRadius: 12,
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: -1,
            opacity: opened ? 1 : 0,
            transition: "opacity 0.3s",
            borderTopRightRadius: 12,
            borderBottomRightRadius: 12,
            boxShadow: "3px 0px 10px 0px #0000001A",
          },
        }}
      >
        <Box
          height="100%"
          pt={1}
          pb={3}
          sx={{
            overflowY: "auto",
            overflowX: "hidden",
            scrollbarGutter: "stable",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <FaIconButton
              icon={faChevronLeft}
              iconSize={20}
              color="primary"
              wrapperProps={{ sx: { display: "inline-block", ml: 1, mb: 2 } }}
              onClick={() => onClose?.()}
              title={opened ? t("tooltips.closePanel") : ""}
            />

            {!!detail?.id && (
              <Button
                variant="outlined"
                size="small"
                href={paths.admin.detailProduct + "/" + detail.id}
                target="_blank"
                sx={{ m: 1 }}
              >
                {tCommon("learn_more")}
              </Button>
            )}
          </Box>

          <Box px={2}>
            {detail ? (
              <>
                <Typography
                  fontSize="10px"
                  fontWeight="500"
                  textTransform="uppercase"
                  mb={1}
                >
                  {detail.series}
                </Typography>
                <Typography fontSize="16px" fontWeight="600" mb={1}>
                  {detail.model}
                </Typography>

                <Box display="flex" gap={1.5} mb={2}>
                  <Box
                    width="52%"
                    height="52%"
                    position="relative"
                    borderRadius={1.5}
                    sx={{
                      aspectRatio: 1,
                      cursor: "grab",
                      "&:active": { cursor: "grabbing" },
                      "&::after": {
                        content: '""',
                        opacity: 0,
                        transition: "opacity 0.3s",
                        position: "absolute",
                        borderRadius: "inherit",
                        width: "100%",
                        height: "100%",
                        left: 0,
                        top: 0,
                        boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                      },
                      "&:hover::after": { opacity: 1 },
                    }}
                  >
                    <DraggableImage
                      id={"detail-product-img"}
                      data={{
                        productId: detail.id,
                        imageId: detail?.images?.[0]?.id,
                      }}
                      imageName={detail.series + " - " + detail.model}
                      url={
                        detail?.images?.[0]?.thumbnail
                          ? pathFile + "/" + detail.images[0].thumbnail
                          : ""
                      }
                      dragUrl={detail.images?.map((img) =>
                        img.thumbnail ? pathFile + "/" + img.thumbnail : "",
                      )}
                      onDragStart={() => onClose?.(true)}
                      onDragStop={() => onRequestOpen?.()}
                    />
                  </Box>

                  <Box width="48%" sx={{ wordWrap: "break-word" }}>
                    <Typography
                      fontSize="12px"
                      color="var(--mui-palette-text-secondary)"
                    >
                      {t("color")}
                    </Typography>
                    <Typography fontSize="12px" mb={1}>
                      {detail.color}
                    </Typography>
                    <Typography
                      fontSize="12px"
                      color="var(--mui-palette-text-secondary)"
                    >
                      {t("size")}
                    </Typography>
                    <Typography fontSize="12px" mb={1}>
                      {detail.sizeGroup}
                    </Typography>
                    <Typography
                      fontSize="12px"
                      color="var(--mui-palette-text-secondary)"
                    >
                      {t("surface")}
                    </Typography>
                    <Typography fontSize="12px" mb={1}>
                      {detail.surface}
                    </Typography>
                  </Box>
                </Box>
              </>
            ) : (
              <CircularProgress sx={{ display: "block", mx: "auto", mb: 3 }} />
            )}

            <Typography
              fontSize="12px"
              color="var(--mui-palette-text-secondary)"
            >
              {t("sameSeries")}
            </Typography>

            <Divider sx={{ mb: 1 }} />
          </Box>

          <Box px={2}>
            <SameSeriesFilter
              filter={filter}
              setFilter={setFilter}
              origin={data?.seriesData.origin}
            />

            {isError ? (
              <MessageLine>{tCommon("errorMsg")}</MessageLine>
            ) : skipBySeries || fullData?.length === 0 ? (
              <MessageLine>{tCommon("empty_data")}</MessageLine>
            ) : (
              <Box
                display="grid"
                gridTemplateColumns="1fr 1fr 1fr"
                gap={1.5}
                mt={1}
              >
                {fullData?.map((item) => (
                  <Button
                    key={item.id}
                    sx={{
                      minWidth: "unset",
                      width: "100%",
                      aspectRatio: 1,
                      borderRadius: 1,
                      overflow: "hidden",
                      p: 0,
                      position: "relative",
                      background: item?.images?.[0]?.thumbnail
                        ? undefined
                        : "var(--mui-palette-action-disabledBackground)",

                      "&:hover .show-on-hover, &:focus-visible .show-on-hover":
                        {
                          opacity: 1,
                        },
                    }}
                    onClick={() => onProductImageSelected?.(item)}
                  >
                    {item?.images?.[0]?.thumbnail ? (
                      <ImageWithSkeleton
                        src={pathFile + "/" + item?.images?.[0].thumbnail}
                        width="100%"
                        height="100%"
                        draggable={false}
                      />
                    ) : (
                      <ImageDefault sx={{ width: "100%", height: "100%" }} />
                    )}
                    <Box
                      className="show-on-hover"
                      display="flex"
                      flexDirection="column"
                      position="absolute"
                      justifyContent="flex-end"
                      width="100%"
                      height="60%"
                      bottom={0}
                      p={1}
                      sx={{
                        background:
                          "linear-gradient(180deg, rgba(102, 102, 102, 0) 0%, #000000 100%)",
                        textAlign: "start",
                        opacity: 0,
                        transition: "opacity 0.3s",
                      }}
                    >
                      <Tooltip
                        title={
                          <span>
                            {item.surface}
                            <br />
                            {item.model}
                          </span>
                        }
                      >
                        <Box>
                          <Typography
                            color="white"
                            fontSize="clamp(6px, 0.8vw, 10px)"
                            lineHeight={1.1}
                            width="100%"
                            textTransform="uppercase"
                            noWrap
                          >
                            {item.surface}
                          </Typography>
                          <Typography
                            color="white"
                            fontSize="clamp(8px, 1vw, 12px)"
                            fontWeight="500"
                            lineHeight={1.3}
                            width="100%"
                            noWrap
                          >
                            {item.model}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Box>
                  </Button>
                ))}
              </Box>
            )}

            {(isFetching || (!skipBySeries && hasNextPage)) && (
              <CircularProgress
                ref={sentryRef}
                size={20}
                sx={{ display: "block", mx: "auto", mt: 2 }}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
