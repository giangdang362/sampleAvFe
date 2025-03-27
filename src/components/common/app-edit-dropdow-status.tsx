import {
  Box,
  BoxProps,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  SxProps,
  Theme,
  Typography,
  TypographyProps,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { FC, useRef, useState } from "react";

export interface EditableTypographyProps extends Omit<TypographyProps, "sx"> {
  value: string;
  enabled?: boolean;
  onEditingFinish?: (value: string) => void | Promise<void>;
  wrapperProps?: BoxProps;
  sx?: SxProps<Theme>;
  onChangeDropDow?: (e: SelectChangeEvent) => void;
  dataDropDow?: API.SlugItem[];
  isGroupView?: boolean;
}

const EditableStatusDropDow: FC<EditableTypographyProps> = ({
  value,
  onEditingFinish,
  wrapperProps,
  onChangeDropDow,
  isGroupView = false,
  enabled = true,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const t = useTranslations("projects");

  const status = [
    { value: "-", name: "---", color: "black" },
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

  const handleChange = async () => {
    if (typeof inputRef.current?.value === "string") {
      setIsLoading(true);
      await onEditingFinish?.(inputRef.current?.value);
      setIsLoading(false);
    }
  };

  return (
    <Box display="flex" alignItems="center" {...wrapperProps}>
      <FormControl sx={{ p: 0 }} size="small">
        {
          <Select
            native={isGroupView === true ? true : false}
            disabled={isLoading || !enabled}
            onBlur={(e) => {
              handleChange();
              e.preventDefault();
            }}
            labelId="demo-select-small-label"
            id="demo-select-small"
            value={value || "-"}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onChange={onChangeDropDow}
            sx={{
              borderRadius: "2px",
              "& .MuiSelect-select": {
                padding: "2px",
              },
              width: value === "" ? "150px" : "fit-content",
              pl: "5px",
            }}
          >
            {status &&
              status?.map((e, index) => (
                <MenuItem
                  value={e.value}
                  key={index}
                  defaultChecked={index === 0}
                >
                  <Stack spacing={1} direction={"row"} alignItems={"center"}>
                    <Typography
                      width={8}
                      height={8}
                      bgcolor={e.color}
                      borderRadius={4}
                    />
                    <Typography
                      variant="subtitle1"
                      color={e.color}
                      fontSize="14px"
                    >
                      {e.name}
                    </Typography>
                  </Stack>
                </MenuItem>
              ))}
          </Select>
        }
      </FormControl>
    </Box>
  );
};

export default EditableStatusDropDow;
