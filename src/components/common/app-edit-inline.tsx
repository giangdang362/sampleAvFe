import {
  Box,
  BoxProps,
  SxProps,
  Theme,
  Typography,
  TypographyProps,
} from "@mui/material";
import { ChangeEvent, FC, useRef, useState } from "react";
import NumericFormatCustom from "./Input-number-format";
import UserTextField from "./UserTextField";
import { useIsUser } from "@/services/helpers";
import { usePathname } from "next/navigation";
import { paths } from "@/paths";

export interface EditableTypographyProps extends Omit<TypographyProps, "sx"> {
  value: string | number;
  enabled?: boolean;
  editLabel?: string;
  suffixValue?: string;
  confirmEditLabel?: string;
  cancelEditLabel?: string;
  onEditingFinish?: (value: string) => void | Promise<void>;
  wrapperProps?: BoxProps;
  iconSize?: string | number;
  sx?: SxProps<Theme>;
  textFieldSx?: SxProps<Theme>;
  textFieldInputSx?: SxProps<Theme>;
  maxLength?: number;
  typeInput?: string;
  onChangeText: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  isHoverInput?: boolean;
}

const EditableTypography: FC<EditableTypographyProps> = ({
  value,
  enabled = true,
  onEditingFinish,
  wrapperProps,
  suffixValue,
  sx,
  textFieldSx,
  textFieldInputSx,
  typeInput,
  onChangeText,
  isHoverInput = true,
  ...rest
}) => {
  const isUser = useIsUser();
  const path = usePathname();
  const checkPathCanEdit = !path.includes(paths.admin.detailProduct);
  const inputRef = useRef<HTMLInputElement>(null);
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
        <UserTextField
          InputProps={{
            disableUnderline: true,
            inputComponent:
              typeInput === "number" ? (NumericFormatCustom as any) : undefined,
          }}
          inputProps={{
            pattern: typeInput === "number" ? "[0-9]*[.,]?[0-9]*" : undefined,
          }}
          variant="standard"
          onChange={(e) => {
            onChangeText(e);
          }}
          onBlur={(e) => {
            handleChange();
            e.preventDefault();
          }}
          type={typeInput === "number" ? "number" : "text"}
          inputRef={inputRef}
          defaultValue={value}
          sx={[
            {
              width: "100%",
              "& .MuiInputBase-input": {
                py: 0,
                px: "2px",
                border: 0,
                mx: 0,
                fontSize: "14px",
                ...textFieldInputSx,
              },
              "&:hover:not(.Mui-disabled):before": {
                border: "none",
              },
              "&:after": {
                border: "none",
              },
              "&.Mui-focused:before": {
                border: "none",
              },
              "& input": {
                borderRadius: "2px",
                padding: "0",
              },
              "& input:focus-visible": {
                outline: "1px solid #212121",
              },
              fontSize: "14px",
              fontFamily:
                "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'",
            },
            ...(Array.isArray(textFieldSx) ? textFieldSx : [textFieldSx]),
          ]}
          autoFocus
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleChange();
              e.preventDefault();
            }
          }}
        />
      ) : (
        <Box
          onClick={(e) => {
            setIsEditMode(true);
            e.stopPropagation();
          }}
          sx={{
            width: "100%",
            "&:hover": {
              boxShadow: isHoverInput ? "0 0 0 0.5px #212121" : "unset",
            },
            borderRadius: "2px",
            cursor: "text",
          }}
        >
          {value !== "" ? (
            <Typography
              lineHeight={"20px"}
              variant="body2"
              {...rest}
              sx={{
                whiteSpace: "pre",
                width: "100%",
                ...sx,
              }}
            >
              {value}
              {suffixValue}
            </Typography>
          ) : (
            <Box onClick={() => setIsEditMode(true)}>
              <Typography
                variant="body2"
                color={"#000000DE"}
                lineHeight={"20px"}
                width={"100%"}
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

export default EditableTypography;
