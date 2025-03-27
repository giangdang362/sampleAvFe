import { InputAdornment, OutlinedInput, Stack } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslations } from "next-intl";

export interface ProductFilterProps {
  valueSearch: string;
  onChangeSearchInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProjectFilter = ({
  valueSearch,
  onChangeSearchInput,
}: ProductFilterProps) => {
  const t = useTranslations("projects");
  return (
    <Stack sx={{ flexDirection: "column" }}>
      <OutlinedInput
        fullWidth
        type="search"
        placeholder={t("search")}
        value={valueSearch}
        onChange={onChangeSearchInput}
        endAdornment={
          <InputAdornment position="end">
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
    </Stack>
  );
};

export default ProjectFilter;
