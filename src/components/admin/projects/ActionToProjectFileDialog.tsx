import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import FaIconButton from "@/components/common/FaIconButton";
import {
  faCheck,
  faMagnifyingGlass,
  faXmark,
} from "@/lib/fas/pro-regular-svg-icons";
import { LoadingButton } from "@mui/lab";
import {
  Dialog,
  Box,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  OutlinedInput,
  InputAdornment,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
} from "@mui/material";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  useCreatePinBoardOrScheduleMutation,
  useCreateSectionScheduleMutation,
  useGetAllPinBoardAndScheduleQuery,
} from "@/services/projectFolder";
import { useGetInfiniteProjectsQuery } from "@/services/projects";
import { RequestQueryBuilder } from "@nestjsx/crud-request";
import { useDebounce } from "use-debounce";
import { useInfiniteQueryPage } from "@/hooks/infinite-scroll/useInfiniteQueryPage";
import {
  faArrowLeft,
  faBriefcase,
  faChevronRight,
  faLayerGroup,
  faTableColumns,
  faPlus,
} from "@/lib/fas/pro-light-svg-icons";
import {
  faBriefcase as faBriefcaseDuotone,
  faLayerGroup as faLayerGroupDuotone,
  faTableColumns as faTableColumnsDuotone,
} from "@/lib/fas/pro-duotone-svg-icons";
import { skipToken } from "@reduxjs/toolkit/query";
import { FOLDER_SECTION_TYPE } from "@/constants/common";
import MessageLine from "@/components/common/MessageLine";
import { Promisable } from "type-fest";
import { enqueueSnackbar } from "notistack";
import { isErrorResponse, useIsUser } from "@/services/helpers";
import { roleDataLeader } from "@/utils/common";
import { useInfiniteSentry } from "@/hooks/infinite-scroll/useInfiniteSentry";

export interface ActionToProjectFileDialogProps {
  type: (typeof FOLDER_SECTION_TYPE)[keyof typeof FOLDER_SECTION_TYPE];
  action: "copy" | "add" | "duplicate";
  open: boolean;
  onClose?: () => void;
  onSectionSelected?: (
    projectFileId: string,
    sectionId: string,
  ) => Promisable<void | boolean>;
  onProjectSelected?: (projectId: string) => Promisable<void | boolean>;
  showSuccessToast?: boolean;
}

