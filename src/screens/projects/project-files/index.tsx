"use client";
import HeaderMain from "@/components/layout/header";
import { Box, Divider, Stack, Typography } from "@mui/material";
import React, { useState } from "react";
import RouterLink from "next/link";
import { useHref } from "@/hooks/href";
import ButtonPrimary from "@/components/common/button-primary";
import { paths } from "@/paths";
import {
  useCreateOrUpdateMutation,
  useGetProjectByIdQuery,
  useUpdateBannerMutation,
} from "@/services/projects";
import { useParams } from "next/navigation";
import AddIcon from "@mui/icons-material/Add";
import ButtonSecondary from "@/components/common/button-secondary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup, faTableColumns } from "@/lib/fas/pro-light-svg-icons";
import { pathFile } from "@/config/api";
import { RequestQueryBuilder } from "@nestjsx/crud-request";
import { useIsUser } from "@/services/helpers";
import { getDifferenceTime } from "@/utils/fun";
import CardPinBoardProject from "../components/CardPinBoardProject";
import CardMaterialSchedule from "../components/CardMaterialSchedule";
import { useGetAllPinBoardAndScheduleQuery } from "@/services/projectFolder";
import { DialogAddNewPinBroadSchedule } from "../components/DialogAddNewPinBroadOrSchedule";
import { roleDataLeader } from "@/utils/common";
import { useTranslations } from "next-intl";
import CoverImage, {
  CoverSpace,
} from "@/components/admin/projects/project-files/CoverImage";
import { usePageTitle } from "@/hooks/usePageTitle";
import { faGear } from "@/lib/fas/pro-regular-svg-icons";
import DataStateOverlay from "@/components/common/DataStateOverflay";
import NotFoundWrapper from "@/components/common/NotFoundWrapper";

const PROJECT_NAME_MAX_LENGTH = 155;

