import {
  Box,
  BoxProps,
  FormHelperText,
  InputBaseComponentProps,
  OutlinedInput,
  OutlinedInputProps,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import {
  useRef,
  useState,
  useEffect,
  RefObject,
  MutableRefObject,
} from "react";

export interface AttributeManageInputProps
  extends Omit<BoxProps, "onChange" | "onError"> {
  label?: string;
  value: string;
  onChange?: (newValue: string) => void;
  onBlurChange?: (newValue: string) => void;
  onConfirm?: (newValue: string) => void;
  onError?: (error?: string) => void;
  alwaysInput?: boolean;
  disableDisplayError?: boolean;
  resetOnError?: boolean;
  inputProps?: InputBaseComponentProps;
  inputRef?: RefObject<HTMLInputElement>;
}

const MAX_LENGTH = 250;

const AttributeManageInput: React.FC<AttributeManageInputProps> = ({
  label,
  value,
  onChange,
  onBlurChange,
  onConfirm,
  onError,
  alwaysInput,
  disableDisplayError,
  resetOnError = true,
  inputProps,
  inputRef: externalInputRef,
  sx,
  ...rest
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const blurByEnterRef = useRef(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [error, setError] = useState<string>();
  const tMsg = useTranslations("errorMsg");

  const setErrorAndCallback = (error: string | undefined) => {
    setError(error);
    onError?.(error);
  };

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.value = value;
  }, [value]);

  const validate = () => {
    const newValue = inputRef.current?.value;

    if (!newValue?.length) {
      setErrorAndCallback(tMsg("required"));
      return false;
    }

    if (newValue.length > MAX_LENGTH) {
      setErrorAndCallback(tMsg("tooLong", { count: MAX_LENGTH }));
      return false;
    }

    setErrorAndCallback(undefined);
    return true;
  };

  const handleChange = () => {
    if (!inputRef.current) return;

    const blurByEnter = blurByEnterRef.current;
    blurByEnterRef.current = false;

    const valid = validate();
    if (!valid) {
      if (resetOnError) {
        inputRef.current.value = value;
        setErrorAndCallback(undefined);
      }
      return;
    }

    const newValue = inputRef.current.value;
    inputRef.current.value = value;
    onBlurChange?.(newValue);
    blurByEnter && onConfirm?.(newValue);
  };

  return (
    <Box
      role="button"
      tabIndex={isInputFocused || alwaysInput ? -1 : 0}
      onKeyDown={(e) => {
        if (alwaysInput) return;
        if (document.activeElement === inputRef.current) return;

        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();

          inputRef.current?.focus();
          const valueLength = inputRef.current?.value.length ?? 0;
          inputRef.current?.setSelectionRange(valueLength, valueLength);
        }
      }}
      {...rest}
      sx={[
        {
          "&:focus-visible": {
            outline: "none",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--mui-palette-text-primary)",
            },
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Typography
        variant="body2"
        flex={1}
        component={TypographyInput}
        inputRef={(ref) => {
          inputRef.current = ref;
          if (externalInputRef) {
            (externalInputRef as MutableRefObject<HTMLInputElement>).current =
              ref;
          }
        }}
        inputProps={{
          tabIndex: isInputFocused || alwaysInput ? 0 : -1,
          maxLength: MAX_LENGTH,
          ["aria-label"]: label,
          ...inputProps,
        }}
        onChange={() => {
          if (!inputRef.current) return;

          validate();
          const newValue = inputRef.current.value;
          onChange?.(newValue);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !error) {
            blurByEnterRef.current = true;
            inputRef.current?.blur();
            e.stopPropagation();
          }
        }}
        onFocus={() => setIsInputFocused(true)}
        onBlur={() => {
          setIsInputFocused(false);
          handleChange();
        }}
        error={!!error && !disableDisplayError}
        classes={{ root: isInputFocused ? "Mui-focused" : undefined }}
        sx={
          !alwaysInput
            ? {
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "transparent",
                },
              }
            : undefined
        }
      >
        {value}
      </Typography>

      {!!error && !disableDisplayError && (
        <FormHelperText error sx={{ ml: 1 }}>
          {error}
        </FormHelperText>
      )}
    </Box>
  );
};

export default AttributeManageInput;

const TypographyInput = ({
  children,
  sx,
  ...props
}: OutlinedInputProps & { children?: React.ReactNode }) => {
  const value = children?.toString() ?? "";

  return (
    <OutlinedInput
      {...props}
      size="small"
      fullWidth
      defaultValue={value}
      inputProps={{ className: props.className, ...props.inputProps }}
      sx={[
        { "& .MuiInputBase-input": { px: 1 } },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );
};
