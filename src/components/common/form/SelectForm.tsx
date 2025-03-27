import React, { type ReactNode } from "react";
import {
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  SelectProps,
  type FormControlProps,
} from "@mui/material";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

interface SelectFormProps<T extends FieldValues> extends FormControlProps {
  name: Path<T>;
  label: string;
  control: Control<T>;
  children: ReactNode;
  selectProps?: Omit<SelectProps, "value" | "onChange">;
}
function SelectForm<T extends FieldValues>({
  name,
  label,
  control,
  children,
  selectProps,
  ...props
}: SelectFormProps<T>): React.JSX.Element {
  const labelId = `${name}-label`;
  return (
    <FormControl {...props} error={props.error}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState: { error } }) => {
          return (
            <>
              <Select
                label={label}
                labelId={labelId}
                {...selectProps}
                {...field}
                value={field.value ?? ""}
              >
                {children}
              </Select>
              {!!error?.message && (
                <FormHelperText error>{error.message}</FormHelperText>
              )}
            </>
          );
        }}
      />
    </FormControl>
  );
}

export default SelectForm;
