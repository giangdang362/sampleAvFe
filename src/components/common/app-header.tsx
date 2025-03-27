"use client";

import * as React from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, IconButton, Stack, Typography } from "@mui/material";

export type AppHeaderProps = {
  imageLink?: string;
  title?: string;
  buttonLeft?: React.ReactNode;
} & ({ isHaveBack: true; backFun: () => void } | { isHaveBack?: false });

export function AppHeader(Props: AppHeaderProps): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: "1 1 auto" }}>
          <Stack sx={{}} flexDirection="row" alignItems="center">
            {Props.isHaveBack ? (
              <Box
                sx={{
                  borderRadius: "100px",
                  borderWidth: 1,
                  borderColor: "ButtonFace",
                }}
              >
                <IconButton
                  onClick={Props.backFun}
                  aria-label="icon button"
                  sx={{
                    borderRadius: "50%",
                    border: "1px solid",
                    width: 30,
                    height: 30,
                    marginRight: 1,
                  }}
                >
                  <ArrowBackIcon sx={{ color: "GrayText" }} />
                </IconButton>
              </Box>
            ) : null}

            <Typography variant="h6">{Props.title}</Typography>
          </Stack>
        </Stack>
        {Props.buttonLeft}
      </Stack>
    </Stack>
  );
}
