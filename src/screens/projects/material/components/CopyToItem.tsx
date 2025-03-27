import { IconButton, Stack, Typography } from "@mui/material";
import React from "react";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

type Props = {
  onClick: () => void;
  name: string;
  noIcon?: boolean;
  backgroundColor?: boolean;
};
export default function CopyToItem(props: Props) {
  const bgColor = "var(--mui-palette-action-selected)";

  return (
    <>
      <Stack
        sx={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "20px",
          p: 1,
          cursor: "pointer",
          ":hover": { backgroundColor: bgColor },
          backgroundColor: props.backgroundColor ? bgColor : "",
          borderRadius: "4px",
        }}
        onClick={props.onClick}
      >
        <Stack sx={{ flexDirection: "row", alignItems: "center" }}>
          <BusinessCenterIcon sx={{ marginRight: "8px", color: "GrayText" }} />
          <Typography>{props.name}</Typography>
        </Stack>
        {!props.noIcon && (
          <IconButton aria-label="icon button">
            <ArrowForwardIosIcon sx={{ color: "GrayText" }} fontSize="small" />
          </IconButton>
        )}
      </Stack>
    </>
  );
}
