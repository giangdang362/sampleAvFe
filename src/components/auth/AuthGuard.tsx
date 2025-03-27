"use client";
import { useAvciRouter } from "@/hooks/avci-router";
import { logger } from "@/lib/default-logger";
import { Fragment, useCallback, useEffect, useState } from "react";
import { paths } from "@/paths";
import { useAccess } from "@/services/helpers";
import { useSelector } from "react-redux";
import { logout, useSelectToken } from "@/store/features/auth";
import { usePathname } from "@/i18n";
import { Box } from "@mui/material";
import { NO_AUTH_PATHS } from "@/constants/path";
import { useAppDispatch } from "@/store";
import { useGetMyAccountQuery } from "@/services/user";
import { sendGAEvent } from "@next/third-parties/google";

export interface AuthGuardProps {
  children: React.ReactNode;
  permissions?: Array<keyof API.Access>;
}

export function AuthGuard({
  children,
  permissions,
}: AuthGuardProps): React.JSX.Element | null {
  const [isAuthorizing, setIsAuthorizing] = useState(true);
  const router = useAvciRouter();
  const access = useAccess();
  const token = useSelector(useSelectToken);
  const currentPath = usePathname();
  const dispatch = useAppDispatch();
  const { data } = useGetMyAccountQuery();

  const checkPermissions = useCallback(async (): Promise<void> => {
    if (access.userLoading) return;

    const authorized = token && access.userAvailable;

    if (authorized && currentPath.startsWith(paths.auth.prefix)) {
      logger.debug(
        "[AuthGuard]: User is logged in and go to auth, redirecting to home",
      );

      const params = new URLSearchParams(window.location.search);
      router.push(
        decodeURIComponent(params.get("redirect") ?? "") || paths.home,
      );
      return;
    }

    if (!authorized) {
      logger.debug(
        "[AuthGuard]: User is not logged in, redirecting to sign in",
      );

      if (NO_AUTH_PATHS.some((path) => currentPath.startsWith(path))) {
        setIsAuthorizing(false);
        return;
      }

      dispatch(logout());
      return;
    }

    if (permissions) {
      const noError = permissions.every((permission) => {
        return access?.[permission];
      });
      if (!noError) {
        logger.debug(
          "[AuthGuard]: User does not have the required permissions",
        );
        router.back();
        return;
      }
    }

    setIsAuthorizing(false);
  }, [access, token, currentPath, permissions, router, dispatch]);

  useEffect(() => {
    checkPermissions().catch(() => {
      logger.error("Error checking session");
    });
  }, [checkPermissions]);

  useEffect(() => {
    if (data?.id) {
      sendGAEvent("config", "G-Q11QNYV6F5", {
        user_id: data.id,
      });
    }
  }, [data?.id]);

  return (
    <Fragment>
      {isAuthorizing ? (
        <Box
          sx={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Box
            alt="logo"
            component="img"
            src={"/logo.svg"}
            width={"100px"}
            sx={{
              "@keyframes scaleUpDown": {
                "0%, 100%": {
                  transform: "scale(1)",
                },
                "50%": {
                  transform: "scale(1.2)",
                },
              },
              animation:
                "scaleUpDown 3s infinite cubic-bezier(.66,-0.01,.31,1.01)",
            }}
          />
        </Box>
      ) : (
        children
      )}
    </Fragment>
  );
}
