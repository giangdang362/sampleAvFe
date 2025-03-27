import React from "react";
import { FormControl, type FormControlProps } from "@mui/material";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import UserTextField, { UserTextFieldProps } from "../UserTextField";
import NumericFormatCustom from "../Input-number-format";

interface InputFormProps<T extends FieldValues> extends FormControlProps {
  name: Path<T>;
  label: string;
  control: Control<T>;
  multiline?: boolean;
  maxRow?: number;
  row?: number;
  inputRef?:
    | React.MutableRefObject<HTMLInputElement | null>
    | ((ref: HTMLInputElement | null) => void);
  textFieldProps?: Omit<UserTextFieldProps, "inputRef">;
  inputMode?:
    | "search"
    | "text"
    | "none"
    | "tel"
    | "url"
    | "email"
    | "numeric"
    | "decimal";
  endAdornment?: React.ReactNode;
  startAdornment?: React.ReactNode;
  type?: React.HTMLInputTypeAttribute;
}
function InputForm<T extends FieldValues>({
  name,
  label,
  control,
  multiline,
  maxRow,
  row,
  inputRef,
  textFieldProps,
  endAdornment,
  startAdornment,
  inputMode = "text",
  type = "text",
  ...props
}: InputFormProps<T>): React.JSX.Element {
  const labelId = `${name}-label`;

  return (
    <FormControl {...props}>
      <Controller
        control={control}
        name={name}
        render={({
          field: { ref: setRef, ...field },
          fieldState: { error },
        }) => {
          return (
            <UserTextField
              type={type}
              disabled={props.disabled}
              variant="outlined"
              size="medium"
              placeholder={props.placeholder}
              required={props.required}
              label={label}
              inputRef={(ref) => {
                setRef(ref);
                if (inputRef) {
                  if (typeof inputRef === "function") {
                    inputRef(ref);
                  } else {
                    inputRef.current = ref;
                  }
                }
              }}
              InputLabelProps={{ id: labelId }}
              {...field}
              helperText={error ? error.message : null}
              error={!!error}
              multiline={multiline}
              maxRows={maxRow}
              rows={row}
              {...textFieldProps}
              InputProps={{
                ...textFieldProps?.InputProps,
                endAdornment: endAdornment ? endAdornment : "",
                startAdornment: startAdornment ? startAdornment : "",
                inputComponent:
                  inputMode === "decimal"
                    ? (NumericFormatCustom as any)
                    : undefined,
              }}
              inputProps={{
                ...textFieldProps?.inputProps,
                inputMode,
                pattern:
                  inputMode === "decimal" ? "[0-9]*[.,]?[0-9]*" : undefined,
              }}
            />
          );
        }}
      />
    </FormControl>
  );
}

export default InputForm;
