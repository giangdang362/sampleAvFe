import { useCallback } from "react";
import RouterLink from "next/link";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import { SignOut as SignOutIcon } from "@phosphor-icons/react/dist/ssr/SignOut";
import { User as UserIcon } from "@phosphor-icons/react/dist/ssr/User";
import { paths } from "@/paths";
import { logger } from "@/lib/default-logger";
// import { useAvciRouter } from "@/hooks/avci-router";
import { useHref } from "@/hooks/href";
import { useSelectToken } from "@/store/features/auth";
import { useLogoutMutation } from "@/services/auth";
import { useAppSelector } from "@/store";
import { useTranslations } from "next-intl";
import { useGetMyAccountQuery } from "@/services/user";

export interface UserPopoverProps {
  anchorEl: Element | null;
  onClose: () => void;
  open: boolean;
}

export default function UserPopover({
  anchorEl,
  onClose,
  open,
}: UserPopoverProps): React.JSX.Element {
  const createHref = useHref();
  const [logoutAction] = useLogoutMutation();
  // const router = useAvciRouter();
  const accessToken = useAppSelector(useSelectToken);
  const t = useTranslations("menu");

  const handleSignOut = useCallback(async (): Promise<void> => {
    try {
      if (accessToken && accessToken !== null) {
        await logoutAction({ token: accessToken }).unwrap();
      }
    } catch (err) {
      logger.error("Sign out error", err);
    }
  }, [accessToken, logoutAction]);

  const { data: dataMe } = useGetMyAccountQuery();

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: -2,
        horizontal: "right",
      }}
      onClose={onClose}
      open={open}
      slotProps={{ paper: { sx: { width: "240px" } } }}
    >
      <Box sx={{ p: "16px 20px " }}>
        <Typography variant="subtitle1">{dataMe?.firstName}</Typography>
        <Typography color="text.secondary" variant="body2">
          {dataMe?.email}
        </Typography>
      </Box>
      <Divider />
      <MenuList
        disablePadding
        sx={{ p: "8px", "& .MuiMenuItem-root": { borderRadius: 1 } }}
      >
        {/* <MenuItem
          component={RouterLink}
          href={createHref(paths.app.settings)}
          onClick={onClose}
        >
          <ListItemIcon>
            <GearSixIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          {t("setting")}
        </MenuItem> */}
        <MenuItem
          component={RouterLink}
          href={createHref(paths.admin.myAccount)}
          onClick={onClose}
        >
          <ListItemIcon>
            <UserIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          <Typography ml={"10px"}>{t("account")}</Typography>
        </MenuItem>
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <SignOutIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          <Typography ml={"10px"}>{t("logout")}</Typography>
        </MenuItem>
      </MenuList>
    </Popover>
  );
}
