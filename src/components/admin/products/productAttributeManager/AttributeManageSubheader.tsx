import FaIconButton from "@/components/common/FaIconButton";
import { faChevronDown, faPlus, faTrash } from "@/lib/fas/pro-solid-svg-icons";
import { Box, Collapse, List, ListItem, ListItemProps } from "@mui/material";
import { useTranslations } from "next-intl";
import AttributeManageInput from "./AttributeManageInput";
import { useConfirmDialog } from "@/components/common/UserDialog";
import { faTrashCan } from "@/lib/fas/pro-regular-svg-icons";
import { MaybePromise } from "@reduxjs/toolkit/dist/query/tsHelpers";
import AttributeManageItem from "./AttributeManageItem";
import { useLayoutEffect, useRef, useState } from "react";
import AttributeManageAddNew, {
  AttributeManageAddNewRef,
} from "./AttributeManageAddNew";

export interface AttributeManageSubheaderProps
  extends Omit<ListItemProps, "id" | "onChange"> {
  id: number;
  value: string;
  items: API.SlugItem[];
  onCreate?: (parentId: number, value: string) => MaybePromise<void>;
  onChange?: (id: number, newValue: string) => void;
  onDelete?: (id: number) => MaybePromise<void>;
}

const TRANSITION_DURATION = 300; // ms

const AttributeManageSubheader: React.FC<AttributeManageSubheaderProps> = ({
  id,
  value,
  items,
  onCreate,
  onChange,
  onDelete,
  sx,
  ...rest
}) => {
  const t = useTranslations("products");
  const tCommon = useTranslations("common");

  const addNewRef = useRef<AttributeManageAddNewRef>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [childrenOpen, setChildrenOpen] = useState(false);

  const handleCreate = async (value: string) => {
    setIsCreating(true);
    await onCreate?.(id, value);
    setIsCreating(false);
    setIsAddingNew(false);
    setChildrenOpen(true);
  };

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

  useLayoutEffect(() => {
    if (!items.length) {
      setChildrenOpen(false);
    }
  }, [items.length]);

  useLayoutEffect(() => {
    setChildrenOpen(false);
    setIsAddingNew(false);
    setIsCreating(false);
  }, [id]);

  return (
    <>
      <ListItem
        disablePadding
        {...rest}
        sx={[
          { alignItems: "baseline", gap: 3 },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <FaIconButton
          icon={faChevronDown}
          title={
            items.length
              ? tCommon(childrenOpen ? "collapse" : "expand")
              : undefined
          }
          tooltipBottomOffset={-14}
          wrapperProps={{
            visibility: items.length ? "visible" : "hidden",
            sx: {
              p: 1,
              "& .svg-inline--fa": {
                transition: `transform ${TRANSITION_DURATION}ms`,
                transform: `rotate(${childrenOpen || !items.length ? 180 : 0}deg)`,
              },
            },
          }}
          disabled={!items.length}
          aria-expanded={items.length ? childrenOpen : undefined}
          onClick={() => setChildrenOpen((prev) => !prev)}
        />

        <AttributeManageInput
          flex={1}
          p={1}
          label={`${tCommon("edit")} '${value}'`}
          value={value}
          onBlurChange={(newValue) =>
            newValue !== value && onChange?.(id, newValue)
          }
          sx={{ "& .MuiInputBase-input": { fontWeight: "500" } }}
        />

        <Box p={1}>
          <FaIconButton
            icon={faPlus}
            title={tCommon("new")}
            tooltipBottomOffset={0}
            onClick={() => {
              setIsAddingNew(true);
              addNewRef.current?.focusInput();
            }}
          />
          <FaIconButton
            icon={faTrash}
            title={tCommon("delete")}
            tooltipBottomOffset={0}
            onClick={handleDelete}
          />
        </Box>
      </ListItem>
      {isAddingNew && (
        <AttributeManageAddNew
          ref={addNewRef}
          onConfirm={handleCreate}
          onCancel={() => setIsAddingNew(false)}
          sx={{ borderTop: "1px solid var(--mui-palette-divider)" }}
          loading={isCreating}
          padding
        />
      )}
      {!!items.length && (
        <Collapse in={childrenOpen} timeout={TRANSITION_DURATION} unmountOnExit>
          <List disablePadding>
            {items.map((item) => (
              <AttributeManageItem
                key={item.id}
                id={item.id}
                value={item.enName}
                onChange={onChange}
                onDelete={onDelete}
                padding
                sx={{ borderTop: "1px solid var(--mui-palette-divider)" }}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

export default AttributeManageSubheader;
