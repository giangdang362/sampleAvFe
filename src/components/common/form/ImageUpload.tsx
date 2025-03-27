"use client";

import * as React from "react";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { Box, Typography } from "@mui/material";

export default function ImageUpload(): React.JSX.Element {
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
        <UploadFileIcon sx={{ fontSize: 40 }} />
        <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
          <span style={{ textDecoration: "underline" }}>Click to upload</span>{" "}
          or drag and drop
        </Typography>
        <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
          JPG, JPEG, or PNG only
        </Typography>
      </Box>
    </Box>
  );
}
