import {
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  NoSsr,
  OutlinedInput,
  Select,
  Stack,
} from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import { useGetConstSlugQuery } from "@/services/slug";
import { PRODUCT_OPTION_SLUGS } from "@/constants/common";
import { useTranslations } from "next-intl";
import { faMagnifyingGlass } from "@/lib/fas/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
export interface ProductFilterProps {
  valueSearch: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  materialFilter: string;
  setMaterialFilter: Dispatch<SetStateAction<string | null>>;
}

const ProductFilter = ({
  materialFilter,
  valueSearch,
  onChange,
  setMaterialFilter,
}: ProductFilterProps) => {
  const t = useTranslations("products");

  const { data: dataMaterial } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productMaterial,
  });

  return (
    <NoSsr>
      <Stack
        sx={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "center",
        }}
      >
        <OutlinedInput
          placeholder={t("search")}
          type="search"
          value={valueSearch}
          onChange={onChange}
          endAdornment={
            <InputAdornment position="end">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                style={{ fontSize: "16px" }}
              />
            </InputAdornment>
          }
          sx={{
            width: "300px",
            height: "40px",
            borderRadius: "4px",
            marginRight: 2,
          }}
        />
        <FormControl
          key={!!dataMaterial + "dataMaterial"}
          size="small"
          sx={{ maxWidth: "110px", width: "100%" }}
        >
          <InputLabel sx={{ fontSize: "13px", color: "#000" }}>
            {t("material")}
          </InputLabel>
          <Select
            value={materialFilter}
            label={t("material")}
            onChange={(e) => {
              setMaterialFilter(e.target.value);
            }}
            sx={{ ...styleSelect }}
          >
            <MenuItem value={""}>{`---`}</MenuItem>
            {dataMaterial &&
              dataMaterial?.children?.flatMap((item) =>
                item.children.length <= 0
                  ? [
                      <MenuItem value={item.enName} key={item.id}>
                        {item.enName}
                      </MenuItem>,
                    ]
                  : item.children?.map((data) => (
                      <MenuItem value={data.enName} key={item.id + data.id}>
                        {data.enName}
                      </MenuItem>
                    )),
              )}
          </Select>
        </FormControl>
      </Stack>
    </NoSsr>
  );
};

export default ProductFilter;
