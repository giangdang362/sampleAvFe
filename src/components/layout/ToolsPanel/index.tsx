import { Box, ClickAwayListener } from "@mui/material";
import * as React from "react";
import ImagePanel from "./ImagePanel";
import TabBar from "./TabBar";
import FilterPanel, { FilterPanelProps } from "./FilterPanel";
import DetailPanel from "./DetailPanel";

export default function ToolsPanel(): React.JSX.Element {
  const [boxRef, setBoxRef] = React.useState<HTMLDivElement | null>(null);
  const [tab, setTab] = React.useState<number | undefined>(0);
  const [topOffset, setTopOffset] = React.useState<number>();
  const [filterOpened, setFilterOpenedRaw] = React.useState(false);
  const [detailOpened, setDetailOpenedRaw] = React.useState(false);
  const [detailClosedTemporary, setDetailClosedTemporaryRaw] =
    React.useState(false);
  const [productImageId, setProductImageId] = React.useState<string>();
  const [displayProductImage, setDisplayProductImage] =
    React.useState<API.SearchProduct>();
  const [searchImageId, setSearchImageId] = React.useState<string>();

  const setFilterOpened = (opened: boolean) => {
    setFilterOpenedRaw(opened);
    setDetailOpenedRaw(false);
  };

  const setDetailOpened = (opened: boolean, temporary?: boolean) => {
    setDetailOpenedRaw(opened);
    setFilterOpenedRaw(false);
    setDetailClosedTemporaryRaw(!detailOpened || opened ? false : !!temporary);
  };

  const [filter, setFilter] = React.useState<
    NonNullable<FilterPanelProps["filter"]>
  >({
    brand: [],
    material: [],
    color: [],
    application: [],
    effect: [],
    origin: [],
  });

  React.useEffect(() => {
    if (!boxRef) return;

    const { y } = boxRef.getBoundingClientRect();
    setTopOffset(y);

    const resizeObserver = new ResizeObserver(() => {
      const { y } = boxRef.getBoundingClientRect();
      setTopOffset(y);
    });
    resizeObserver.observe(boxRef);

    return () => resizeObserver.disconnect();
  }, [boxRef]);

  const handleProductImageSelected = (productImage: API.SearchProduct) => {
    setProductImageId(productImage.id);
    setDisplayProductImage(productImage);
    setDetailOpened(true);
  };

  const handleProductImageUnselected = () => {
    setDetailOpened(false);
  };

  React.useEffect(() => {
    if (!detailOpened && !detailClosedTemporary) {
      setProductImageId(undefined);
    }
  }, [detailClosedTemporary, detailOpened]);

  React.useEffect(() => {
    setFilterOpened(false);
    setDetailOpened(false);
    setProductImageId(undefined);
  }, [tab]);

  const handleAiSearch = (imgId: string) => {
    setSearchImageId(imgId);
    setTab(undefined);
  };

  const scrollbarStyle = {
    "& *": {
      "&::-webkit-scrollbar": { width: "16px", height: "16px" },
      "&::-webkit-scrollbar-thumb": {
        border: "4px solid rgba(0, 0, 0, 0)",
        backgroundClip: "padding-box",
        bgcolor: "var(--mui-palette-grey-400)",
        borderRadius: "1000px",
      },
      "&::-webkit-scrollbar-thumb:hover": {
        bgcolor: "var(--mui-palette-grey-500)",
      },
      "&::-webkit-scrollbar-thumb:active": {
        bgcolor: "var(--mui-palette-grey-600)",
      },
    },
  };

  return (
    <ClickAwayListener
      onClickAway={() => {
        setFilterOpened(false);
        setDetailOpened(false);
      }}
    >
      <Box display="flex" role="presentation">
        <Box
          ref={setBoxRef}
          component="aside"
          display="flex"
          flexDirection="row"
          boxShadow="3px 0px 10px 0px #0000001A"
          bgcolor="var(--mui-palette-common-background)"
          zIndex="var(--ToolsPanel-zIndex)"
          sx={{
            overflowY: "auto",
            ...scrollbarStyle,
          }}
        >
          <TabBar
            tabValue={tab}
            onTabChange={setTab}
            onAiSearch={handleAiSearch}
          />

          <ImagePanel
            mode={
              tab === undefined ? "ai-search" : tab === 0 ? "product" : "image"
            }
            searchImageId={searchImageId}
            filter={filter}
            filterOpened={filterOpened}
            selectedId={productImageId}
            onFilterStateChange={setFilterOpened}
            onProductImageChanged={(item) => {
              if (
                item.id === productImageId &&
                item.images[0]?.id === displayProductImage?.images[0]?.id
              ) {
                handleProductImageUnselected();
              } else {
                handleProductImageSelected(item);
              }
            }}
            onImageDragStart={() => setDetailOpened(false, true)}
            onImageDragStop={() =>
              detailClosedTemporary && setDetailOpened(true)
            }
          />
        </Box>

        {topOffset !== undefined && (
          <>
            <DetailPanel
              detail={displayProductImage}
              opened={detailOpened}
              topOffset={topOffset}
              onClose={(temporary) => setDetailOpened(false, temporary)}
              onRequestOpen={() => setDetailOpened(true)}
              onProductImageSelected={handleProductImageSelected}
              sx={scrollbarStyle}
            />
            <FilterPanel
              opened={filterOpened}
              topOffset={topOffset}
              filter={filter}
              onFilterChange={(type, name, checked) =>
                setFilter((pre) => ({
                  ...pre,
                  [type]: checked
                    ? [...pre[type], name]
                    : pre[type]?.filter((v) => v !== name),
                }))
              }
              sx={scrollbarStyle}
            />
          </>
        )}
      </Box>
    </ClickAwayListener>
  );
}
