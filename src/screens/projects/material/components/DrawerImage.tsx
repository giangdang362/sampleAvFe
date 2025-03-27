import { Box, DialogTitle, IconButton } from "@mui/material";
import React from "react";

export interface DrawerImageProps {
  handleClose: () => void;
}

const DrawerImage = ({ handleClose }: DrawerImageProps) => {
  return (
    <Box sx={{ width: "417px" }}>
      <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
        Get Sample
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={() => {
          handleClose();
        }}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        {/* <CloseIcon /> */}
      </IconButton>
    </Box>
  );
};

export default DrawerImage;
