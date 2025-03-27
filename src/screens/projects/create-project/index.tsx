"use client";
import HeaderMain from "@/components/layout/header";
import { Box, Stack } from "@mui/material";
import { CreateUpdateForm } from "../../../components/admin/projects/form";
import FooterMain from "@/components/layout/footer-main";
import ButtonPrimary from "@/components/common/button-primary";
import ButtonSecondary from "@/components/common/button-secondary";
import RouterLink from "next/link";
import { useHref } from "@/hooks/href";
import { paths } from "@/paths";
import { useTranslations } from "next-intl";
import { useIsUser } from "@/services/helpers";
const CreateProjectView: React.FC = () => {
  const isUser = useIsUser();
  const createHref = useHref();
  const t = useTranslations("projects");

  return (
    <Stack>
      <HeaderMain
        title={t("list.createProject")}
        haveBackBtn
        backBtnHref={{ isUser, path: "projects" }}
      />
      <Box maxWidth={700}>
        <CreateUpdateForm showMemberSection formId="create-update-project" />
      </Box>

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
                label={t("button.save")}
                type="submit"
                form={"create-update-project"}
              />
              <ButtonSecondary
                title={t("button.cancel")}
                component={RouterLink}
                href={createHref(`${paths.admin.projects}`)}
              />
            </Stack>
          </Stack>
        }
      />
    </Stack>
  );
};

export default CreateProjectView;
