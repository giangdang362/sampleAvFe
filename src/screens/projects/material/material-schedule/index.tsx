"use client";
import { FileDragAndDrop } from "@/components/common/app-upload-file";
import ButtonPrimary from "@/components/common/button-primary";
import SideDialog from "@/components/common/side-dialog";
import { useConfirmDialog } from "@/components/common/UserDialog";
import HeaderMain from "@/components/layout/header";
import { useAvciRouter } from "@/hooks/avci-router";
import {
  faLink,
  faPlus,
  faCopy,
  faPaperclip,
  faFileExcel,
  faFilePdf,
  faTrash as faTrashLight,
} from "@/lib/fas/pro-light-svg-icons";
import {
  faEllipsis,
  faTrash,
  faTrashCan,
  faXmark,
} from "@/lib/fas/pro-regular-svg-icons";
import { paths } from "@/paths";
import { useCreateSectionScheduleMutation } from "@/services/projectFolder";
import {
  useDeleteAttachmentsMutation,
  useDeleteProductsScheduleMutation,
  useDeleteScheduleMutation,
  useDuplicateScheduleMutation,
  useGetListProductMaterialScheduleIdQuery,
  useUpdateMaterialScheduleMutation,
  useUploadAttachmentsScheduleMutation,
} from "@/services/projectMaterialSchedule";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TabContext, TabPanel } from "@mui/lab";
import {
  Button,
  Card,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Popover,
  Select,
  Tabs,
  Typography,
} from "@mui/material";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import { useTranslations } from "next-intl";
import React, {
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { DialogAddMemberToProject } from "../../components/DialogAddMenberToProject";
import ProductScheduleFilter from "../components/ProductFilter";
import Summary from "./summary";
import { RequestQueryBuilder } from "@nestjsx/crud-request";
import { useDebounce } from "use-debounce";
import { useSearchParams } from "next/navigation";
import { openDownloadFile } from "@/utils/openFile";
import { roleDataLeader } from "@/utils/common";
import { useIsUser } from "@/services/helpers";
import ActionToProjectFileDialog from "@/components/admin/projects/ActionToProjectFileDialog";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useGetDownloadTokenMutation } from "@/services/tokenDownload";
import DataStateOverlay from "@/components/common/DataStateOverflay";
import NotFoundWrapper from "@/components/common/NotFoundWrapper";

type MaterialScheduleProps = {
  id: string;
};

// export const metadata = {
//   title: `Integrations | Dashboard | ${config.site.name}`,
// } satisfies Metadata;

