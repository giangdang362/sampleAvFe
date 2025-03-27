import { paths } from "@/paths";
import { useIsUser } from "@/services/helpers";
import {
  Box,
  BoxProps,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  SxProps,
  Theme,
  Typography,
  TypographyProps,
} from "@mui/material";
import { usePathname } from "next/navigation";
import { FC, useRef, useState } from "react";

export interface EditableTypographyProps extends Omit<TypographyProps, "sx"> {
  value: string;
  enabled?: boolean;
  onEditingFinish?: (value: string) => void | Promise<void>;
  wrapperProps?: BoxProps;
  sx?: SxProps<Theme>;
  onChangeDropDow: (e: SelectChangeEvent) => void;
  dataDropDow: API.SlugItem[];
  isGroupView?: boolean;
}

const EditableDropDow: FC<EditableTypographyProps> = ({
  value,
  enabled = true,
  onEditingFinish,
  wrapperProps,
  onChangeDropDow,
  sx,
  dataDropDow,
  isGroupView = false,
  ...rest
}) => {
  const isUser = useIsUser();
  const inputRef = useRef<HTMLInputElement>(null);
  const path = usePathname();
  const checkPathCanEdit = !path.includes(paths.admin.detailProduct);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = async () => {
    if (typeof inputRef.current?.value === "string") {
      setIsLoading(true);
      await onEditingFinish?.(inputRef.current?.value);
      setIsLoading(false);
    }
    setIsEditMode(false);
  };

  return (
    <Box display="flex" alignItems="center" {...wrapperProps}>
      {enabled && isEditMode && (checkPathCanEdit || !isUser) ? (
        <>
          <FormControl sx={{ width: "100%" }} size="small">
            {
              <Select
                native={isGroupView === true ? true : false}
                disabled={isLoading}
                autoFocus
                defaultValue=""
                onBlur={(e) => {
                  handleChange();
                  e.preventDefault();
                }}
                labelId="demo-select-small-label"
                id="demo-select-small"
                value={value}
                onChange={onChangeDropDow}
                sx={{
                  width: "100%",
                  "& .MuiInputBase-input": {
                    px: "0px",
                    py: 0,
                    border: 0,
                    m: 0,
                  },
                  borderRadius: "2px",
                  "& .MuiSelect-select": {
                    px: "0px",
                    py: 0,
                    border: 0,
                  },
                  border: "none",
                  "&:hover:not(.Mui-disabled):before": {
                    border: "none",
                  },
                  "&:before": {
                    border: "none",
                  },
                  "&:after": {
                    border: "none",
                  },
                  "&.Mui-focused:after": {
                    border: "#c4c4c4",
                  },
                  "&.Mui-focused:before": {
                    border: "none",
                  },
                  "&.Mui-visited": {
                    border: "none",
                  },
                  "& input": {
                    borderRadius: "2px",
                    padding: "2px 4px",
                  },
                  "& input:focus-visible": {
                    outline: "1px solid #212121",
                  },
                  fontSize: "14px",
                  fontFamily:
                    "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'",
                }}
              >
                {isGroupView && (
                  <option aria-label="None" value="">
                    ---
                  </option>
                )}
                {dataDropDow &&
                  dataDropDow?.map((e, index) =>
                    e.children.length <= 0 ? (
                      isGroupView ? (
                        <optgroup label={e.enName} key={index}>
                          <option value={e.enName} key={e?.id}>
                            {e.enName}
                          </option>
                        </optgroup>
                      ) : (
                        <MenuItem
                          sx={{ px: "8px" }}
                          value={e.enName}
                          key={e?.id}
                        >
                          <Typography px="4px" variant="body2">
                            {e.enName}
                          </Typography>
                        </MenuItem>
                      )
                    ) : (
                      <>
                        <optgroup label={e.enName}>
                          {e.children?.map((data, index) => (
                            <option value={data.enName} key={index}>
                              <Typography variant="body2">
                                {data.enName}
                              </Typography>
                            </option>
                          ))}
                        </optgroup>
                      </>
                    ),
                  )}
              </Select>
            }
          </FormControl>
        </>
      ) : (
        <Box
          onClick={() => setIsEditMode(true)}
          sx={{
            width: "100%",
            "&:hover": {
              boxShadow: "0 0 0 0.5px #212121",
            },
            borderRadius: "2px",
          }}
        >
          {value !== "" ? (
            <Typography
              lineHeight={"20px"}
              variant="body2"
              {...rest}
              sx={{
                whiteSpace: "pre",
                ...sx,
              }}
            >
              {value}
            </Typography>
          ) : (
            <Box onClick={() => setIsEditMode(true)}>
              <Typography
                variant="body2"
                lineHeight={"20px"}
                color={"#000000DE"}
              >
                ...
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default EditableDropDow;
