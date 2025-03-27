import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { DatePicker, DatePickerProps } from "@mui/x-date-pickers";

interface DateRangePickerProps
  extends Omit<DatePickerProps<Date>, "label" | "value" | "onChange"> {
  initialStartDate?: Date | null;
  initialEndDate?: Date | null;
  onChange?: (value: { startDate: Date; endDate: Date } | null) => void;
  startLabel?: string;
  endLabel?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  initialStartDate: initialStartDate = null,
  initialEndDate: initialEndDate = null,
  onChange,
  startLabel = "Start Date",
  endLabel = "End Date",
  ...props
}) => {
  const [internalStartDate, setStartDate] = useState<Date | null>(
    initialStartDate,
  );
  const [internalEndDate, setEndDate] = useState<Date | null>(initialEndDate);

  useEffect(() => {
    if (internalStartDate && internalEndDate) {
      onChange?.({ startDate: internalStartDate, endDate: internalEndDate });
    } else {
      onChange?.(null);
    }
  }, [internalStartDate, internalEndDate, onChange]);

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      gap={2}
      sx={{
        "& .MuiSvgIcon-root[data-testid='CalendarIcon']": {
          width: "0.8em",
          height: "0.8em",
        },
        "& .MuiInputAdornment-root > .MuiIconButton-root": {
          padding: 0.5,
        },
      }}
    >
      <DatePicker
        label={startLabel}
        value={internalStartDate}
        onChange={(newValue) => {
          setStartDate(newValue);
        }}
        maxDate={internalEndDate ?? undefined}
        slotProps={{
          textField: {
            inputProps: { readOnly: true },
          },
          field: { clearable: true },
        }}
        {...props}
        sx={[
          {
            width: "170px",
          },
          ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
        ]}
      />
      <DatePicker
        label={endLabel}
        value={internalEndDate}
        onChange={(newValue) => {
          setEndDate(newValue);
        }}
        minDate={internalStartDate ?? undefined}
        slotProps={{
          textField: {
            inputProps: { readOnly: true },
          },
          field: { clearable: true },
        }}
        {...props}
        sx={[
          {
            width: "170px",
          },
          ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
        ]}
      />
    </Box>
  );
};

export default DateRangePicker;
