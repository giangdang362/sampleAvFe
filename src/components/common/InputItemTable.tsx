import { FormControl, FormControlProps, Input } from "@mui/material";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

interface InputItemTableProps<T extends FieldValues>
  extends FormControlProps<"input"> {
  name: Path<T>;
  control: Control<T>;
  row?: number;
}

function InputItemTable<T extends FieldValues>({
  name,
  control,
  row,
  ...props
}: InputItemTableProps<T>): React.JSX.Element {
  return (
    <FormControl {...props}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          return (
            <Input
              sx={{
                "&::before": {
                  content: "unset",
                },
              }}
              {...field}
              rows={row}
            />
          );
        }}
      />
    </FormControl>
  );
}

export default InputItemTable;
