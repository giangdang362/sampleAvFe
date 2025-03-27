import { InputAdornment, OutlinedInput, Stack } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import ButtonPrimary from "@/components/common/button-primary";
import { useIsUser } from "@/services/helpers";
import { useTranslations } from "next-intl";
export interface ProductFilterProps {
  valueSearch: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleClickOpen: () => void;
  isDeleted?: boolean;
  roleName?: string;
}

const ProjectMemberFilter = ({
  valueSearch,
  onChange,
  handleClickOpen,
  isDeleted,
  roleName,
}: ProductFilterProps) => {
  const isUser = useIsUser();
  const t = useTranslations("projects");

  return (
    <Stack sx={{ flexDirection: "column" }}>
      <Stack
        sx={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginY: "16px",
        }}
      >
        <OutlinedInput
          fullWidth
          placeholder={t("button.search")}
          value={valueSearch}
          onChange={onChange}
          endAdornment={
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          }
          sx={{
            maxWidth: "300px",
            maxHeight: "40px",
            borderRadius: "4px",
            marginRight: 2,
          }}
        />
        {!isDeleted && (roleName !== "viewer" || !isUser) && (
          <ButtonPrimary
            onClick={() => {
              handleClickOpen();
            }}
            label={t("button.addMember")}
            startIcon={<AddIcon sx={{ fontSize: "var(--icon-fontSize-md)" }} />}
          />
        )}
      </Stack>
    </Stack>
  );
};

export default ProjectMemberFilter;