const ActionToProjectFileDialog: React.FC<ActionToProjectFileDialogProps> = ({
  type,
  action,
  open,
  onClose,
  onSectionSelected,
  onProjectSelected,
  showSuccessToast = true,
}) => {
  const t = useTranslations("projects");
  const tCommon = useTranslations("common");
  const tErrorMsg = useTranslations("errorMsg");
  const scrollRef = useRef<HTMLElement | null>(null);
  const isUser = useIsUser();

  let title: string, actionLabel: string;
  switch (action) {
    case "copy":
      title = tCommon("copy_to_target", { target: t(`files.${type}`) });
      actionLabel = tCommon("copy_here");
      break;
    case "add":
      title = tCommon("add_to_target", { target: t(`files.${type}`) });
      actionLabel = tCommon("add_to");
      break;
    case "duplicate":
      title = tCommon("duplicate_target", { target: t(`files.${type}`) });
      actionLabel = tCommon("duplicate");
      break;
  }

  const [reallyClosed, setReallyClosed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [layer, setLayer] = useState<"project" | "project-file" | "section">(
    "project",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [debounceSearch] = useDebounce(searchTerm, 700);
  const projectQuery = RequestQueryBuilder.create();

  if (debounceSearch) {
    projectQuery.setFilter({
      field: "name",
      operator: "$cont",
      value: debounceSearch,
    });
  }

  if (isUser) {
    projectQuery.setFilter({
      field: "projectUsers.permission",
      operator: "$ne",
      value: roleDataLeader[1].value,
    });
  }

  const { page, nextPage, setPage } = useInfiniteQueryPage(debounceSearch);

  const {
    currentData: projectsData,
    isFetching: isProjectsFetching,
    isError: isProjectsError,
  } = useGetInfiniteProjectsQuery(
    {
      page,
      limit: 25,
      querySearch: projectQuery.query(),
    },
    { skip: (!open && reallyClosed) || layer !== "project" },
  );

  const hasNextPage =
    !isProjectsError &&
    (projectsData ? projectsData.page < projectsData.pageCount : true);
  const sentryRef = useInfiniteSentry({
    loading: isProjectsFetching,
    hasNextPage,
    onLoadMore: nextPage,
    disabled: isProjectsError,
    rootMargin: "0px 0px 50px 0px",
  });

  const [selectedProjectName, setSelectedProjectName] = useState<string>();
  const [selectedProjectId, setSelectedProjectId] = useState<string>();
  const [selectedProjectFileName, setSelectedProjectFileName] =
    useState<string>();
  const [selectedProjectFileId, setSelectedProjectFileId] = useState<string>();
  const [selectedSectionId, setSelectedSectionId] = useState<string>();
  const {
    currentData: projectFilesData,
    isFetching: isProjectFilesFetching,
    isError: isProjectFilesError,
  } = useGetAllPinBoardAndScheduleQuery(
    selectedProjectId
      ? {
          query: RequestQueryBuilder.create()
            .search({
              projectId: selectedProjectId,
              type,
            })
            .query(),
        }
      : skipToken,
    {
      skip: (!open && reallyClosed) || layer === "project",
      refetchOnMountOrArgChange: 60,
    },
  );

  const prevScrollPositionRef = useRef({
    project: 0,
    ["project-file"]: 0,
    section: 0,
  });
  const prevLayerRef = useRef<typeof layer>();
  const prevLayer = prevLayerRef.current;
  prevLayerRef.current = layer;

  if (scrollRef.current && prevLayer !== undefined && layer !== prevLayer) {
    prevScrollPositionRef.current[prevLayer] = scrollRef.current.scrollTop;
  }
  useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = prevScrollPositionRef.current[layer];
    }
  }, [layer]);

  useEffect(() => {
    if (open) {
      setPage(1);
      setLayer("project");
      setSelectedProjectId(undefined);
      setSelectedProjectFileId(undefined);
      setSelectedSectionId(undefined);
      setReallyClosed(false);
      setIsLoading(false);
      setIsAddingNew(false);
    }
  }, [open, setPage]);

  useEffect(() => {
    if (reallyClosed) {
      setSearchTerm("");
    }
  }, [reallyClosed]);

  const handleItemClick = (id: string, name: string) => {
    switch (layer) {
      case "project":
        if (action !== "duplicate") {
          setLayer("project-file");
          setSelectedProjectId(id);
          setSelectedProjectName(name);
        } else {
          setSelectedProjectId((prevId) => (prevId === id ? undefined : id));
        }
        break;
      case "project-file":
        setLayer("section");
        setSelectedProjectFileId(id);
        setSelectedProjectFileName(name);
        break;
      case "section":
        setSelectedSectionId((prevId) => (prevId === id ? undefined : id));
        break;
    }

    setIsAddingNew(false);
  };

  const handleBack = () => {
    setSelectedSectionId(undefined);
    switch (layer) {
      case "project":
        break;
      case "project-file":
        setLayer("project");
        break;
      case "section":
        setLayer("project-file");
        break;
    }

    setIsAddingNew(false);
  };

  const handleSubmit = async () => {
    let callback: Promisable<boolean | void>;
    if (action === "duplicate") {
      if (!selectedProjectId) {
        onClose?.();
        return;
      }

      callback = onProjectSelected?.(selectedProjectId);
    } else {
      if (!selectedProjectFileId || !selectedSectionId) {
        onClose?.();
        return;
      }

      callback = onSectionSelected?.(selectedProjectFileId, selectedSectionId);
    }

    setIsLoading(true);
    let success = true;
    try {
      success = (await callback) ?? true;
    } catch {
      success = false;
    }

    if (success !== false) {
      if (showSuccessToast) {
        enqueueSnackbar(tCommon("actionSuccessfully", { action: title }), {
          variant: "success",
        });
      }

      onClose?.();
    } else {
      setIsLoading(false);
    }
  };

  const [createProjectFile] = useCreatePinBoardOrScheduleMutation();
  const [createSection] = useCreateSectionScheduleMutation();
  const handleAddNew = async (name: string) => {
    if (layer === "project") return;

    if (layer === "project-file") {
      if (!selectedProjectId) return;

      try {
        await createProjectFile({
          projectId: selectedProjectId,
          name,
          type,
        }).unwrap();
      } catch (e) {
        if (isErrorResponse(e) && e.data.message === "PROJECT_FOLDER_EXIST") {
          return { error: tErrorMsg("alreadyExists") };
        } else {
          throw e;
        }
      }
    } else {
      if (!selectedProjectFileId) return;

      await createSection({
        folderId: selectedProjectFileId,
        name,
        projectFolderType: type,
      }).unwrap();
    }

    setIsAddingNew(false);
  };

  let data: { id: string; name: string }[] | undefined,
    isError: boolean = false,
    headerTitle: string | undefined,
    headerIcon: IconProp | undefined,
    itemIcon: IconProp | undefined,
    createLabel: string | undefined;
  switch (layer) {
    case "project":
      data = projectsData?.data;
      isError = isProjectsError;
      itemIcon = faBriefcase;
      break;
    case "project-file":
      data = projectFilesData?.data;
      isError = isProjectFilesError;
      headerTitle = selectedProjectName;
      headerIcon = faBriefcaseDuotone;
      itemIcon = type === "pinboard" ? faTableColumns : faLayerGroup;
      createLabel = t(
        type === "pinboard" ? "create_pinboard" : "create_material_schedule",
      );
      break;
    case "section":
      data = projectFilesData?.data.find(
        (file) => file.id === selectedProjectFileId,
      )?.folderSections;
      isError = isProjectFilesError;
      headerTitle = selectedProjectFileName;
      headerIcon =
        type === "pinboard" ? faTableColumnsDuotone : faLayerGroupDuotone;
      createLabel = t("create_section");
      break;
  }

  const createNewButton = (
    <Box ml={3.7} mt={1}>
      {isAddingNew ? (
        <EditInput
          onSave={handleAddNew}
          onCancel={() => setIsAddingNew(false)}
        />
      ) : (
        <Button
          fullWidth
          onClick={() => setIsAddingNew(true)}
          startIcon={
            <FontAwesomeIcon icon={faPlus} style={{ width: 12, height: 12 }} />
          }
          sx={{
            px: 1.5,
            py: 1.3,
            justifyContent: "flex-start",
            fontWeight: 400,
            fontStyle: "italic",
            color: "var(--mui-palette-text-disabled)",
          }}
        >
          {createLabel}
        </Button>
      )}
    </Box>
  );

  return (
    <Dialog
      maxWidth={false}
      open={open}
      onClose={onClose}
      TransitionProps={{
        onExited: () => {
          setReallyClosed(true);
        },
      }}
      sx={{
        "& .MuiDialog-paper": {
          width: "500px",
          height: "calc(100% - 64px)",
          maxHeight: "480px",
        },
      }}
    >
      {title !== undefined && (
        <Box display="flex" alignItems="center">
          <DialogTitle sx={{ flex: 1 }}>{title}</DialogTitle>
          <FaIconButton
            title={"close"}
            icon={faXmark}
            wrapperProps={{
              sx: {
                mr: 1.5,
              },
            }}
            onClick={onClose}
          />
        </Box>
      )}

      <DialogContent
        ref={scrollRef}
        dividers
        sx={{
          px: layer === "project" ? 3 : 2,
          pt: layer === "project" ? undefined : 2,
          pb: 2,
        }}
      >
        {layer === "project" ? (
          <Box mx={1}>
            <OutlinedInput
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
              size="small"
              fullWidth
              placeholder={t("searchProject")}
              type="search"
              endAdornment={
                <InputAdornment position="end">
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </InputAdornment>
              }
            />
          </Box>
        ) : (
          <LayerHeader
            icon={headerIcon}
            title={headerTitle ?? ""}
            onBack={handleBack}
          />
        )}

        {layer === "project-file" && createNewButton}

        {isError ? (
          <MessageLine my={2}>{tCommon("errorMsg")}</MessageLine>
        ) : data?.length === 0 ? (
          <MessageLine my={2}>{tCommon("empty_data")}</MessageLine>
        ) : (
          <List
            sx={{
              mt: layer === "project" ? 2 : 1,
              ml: layer === "project" ? undefined : 3.7,
            }}
            disablePadding
          >
            {data?.map((item) => (
              <LayerItem
                key={item.id}
                type={
                  layer === "section"
                    ? item.id === selectedSectionId
                      ? "active"
                      : "inactive"
                    : action === "duplicate"
                      ? item.id === selectedProjectId
                        ? "active"
                        : "inactive"
                      : "next"
                }
                icon={itemIcon}
                label={item.name}
                onClick={() => handleItemClick(item.id, item.name)}
              />
            ))}
          </List>
        )}

        {layer === "project" && (isProjectsFetching || hasNextPage) && (
          <CircularProgress
            ref={sentryRef}
            size={30}
            sx={{ display: "block", mx: "auto", my: 3 }}
          />
        )}
        {layer !== "project" && isProjectFilesFetching && (
          <CircularProgress
            size={30}
            sx={{ display: "block", mx: "auto", my: 3 }}
          />
        )}

        {layer === "section" && createNewButton}
      </DialogContent>

      <DialogActions sx={{ gap: 1 }}>
        <Button variant="outlined" onClick={onClose}>
          {tCommon("cancel")}
        </Button>
        <LoadingButton
          variant="contained"
          disabled={
            !(action === "duplicate" ? selectedProjectId : selectedSectionId)
          }
          loading={isLoading}
          onClick={handleSubmit}
        >
          {actionLabel}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default ActionToProjectFileDialog;

const LayerHeader: React.FC<{
  icon?: IconProp;
  title: string;
  onBack?: () => void;
}> = ({ icon, title, onBack }) => {
  return (
    <Box display="flex" alignItems="center">
      <FaIconButton icon={faArrowLeft} onClick={onBack} sx={{ mr: 0.5 }} />
      {!!icon && (
        <FontAwesomeIcon
          icon={icon}
          color="var(--mui-palette-action-active)"
          style={{ width: 20, height: 20 }}
        />
      )}
      <Typography variant="subtitle1" component="p" ml={1}>
        {title}
      </Typography>
    </Box>
  );
};

const LayerItem: React.FC<{
  icon?: IconProp;
  label: string;
  type: "active" | "inactive" | "next";
  onClick: () => void;
}> = ({ icon, label, type, onClick }) => {
  return (
    <ListItem disablePadding dense>
      <ListItemButton
        onClick={onClick}
        sx={{
          px: 1,
          borderRadius: 0.5,
          ...(type === "active"
            ? {
                bgcolor: "var(--mui-palette-action-selected)",
                "&:hover": {
                  bgcolor: "var(--mui-palette-action-selected)",
                },
              }
            : undefined),
        }}
      >
        {!!icon && (
          <ListItemIcon sx={{ mr: 1, minWidth: 0 }}>
            <FontAwesomeIcon
              icon={icon}
              color="var(--mui-palette-action-disabled)"
            />
          </ListItemIcon>
        )}

        <ListItemText
          primary={label}
          primaryTypographyProps={{ variant: "subtitle2", component: "span" }}
        />

        {type !== "inactive" && (
          <FontAwesomeIcon
            {...(type === "next"
              ? {
                  icon: faChevronRight,
                  color: "var(--mui-palette-action-disabled)",
                }
              : {
                  icon: faCheck,
                  style: { width: 20, height: 20 },
                })}
          />
        )}
      </ListItemButton>
    </ListItem>
  );
};

const MAX_INPUT_LENGTH = 155;

const EditInput: React.FC<{
  onSave: (value: string) => Promisable<{ error: string } | void>;
  onCancel: () => void;
}> = ({ onSave, onCancel }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("errorMsg");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const handleSave = async () => {
    const value = inputRef.current?.value ?? "";

    if (!value) {
      setError(t("required"));
      return;
    }

    if (value.length > MAX_INPUT_LENGTH) {
      setError(t("tooLong", { count: MAX_INPUT_LENGTH }));
      return;
    }

    setIsLoading(true);
    let success = false;
    let error: string | undefined;
    try {
      const result = await onSave(value);
      if (result) {
        error = result.error;
      } else {
        success = true;
      }
    } catch {}
    setIsLoading(false);

    if (!success) {
      inputRef.current?.focus();
      error && setError(error);
    }
  };

  return (
    <TextField
      inputRef={inputRef}
      fullWidth
      autoFocus
      disabled={isLoading}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleSave();
        }
      }}
      error={!!error}
      helperText={error}
      inputProps={{ maxLength: MAX_INPUT_LENGTH }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            {isLoading ? (
              <CircularProgress size={16} sx={{ mx: 1 }} />
            ) : (
              <>
                <FaIconButton icon={faXmark} onClick={onCancel} />
                <FaIconButton icon={faCheck} onClick={handleSave} />
              </>
            )}
          </InputAdornment>
        ),
        sx: {
          pr: 1,
          fontSize: "0.875rem",
          fontWeight: "500",
          "& .MuiInputBase-input": {
            pl: 1,
          },
        },
      }}
    />
  );
};
