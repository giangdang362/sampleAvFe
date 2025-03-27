import FaIconButton from "@/components/common/FaIconButton";
import MessageLine from "@/components/common/MessageLine";
import { pathFile, pathFileStatic } from "@/config/api";
import { faFilter as faFilterLight } from "@/lib/fas/pro-light-svg-icons";
import { faMagnifyingGlass } from "@/lib/fas/pro-regular-svg-icons";
import {
  faCircleCheck,
  faFilter as faFilterSolid,
} from "@/lib/fas/pro-solid-svg-icons";
import {
  useSearchInfiniteImagesQuery,
  useSearchInfiniteProductsByImagesQuery,
  useSearchInfiniteProductsQuery,
} from "@/services/search";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/query";
import { useTranslations } from "next-intl";
import * as React from "react";
import { useDebounce } from "use-debounce";
import DraggableImage from "./DraggableImage";
import { FilterPanelProps } from "./FilterPanel";
import { jsonStringifyEqualityCheck } from "@/utils/json";
import { useInfiniteQueryPage } from "@/hooks/infinite-scroll/useInfiniteQueryPage";
import ImageSearchCrop, {
  SearchCrop,
} from "@/components/common/ImageSearchCrop";
import AiIcon from "./AiIcon";
import { useIsUser } from "@/services/helpers";
import { useInfiniteSentry } from "@/hooks/infinite-scroll/useInfiniteSentry";
import { GridComponents, VirtuosoGrid } from "react-virtuoso";
import { UseInfiniteScrollHookRefCallback } from "react-infinite-scroll-hook";
import { AI_SEARCH_FILTER_TYPE } from "@/constants/common";

interface ImagePanelProps {
  mode: "product" | "image" | "ai-search";
  filter?: NonNullable<FilterPanelProps["filter"]>;
  filterOpened?: boolean;
  onFilterStateChange?: (filterOpened: boolean) => void;
  onProductImageChanged?: (product: API.SearchProduct) => void;
  selectedId?: string;
  searchImageId?: string;
  onImageDragStart?: () => void;
  onImageDragStop?: () => void;
}

const debounceOptions = {
  equalityFn: jsonStringifyEqualityCheck,
};

const LIMIT = 30;
const AI_LIMIT = 40;
const FILTER_DEBOUNCE_DELAY = 700;

