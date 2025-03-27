"use client";

import ButtonPrimary from "@/components/common/button-primary";
import DragAndDrop from "@/components/common/drag-and-drop";
import InputForm from "@/components/common/form/InputForm";
import SideDialog from "@/components/common/side-dialog";
import { useConfirmDialog } from "@/components/common/UserDialog";
import AddImagePopover from "@/components/layout/AddImagePopover/AddImagePopover";
import HeaderMain from "@/components/layout/header";
import { pathFile } from "@/config/api";
import { faPlus } from "@/lib/fas/pro-light-svg-icons";
import { faMagnifyingGlass, faTrash } from "@/lib/fas/pro-regular-svg-icons";
import {
  faCircleUser,
  faTrashCan,
  faSquare,
  faSquareCheck,
} from "@/lib/fas/pro-solid-svg-icons";
import {
  useDeleteImageLibraryMutation,
  useGetInfiniteImageLibraryQuery,
  useUpdateImageLibraryMutation,
  useUploadImageFromPinterestMutation,
  useUploadImagesLibraryMutation,
} from "@/services/imageLibrary";
import { useGetPlansQuery } from "@/services/plan";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { zodResolver } from "@hookform/resolvers/zod";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  ImageListItem,
  InputAdornment,
  OutlinedInput,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { RequestQueryBuilder } from "@nestjsx/crud-request";
