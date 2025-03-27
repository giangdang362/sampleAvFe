import {
  CircularProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListProps,
  Modal,
  Popover,
  PopoverProps,
  styled,
} from "@mui/material";
import {
  bindDialog,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import AddPinterestDialog from "./AddPinterestDialog";
import { useGetUploadFiles } from "@/hooks/upload-files";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderOpen } from "@/lib/fas/pro-light-svg-icons";
import { faPinterestP } from "@fortawesome/free-brands-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

export interface AddImagePopoverProps extends Omit<PopoverProps, "onClose"> {
  onFileImagesSelected: (files: File[]) => void | Promise<void>;
  onPinterestImagesSelected: (urls: string[]) => void | Promise<void>;
  onClose?: () => void;
  listProps?: ListProps;
  additionalItems?: {
    icon: IconProp;
    label: string;
    onClick: () => void | Promise<void>;
  }[];
}

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  color: "var(--mui-palette-primary-main)",
  marginRight: `${theme.spacing(1.5)} !important`,
}));

const AddImagePopover: React.FC<AddImagePopoverProps> = ({
  onFileImagesSelected,
  onPinterestImagesSelected,
  onClose,
  listProps,
  additionalItems,
  ...rest
}) => {
  const t = useTranslations("addImages");
  const getUploadFiles = useGetUploadFiles();
  const pinterestDialogState = usePopupState({
    variant: "dialog",
    popupId: "add-pinterest-image-dialog",
  });

  const [isFullScreenLoading, setIsFullScreenLoading] = useState(false);
  const handleAddFromFiles = () => {
    getUploadFiles(
      async (files) => {
        onClose?.();
        setIsFullScreenLoading(true);
        await onFileImagesSelected([...files]);
        setIsFullScreenLoading(false);
      },
      { type: "image", maxSize: 5 },
    );
  };

  return (
    <>
      <Popover {...rest} onClose={onClose}>
        <List {...listProps}>
          <ListItemButton onClick={handleAddFromFiles}>
            <StyledListItemIcon>
              <FontAwesomeIcon icon={faFolderOpen} />
            </StyledListItemIcon>
            <ListItemText primary={t("addFromMyFiles")} />
          </ListItemButton>
          <ListItemButton
            {...bindTrigger(pinterestDialogState)}
            onClick={(e) => {
              bindTrigger(pinterestDialogState).onClick(e);
              onClose?.();
            }}
          >
            <StyledListItemIcon>
              <FontAwesomeIcon icon={faPinterestP} />
            </StyledListItemIcon>
            <ListItemText primary={t("addFromPinterest")} />
          </ListItemButton>

          {additionalItems?.map((listItem) => (
            <ListItemButton
              key={listItem.label}
              onClick={async () => {
                onClose?.();
                setIsFullScreenLoading(true);
                await listItem.onClick();
                setIsFullScreenLoading(false);
              }}
            >
              <StyledListItemIcon>
                <FontAwesomeIcon icon={listItem.icon} />
              </StyledListItemIcon>
              <ListItemText primary={listItem.label} />
            </ListItemButton>
          ))}
        </List>
      </Popover>

      <AddPinterestDialog
        onAdd={onPinterestImagesSelected}
        {...bindDialog(pinterestDialogState)}
      />

      <Modal
        open={isFullScreenLoading}
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <CircularProgress sx={{ color: "var(--mui-palette-common-white)" }} />
      </Modal>
    </>
  );
};

export default AddImagePopover;
