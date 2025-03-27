import * as React from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";

import { type Options } from "./app-filters";

export interface AppSelectProps {
  value?: string;
  onChange: (event: SelectChangeEvent) => void;
  options: Options[];
  label?: string;
}

export function AppSelect({
  value,
  onChange,
  options,
  label,
}: AppSelectProps): React.JSX.Element {
  return (
    <FormControl sx={{ minWidth: 150, marginRight: 1 }} size="small">
      <InputLabel id="demo-select-small-label">{label}</InputLabel>
      <Select
        value={value}
        onChange={onChange}
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        label={label}
        sx={{
          borderRadius: "100px",
        }}
      >
        <MenuItem value="">
          <em>Text Select</em>
        </MenuItem>
        {options?.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
