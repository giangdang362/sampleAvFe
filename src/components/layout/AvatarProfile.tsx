"use client";

import { Avatar, ButtonBase } from "@mui/material";
import { FC } from "react";
import { PopoverController } from "@/hooks/popover";
import { pathFile } from "@/config/api";

interface Props {
  user?: API.UserItem;
  userPopover?: PopoverController<HTMLDivElement>;
}

const AvatarProfile: FC<Props> = ({ user, userPopover }) => {
  return (
    <ButtonBase
      onClick={() => {
        userPopover?.handleOpen?.();
      }}
      sx={{
        borderRadius: "50%",
        justifyContent: "center",
        "&:focus-visible": {
          outline: "2px solid var(--mui-palette-primary-main)",
        },
      }}
    >
      <Avatar
        ref={userPopover?.anchorRef}
        src={user?.avatar ? `${pathFile}/${user.avatar}` : undefined}
        sx={{ height: "100%", aspectRatio: 1 }}
      />
    </ButtonBase>
  );
};

export default AvatarProfile;