import {
  bindDialog,
  bindPopover,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";
import { useTranslations } from "next-intl";
import { ChangeEvent, useEffect, useLayoutEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDebounce } from "use-debounce";
import { z } from "zod";
import UploaderFilter from "./UploaderFilter";
import { useIsUser } from "@/services/helpers";
import { useGetMyAccountQuery } from "@/services/user";
import { jsonStringifyEqualityCheck } from "@/utils/json";
import { parseAsArrayOf, parseAsString } from "nuqs";
import { useQueryParamState } from "@/components/common/query-param-state/useQueryParamState";
import { useGetTagsListQuery } from "@/services/tags";
import Masonry from "react-responsive-masonry";
import { useInfiniteQueryPage } from "@/hooks/infinite-scroll/useInfiniteQueryPage";
import { onImageLoad } from "@/utils/image-load";
import ImageWithSkeleton from "@/components/common/ImageWithSkeleton";
import ActionToProjectFileDialog from "@/components/admin/projects/ActionToProjectFileDialog";
import {
  useAddImageLibraryToPinBoardMutation,
  useLazyGetPinboardDetailsQuery,
  useUpdatePinboardMutation,
} from "@/services/pinboards";
import { useInfiniteSentry } from "@/hooks/infinite-scroll/useInfiniteSentry";

const imageInfoSchema = z.object({
  imageName: z.string().max(155).min(1, { message: "This field is required" }),
  comment: z.string().max(350),
  note: z.string().max(350),
  tag: z.string().array(),
});
type ImageInfo = z.infer<typeof imageInfoSchema>;

const parseAsStringArray = parseAsArrayOf(parseAsString);

const ImageLibrary = () => {
  const t = useTranslations("imageLibrary");
  const isUser = useIsUser();
  const { data: me } = useGetMyAccountQuery();
  const [isOpenAddToPinBoard, setIsOpenAddToPinBoard] = useState(false);
  const [filesSelectedLoading, setFilesSelectedLoading] = useState(false);
  const [curImageId, setCurImageId] = useState<string>();
  const [getPinboard] = useLazyGetPinboardDetailsQuery();
  const [updatePinboard] = useUpdatePinboardMutation();
  const [addImageToPinboard] = useAddImageLibraryToPinBoardMutation();
  const handleAddToPinBoard = async (pinboardId: string, sectionId: string) => {
    if (!curImage?.id) return;

    await addImageToPinboard({
      fileId: curImage.id,
      pinboardId,
      sectionId,
    })
      .unwrap()
      .then(async () => {
        const pinboard = (await getPinboard({ id: pinboardId })).data;
        if (pinboard && pinboard.sections[0].id === sectionId) {
          let newThumbnail: string | undefined;
          if (pinboard.thumbnailId !== pinboard.sections[0].images[0].id) {
            newThumbnail = pinboard.sections[0].images[0].id;
          }
          await updatePinboard({ id: pinboardId, thumbnailId: newThumbnail });
        }
      });
  };

  const [itemSelected, setItemSelected] = useState<string[]>([]);
  const [uploaderFilter, setUploaderFilter] = useQueryParamState(
    "uploader",
    parseAsStringArray,
  );
  const [searchTerm, setSearchTerm] = useQueryParamState(
    "search",
    parseAsString,
  );

  const [debouncedFilter] = useDebounce(
    {
      searchTerm,
      uploaderFilter,
    },
    700,
    { equalityFn: jsonStringifyEqualityCheck },
  );

  let queryBuilder = RequestQueryBuilder.create();
  let qbArr = [];
  if (debouncedFilter.searchTerm) {
    qbArr.push({
      $or: [
        { name: { $cont: debouncedFilter.searchTerm } },
        { "tagFiles.tag.name": { $cont: debouncedFilter.searchTerm } },
      ],
    });
  }

  if (debouncedFilter.uploaderFilter?.length) {
    qbArr.push({
      authorId: { $in: debouncedFilter.uploaderFilter },
    });
  }

  queryBuilder = queryBuilder.search({
    $and: qbArr,
  });

  const menuDetailPopoverState = usePopupState({
    variant: "popover",
    popupId: "image-library-detail",
  });

  const imageDialogState = usePopupState({
    variant: "dialog",
    popupId: "image-detail-dialog",
  });

  const { data: dataPlan } = useGetPlansQuery();
  const { data: dataTags } = useGetTagsListQuery(
    { type: "file" },
    {
      skip: !imageDialogState.isOpen,
    },
  );

  const [uploadImages] = useUploadImagesLibraryMutation();
  const [deleteImages] = useDeleteImageLibraryMutation();
  const [updateImageDetail, { isLoading: isLoadingUpdateImage }] =
    useUpdateImageLibraryMutation();
  const [uploadPinterestImages] = useUploadImageFromPinterestMutation();

  const { openDialog } = useConfirmDialog();

  const handleBulkDeleteImage = async () => {
    openDialog({
      type: "confirm",
      mainColor: "error",
      title: t("delete_image"),
      content: `${t.rich("deleteContent")} ${itemSelected.length} ${itemSelected.length > 1 ? t("items") : t("item")}?`,
      confirmButtonLabel: t("delete_image"),
      icon: faTrashCan,
      onConfirm: async () => {
        try {
          await deleteImages({ ids: itemSelected }).unwrap();
          setItemSelected([]);
        } catch {}
      },
    });
  };

  const handleDeleteCurItem = async (id: string) => {
    openDialog({
      type: "confirm",
      mainColor: "error",
      title: t("delete_image"),
      content: t.rich("deleteContentDetail", { name: curImage?.name ?? "" }),
      confirmButtonLabel: t("delete_image"),
      icon: faTrashCan,
      onConfirm: async () => {
        try {
          await deleteImages({ ids: [id] }).unwrap();
        } catch {}
      },
    });
  };

  const handleAddFromFiles = async (files: File[]) => {
    try {
      await uploadImages({
        planId: dataPlan?.data?.[0].id ?? "",
        files: files,
      }).unwrap();
    } catch {}
  };
  const handleUploadImageDragDrop = async (files: File[]) => {
    setFilesSelectedLoading(true);
    await handleAddFromFiles(files);
    setFilesSelectedLoading(false);
  };

  const { page, nextPage, setPage } = useInfiniteQueryPage(
    queryBuilder.query(),
  );

  const {
    data,
    currentData: dataImage,
    isFetching,
    isError,
  } = useGetInfiniteImageLibraryQuery({
    page,
    limit: 20,
    querySearch: queryBuilder.query(),
  });

  useLayoutEffect(() => {
    if (!dataImage) return;

    setPage((pre) => (dataImage.page < pre ? dataImage.page : pre));
  }, [dataImage, setPage]);

  const [isImageLoading, setIsImageLoading] = useState(isFetching);
  useEffect(() => {
    if (isFetching) {
      setIsImageLoading(true);
      return;
    }

    if (!dataImage) {
      setIsImageLoading(false);
      return;
    }

    const unsubscribes: (() => void)[] = [];
    Promise.all(
      dataImage.data.map((item) => {
        const image = new Image();
        image.src = `${pathFile}/${item.path}` ?? "";
        return new Promise<void>((resolve) => {
          unsubscribes.push(onImageLoad(image, undefined, () => resolve()));
        });
      }),
    ).then(() => setIsImageLoading(false));

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [dataImage, isFetching]);

  const hasNextPage = !isError && (data ? data.page < data.pageCount : true);
  const sentryRef = useInfiniteSentry({
    loading: isFetching || isImageLoading,
    hasNextPage,
    onLoadMore: nextPage,
    disabled: isError,
    rootMargin: "0px 0px 200px 0px",
  });

  const curImage = dataImage?.data.find((x) => x.id === curImageId);

  const handleCheckBox = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      if (!itemSelected.includes(event.target.value)) {
        setItemSelected([...itemSelected, event.target.value]);
      }
    } else {
      if (itemSelected.includes(event.target.value)) {
        setItemSelected((pre) => pre?.filter((x) => x !== event.target.value));
      }
    }
  };
  const { control, handleSubmit, reset } = useForm<ImageInfo>({
    resolver: zodResolver(imageInfoSchema),
    values: {
      imageName: curImage?.name ?? "",
      comment: curImage?.comment ?? "",
      note: curImage?.note ?? "",
      tag: curImage?.tagFiles?.map((item) => item.tag.name) ?? [],
    },
  });

  useEffect(() => {
    if (imageDialogState.isOpen) {
      reset();
    }
  }, [imageDialogState.isOpen, reset]);

  const handleSaveImageInfo = () => {
    handleSubmit(({ imageName, comment, note, tag }) => {
      if (!curImage?.id) return;
      if (!dataTags) return;

      updateImageDetail({
        id: curImage.id,
        name: imageName,
        comment: comment,
        note: note,
        tags: tag?.map((name) => ({
          id: dataTags.data.find((item) => item.name === name)?.id ?? undefined,
          name,
        })),
      })
        .unwrap()
        .then(() => {
          imageDialogState.close();
        });
    })();
  };

  const allowUploading =
    !debouncedFilter.searchTerm &&
    (!debouncedFilter.uploaderFilter?.length ||
      (me?.id ? debouncedFilter.uploaderFilter.includes(me.id) : false));

  return (
    <Box>
      <HeaderMain
        title={t("title")}
        buttonBlock={
          <Box>
            {allowUploading && (
              <ButtonPrimary
                startIcon={
                  <FontAwesomeIcon
                    icon={faPlus}
                    style={{ fontSize: "16px", color: "#fff" }}
                  />
                }
                label={t("new")}
                {...bindTrigger(menuDetailPopoverState)}
              />
            )}
            {/* Upload Image */}
            <AddImagePopover
              {...bindPopover(menuDetailPopoverState)}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: -6,
                horizontal: "right",
              }}
              onFileImagesSelected={async (files) => {
                // if (!data) return;
                await handleAddFromFiles(files);
              }}
              onPinterestImagesSelected={async (images) => {
                // if (!data) return;
                try {
                  await uploadPinterestImages({
                    imageUrls: images?.map((x) => x),
                    planId: dataPlan?.data?.[0].id ?? "",
                  }).unwrap();
                } catch {}
              }}
            />
          </Box>
        }
      />
      {/* Filter */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <OutlinedInput
            value={searchTerm ?? ""}
            onChange={(e) => setSearchTerm(e.target.value || null)}
            fullWidth
            type="search"
            placeholder={t("search")}
            endAdornment={
              <InputAdornment position="end">
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  style={{ fontSize: "16px" }}
                />
              </InputAdornment>
            }
            sx={{
              minWidth: "300px",
              maxHeight: "40px",
              borderRadius: "4px",
              marginRight: 2,
            }}
          />
          {!isUser && (
            <UploaderFilter
              value={uploaderFilter ?? []}
              onChange={(uploaders) => {
                setUploaderFilter(uploaders.length ? uploaders : null);
              }}
            />
          )}
        </Box>
        <Box>
          {itemSelected.length ? (
            <Box
              sx={{
                display: "flex",
                gap: "12px",
                alignItems: "center",
              }}
            >
              <Typography>
                {`${itemSelected.length} ${itemSelected.length > 1 ? t("items") : t("item")} ${t("selected")}`}
              </Typography>
              <Button
                variant="text"
                startIcon={<DeleteOutlineIcon />}
                sx={{ color: "red", border: "1px solid red" }}
                onClick={handleBulkDeleteImage}
              >
                {t("delete")}
              </Button>
            </Box>
          ) : null}
        </Box>
      </Box>
      {/* List Image */}
      <Box my={3}>
        {dataImage?.data && (
          <Masonry columnsCount={4} gutter={"16px"}>
            {allowUploading && (
              <Box
                sx={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  background: "#f2f2f2",
                }}
              >
                <DragAndDrop
                  variant="contained"
                  type="image"
                  onFilesSelected={handleUploadImageDragDrop}
                  icon={"large"}
                  instructionText={t.rich("textDrag")}
                  loading={filesSelectedLoading}
                  sx={{
                    width: "100%",
                    aspectRatio: "1 / 1",
                    "& .DnD-InstructionText": {
                      mx: "auto",
                      textAlign: "center",
                      whiteSpace: "pre-line",
                      fontSize: "12px",
                      fontWeight: 500,
                      color: "#969696",
                    },
                  }}
                />
              </Box>
            )}

            {dataImage?.data?.map((item) => {
              const selected = itemSelected.includes(item.id ?? "");
              const checkBackgroundColor = selected
                ? "var(--mui-palette-common-background)"
                : "var(--mui-palette-action-disabled)";

              return (
                <ImageListItem
                  key={item.id}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    p: 0,
                    borderRadius: 0.5,
                    "& .tool-tip-image": {
                      transition: "opacity 0.3s",
                    },
                    "&:hover": {
                      ".tool-tip-image": {
                        opacity: 1,
                      },
                    },
                  }}
                >
                  <Button
                    className="tool-tip-image"
                    sx={{
                      background:
                        "linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.75) 99.33%)",
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: 0,
                      right: 0,
                      borderRadius: "inherit",
                      border: selected
                        ? "2px solid var(--mui-palette-primary-main)"
                        : undefined,
                      opacity: selected ? 1 : 0,
                    }}
                    {...bindTrigger(imageDialogState)}
                    onClick={(e) => {
                      setCurImageId(item.id);
                      e.currentTarget.blur();
                      bindTrigger(imageDialogState).onClick(e);
                    }}
                  />

                  <Tooltip title={t("bulk_delete")}>
                    <Checkbox
                      className="tool-tip-image"
                      value={item.id}
                      icon={<FontAwesomeIcon icon={faSquare} />}
                      checkedIcon={<FontAwesomeIcon icon={faSquareCheck} />}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleCheckBox(e);
                      }}
                      sx={{
                        position: "absolute",
                        top: 4,
                        left: 4,
                        color: "#fff",
                        height: "fit-content",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          bgcolor: checkBackgroundColor,
                          width: "1.5em",
                          height: "1.5em",
                          borderRadius: 0.5,
                        },
                        "& input": {
                          zIndex: 2,
                        },
                        "& .svg-inline--fa": {
                          width: "1.5em",
                          height: "1.5em",
                          zIndex: 1,
                        },
                        opacity: selected ? 1 : 0,
                      }}
                    />
                  </Tooltip>
                  <Tooltip title={t("add_to_pinboard")}>
                    <Button
                      className="tool-tip-image"
                      sx={{
                        position: "absolute",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        top: "8px",
                        right: "8px",
                        width: "28px",
                        minWidth: "0px",
                        height: "28px",
                        padding: "0px !important",
                        borderRadius: "9999px",
                        border: "1px solid var(--mui-palette-action-disabled)",
                        backgroundColor: "#fff",
                        "&:hover": {
                          backgroundColor: "#dddddd",
                        },
                        opacity: 0,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurImageId(item.id);
                        setIsOpenAddToPinBoard(true);
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faPlus}
                        style={{ fontSize: "16px" }}
                        color="#00000099"
                      />
                    </Button>
                  </Tooltip>
                  <Typography
                    className="tool-tip-image"
                    sx={{
                      position: "absolute",
                      bottom: 10,
                      left: 0,
                      right: 0,
                      textAlign: "center",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#fff",
                      opacity: selected ? 1 : 0,
                    }}
                  >
                    {item.name}
                  </Typography>

                  <ImageWithSkeleton
                    skeletonHeight={`${seedRandomInRange(item.id ?? item.name ?? "", 10, 30)}vw`}
                    sx={{
                      width: "100%",
                      borderRadius: "inherit",
                    }}
                    alt={item.name}
                    src={`${pathFile}/${item.path}` ?? ""}
                  />
                </ImageListItem>
              );
            })}
          </Masonry>
        )}

        {(isFetching || isImageLoading || hasNextPage) && (
          <CircularProgress
            ref={sentryRef}
            sx={{ display: "block", mx: "auto", my: 4 }}
          />
        )}
      </Box>
      {/* Drawer */}
      <SideDialog
        customHeader={<></>}
        customAction={
          <Button
            color="error"
            startIcon={<FontAwesomeIcon icon={faTrash} />}
            onClick={() => {
              handleDeleteCurItem(curImage?.id ?? "");
              imageDialogState.close();
            }}
            sx={{
              lineHeight: "normal",
            }}
          >
            {t("delete")}
          </Button>
        }
        confirmButton={{
          title: t("save"),
          onClick: handleSaveImageInfo,
          loading: isLoadingUpdateImage,
        }}
        // cancelButton={{ title: t("cancel") }}
        advanceButton={{
          title: t("add_to"),
          onClick: () => {
            handleSaveImageInfo();
            setIsOpenAddToPinBoard(true);
          },
        }}
        closeOnConfirm={false}
        sx={{
          "& .MuiDialogContent-root": {
            p: 0,
          },
        }}
        {...bindDialog(imageDialogState)}
        onClose={
          isLoadingUpdateImage
            ? undefined
            : bindDialog(imageDialogState).onClose
        }
      >
        <Box
          component="img"
          sx={{ width: "100%" }}
          alt={curImage?.name ?? ""}
          src={`${pathFile}/${curImage?.path}` ?? ""}
        />
        {/* Form */}
        <Box p={3}>
          <Box
            sx={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              mb: "24px",
            }}
          >
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 500,
                color: "#9e9e9e",
              }}
            >
              {t("uploaded_by")}
            </Typography>
            <Box display={"flex"} gap={"6px"} alignItems={"center"}>
              {curImage?.author?.avatar ? (
                <Box
                  component="img"
                  sx={{
                    display: "block",
                    width: "28px",
                    height: "28px",
                    borderRadius: "9999px",
                  }}
                  alt={curImage?.author?.firstName ?? ""}
                  src={`${pathFile}/${curImage?.author?.avatar}` ?? ""}
                />
              ) : (
                <FontAwesomeIcon
                  icon={faCircleUser}
                  style={{
                    fontSize: "28px",
                    color: "gray",
                  }}
                />
              )}
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "#000",
                }}
              >
                {curImage?.author?.firstName}
              </Typography>
            </Box>
          </Box>
          <InputForm
            control={control}
            name="imageName"
            label={t("image_name")}
            fullWidth
            sx={{ mb: 3 }}
            textFieldProps={{ required: true }}
          />
          <InputForm
            control={control}
            name="comment"
            label={t("description")}
            multiline
            row={5}
            fullWidth
            sx={{ mb: 3 }}
            textFieldProps={{ required: false }}
          />
          <InputForm
            control={control}
            name="note"
            label={t("notes")}
            multiline
            row={5}
            fullWidth
            sx={{ mb: 3 }}
            textFieldProps={{ required: false }}
          />
          <Controller
            control={control}
            name="tag"
            render={({ field: { onChange, ...props } }) => (
              <Autocomplete
                onChange={(_e, data) => onChange(data)}
                {...props}
                multiple
                options={dataTags?.deduplicatedTags ?? []}
                freeSolo
                renderTags={(value, getTagProps) =>
                  value?.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                      <Chip
                        variant="outlined"
                        label={option}
                        key={key}
                        {...tagProps}
                      />
                    );
                  })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    inputProps={{ ...params.inputProps, maxLength: 55 }}
                    variant="outlined"
                    // size="small"
                    label={t("tag")}
                  />
                )}
                sx={{ mb: 3 }}
              />
            )}
          />
        </Box>
      </SideDialog>
      {/* Add To Dialog */}
      <ActionToProjectFileDialog
        type="pinboard"
        action="add"
        open={isOpenAddToPinBoard}
        onClose={() => setIsOpenAddToPinBoard(false)}
        onSectionSelected={handleAddToPinBoard}
      />
    </Box>
  );
};

export default ImageLibrary;

function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

function seedRandomInRange(
  seed: string | number,
  min: number,
  max: number,
): number {
  const seedNum = typeof seed === "number" ? seed : stringToSeed(seed);
  const x = Math.sin(seedNum) * 10000;
  const randomNum = x - Math.floor(x);

  return randomNum * (max - min) + min;
}
