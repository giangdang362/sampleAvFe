import {
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { Dispatch, SetStateAction } from "react";
import { useTranslations } from "next-intl";
import { useGetConstSlugQuery } from "@/services/slug";
import { PRODUCT_OPTION_SLUGS } from "@/constants/common";

export const styleSelect = {
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
};
export interface ProductScheduleFilterProps {
  valueSearch: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  statusFilter: string;
  setStatusFilter: Dispatch<SetStateAction<string>>;
  leadTimeFilter: string;
  setLeadTimeFilter: Dispatch<SetStateAction<string>>;
}

const ProductScheduleFilter = ({
  valueSearch,
  onChange,
  statusFilter,
  setStatusFilter,
  leadTimeFilter,
  setLeadTimeFilter,
}: ProductScheduleFilterProps) => {
  const t = useTranslations("projects");

  const { data: dataLeadTime } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productLeadTime,
  });

  const status = [
    {
      value: "sample_requested",
      name: t("sample_requested"),
      color: "#D32F2F",
    },
    { value: "sample_received", name: t("sample_received"), color: "#D32F2F" },
    { value: "quote_requested", name: t("quote_requested"), color: "#D32F2F" },
    { value: "quote_received", name: t("quote_received"), color: "#D32F2F" },
    {
      value: "internal_approved",
      name: t("internal_approved"),
      color: "#EF6C00",
    },
    { value: "client_approved", name: t("client_approved"), color: "#2E7D32" },
    {
      value: "reject_by_client",
      name: t("reject_by_client"),
      color: "rgba(0, 0, 0, 0.6)",
    },
  ];

  return (
    <Stack
      sx={{
        // flexDirection: "row",
        // flexWrap: "wrap",
        gap: "12px",
        // alignItems: "center",
      }}
    >
      <OutlinedInput
        placeholder={t("search")}
        value={valueSearch}
        onChange={onChange}
        inputProps={{ maxLength: 155 }}
        type="search"
        endAdornment={
          <InputAdornment position="end">
            <SearchIcon sx={{ cursor: "pointer" }} />
          </InputAdornment>
        }
        sx={{
          width: "330px",
          height: "40px",
          borderRadius: "4px",
          marginRight: 2,
        }}
      />
      <Stack direction={"row"} spacing={2} marginTop={1}>
        <FormControl size="small" sx={{ maxWidth: "160px", width: "100%" }}>
          <InputLabel sx={{ fontSize: "13px" }}>{t("status")}</InputLabel>
          <Select
            size="small"
            value={statusFilter}
            label={t("status")}
            onChange={(e) => {
              setStatusFilter(e.target.value);
            }}
            sx={{ ...styleSelect }}
          >
            <MenuItem value={""}>{`---`}</MenuItem>
            {status?.map((item, index) => (
              <MenuItem key={index} value={item.value}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ maxWidth: "160px", width: "100%" }}>
          <InputLabel sx={{ fontSize: "13px" }}>{t("lead_time")}</InputLabel>
          <Select
            value={leadTimeFilter}
            label={t("lead_time")}
            onChange={(e) => {
              setLeadTimeFilter(e.target.value);
            }}
            sx={{ ...styleSelect }}
          >
            <MenuItem value={""}>{`---`}</MenuItem>
            {dataLeadTime?.children?.map((item) => (
              <MenuItem key={item.id} value={item.enName}>
                {item.enName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </Stack>
  );
};

export default ProductScheduleFilter;
