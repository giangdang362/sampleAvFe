import * as React from "react";
import { Box, Stack, Typography } from "@mui/material";

interface AppItemImageProps {
  imageLink?: string;
  title?: string;
  height?: number;
  width?: number;
}

export function AppItemImage({
  title,
  height = 46,
  width = 46,
}: AppItemImageProps): React.JSX.Element {
  return (
    <Stack sx={{ alignItems: "center" }} direction="row" spacing={1}>
      <Box
        component="img"
        sx={{
          height: height,
          width: width,
          maxHeight: { xs: 100, md: 100 },
          maxWidth: { xs: 100, md: 100 },
          borderRadius: "4px",
        }}
        alt="The house from the offer."
        src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&w=350&dpr=2"
      />
      <Typography variant="body1">{title}</Typography>
    </Stack>
  );
}