export default function ImagePanel({
  mode,
  filter,
  filterOpened,
  onFilterStateChange,
  onProductImageChanged,
  selectedId,
  searchImageId,
  onImageDragStart,
  onImageDragStop,
}: ImagePanelProps): React.JSX.Element {
  const t = useTranslations("toolsPanel");
  const tCommon = useTranslations("common");
  const tProd = useTranslations("products");
  const isAdmin = !useIsUser();
  const scrollRef = React.useRef<HTMLElement | null>(null);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedProductParams, { flush: flushProductParams }] = useDebounce(
    {
      s: searchTerm === "" || mode !== "product" ? undefined : searchTerm,
      ...filter,
    },
    FILTER_DEBOUNCE_DELAY,
    debounceOptions,
  );
  const [debouncedImageParams, { flush: flushImageParams }] = useDebounce(
    { s: searchTerm === "" || mode !== "image" ? undefined : searchTerm },
    FILTER_DEBOUNCE_DELAY,
    debounceOptions,
  );
  const [searchCrop, setSearchCrop] = React.useState<SearchCrop>();
  const [aiSearchFilterType, setAiSearchFilterType] =
    React.useState<(typeof AI_SEARCH_FILTER_TYPE)[number]>("pattern");

  const prevSearchImageId = React.useRef<string>();
  const searchImageIdChanged = prevSearchImageId.current !== searchImageId;
  prevSearchImageId.current = searchImageId;
  if (searchImageIdChanged) {
    setSearchCrop(undefined);
  }
  const aiSearchParams =
    searchCrop && searchImageId && !searchImageIdChanged
      ? {
          key: searchImageId,
          width: searchCrop.width,
          height: searchCrop.height,
          top: searchCrop.y,
          left: searchCrop.x,
          searchByColor: aiSearchFilterType === "color",
        }
      : undefined;

  const prevModeRef = React.useRef<typeof mode>();
  const modeChanged = prevModeRef.current !== mode;
  if (modeChanged) {
    flushProductParams();
    flushImageParams();
  }
  prevModeRef.current = mode;

  React.useLayoutEffect(() => {
    setSearchTerm("");
  }, [mode]);

  const {
    page: productPage,
    nextPage: nextProductPage,
    scrollRef: productScrollRef,
  } = useInfiniteQueryPage({ debouncedProductParams, mode });
  const {
    page: imagePage,
    nextPage: nextImagePage,
    scrollRef: imageScrollRef,
  } = useInfiniteQueryPage({ debouncedImageParams, mode });
  const { page: aiSearchPage, nextPage: nextAiSearchPage } =
    useInfiniteQueryPage({ aiSearchParams, mode });

  const setScrollRef = React.useCallback(
    (el: HTMLElement | null) => {
      scrollRef.current = el;
      productScrollRef.current = el;
      imageScrollRef.current = el;
    },
    [imageScrollRef, productScrollRef],
  );

  const {
    currentData: productData,
    isFetching: isProductFetching,
    isError: isProductError,
  } = useSearchInfiniteProductsQuery(
    mode === "product"
      ? {
          ...debouncedProductParams,
          page: productPage,
          limit: LIMIT,
        }
      : skipToken,
  );
  const {
    currentData: imageData,
    isFetching: isImageFetching,
    isError: isImageError,
  } = useSearchInfiniteImagesQuery(
    mode === "image"
      ? {
          ...debouncedImageParams,
          page: imagePage,
          limit: LIMIT,
        }
      : skipToken,
  );
  const {
    currentData: aiSearchData,
    isFetching: isAiSearchFetching,
    isError: isAiSearchError,
  } = useSearchInfiniteProductsByImagesQuery(
    mode === "ai-search" && aiSearchParams
      ? {
          ...aiSearchParams,
          page: aiSearchPage,
          limit: AI_LIMIT,
        }
      : skipToken,
  );

  let fullData:
      | (API.SearchProduct | API.SearchImage | API.AiSearchProduct)[]
      | undefined,
    isFetching: boolean,
    isError: boolean,
    hasNextPage: boolean,
    onLoadMore: VoidFunction;
  switch (mode) {
    case "product":
      fullData = productData?.data;
      isFetching = isProductFetching;
      isError = isProductError;
      hasNextPage =
        !isError &&
        (productData ? productData.page < productData.pageCount : true);
      onLoadMore = nextProductPage;
      break;
    case "image":
      fullData = imageData?.data;
      isFetching = isImageFetching;
      isError = isImageError;
      hasNextPage =
        !isError && (imageData ? imageData.page < imageData.pageCount : true);
      onLoadMore = nextImagePage;
      break;
    case "ai-search":
      fullData = aiSearchData?.data;
      isFetching = isAiSearchFetching || searchCrop === undefined;
      isError = isAiSearchError;
      hasNextPage =
        !isError && (aiSearchData ? aiSearchData.hasNextPage : true);
      onLoadMore = nextAiSearchPage;
      break;
  }

  const sentryRef = useInfiniteSentry({
    loading: isFetching,
    hasNextPage,
    onLoadMore,
    disabled: isError,
  });

  const [cropBoxRef, setCropBoxRef] = React.useState<HTMLDivElement>();
  const [freezeBoxImg, setFreezeBoxImg] = React.useState(false);

  React.useEffect(() => {
    if (!cropBoxRef) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        setFreezeBoxImg(false);
      } else setFreezeBoxImg(true);
    });
    observer.observe(cropBoxRef);
    return () => {
      observer.disconnect();
    };
  }, [cropBoxRef]);

  return (
    <Box position={"relative"}>
      <Box
        position={"relative"}
        ref={setScrollRef}
        width="var(--ToolsPanel--ImagePanel-width)"
        height="100%"
        pb={3}
        sx={{ overflowY: "auto", scrollbarGutter: "stable" }}
      >
        {mode !== "ai-search" && (
          <Box
            position="sticky"
            top={0}
            bgcolor="var(--mui-palette-background-default)"
            pt={3}
            px={2}
            mb={1}
            pb={1}
            zIndex={4}
          >
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <TextField
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                type="search"
                placeholder={t("search")}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </InputAdornment>
                  ),
                }}
              />
              {mode === "product" && (
                <FaIconButton
                  icon={filterOpened ? faFilterSolid : faFilterLight}
                  color="primary"
                  badgeProps={{
                    badgeContent: filter
                      ? Object.values(filter).reduce(
                          (total, value) => total + value.length,
                          0,
                        )
                      : 0,
                    color: filterOpened ? "default" : "primary",
                    sx: filterOpened
                      ? {
                          "& .MuiBadge-badge": {
                            outline:
                              "1px solid var(--mui-palette-primary-main)",
                            bgcolor: "var(--mui-palette-background-default)",
                          },
                        }
                      : undefined,
                  }}
                  onClick={() => onFilterStateChange?.(!filterOpened)}
                  title={
                    filterOpened
                      ? t("tooltips.closeFilterProduct")
                      : t("tooltips.openFilterProduct")
                  }
                />
              )}
            </Box>
          </Box>
        )}

        {mode === "ai-search" && (
          <>
            <Box display="flex" gap={1} px={2.5} py={2}>
              <AiIcon width={24} height={24} />
              <Typography fontWeight="500">{t("aiSearch")}</Typography>
            </Box>

            {searchImageId && (
              <Box
                ref={setCropBoxRef}
                display="flex"
                justifyContent="center"
                bgcolor="var(--mui-palette-primary-100)"
                p="16px"
                mb={3}
              >
                <ImageSearchCrop
                  src={`${pathFileStatic}/${searchImageId}`}
                  cornerSize={20}
                  maxHeight="calc(var(--ToolsPanel--ImagePanel-width) * 1)"
                  onChange={setSearchCrop}
                />
              </Box>
            )}

            <FormControl
              size="small"
              sx={{
                maxWidth: "130px",
                width: "100%",
                mb: 3,
                ml: 2,
              }}
            >
              <InputLabel sx={{ fontSize: "13px", color: "#000" }}>
                {tCommon("sortBy")}
              </InputLabel>
              <Select
                label={tCommon("sortBy")}
                value={aiSearchFilterType}
                onChange={(e) =>
                  setAiSearchFilterType(
                    e.target.value as (typeof AI_SEARCH_FILTER_TYPE)[number],
                  )
                }
                size="small"
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderRadius: "100px",
                  },
                  fontSize: "13px",
                  "& fieldset": {
                    borderColor: "#000",
                  },
                  "& svg": {
                    color: "#000",
                  },
                }}
              >
                <MenuItem value={"pattern"}>{tCommon("pattern")}</MenuItem>
                <MenuItem value={"color"}>{tCommon("color")}</MenuItem>
              </Select>
            </FormControl>
          </>
        )}

        {isError ? (
          <MessageLine>{tCommon("errorMsg")}</MessageLine>
        ) : fullData?.length === 0 ? (
          <MessageLine>{tCommon("empty_data")}</MessageLine>
        ) : (
          scrollRef.current && (
            <VirtuosoGrid
              customScrollParent={scrollRef.current}
              data={fullData ?? []}
              computeItemKey={(_, item) =>
                item.id + ("images" in item ? item.images[0]?.id : "")
              }
              overscan={200}
              itemContent={(_, item) => {
                const imageThumbnail =
                  "images" in item
                    ? item.images?.[0]?.thumbnail
                    : item.thumbnail;
                const imageDrag =
                  "images" in item
                    ? item.images?.map((img) =>
                        img.thumbnail ? pathFile + "/" + img.thumbnail : "",
                      )
                    : item.thumbnail
                      ? pathFile + "/" + item.thumbnail
                      : "";
                const imageId = "images" in item ? item.images[0]?.id : item.id;
                const productId = "images" in item ? item.id : undefined;
                const name =
                  "images" in item
                    ? (item.series || tProd("na_series")) +
                      " - " +
                      (item.model || tProd("na_model"))
                    : item.name;
                const info =
                  "images" in item
                    ? {
                        title: name,
                        subtitle: item.material || tProd("na_material"),
                        content: `${item.brandName || tProd("na_brand")}${item.origin ? ` (${item.origin})` : ""}`,
                      }
                    : undefined;

                return (
                  <Button
                    disableRipple
                    onClick={() => {
                      if ("images" in item) {
                        onProductImageChanged?.(item);
                      }
                    }}
                    sx={{
                      width: "100%",
                      flexDirection: "column",
                      p: 0,
                      borderRadius: 1.5,
                      aspectRatio: 1,
                      background: imageThumbnail
                        ? undefined
                        : "var(--mui-palette-action-disabledBackground)",
                      "&:hover":
                        mode === "image" ? { cursor: "grab" } : undefined,
                      "&:focus-visible .show-on-focus": { opacity: 1 },
                      "&:active":
                        mode === "image"
                          ? { cursor: "grabbing" }
                          : {
                              transition: "opacity 0.1s",
                              opacity: 0.8,
                            },
                    }}
                  >
                    <DraggableImage
                      id={
                        item.id + ("images" in item ? item.images[0]?.id : "")
                      }
                      data={{ imageId, productId }}
                      info={info}
                      url={
                        imageThumbnail ? pathFile + "/" + imageThumbnail : ""
                      }
                      imageName={name}
                      dragUrl={imageDrag}
                      sx={{ aspectRatio: 1, height: undefined }}
                      onDragStart={() => {
                        if (scrollRef.current) {
                          scrollRef.current.style.overflow = "hidden";
                        }
                        onImageDragStart?.();
                      }}
                      onDragStop={() => {
                        if (scrollRef.current) {
                          scrollRef.current.style.overflow = "";
                        }
                        onImageDragStop?.();
                      }}
                    />
                    {item.id === selectedId && (
                      <Box
                        position="absolute"
                        top={0}
                        zIndex={3}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height="100%"
                        width="100%"
                        borderRadius="inherit"
                        bgcolor="rgba(var(--mui-palette-common-backgroundChannel) / 0.4)"
                      >
                        <FontAwesomeIcon
                          icon={faCircleCheck}
                          style={{
                            width: "50px",
                            height: "50px",
                            color: "var(--mui-palette-common-background)",
                            filter: "drop-shadow(1px 1px 2px #bbb)",
                          }}
                        />
                      </Box>
                    )}

                    {isAdmin && "score" in item && (
                      <Typography
                        variant="caption"
                        width="100%"
                        textAlign="start"
                      >
                        {(item.score * 100).toFixed(5) + "%"}
                      </Typography>
                    )}
                  </Button>
                );
              }}
              context={{
                sentryRef,
                showProgressFooter: isFetching || hasNextPage,
              }}
              components={gridComponents}
            />
          )
        )}
      </Box>
      {mode === "ai-search" && (
        <Box
          onClick={() => {
            if (scrollRef.current) {
              scrollRef.current.scroll({
                top: 0,
                behavior: "smooth",
              });
            }
          }}
          component={"img"}
          src={`${pathFileStatic}/${searchImageId}`}
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            bgcolor: "var(--mui-palette-primary-100)",
            maxHeight: "300px",
            objectFit: "contain",
            position: "absolute",
            top: 0,
            zIndex: 50,
            clipPath: "inset(0px 0px -15px 0px)",
            boxShadow: "0px 0px 8px 4px rgba(0, 0, 0, 0.22)",
            transform: `translateY(${freezeBoxImg ? "0px" : "-110%"})`,
            transition: "all 0.3s",
            padding: "16px",
            cursor: "pointer",
          }}
        />
      )}
    </Box>
  );
}

const gridComponents: GridComponents<{
  sentryRef: UseInfiniteScrollHookRefCallback;
  showProgressFooter: boolean;
}> = {
  // eslint-disable-next-line react/display-name
  List: React.forwardRef(({ context: _context, ...props }, ref) => (
    <Box
      ref={ref}
      display="grid"
      gridTemplateColumns="1fr 1fr"
      gap={2}
      px={2}
      {...props}
    />
  )),
  Footer: ({ context }) => {
    if (!context) return;

    return (
      <Box pb={3}>
        {context.showProgressFooter && (
          <CircularProgress
            ref={context.sentryRef}
            sx={{ display: "block", mx: "auto", mt: 4 }}
          />
        )}
      </Box>
    );
  },
};