interface ViewProjectFilesProps {
  isDeleted?: boolean;
}
const ViewProjectFiles = ({ isDeleted }: ViewProjectFilesProps) => {
  const createHref = useHref();
  const searchParams = useParams();
  const projectId = searchParams.id as string;
  let querySchedule = RequestQueryBuilder.create();
  let queryPinBoard = RequestQueryBuilder.create();
  const isUser = useIsUser();

  queryPinBoard = queryPinBoard.setFilter({
    field: "projectId",
    operator: "$eq",
    value: projectId,
  });
  querySchedule = querySchedule.setFilter({
    field: "projectId",
    operator: "$eq",
    value: projectId,
  });

  const {
    data: dataAllPinBoard,
    isFetching: isFetchingPinBoard,
    isError: isPinBoardError,
  } = useGetAllPinBoardAndScheduleQuery({
    query: queryPinBoard
      .setFilter({
        field: "type",
        operator: "$eq",
        value: "pinboard",
      })
      .query(),
  });

  const {
    data: dataAllSchedule,
    isFetching: isFetchingSchedule,
    isError: isScheduleError,
  } = useGetAllPinBoardAndScheduleQuery({
    query: querySchedule
      .setFilter({
        field: "type",
        operator: "$eq",
        value: "schedule",
      })
      .query(),
  });
  let query = RequestQueryBuilder.create();
  query.setIncludeDeleted(1);

  const {
    data: dataGetPjById,
    isLoading,
    error,
  } = useGetProjectByIdQuery({
    id: projectId,
    query: isDeleted ? query.query() : "",
  });
  usePageTitle("projectFiles", dataGetPjById?.name);

  const [updateBannerProject] = useUpdateBannerMutation();

  const [dataPinMore, setDataPinMore] = useState(6);
  const [dataSchedule, setDataSchedule] = useState(2);

  const toggleShowMorePinBoard = () => {
    setDataPinMore(dataPinMore + 6);
  };
  const toggleShowMoreSchedule = () => {
    setDataSchedule(dataSchedule + 2);
  };

  const [openPinBoard, setOpenPinBoard] = useState(false);
  const [typeDialog, setTypeDialog] = useState("");

  const handleClickOpenPinBoard = () => {
    setOpenPinBoard(true);
  };

  const handleClosePinBoard = () => {
    setOpenPinBoard(false);
  };

  const t = useTranslations("projects");
  const tPinboard = useTranslations("pinboard");

  const onCropComplete = async (coverSpace: CoverSpace) => {
    try {
      await updateBannerProject({
        id: projectId,
        body: {
          coverInfo: coverSpace,
        },
      }).unwrap();
    } catch {
      return false;
    }
  };

  const [createOrUpdate, { isLoading: isUpdatingTitle }] =
    useCreateOrUpdateMutation();

  const handleTitleChange = async (newName: string) => {
    if (newName.length < 1) {
      return { error: tPinboard("validation.pinboardNameEmpty") };
    }
    if (newName.length > PROJECT_NAME_MAX_LENGTH) {
      return {
        error: tPinboard("validation.pinboardNameMaxLength", {
          count: PROJECT_NAME_MAX_LENGTH,
        }),
      };
    }

    await createOrUpdate({
      id: dataGetPjById?.id ?? "",
      name: newName,
    }).unwrap();
  };

  const readOnly =
    isLoading ||
    dataGetPjById?.roleName === roleDataLeader[1].value ||
    dataGetPjById?.projectUsers === null;

  const subTitleHeader = [
    dataGetPjById?.address.addressLine1,
    dataGetPjById?.address.city,
    dataGetPjById?.address.country?.enName,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Stack gap="24px" sx={{ pb: "60px" }}>
      <HeaderMain
        titleEditable={!isUpdatingTitle && !readOnly}
        subTitle={isLoading ? "..." : subTitleHeader}
        title={isLoading ? "..." : dataGetPjById?.name}
        haveBackBtn={true}
        backBtnHref={{ isUser, path: "projects" }}
        onTitleChange={handleTitleChange}
        buttonBlock={
          <ButtonPrimary
            component={RouterLink}
            href={
              !isDeleted
                ? createHref(
                    `${!isUser ? paths.admin.projects : paths.app.projects}/${projectId}/manage`,
                  )
                : createHref(
                    `${!isUser ? paths.admin.projects : paths.app.projects}/deleted/${projectId}/manage`,
                  )
            }
            startIcon={
              <FontAwesomeIcon
                icon={faGear}
                style={{ fontSize: "14px", color: "#00000099" }}
              />
            }
            label={t("manage.manageProject")}
            variant="text"
            sx={{
              color: "#00000099",
              fontWeight: 600,
              fontSize: "14px",
            }}
          />
        }
      />

      <NotFoundWrapper error={error} notFoundMessage={t("project_not_found")}>
        <CoverImage
          src={
            dataGetPjById?.coverImageFile &&
            `${pathFile}/${dataGetPjById.coverImageFile.path}`
          }
          coverSpace={dataGetPjById?.coverInfo}
          onCoverSpaceSaved={onCropComplete}
          isGuest={dataGetPjById ? dataGetPjById.roleName === "viewer" : true}
        />

        <Box>
          <Stack
            sx={{
              flexDirection: "row",
              alignItems: "center",
              mb: "16px",
            }}
          >
            <Stack sx={{ flexDirection: "row", alignItems: "center" }}>
              <FontAwesomeIcon
                icon={faTableColumns}
                style={{ fontSize: "24px" }}
              />
              <Typography
                sx={{
                  textTransform: "uppercase",
                  marginLeft: "8px",
                  color: "#000000DE",
                  fontWeight: 600,
                  fontSize: "20px",
                }}
              >
                {t("files.pinboard")}
              </Typography>
            </Stack>

            {!isDeleted &&
              dataGetPjById?.roleName !== roleDataLeader[1].value && (
                <>
                  <Divider
                    orientation="vertical"
                    variant="middle"
                    flexItem
                    sx={{ px: 0.5 }}
                  />
                  <ButtonPrimary
                    variant="text"
                    startIcon={
                      <AddIcon sx={{ fontSize: "var(--icon-fontSize-md)" }} />
                    }
                    label={t("files.create")}
                    onClick={() => {
                      handleClickOpenPinBoard();
                      setTypeDialog("pinboard");
                    }}
                    sx={{
                      color: "rgba(123, 123, 123, 0.87)",
                    }}
                  />
                </>
              )}
          </Stack>

          <DataStateOverlay
            isError={isPinBoardError}
            isFetching={isFetchingPinBoard}
            isEmpty={dataAllPinBoard?.data.length === 0}
            wrapperProps={{ height: "171px" }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(1, 1fr)",
                  sm: "repeat(3, 1fr)",
                  md: "repeat(4, 1fr)",
                  lg: "repeat(5, 1fr)",
                  xl: "repeat(auto-fill, 206px)",
                },
                columnGap: { xs: "16px", xl: "24px" },
                rowGap: "22px",
              }}
            >
              {dataAllPinBoard && dataAllPinBoard?.data.length >= dataPinMore
                ? dataAllPinBoard?.data
                    .slice(0, dataPinMore)
                    ?.map((row) => (
                      <CardPinBoardProject
                        key={row.id}
                        pinboardId={row.id}
                        pinName={row.name}
                        pinImage={row.thumbnail?.thumbnail}
                        modifiedTime={`${getDifferenceTime(row.updatedAt)}`}
                      />
                    ))
                : dataAllPinBoard?.data?.map((row) => (
                    <CardPinBoardProject
                      key={row.id}
                      pinboardId={row.id}
                      pinName={row.name}
                      pinImage={row.thumbnail?.thumbnail}
                      modifiedTime={`${getDifferenceTime(row.updatedAt)}`}
                    />
                  ))}
            </Box>

            {dataAllPinBoard && dataAllPinBoard?.data.length > dataPinMore && (
              <Box
                sx={{ display: "flex", justifyContent: "center", mt: "16px" }}
              >
                <ButtonSecondary
                  title={t("files.showMore")}
                  onClick={toggleShowMorePinBoard}
                />
              </Box>
            )}
          </DataStateOverlay>
        </Box>

        <Stack
          sx={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Stack sx={{ flexDirection: "row", alignItems: "center" }}>
            <FontAwesomeIcon icon={faLayerGroup} style={{ fontSize: "24px" }} />
            <Typography
              variant="h6"
              sx={{
                textTransform: "uppercase",
                marginLeft: "8px",
                color: "#000000DE",
                fontWeight: 600,
                fontSize: "20px",
              }}
            >
              {t("files.materialSchedule")}
            </Typography>
          </Stack>
          {!isDeleted &&
            dataGetPjById?.roleName !== roleDataLeader[1].value && (
              <>
                <Divider
                  orientation="vertical"
                  variant="middle"
                  flexItem
                  sx={{ px: 0.5 }}
                />
                <ButtonPrimary
                  variant="text"
                  startIcon={
                    <AddIcon sx={{ fontSize: "var(--icon-fontSize-md)" }} />
                  }
                  label={t("files.create")}
                  onClick={() => {
                    handleClickOpenPinBoard();
                    setTypeDialog("schedule");
                  }}
                  sx={{
                    color: "rgba(123, 123, 123, 0.87)",
                  }}
                />
              </>
            )}
        </Stack>

        <DataStateOverlay
          isError={isScheduleError}
          isFetching={isFetchingSchedule}
          isEmpty={dataAllSchedule?.data.length === 0}
        >
          {dataAllSchedule && dataAllSchedule?.data.length >= dataSchedule
            ? dataAllSchedule?.data
                .slice(0, dataSchedule)
                ?.map((data, index) => (
                  <CardMaterialSchedule
                    key={index}
                    materialScheduleId={data.id}
                    dataTag={data.folderSections ?? []}
                    materialScheduleName={data.name}
                    materialScheduleModified={`${getDifferenceTime(data.updatedAt)}`}
                  />
                ))
            : dataAllSchedule?.data?.map((data, index) => (
                <CardMaterialSchedule
                  key={index}
                  materialScheduleId={data.id}
                  dataTag={data.folderSections ?? []}
                  materialScheduleName={data.name}
                  materialScheduleModified={`${getDifferenceTime(data.updatedAt)}`}
                />
              ))}
          {dataAllSchedule && dataAllSchedule?.data.length > dataSchedule && (
            <ButtonSecondary
              title={t("files.showMore")}
              onClick={toggleShowMoreSchedule}
              sx={{ alignSelf: "center" }}
            />
          )}
        </DataStateOverlay>

        <DialogAddNewPinBroadSchedule
          handleClose={handleClosePinBoard}
          handleClickOpen={handleClickOpenPinBoard}
          open={openPinBoard}
          projectId={projectId}
          type={typeDialog}
        />
      </NotFoundWrapper>
    </Stack>
  );
};

export default ViewProjectFiles;
