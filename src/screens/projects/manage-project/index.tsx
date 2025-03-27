"use client";
import HeaderMain from "@/components/layout/header";
import { Box, Button, Stack, Tab } from "@mui/material";
import { CreateUpdateForm } from "../../../components/admin/projects/form";
import FooterMain from "@/components/layout/footer-main";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useDeleteMemberProjectMutation,
  useGetMemberProjectQuery,
  useGetProjectByIdQuery,
  useRestoreProjectMutation,
  useSoftDeleteOneMutation,
} from "@/services/projects";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import MemberList from "@/components/admin/projects/manage-project/MemberList";
import { useAvciRouter } from "@/hooks/avci-router";
import ProjectMemberFilter from "../components/ProjectMemberFilter";
import { RequestQueryBuilder } from "@nestjsx/crud-request";
import { useDebounce } from "use-debounce";
import { DialogAddMemberToProject } from "../components/DialogAddMenberToProject";
import ButtonSecondary from "@/components/common/button-secondary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft } from "@/lib/fas/pro-solid-svg-icons";
import { DialogConfirmProject } from "../components/DialogConfirmProject";
import ButtonPrimary from "@/components/common/button-primary";
import { paths } from "@/paths";
import RouterLink from "next/link";
import { useHref } from "@/hooks/href";
import { useIsUser } from "@/services/helpers";
import { roleDataLeader } from "@/utils/common";
import { useTranslations } from "next-intl";
import { useHashState } from "@/hooks/useHashState";
import { usePageTitle } from "@/hooks/usePageTitle";
import NotFoundWrapper from "@/components/common/NotFoundWrapper";

interface ManageProjectViewProps {
  isDeleted?: boolean;
}

