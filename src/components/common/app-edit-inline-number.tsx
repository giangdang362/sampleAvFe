import {
  Box,
  BoxProps,
  SxProps,
  TextField,
  Theme,
  Typography,
  TypographyProps,
} from "@mui/material";
import { ChangeEvent, FC, useRef, useState } from "react";

export interface EditableTypographyProps extends Omit<TypographyProps, "sx"> {
  value: number;
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
  onChangeText: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}

const EditableNumberTypography: FC<EditableTypographyProps> = ({
  value,
  enabled = true,
  onEditingFinish,
  wrapperProps,
  sx,
  textFieldSx,
  textFieldInputSx,
  onChangeText,
  suffixValue,
  ...rest
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = async () => {
    if (typeof inputRef.current?.value === "number") {
      setIsLoading(true);
      await onEditingFinish?.(inputRef.current?.value);
      setIsLoading(false);
    }
    setIsEditMode(false);
  };

  return (
    <Box display="flex" alignItems="center" {...wrapperProps}>
      {enabled && isEditMode ? (
        <TextField
          type="number"
          onChange={onChangeText}
          onBlur={(e) => {
            handleChange();
            e.preventDefault();
          }}
          inputProps={{ style: { textAlign: "right" } }}
          inputRef={inputRef}
          defaultValue={value}
          sx={[
            (theme) => ({
              "& .MuiInputBase-root": {
                pr: 0.1,
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderRadius: 0.25,
              },
              "& .MuiInputBase-input": [
                {
                  height: "initial",
                  padding: theme.spacing(0.25),
                },
                ...(Array.isArray(sx) ? sx : [sx]),
                ...(Array.isArray(textFieldInputSx)
                  ? textFieldInputSx
                  : [textFieldInputSx]),
              ],
            }),
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
        <Box onClick={() => setIsEditMode(true)}>
          {value !== 0 ? (
            <Typography
              {...rest}
              sx={{
                textAlign: "right",
                whiteSpace: "pre",
                mr: 0.5,
                my: 1,
                ...sx,
              }}
            >
              {value}
              {suffixValue}
            </Typography>
          ) : (
            <Box onClick={() => setIsEditMode(true)}>
              <Typography>...</Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default EditableNumberTypography;
