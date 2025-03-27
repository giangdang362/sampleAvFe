"use client";

import * as React from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { IconButton, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

import { MobileNav } from "./mobile-nav";
import EditableTypography, {
  EditableTypographyProps,
} from "../common/EditableTypography";
import { paths } from "@/paths";
import { useHref } from "@/hooks/href";
import Link from "next/link";

export type BackBtnHref<IsUser extends boolean> = {
  isUser: IsUser;
  path: keyof (typeof paths)[IsUser extends true ? "app" : "admin"];
  suffix?: string;
  params?: Record<string, string>;
};

interface HeaderMainProps<IsUser extends boolean> {
  title?: string;
  titleEditable?: boolean;
  titleLoading?: boolean;
  editTitleLabel?: string;
  editTitlePlaceholder?: string;
  onTitleChange?: EditableTypographyProps["onEditingFinish"];
  subTitle?: string;
  buttonBlock?: React.ReactNode;
  hidden?: boolean;
  haveBackBtn?: boolean;
  backBtnHref?: BackBtnHref<IsUser>;
  statusBlock?: React.ReactNode;
  /**
   * fix some problems with scroll to top
   */
  useExternalPaddingTop?: boolean;
  mode?: "normal" | "contextSource";
}

export type ContextHeaderMainProps = Omit<HeaderMainProps<boolean>, "mode">;

export const HeaderMainContext = React.createContext<
  { updateProps: (props: ContextHeaderMainProps) => void } | undefined
>(undefined);

const HeaderMain = <IsUser extends boolean>(
  props: HeaderMainProps<IsUser>,
): React.JSX.Element => {
  const {
    title,
    titleEditable,
    titleLoading,
    editTitleLabel,
    editTitlePlaceholder,
    onTitleChange,
    buttonBlock,
    subTitle,
    hidden = false,
    haveBackBtn = false,
    backBtnHref,
    statusBlock,
    useExternalPaddingTop,
    mode = "normal",
  } = props;

  const createHref = useHref();
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  const headerMainContext = React.useContext(HeaderMainContext);

  React.useEffect(() => {
    if (mode === "contextSource") {
      const propsWithoutMode = { ...props };
      delete propsWithoutMode.mode;

      headerMainContext?.updateProps(propsWithoutMode);
    }
  }, [headerMainContext, props]);

  if (mode === "contextSource") {
    return <></>;
  }

  const backHref = backBtnHref
    ? createHref(
        (paths[backBtnHref.isUser ? "app" : "admin"] as Record<string, string>)[
          backBtnHref.path as string
        ],
        backBtnHref.params,
      ) + (backBtnHref.suffix ?? "")
    : undefined;

  return (
    <>
      {!hidden && (
        <>
          {useExternalPaddingTop && <Box height="80px" />}
          <Box
            component="header"
            sx={{
              mb: "12px",
              mt: useExternalPaddingTop ? undefined : "80px",
            }}
          >
            <Stack
              direction="row"
              sx={{
                alignItems: "center",
                justifyContent: "space-between",
                height: "36px",
              }}
            >
              <Stack direction={"row"} alignItems="center" minWidth={0} mr={5}>
                {haveBackBtn && (
                  <Box
                    sx={{
                      borderRadius: "100px",
                      borderWidth: 1,
                      borderColor: "ButtonFace",
                      mr: "14px",
                    }}
                  >
                    <IconButton
                      {...(backHref
                        ? { LinkComponent: Link, href: backHref }
                        : undefined)}
                      disabled={!backHref}
                      aria-label="back"
                      sx={{
                        borderRadius: "9999px",
                        border: "1px solid",
                        width: 30,
                        height: 30,
                      }}
                    >
                      <ArrowBackIcon sx={{ color: "GrayText" }} />
                    </IconButton>
                  </Box>
                )}

                <Stack minWidth={0}>
                  <EditableTypography
                    component="h1"
                    variant="h6"
                    enabled={!!titleEditable}
                    value={title || (titleEditable ? "" : "Enter Title Page")}
                    placeholder={editTitlePlaceholder}
                    editLabel={editTitleLabel}
                    textFieldProps={{ inputProps: { maxLength: 155 } }}
                    onEditingFinish={onTitleChange}
                    loading={titleLoading}
                    loadingSkeletonProps={{ sx: { width: "300px" } }}
                    wrapperProps={{
                      sx: {
                        minWidth: 0,
                        "& .MuiFormHelperText-root.Mui-error": {
                          position: "absolute",
                          top: "100%",
                        },
                      },
                    }}
                    textFieldSx={{
                      width: "min(400px, 30vw)",
                    }}
                    textFieldInputSx={{
                      py: 0.5,
                    }}
                    sx={{
                      fontSize: "22px",
                      fontWeight: "600",
                      lineHeight: "27px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  />
                  {statusBlock}
                </Stack>
              </Stack>
              {/* Button */}
              <Stack direction={"row"} justifyContent={"flex-end"} gap={"12px"}>
                {buttonBlock}
              </Stack>
            </Stack>
            {subTitle && (
              <Typography
                sx={{ marginLeft: haveBackBtn ? 5 : 0 }}
                color={"GrayText"}
                variant="body2"
              >
                {subTitle}
              </Typography>
            )}
          </Box>
          <MobileNav
            onClose={() => {
              setOpenNav(false);
            }}
            open={openNav}
          />
        </>
      )}
    </>
  );
};

export default HeaderMain;