const ManageProjectView = ({ isDeleted }: ManageProjectViewProps) => {
  const rt = useAvciRouter();
  const params = useParams();
  const projectId = params.id as string;
  let query = RequestQueryBuilder.create();
  query.setIncludeDeleted(1);

  const tabValue = useHashState(["details", "members"], "details");

  const { data: dataGetPjById, error } = useGetProjectByIdQuery({
    id: projectId,
    query: isDeleted ? query.query() : "",
  });
  usePageTitle("projectManage", dataGetPjById?.name);

  const [paginationModelMember, setPaginationModelMember] = useState({
    page: 0,
    pageSize: 10,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [debounceSearch] = useDebounce(searchTerm, 500);
  const { data: dataMemberProject } = useGetMemberProjectQuery({
    projectId: projectId,
    body: {
      page: paginationModelMember.page,
      limit: paginationModelMember.pageSize,
    },
  });
  const [dataSearchMemberProject, setDataSearchMemberProject] = useState<
    API.PjMember[]
  >([]);

  useEffect(() => {
    setDataSearchMemberProject(dataMemberProject?.data ?? []);
  }, [dataMemberProject]);

  if (debounceSearch !== "") {
    query.setFilter({
      field: "name",
      operator: "$cont",
      value: debounceSearch,
    });
  }

  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    if (term !== "") {
      setDataSearchMemberProject(
        dataMemberProject?.data?.filter((e) => e.email?.includes(term)) ?? [],
      );
    } else {
      setDataSearchMemberProject(dataMemberProject?.data ?? []);
    }

    setSearchTerm(term);
  };

  const rowCountRef = useRef(dataMemberProject?.total || 0);
  const rowCount = useMemo(() => {
    if (dataMemberProject?.total !== undefined) {
      rowCountRef.current = dataMemberProject.total;
    }
    return rowCountRef.current;
  }, [dataMemberProject?.total]);

  const [softDeleteOne] = useSoftDeleteOneMutation();

  const handleDeleteProject = () => {
    const ids = [];
    ids.push(projectId);
    softDeleteOne({ ids })
      .then((res) => {
        if (res && res.data?.success) {
          rt.push(`${paths.app.projects}`);
        }
      })
      .catch((err) => {
        console.log("Delete error", err);
      });
  };

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const [openDl, setOpenDl] = useState(false);

  const handleClickOpenDl = () => {
    setOpenDl(true);
  };
  const handleCloseDl = () => {
    setOpenDl(false);
  };

  const [deleteMemberProject] = useDeleteMemberProjectMutation();

  const [idDl, setIdDL] = useState(-1);
  const [nameMemberDelete, setNameMemberDelete] = useState("");

  const deleteProd = () => {
    deleteMemberProject({ memberId: idDl, projectId: projectId }).then(() => {
      handleCloseDl();
    });
  };

  const [openDelete, setOpenDelete] = useState(false);

  const handleClickOpenDeleteProject = () => {
    setOpenDelete(true);
  };
  const handleCloseDeleteProject = () => {
    setOpenDelete(false);
  };
  const [openRestore, setOpenRestore] = useState(false);

  const handleClickOpenDlRt = () => {
    setOpenRestore(true);
  };
  const handleCloseDlRt = () => {
    setOpenRestore(false);
  };

  const [restoreProject] = useRestoreProjectMutation();

  const restoreProjectFun = () => {
    restoreProject({ id: projectId }).then((res) => {
      handleCloseDlRt();
      if (res && res.data?.success) {
        rt.push(`${paths.app.deletedProject}`);
      }
    });
  };
  const createHref = useHref();
  const isUser = useIsUser();
  const t = useTranslations("projects");

  return (
    <Stack>
      <DialogConfirmProject
        open={openRestore}
        handleClickOpen={handleClickOpenDlRt}
        handleClose={handleCloseDlRt}
        handleAgree={restoreProjectFun}
        name={dataGetPjById?.name ?? ""}
        type="reStore"
      />
      <DialogConfirmProject
        open={openDelete}
        handleClickOpen={handleClickOpenDeleteProject}
        handleClose={handleCloseDeleteProject}
        handleAgree={handleDeleteProject}
        name={dataGetPjById?.name ?? ""}
        type="delete"
        deleteName="project"
      />
      <DialogConfirmProject
        open={openDl}
        handleClickOpen={handleClickOpenDl}
        handleClose={handleCloseDl}
        handleAgree={deleteProd}
        name={nameMemberDelete}
        type="delete"
        deleteName="member"
      />

      <DialogAddMemberToProject
        handleClose={handleClose}
        handleClickOpen={handleClickOpen}
        open={open}
        idProject={projectId}
        roleName={dataGetPjById?.roleName ?? ""}
      />
      <HeaderMain
        title={t("manage.manageProject")}
        haveBackBtn
        backBtnHref={{
          isUser,
          path: "projectFiles",
          params: { id: projectId },
        }}
        buttonBlock={
          !isDeleted ? (
            <>
              {(!isUser ||
                dataGetPjById?.roleName === roleDataLeader[2]?.value) && (
                <Button
                  variant="text"
                  color="error"
                  startIcon={<DeleteRoundedIcon />}
                  onClick={handleClickOpenDeleteProject}
                >
                  {t("manage.deleteProject")}
                </Button>
              )}
            </>
          ) : (
            <ButtonSecondary
              startIcon={
                <FontAwesomeIcon
                  icon={faArrowRotateLeft}
                  style={{ fontSize: "16px" }}
                />
              }
              title={t("manage.restoreProject")}
              onClick={() => {
                handleClickOpenDlRt();
              }}
            />
          )
        }
      />

      <NotFoundWrapper
        error={error}
        notFoundMessage={t("project_not_found")}
        messageProps={{ mt: 7 }}
      >
        <TabContext value={tabValue}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList aria-label="project-manage-context">
              <Tab
                label={t("manage.details")}
                value="details"
                href="#details"
              />
              <Tab
                label={t("manage.members")}
                value="members"
                href="#members"
              />
            </TabList>
          </Box>
          <TabPanel value="details">
            <Box maxWidth={700}>
              <CreateUpdateForm
                projectData={dataGetPjById}
                formId="create-update-project"
                showMemberSection={false}
                isDeleted={isDeleted}
              />
            </Box>
          </TabPanel>
          <TabPanel value="members">
            <ProjectMemberFilter
              isDeleted={isDeleted}
              handleClickOpen={handleClickOpen}
              valueSearch={searchTerm}
              onChange={handleSearch}
              roleName={dataGetPjById?.roleName ?? ""}
            />
            <MemberList
              roleName={dataGetPjById?.roleName ?? ""}
              isDeleted={isDeleted}
              handleClickOpenDl={handleClickOpenDl}
              rowsCount={rowCount}
              paginationModel={paginationModelMember}
              onPaginationModelChange={setPaginationModelMember}
              loading={false}
              onDelete={(id, name) => {
                setIdDL(id);
                setNameMemberDelete(name);
              }}
              dataMemberProject={dataSearchMemberProject}
              projectId={projectId}
            />
          </TabPanel>
        </TabContext>

        {tabValue === "details" &&
        !isDeleted &&
        dataGetPjById?.roleName !== roleDataLeader[1].value ? (
          <FooterMain
            type="custom"
            cusView={
              <Stack
                direction="row"
                sx={{
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                <Stack direction={"row"} gap={"12px"}>
                  <ButtonPrimary
                    label={t("manage.save")}
                    type="submit"
                    form={"create-update-project"}
                  />
                  <ButtonSecondary
                    title="Cancel"
                    component={RouterLink}
                    href={createHref(
                      `${paths.admin.projects}/${projectId}/files`,
                    )}
                  />
                </Stack>
              </Stack>
            }
          />
        ) : null}
      </NotFoundWrapper>
    </Stack>
  );
};

export default ManageProjectView;
