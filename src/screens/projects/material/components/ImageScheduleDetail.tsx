import SideDialog from "@/components/common/side-dialog";
import { pathFile } from "@/config/api";
import { Box, Checkbox, Stack } from "@mui/material";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import ActionToProjectFileDialog from "@/components/admin/projects/ActionToProjectFileDialog";
import {
  useAddPinboardMutation,
  useLazyGetPinboardDetailsQuery,
  useUpdatePinboardMutation,
} from "@/services/pinboards";

export interface ImageScheduleDetailProps {
  handleClose: () => void;
  open: boolean;
  title: string;
  images?: {
    id: string;
    path: string;
  }[];
}

const ImageScheduleDetail = ({
  handleClose,
  open,
  title,
  images,
}: ImageScheduleDetailProps) => {
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [updatePinboard] = useUpdatePinboardMutation();
  const [getPinboard] = useLazyGetPinboardDetailsQuery();
  const [addImageToPinboard] = useAddPinboardMutation();
  const handleCheckboxChange =
    (ImageId: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        setSelectedImageIds((prevSelectedImageIds) => [
          ...prevSelectedImageIds,
          ImageId,
        ]);
      } else {
        setSelectedImageIds((prevSelectedImageIds) =>
          prevSelectedImageIds?.filter((id) => id !== ImageId),
        );
      }
    };

  const handleClickOpenAdd = () => {
    setOpenAdd(true);
  };
  const handleCloseAdd = () => {
    setOpenAdd(false);
  };

  const handleAdd = async (pinboardId: string, sectionId: string) => {
    await addImageToPinboard({
      pinboardId,
      qd: {
        sectionId,
        fileIds: selectedImageIds,
      },
    })
      .unwrap()
      .then(async () => {
        const pinboard = (await getPinboard({ id: pinboardId })).data;
        if (pinboard && pinboard.sections[0].id === sectionId) {
          let newThumbnail: string | undefined;
          if (pinboard.thumbnailId !== pinboard.sections[0].images[0].id) {
            newThumbnail = pinboard.sections[0].images[0].id;
          }
          await updatePinboard({ id: pinboardId, thumbnailId: newThumbnail });
        }
      });
  };

  const t = useTranslations("common");
  return (
    <SideDialog
      title={title}
      open={open}
      closeOnConfirm={false}
      confirmButton={{
        title: t("copy_to"),
        disabled: !selectedImageIds.length,
        onClick: handleClickOpenAdd,
      }}
      cancelButton={{ title: t("cancel") }}
      onClose={handleClose}
    >
      <Stack direction={"row"} spacing={1} flexWrap={"wrap"}>
        {images?.map((image) => (
          <Box
            className="ImgDnD-ImgContainer"
            key={image.id}
            position={"relative"}
            sx={{
              height: 110,
              width: 110,
              aspectRatio: 1,
              "&:hover .marks-box": { opacity: 0.5 },
              "&:hover .marks-box-1": { opacity: 1 },
              "&:hover .marks-box-2": { opacity: 1 },
            }}
          >
            <Box
              className="ImgDnD-Img"
              component="img"
              sx={{
                display: "block",
                objectFit: "cover",
                width: "100%",
                height: "100%",
                borderRadius: "4px",
              }}
              alt=""
              src={`${pathFile}/${image.path}` ?? ""}
            />

            <Box
              className={"marks-box"}
              position={"absolute"}
              top={0}
              bottom={0}
              right={0}
              left={0}
              bgcolor={"black"}
              sx={{
                opacity: 0,
                transition: "opacity 200ms",
                borderRadius: "4px",
                alignItems: "center",
                alignContent: "center",
              }}
            />

            <Box position={"absolute"} sx={{ left: 0, top: 0 }}>
              <Checkbox
                sx={{
                  opacity: selectedImageIds.includes(image.id) ? null : 0,
                  color: "#FFFFFF",
                  "&.Mui-checked": {
                    color: "#FFFFFF",
                  },
                }}
                className={"marks-box-1"}
                size="small"
                checked={selectedImageIds.includes(image.id)}
                onChange={handleCheckboxChange(image.id)}
              />
            </Box>
          </Box>
        ))}

        <ActionToProjectFileDialog
          type="pinboard"
          action="copy"
          open={openAdd}
          onClose={handleCloseAdd}
          onSectionSelected={handleAdd}
        />
      </Stack>
    </SideDialog>
  );
};

export default ImageScheduleDetail;
