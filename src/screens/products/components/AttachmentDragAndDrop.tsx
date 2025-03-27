"use client";

import * as React from "react";
import { Box, Typography } from "@mui/material";

export default function AttachmentDragAndDrop(): React.JSX.Element {
  return (
    <Box
      flex={1}
      border="1px dashed var(--Input-outlined-stroke, rgba(0, 0, 0, 0.23))"
      borderRadius="4px"
      padding="24px 16px"
    >
      <Box
        width="100%"
        height="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography sx={{ fontSize: 14, fontWeight: 500 }} color={"GrayText"}>
          <span style={{ textDecoration: "underline" }}>Click to upload</span>{" "}
          or drag and drop
        </Typography>
      </Box>
    </Box>
  );
}
