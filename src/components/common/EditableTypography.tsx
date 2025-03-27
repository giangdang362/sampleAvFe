import {
  Box,
  BoxProps,
  Skeleton,
  SkeletonProps,
  SxProps,
  TextField,
  TextFieldProps,
  Theme,
  Tooltip,
  Typography,
  TypographyProps,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { FC, useEffect, useRef, useState } from "react";

export interface EditableTypographyProps extends Omit<TypographyProps, "sx"> {
  value: string;
  placeholder?: string;
  enabled?: boolean;
  editLabel?: string;
  onEditingFinish?: (
    value: string,
  ) => void | { error: string } | Promise<void | { error: string }>;
  wrapperProps?: BoxProps;
  sx?: SxProps<Theme>;
  textFieldSx?: SxProps<Theme>;
  textFieldInputSx?: SxProps<Theme>;
  textFieldProps?: TextFieldProps;
  loading?: boolean;
  loadingSkeletonProps?: SkeletonProps;
}

const EditableTypography: FC<EditableTypographyProps> = ({
  value,
  placeholder,
  enabled = true,
  editLabel,
  onEditingFinish,
  wrapperProps,
  sx,
  textFieldSx,
  textFieldInputSx,
  textFieldProps,
  loading: nonEditLoading,
  loadingSkeletonProps,
  ...rest
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingValue, setLoadingValue] = useState<string>();
  const [isError, setIsError] = useState(false);

  const handleChange = async () => {
    const inputValue = inputRef.current?.value;

    if (typeof inputValue === "string" && inputValue !== value) {
      let loading = true;
      requestAnimationFrame(() => {
        if (loading) {
          setIsLoading(true);
          setLoadingValue(inputValue);
        }
      });

      const result = await onEditingFinish?.(inputValue);
      loading = false;
      setIsLoading(false);

      if (result) {
        enqueueSnackbar(result.error, {
          variant: "error",
          preventDuplicate: true,
        });
        setIsError(true);
        return;
      }
    }
    setIsEditMode(false);
  };

  useEffect(() => {
    if (!isLoading) {
      setLoadingValue(undefined);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isEditMode) {
      setIsError(false);
    }
  }, [isEditMode]);

  useEffect(() => {
    if (isError) {
      inputRef.current?.focus();
    }
  }, [isError, isLoading]);

  const displayValue = loadingValue ?? value;

  return (
    <Box display="flex" alignItems="center" {...wrapperProps}>
      {enabled && isEditMode && !isLoading ? (
        <TextField
          inputRef={inputRef}
          placeholder={placeholder}
          {...textFieldProps}
          defaultValue={value}
          sx={[
            (theme) => ({
              "& .MuiInputBase-root": {
                pr: 0.5,
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderRadius: 0.25,
              },
              "& .MuiInputBase-input": [
                {
                  height: "initial",
                  padding: theme.spacing(1),
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
          error={!!isError}
          onChange={() => setIsError(false)}
          onKeyDown={(e) => e.key === "Enter" && handleChange()}
          onBlur={handleChange}
        />
      ) : (
        <Tooltip title={enabled && !isLoading && displayValue ? editLabel : ""}>
          <Typography
            {...rest}
            sx={{
              whiteSpace: "pre",
              mr: 0.5,
              my: 1,
              opacity: `calc(${!displayValue ? "var(--mui-opacity-inputPlaceholder)" : 1}
                * ${isLoading ? 0.65 : 1})`,
              ...sx,
            }}
            {...(enabled && !isLoading
              ? {
                  role: "button",
                  tabIndex: 0,
                  onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setIsEditMode(true);
                      e.preventDefault();
                    }
                  },
                  onClick: () => setIsEditMode(true),
                }
              : undefined)}
          >
            {nonEditLoading ? (
              <Skeleton {...loadingSkeletonProps} />
            ) : (
              displayValue || placeholder || " "
            )}
          </Typography>
        </Tooltip>
      )}
    </Box>
  );
};

export default EditableTypography;
