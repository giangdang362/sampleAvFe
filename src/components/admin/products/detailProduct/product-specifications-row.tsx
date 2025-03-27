import * as React from "react";
import { Box, Divider, Typography } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";

export interface PdSpecificationsProps {
  name: string;
  data?: string | React.ReactNode;
}

export function PdSpecificationsRow({
  name,
  data,
}: PdSpecificationsProps): React.JSX.Element {
  return (
    <Box>
      <Grid2
        container
        columns={16}
        columnSpacing={{ xs: 1, sm: 2, md: 2.5 }}
        rowSpacing={{ xs: 1, sm: 2, md: 2.5 }}
        sx={{ marginTop: "20px" }}
      >
        <Grid2 xs={5}>
          <Typography
            sx={{ color: "GrayText", marginRight: "" }}
            variant="body2"
          >
            {name}
          </Typography>
        </Grid2>
        <Grid2 xs={11}>
          {typeof data === "string" ? (
            <Typography variant="body2">{data}</Typography>
          ) : (
            data
          )}
        </Grid2>
      </Grid2>
      <Divider />
    </Box>
  );
}