export default function MaterialSchedule({
  id,
}: MaterialScheduleProps): React.JSX.Element {
  const [value, setValue] = React.useState("1");
  const [openShare, setOpenShare] = useState(false);
  const [isFirst, setIsFirst] = useState(true);
  const [openAttachments, setOpenAttachments] = useState(false);
  const [openDuplicateSchedule, setOpenDuplicateSchedule] = useState(false);
  const rt = useAvciRouter();
  const t = useTranslations("projects");
  const tCommon = useTranslations("common");
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [currentTab, setCurrentTab] = useState<"summary" | "estimation">(
    "summary",
  );
  const [createNewSection] = useCreateSectionScheduleMutation();
  const [updateSchedule] = useUpdateMaterialScheduleMutation();
  const [deleteSchedule] = useDeleteScheduleMutation();
  const [deleteProduct] = useDeleteProductsScheduleMutation();
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [debounceSearch] = useDebounce(searchTerm, 500);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [leadTimeFilter, setLeadTimeFilter] = useState<string>("");
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const searchParams = useSearchParams();
  const goto = searchParams.get("goto");
  const isUser = useIsUser();
  const [uploadAttachments] = useUploadAttachmentsScheduleMutation();
  const [deleteAttachment] = useDeleteAttachmentsMutation();
  const [getDownloadToken] = useGetDownloadTokenMutation();
  const [duplicateSchedule] = useDuplicateScheduleMutation();

  const buildQuery = () => {
    const queryBuilder = RequestQueryBuilder.create();
    const filters = [
      { field: "status", value: statusFilter },
      { field: "leadTime", value: leadTimeFilter },
    ];

    filters.forEach(({ field, value }) => {
      if (value !== "") {
        queryBuilder.setFilter({ field, operator: "$eq", value });
      }
    });

    if (debounceSearch !== "") {
      const filterL = filters?.filter((e) => !!e.value);
      const lastFilter: any = {};
      filterL?.map((f) => {
        lastFilter[f.field] = {
          $eq: f.value,
        };
      });

      const qbData: { $and: any } = {
        $and: [
          {
            $or: [
              { model: { $cont: debounceSearch } },
              // { "supplier.name": { $cont: debounceSearch } },
              // { "author.firstName": { $cont: debounceSearch } },
              { surface: { $cont: debounceSearch } },
              { series: { $cont: debounceSearch } },
              { brandName: { $cont: debounceSearch } },
              { material: { $cont: debounceSearch } },
              { color: { $cont: debounceSearch } },
              { applicationArea1: { $cont: debounceSearch } },
              { applicationArea2: { $cont: debounceSearch } },
              { effect: { $cont: debounceSearch } },
              { origin: { $cont: debounceSearch } },
              { "productTags.tag.name": { $cont: debounceSearch } },
            ],
          },
          lastFilter,
        ],
      };
      queryBuilder.search(qbData);
    }
    return queryBuilder.query();
  };

  const {
    data: getSectionbyId,
    isLoading,
    isError,
    error,
  } = useGetListProductMaterialScheduleIdQuery({
    id: id,
    querySearch: `${buildQuery()}`,
  });
  usePageTitle("materialSchedule", getSectionbyId?.name);

  const readOnly =
    isLoading ||
    isError ||
    getSectionbyId?.roleName === roleDataLeader[1].value ||
    getSectionbyId?.project === null;

  useEffect(() => {
    let timeoutAction: ReturnType<typeof setTimeout>;
    if (getSectionbyId && goto && goto !== null && isFirst) {
      timeoutAction = setTimeout(() => {
        document?.getElementById?.(goto)?.scrollIntoView?.();
        setIsFirst(false);
      }, 500);
    }
    return () => {
      if (timeoutAction) {
        clearTimeout(timeoutAction);
      }
    };
  }, [getSectionbyId, goto, isFirst]);

  const handleCheckboxChange = useCallback(
    (productId: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        setSelectedProductIds((prevSelectedIds) => [
          ...prevSelectedIds,
          productId,
        ]);
      } else {
        setSelectedProductIds((prevSelectedIds) =>
          prevSelectedIds?.filter((id) => id !== productId),
        );
      }
    },
    [],
  );

  const handleSelectAllChange = useCallback(
    (section: API.Sections) => (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        const productIds = section.products?.map((product) => product.id);
        setSelectedProductIds((prevSelectedIds) => [
          ...prevSelectedIds,
          ...(productIds ?? ""),
        ]);
      } else {
        const productIds = section.products?.map((product) => product.id);
        setSelectedProductIds((prevSelectedIds) =>
          prevSelectedIds?.filter((id) => !productIds?.includes(id)),
        );
      }
    },
    [],
  );

  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
  };

  const handleTitleChange = async (newName: string) => {
    if (!newName) {
      return { error: t("message.scheduleNameRequired") };
    }

    try {
      await updateSchedule({ id: id, name: newName });
    } catch {}
  };

  const onCreateNewSection = useCallback(async (): Promise<void> => {
    createNewSection({
      folderId: getSectionbyId?.id ?? "",
      name: "Untitled",
      projectFolderType: "schedule",
    }).then();
  }, [createNewSection, getSectionbyId?.id]);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const { openDialog } = useConfirmDialog();
  const handleDeleteSchedule = async () => {
    openDialog({
      type: "confirm",
      title: t("deleteScheduleTitle", { name: getSectionbyId?.name }),
      content: t("deleteScheduleContent", { name: getSectionbyId?.name }),
      confirmButtonLabel: tCommon("delete"),
      icon: faTrashCan,
      mainColor: "error",
      onConfirm: async () => {
        try {
          await deleteSchedule({
            id: id,
          }).unwrap();

          if (getSectionbyId?.projectId) {
            rt.replace(paths.admin.projectFiles, {
              id: getSectionbyId.projectId,
            });
          } else {
            rt.replace(paths.admin.projects);
          }
          rt.back();
        } catch {}
      },
    });
    return;
  };

  const handleUploadAttachments = async (attachments: File[]) => {
    if (id) {
      await uploadAttachments({
        files: attachments,
        folderID: id,
      });
    }
  };

  const handleDeleteProduct = async () => {
    openDialog({
      type: "confirm",
      title: t("product.deleteSelectedProductTitle"),
      content: t("product.deleteSelectedProductContent"),
      confirmButtonLabel: tCommon("delete"),
      icon: faTrashCan,
      mainColor: "error",
      onConfirm: async () => {
        try {
          await deleteProduct({
            scheduleId: id,
            ids: selectedProductIds,
          }).unwrap();

          setSelectedProductIds([]);
        } catch {}
      },
    });
    return;
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    if (newValue === "1") {
      setCurrentTab("summary");
    } else {
      setCurrentTab("estimation");
    }
    setValue(newValue);
  };

  const handleCloseShare = () => {
    setOpenShare(false);
  };

  const scrollToSection = (index: number) => {
    if (sectionRefs.current[index]) {
      sectionRefs.current[index]!.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Stack spacing={3} pb="40px">
      {!!getSectionbyId?.projectId && (
        <DialogAddMemberToProject
          title={t("shareProject")}
          confirmButtonTitle={tCommon("share")}
          handleClose={handleCloseShare}
          open={openShare}
          idProject={getSectionbyId?.projectId}
        />
      )}
      <HeaderMain
        mode="contextSource"
        title={isLoading || isError ? "..." : getSectionbyId?.name}
        titleEditable={!isLoading && !isError && !readOnly}
        editTitleLabel={t("editScheduleName")}
        editTitlePlaceholder={t("editScheduleNamePlaceholder")}
        onTitleChange={handleTitleChange}
        haveBackBtn
        backBtnHref={
          isLoading
            ? undefined
            : {
                isUser,
                ...(getSectionbyId?.projectId
                  ? {
                      path: "projectFiles",
                      params: { id: getSectionbyId.projectId },
                    }
                  : { path: "projects" }),
              }
        }
        buttonBlock={
          <Stack direction={"row"} spacing={1}>
            <IconButton onClick={handleClick} color="primary">
              <FontAwesomeIcon icon={faEllipsis} />
            </IconButton>
            <Popover
              open={open}
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              onClose={handleClose}
              sx={{
                "& .MuiPaper-root": {
                  width: "unset",
                },
              }}
              elevation={8}
              slotProps={{ paper: { sx: { width: "200px" } } }}
            >
              <List>
                {!readOnly && (
                  <ListItemButton
                    onClick={() => setOpenDuplicateSchedule(true)}
                  >
                    <ListItemIcon>
                      <FontAwesomeIcon icon={faCopy} />
                    </ListItemIcon>
                    <ListItemText
                      primary={tCommon("duplicate_target", {
                        target: t("files.schedule"),
                      })}
                    />
                  </ListItemButton>
                )}
                <ListItemButton
                  onClick={() => {
                    getDownloadToken()
                      .unwrap()
                      .then((e: any) => {
                        openDownloadFile(
                          `material-schedule/products/${id}/pdf/download`,
                          {
                            token_download: e.token,
                            type: currentTab,
                          },
                        );
                      });
                  }}
                >
                  <ListItemIcon>
                    <FontAwesomeIcon icon={faFilePdf} />
                  </ListItemIcon>
                  <ListItemText primary={t("exportAsPdf")} />
                </ListItemButton>
                <ListItemButton
                  onClick={() => {
                    getDownloadToken()
                      .unwrap()
                      .then((e: any) => {
                        openDownloadFile(
                          `material-schedule/products/${id}/excel/download`,
                          {
                            token_download: e.token,
                            type: currentTab,
                          },
                        );
                      });
                  }}
                >
                  <ListItemIcon>
                    <FontAwesomeIcon icon={faFileExcel} />
                  </ListItemIcon>
                  <ListItemText primary={t("exportAsXls")} />
                </ListItemButton>
                {!readOnly && (
                  <ListItemButton
                    onClick={() => setOpenAttachments(!openAttachments)}
                  >
                    <ListItemIcon>
                      <FontAwesomeIcon icon={faPaperclip} />
                    </ListItemIcon>
                    <ListItemText primary={t("attachments")} />
                  </ListItemButton>
                )}

                {!readOnly &&
                  (isUser
                    ? getSectionbyId?.roleName === roleDataLeader[2].value
                    : true) && (
                    <>
                      <Divider />

                      <ListItemButton onClick={handleDeleteSchedule}>
                        <ListItemIcon>
                          <FontAwesomeIcon
                            color="var(--mui-palette-error-main)"
                            icon={faTrashLight}
                          />
                        </ListItemIcon>
                        <ListItemText
                          sx={{ color: "var(--mui-palette-error-main)" }}
                          primary={t("delete")}
                        />
                      </ListItemButton>
                    </>
                  )}
              </List>
            </Popover>
            {!readOnly && (
              <ButtonPrimary
                onClick={() => {
                  setOpenShare(true);
                }}
                variant="outlined"
                label="Share"
                sx={{ fontWeight: "600" }}
                startIcon={
                  <FontAwesomeIcon style={{ fontSize: "15px" }} icon={faLink} />
                }
              />
            )}
          </Stack>
        }
      />

      <NotFoundWrapper
        error={error}
        notFoundMessage={t("material_schedule_not_found")}
        messageProps={{ mt: "80px" }}
      >
        <TabContext value={value}>
          <Stack
            direction="row"
            mt={3}
            spacing={2}
            justifyContent={"space-between"}
            flexWrap="wrap"
          >
            <Box display="flex" flexDirection="column" gap={1}>
              <ProductScheduleFilter
                valueSearch={searchTerm}
                onChange={handleSearch}
                setLeadTimeFilter={setLeadTimeFilter}
                leadTimeFilter={leadTimeFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
              />
              <Select
                variant="standard"
                displayEmpty
                disableUnderline
                // IconComponent={() => (
                //   <FontAwesomeIcon
                //     icon={faChevronDown}
                //     style={{ width: "15px", height: "15px" }}
                //   />
                // )}
                value=""
                sx={{ width: "250px" }}
              >
                <MenuItem disabled value="">
                  <Typography variant="body1" color={"GrayText"} pl={1}>
                    {t("navigateSection")}
                  </Typography>
                </MenuItem>
                {getSectionbyId?.sections?.map((item, index) => (
                  <MenuItem
                    key={item.id}
                    value={item.id}
                    onClick={() => {
                      scrollToSection(index);
                    }}
                  >
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <Box
              display="flex"
              flexDirection="column"
              gap={2}
              justifyContent="space-between"
              sx={{ typography: "body1", position: "relative", width: 230 }}
            >
              <Box
                sx={{
                  border: "1px solid rgba(0, 0, 0, 0.12)",
                  borderRadius: 1,
                  p: 0.5,
                  backgroundColor: "rgba(0, 0, 0, 0.12)",
                  width: "90%",
                  right: 0,
                  top: 0,
                }}
              >
                <Tabs
                  value={value}
                  scrollButtons={"auto"}
                  TabIndicatorProps={{ sx: { display: "none" } }}
                  onChange={handleChange}
                  sx={{
                    height: "fit-content",
                    minHeight: "unset",
                    "& > div": {
                      height: "fit-content",
                    },
                  }}
                >
                  <Tab
                    label="Summary"
                    value="1"
                    sx={{
                      fontSize: 14,
                      borderRadius: 1,
                      backgroundColor: value === "1" ? "#FFFFFF" : null,
                      "&:active": {
                        backgroundColor: "#FFFFFF",
                      },
                      minHeight: "unset",
                      lineHeight: "18px",
                      padding: "10px 16px",
                    }}
                  />
                  <Tab
                    label="Estimation"
                    value="2"
                    sx={{
                      borderRadius: 1,
                      fontSize: 14,
                      backgroundColor: value === "2" ? "#FFFFFF" : null,
                      "&:active": {
                        backgroundColor: "#FFFFFF",
                      },
                      minHeight: "unset",
                      lineHeight: "18px",
                      padding: "10px 16px",
                    }}
                  />
                </Tabs>
              </Box>

              {selectedProductIds.length > 0 && (
                <Stack direction={"row"} spacing={2} alignItems={"center"}>
                  <Typography
                    variant="body1"
                    color={"GrayText"}
                    fontSize={12}
                    fontWeight={"500"}
                    // width={'100%'}
                  >
                    {selectedProductIds.length}
                    {t("items_selected")}
                  </Typography>
                  <ButtonPrimary
                    onClick={handleDeleteProduct}
                    color="error"
                    variant="outlined"
                    label={t("delete")}
                    startIcon={
                      <FontAwesomeIcon
                        style={{ fontSize: "15px" }}
                        icon={faTrash}
                      />
                    }
                  />
                </Stack>
              )}
            </Box>
          </Stack>

          <DataStateOverlay isError={isError} isFetching={isLoading}>
            <TabPanel value="1" sx={{ p: 0 }}>
              {getSectionbyId?.sections?.map((item, index) => (
                <div
                  key={item.id}
                  ref={(ref) => (sectionRefs.current[index] = ref)}
                >
                  <Summary
                    section={item}
                    handleSelectAllChange={handleSelectAllChange}
                    handleCheckboxChange={handleCheckboxChange}
                    selectedProductIds={selectedProductIds}
                    readOnly={readOnly}
                  />
                </div>
              ))}
            </TabPanel>
            <TabPanel value="2" sx={{ p: 0 }}>
              <Card
                sx={{
                  borderRadius: 0.8,
                  border: "1px solid rgba(0, 0, 0, 0.12)",
                  bgcolor: "rgba(25, 25, 25, 0.04)",
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "auto",
                    sm: "auto repeat(2, 1fr)",
                    md: "auto repeat(3, 1fr)",
                    lg: "auto repeat(5, 1fr)",
                  },
                  gap: 1,
                }}
              >
                <Stack p={1} gridRow="1 / 4">
                  <Typography>{t("totals")}</Typography>
                </Stack>
                <Stack p={1}>
                  <Typography variant="subtitle1">
                    {getSectionbyId?.totalOriginalCost
                      ? `$${getSectionbyId?.totalOriginalCost}`
                      : "-"}
                  </Typography>
                  <Typography sx={{}}>
                    {t("total_original_cost").toUpperCase()}
                  </Typography>
                </Stack>
                <Stack p={1}>
                  <Typography variant="subtitle1">
                    {getSectionbyId?.totalSaving
                      ? `$${getSectionbyId?.totalSaving}`
                      : "-"}
                  </Typography>
                  <Typography sx={{}}>{t("totalSavings")}</Typography>
                </Stack>
                <Stack p={1}>
                  <Typography variant="subtitle1">
                    {getSectionbyId?.totalFinalMaterialCost
                      ? `$${getSectionbyId?.totalFinalMaterialCost}`
                      : "-"}
                  </Typography>
                  <Typography sx={{}}>
                    {t("total_final_material_cost")}
                  </Typography>
                </Stack>
                <Stack p={1}>
                  <Typography variant="subtitle1">
                    {getSectionbyId?.totalDiscount
                      ? `${getSectionbyId?.totalDiscount}%`
                      : "-"}
                  </Typography>
                  <Typography sx={{}}>
                    {t("total_discount").toUpperCase()}
                  </Typography>
                </Stack>
                <Stack p={1}>
                  <Typography variant="subtitle1">
                    {getSectionbyId?.totalSupplier
                      ? getSectionbyId?.totalSupplier
                      : "-"}
                  </Typography>
                  <Typography sx={{}}>{t("number_suppliers")}</Typography>
                </Stack>
              </Card>
              {getSectionbyId?.sections?.map((item, index) => (
                <div
                  key={item.id}
                  ref={(ref) => (sectionRefs.current[index] = ref)}
                >
                  <Summary
                    isEstimation={true}
                    key={item.id}
                    section={item}
                    handleSelectAllChange={handleSelectAllChange}
                    handleCheckboxChange={handleCheckboxChange}
                    selectedProductIds={selectedProductIds}
                    readOnly={readOnly}
                  />
                </div>
              ))}
            </TabPanel>
          </DataStateOverlay>
        </TabContext>
        {!readOnly && (
          <Stack>
            <Divider>
              <Button
                sx={{ color: "GrayText" }}
                onClick={onCreateNewSection}
                startIcon={<FontAwesomeIcon icon={faPlus} />}
              >
                {t("create_new_section")}
              </Button>
            </Divider>
          </Stack>
        )}
        <SideDialog
          open={openAttachments}
          onClose={() => setOpenAttachments(false)}
        >
          <Stack
            direction="row"
            width="100%"
            justifyContent="space-between"
            alignItems="center"
            mb="24px"
          >
            <Typography fontWeight={500} fontSize="16px">
              Schedule Attachments
            </Typography>

            <Button
              sx={{ width: "fit-content" }}
              onClick={() => setOpenAttachments(false)}
            >
              <FontAwesomeIcon icon={faXmark} />
            </Button>
          </Stack>

          <FileDragAndDrop
            files={
              getSectionbyId?.attachments?.map((a: any) => ({
                id: a.id,
                name: a.name,
                path: a.path,
              })) || []
            }
            addFiles={handleUploadAttachments}
            deleteFile={async (a: any) => {
              if (id) {
                await deleteAttachment({
                  fileId: a.id,
                  folderID: id,
                }).then(() => {});
              }
            }}
            maxFile={10}
            size="compact"
            sx={{ width: "100%" }}
          />
        </SideDialog>
        <ActionToProjectFileDialog
          type="schedule"
          action="duplicate"
          open={openDuplicateSchedule}
          onClose={() => setOpenDuplicateSchedule(false)}
          onProjectSelected={async (projectId) => {
            await duplicateSchedule({
              folderId: id,
              toProjectId: projectId,
            }).unwrap();
          }}
        />
      </NotFoundWrapper>
    </Stack>
  );
}
