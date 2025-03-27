import * as React from "react";
import GroupsIcon from "@mui/icons-material/Groups";
import LockIcon from "@mui/icons-material/Lock";
import { Chip } from "@mui/material";

interface CustomChipProps {
  type: "publis" | "private";
}

function CustomChip({ type }: CustomChipProps): React.JSX.Element {
  return (
    <Chip
      label={type === "publis" ? "Published" : "Private"}
      avatar={type === "publis" ? <GroupsIcon /> : <LockIcon />}
    />
  );
}

export default CustomChip;
