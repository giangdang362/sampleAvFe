import { Chip } from "@mui/material";
import React, { FC } from "react";
import GroupsIcon from "@mui/icons-material/Groups";
import LockIcon from "@mui/icons-material/Lock";

interface ProductTypeTagProps {
  type: "private" | "publish";
}

const ProductTypeTag: FC<ProductTypeTagProps> = ({
  type,
}): React.JSX.Element => {
  return (
    <Chip
      label={type === "private" ? "Private" : "Published"}
      avatar={type === "private" ? <LockIcon /> : <GroupsIcon />}
    />
  );
};

export default ProductTypeTag;
