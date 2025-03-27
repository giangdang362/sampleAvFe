import * as React from "react";
import { Box, Stack, Typography } from "@mui/material";

type CustomSpecificationProps = {
  label: string;
  detail?: string;
};

export function CustomSpecification({
  label,
  detail,
}: CustomSpecificationProps): React.JSX.Element {
  return (
    <Box
      sx={{
        p: "16px",
        border: "1px solid",
        borderRadius: "8px",
        borderColor: "grey.300",
        marginTop: "16px",
      }}
    >
      <Stack sx={{ flexDirection: "row", marginBottom: "16px" }}>
        <Typography sx={{ marginRight: "50px", minWidth: 50 }}>
          Label
        </Typography>
        <Typography>{label}</Typography>
      </Stack>
      <Stack sx={{ flexDirection: "row" }}>
        <Typography sx={{ marginRight: "50px", minWidth: 50 }}>
          Details
        </Typography>
        <Typography>{detail}</Typography>
      </Stack>
    </Box>
  );
}
