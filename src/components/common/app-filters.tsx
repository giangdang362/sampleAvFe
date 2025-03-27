"use client";

import * as React from "react";
import { useState } from "react";
// import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { Box, SelectChangeEvent } from "@mui/material";
// import InputAdornment from "@mui/material/InputAdornment";
// import OutlinedInput from "@mui/material/OutlinedInput";
// import { MagnifyingGlass as MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";

import { AppSelect } from "./app-select";

export interface Options {
  value: string;
  label: string;
}

export function AppFilters(): React.JSX.Element {
  const options = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];
  const [selectedValue, setSelectedValue] = useState("");

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedValue(event.target.value);
  };

  const nameRow = [
    "Product Name",
    "Supplier",
    "Created By",
    "Product Type",
    "Created",
  ];
  // const [isAcc, setIsAcc] = useState(false);

  // const handleSortClick = () => {
  //   setIsAcc(!isAcc);
  // };

  return (
    <Box sx={{}}>
      {/* <Stack direction="row" alignItems="center">
        <OutlinedInput
          defaultValue=""
          fullWidth
          placeholder="Search"
          endAdornment={
            <InputAdornment position="start">
              <MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
            </InputAdornment>
          }
          sx={{
            maxWidth: "300px",
            maxHeight: "40px",
            borderRadius: "4px",
            marginRight: 2,
          }}
        />
        <Button
          startIcon={<FilterAltIcon />}
          variant="text"
          onClick={handleSortClick}
          aria-label="icon button"
          sx={{
            marginRight: 1,
            backgroundColor: isAcc ? "gainsboro" : "Background",
          }}
        >
          Filter
        </Button>
      </Stack> */}
      <Box>
        {nameRow?.map((item) => (
          <AppSelect
            value={selectedValue}
            onChange={handleChange}
            options={options}
            label={item}
            key={item}
          />
        ))}
      </Box>
    </Box>
  );
}
