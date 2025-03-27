import FaIconButton from "@/components/common/FaIconButton";
import { faTrash } from "@/lib/fas/pro-solid-svg-icons";
import { Box, ListItem, ListItemProps } from "@mui/material";
import { useTranslations } from "next-intl";
import AttributeManageInput from "./AttributeManageInput";
import { useConfirmDialog } from "@/components/common/UserDialog";
import { faTrashCan } from "@/lib/fas/pro-regular-svg-icons";
import { MaybePromise } from "@reduxjs/toolkit/dist/query/tsHelpers";

export interface AttributeManageItemProps
  extends Omit<ListItemProps, "id" | "onChange"> {
  id: number;
  value: string;
  onChange?: (id: number, newValue: string) => void;
  onDelete?: (id: number) => MaybePromise<void>;
  padding?: boolean;
}

const AttributeManageItem: React.FC<AttributeManageItemProps> = ({
  id,
  value,
  onChange,
  onDelete,
  padding,
  sx,
  ...rest
}) => {
  const t = useTranslations("products");
  const tCommon = useTranslations("common");

  const { openDialog } = useConfirmDialog();
  const handleDelete = () => {
    openDialog({
      type: "confirm",
      mainColor: "error",
      title: t("delete_attribute"),
      content: tCommon.rich("deleteContent", { name: value }),
      confirmButtonLabel: t("delete_attribute"),
      icon: faTrashCan,
      onConfirm: async () => await onDelete?.(id),
    });
  };

  return (
    <ListItem
      disablePadding
      {...rest}
      sx={[
        { alignItems: "baseline", gap: 3 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {padding && (
        <FaIconButton icon={<></>} disabled wrapperProps={{ sx: { p: 1 } }} />
      )}

      <AttributeManageInput
        flex={1}
        p={1}
        label={`${tCommon("edit")} '${value}'`}
        value={value}
        onBlurChange={(newValue) =>
          newValue !== value && onChange?.(id, newValue)
        }
      />

      <Box p={1}>
        {padding && <FaIconButton disabled icon={<></>} />}
        <FaIconButton
          icon={faTrash}
          title={tCommon("delete")}
          tooltipBottomOffset={0}
          onClick={handleDelete}
        />
      </Box>
    </ListItem>
  );
};

export default AttributeManageItem;
