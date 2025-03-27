import { useHref } from "@/hooks/href";
import { paths } from "@/paths";
import { useDeleteProductMutation } from "@/services/products";
import { Stack, Tooltip, IconButton } from "@mui/material";
import Link from "next/link";
import { FC } from "react";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

type ActionColumnProps = {
  row: API.ProductItem;
  handleClickOpen: () => void;
};

const ActionColumn: FC<ActionColumnProps> = ({ handleClickOpen, row }) => {
  const createHref = useHref();
  const [deleteProduct] = useDeleteProductMutation();
  return (
    <Stack
      sx={{
        flexDirection: "row",
        gap: "10px",
        alignItems: "center",
        height: "100%",
      }}
    >
      <Tooltip title="Add To" arrow>
        <IconButton
          aria-label="icon button"
          onClick={(event) => {
            event.stopPropagation();
            handleClickOpen();
          }}
        >
          <AddIcon sx={{ color: "GrayText" }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Edit" arrow>
        <IconButton
          onClick={(event) => {
            event.stopPropagation();
          }}
          aria-label="icon button"
          LinkComponent={Link}
          href={createHref(`${paths.admin.editProduct}?ori_id=${row?.id}`)}
        >
          <EditIcon sx={{ color: "GrayText" }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete" arrow>
        <IconButton
          aria-label="icon button"
          onClick={(event) => {
            deleteProduct({ id: row?.id ?? "" });
            event.stopPropagation();
          }}
        >
          <DeleteIcon sx={{ color: "GrayText" }} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

export default ActionColumn;
