import * as React from "react";
import { usePathname, Link as RouterLink } from "@/i18n";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Drawer,
  NoSsr,
  Theme,
  useMediaQuery,
} from "@mui/material";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTranslations } from "next-intl";
import type { NavItemConfig } from "@/types/nav";
import { isNavItemActive } from "@/lib/is-nav-item-active";
import { navIconsActive, navIconsDefault } from "../nav-icons";
import { useAccess, useIsUser } from "@/services/helpers";
import {
  faBookOpenCover,
  faChevronDown,
} from "@/lib/fas/pro-duotone-svg-icons";
import {
  faBookOpenCover as faBookOpenCoverLight,
  faCircleChevronLeft,
} from "@/lib/fas/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { selectProductDetailType } from "@/store/product";
import { useAppSelector } from "@/store";
import { paths } from "@/paths";
import Link from "next/link";
import FaIconButton from "@/components/common/FaIconButton";
export default function SideNav({
  navItems,
  showOnMobile,
  setShowOnMobile,
}: {
  navItems: NavItemConfig[];
  showOnMobile: boolean;
  setShowOnMobile: (showInMobile: boolean) => void;
}): React.JSX.Element {
  const t = useTranslations("menu");
  const pathname = usePathname();
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const [isActive, setIsActiveNav] = React.useState<boolean>(false);
  const isUser = useIsUser();

  const isMobileScreen = useMediaQuery<Theme>((theme) =>
    theme.breakpoints.down("lg"),
  );

  React.useEffect(() => {
    setShowOnMobile(false);
  }, [pathname, setShowOnMobile]);

  const handleChange =
    (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  return (
    <NoSsr>
      <Drawer
        variant={isMobileScreen ? "temporary" : "permanent"}
        open={showOnMobile}
        onClose={() => setShowOnMobile(false)}
        sx={{
          "& .MuiDrawer-paper": {
            "--SideNav-background": "var(--mui-palette-common-white)",
            "--SideNav-color": "var(--mui-palette-neutral-950)",
            "--NavItem-color": "var(--mui-palette-neutral-400)",
            "--NavItem-hover-background": "rgba(255, 255, 255, 0.04)",
            "--NavItem-active-background": "var(--mui-palette-neutral-100)",
            "--NavItem-active-color": "var(--mui-palette-neutral-950)",
            "--NavItem-disabled-color": "var(--mui-palette-neutral-500)",
            "--NavItem-icon-color": "var(--mui-palette-neutral-400)",
            "--NavItem-icon-active-color": "var(--mui-palette-neutral-950)",
            "--NavItem-icon-disabled-color": "var(--mui-palette-neutral-600)",
            bgcolor: "var(--SideNav-background)",
            color: "var(--SideNav-color)",
            flexDirection: "column",
            height: "100%",
            maxWidth: "100%",
            width: "var(--SideNav-width)",
            zIndex: "var(--SideNav-zIndex)",
            borderRight: { lg: "1px solid var(--mui-palette-neutral-100)" },
          },
        }}
      >
        <Box
          height="61px"
          minHeight="61px"
          display="flex"
          px={2}
          py={1}
          gap={2}
          justifyContent="space-between"
          alignItems="center"
          borderBottom="1px solid var(--mui-palette-divider)"
          visibility={isMobileScreen ? "visible" : "hidden"}
        >
          <Box
            component={Link}
            href={paths.home}
            sx={{
              flex: 2,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box
              alt="logo"
              component="img"
              width={"100%"}
              src={"/logo-header.png"}
            />
          </Box>

          <Box flex={1} display="flex" justifyContent="flex-end">
            <FaIconButton
              icon={faCircleChevronLeft}
              title={t("hideSidebar")}
              iconSize={24}
              onClick={() => setShowOnMobile(false)}
            />
          </Box>
        </Box>
        <Box height="100%" overflow="auto">
          <Box component="nav" sx={{ flex: "1 1 auto", p: "0px" }}>
            <RenderNavItems pathname={pathname} items={navItems.slice(0, 3)} />

            {/* Product Library */}
            {isUser ? (
              <>
                <Typography
                  sx={{
                    p: "4px 24px 4px 24px",
                    textTransform: "uppercase",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#00000061",
                  }}
                >
                  {t("libraries")}
                </Typography>
                <RenderNavItems
                  pathname={pathname}
                  items={navItems.slice(3, 4)}
                />
              </>
            ) : (
              <>
                <Typography
                  sx={{
                    p: "4px 24px 4px 24px",
                    textTransform: "uppercase",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#00000061",
                  }}
                >
                  {t("libraries")}
                </Typography>
                <Accordion
                  expanded={expanded === "panel1"}
                  onChange={handleChange("panel1")}
                  sx={{
                    border: 0,
                    borderRadius: 0,
                    boxShadow: 0,
                  }}
                >
                  <AccordionSummary
                    expandIcon={
                      <FontAwesomeIcon
                        icon={faChevronDown}
                        style={{
                          fontSize: "11px",
                          color: isActive
                            ? "var(--NavItem-active-color)"
                            : "var(--NavItem-disabled-color)",
                        }}
                      />
                    }
                    aria-controls="panel1bh-content"
                    id="panel1bh-header"
                    sx={{
                      minHeight: "52px !important",
                      padding: "12px 24px",
                      "& .MuiAccordionSummary-content": {
                        margin: "0px !important",
                      },
                      ...(!isActive && {
                        bgcolor: "var(--NavItem-disabled-background)",
                        color: "var(--NavItem-color)",
                        cursor: "not-allowed",
                      }),
                      ...(isActive && {
                        // borderRight: "3px solid",
                        bgcolor: "var(--NavItem-active-background)",
                        color: "var(--NavItem-active-color)",
                      }),
                    }}
                  >
                    <Box
                      sx={{
                        alignItems: "center",
                        justifyContent: "center",
                        display: "flex",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={isActive ? faBookOpenCover : faBookOpenCoverLight}
                        style={{ width: 18, height: 18 }}
                      />
                      <Typography
                        sx={{
                          marginLeft: "8px",
                          fontWeight: 500,
                          fontSize: "14px",
                        }}
                      >
                        {t("product_library")}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ border: 0, padding: "0" }}>
                    <RenderNavItems
                      pathname={pathname}
                      items={navItems.slice(3, 5)}
                      noIcon={true}
                      type="child"
                      setIsActiveNav={setIsActiveNav}
                    />
                  </AccordionDetails>
                </Accordion>
              </>
            )}
            <RenderNavItems pathname={pathname} items={navItems.slice(5, 7)} />
            {!isUser && (
              <>
                <Divider
                  sx={{
                    borderColor: "var(--mui-palette-neutral-100)",
                    mx: "24px ",
                  }}
                />
                <Typography
                  sx={{
                    p: "12px 24px 4px 24px",
                    textTransform: "uppercase",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#00000061",
                  }}
                >
                  {t("settings")}
                </Typography>
              </>
            )}
            <RenderNavItems pathname={pathname} items={navItems.slice(7, 11)} />
          </Box>
        </Box>
      </Drawer>
    </NoSsr>
  );
}

function RenderNavItems({
  items = [],
  pathname,
  noIcon = false,
  type,
  setIsActiveNav,
}: {
  items?: NavItemConfig[];
  pathname: string;
  noIcon?: boolean;
  type?: "child";
  setIsActiveNav?: React.Dispatch<React.SetStateAction<boolean>>;
}): React.JSX.Element {
  const access = useAccess();
  const [arrIsActive, setArrIsActive] = React.useState<boolean[]>([]);

  React.useLayoutEffect(() => {
    setIsActiveNav && setIsActiveNav(arrIsActive.some((x) => x));
  }, [arrIsActive, setIsActiveNav]);

  const setActiveCallbacks = React.useMemo(() => {
    const itemCount = items?.length;
    if (!itemCount) return [];

    return Array.from({ length: itemCount }, (_, i) => (isActive: boolean) => {
      setArrIsActive((pre) => {
        let temp = [...pre];
        temp[i] = isActive;
        return temp;
      });
    });
  }, [items?.length, setArrIsActive]);

  const children = items.reduce(
    (acc: React.ReactNode[], curr: NavItemConfig): React.ReactNode[] => {
      const { key, permissions, ...item } = curr;

      if (!permissions || permissions.every((p) => access?.[p])) {
        let index = acc.length;
        acc.push(
          <NavItem
            key={key}
            pathname={pathname}
            {...item}
            noIcon={noIcon}
            type={type}
            setIsActiveNav={setActiveCallbacks[index]}
          />,
        );
      }

      return acc;
    },
    [],
  );

  return (
    <Stack component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
      {children}
    </Stack>
  );
}

interface NavItemProps extends Omit<NavItemConfig, "items"> {
  pathname: string;
  noIcon?: boolean;
  type?: string;
  setIsActiveNav?: (isActive: boolean) => void;
}

function NavItem({
  disabled,
  external,
  href,
  icon,
  matcher,
  pathname,
  title,
  noIcon,
  type,
  setIsActiveNav,
}: NavItemProps): React.JSX.Element {
  const active = isNavItemActive({
    disabled,
    external,
    href,
    matcher,
    pathname,
  });

  const isUser = useIsUser();
  const productDetailType = useAppSelector(selectProductDetailType);
  const isAdminProductItemActive =
    href === paths.admin.products && productDetailType === "admin";
  const isUserProductItemActive =
    href === paths.admin.userLibrary && productDetailType === "user";
  const isProductItemInDetailPath =
    (href === paths.admin.products || href === paths.admin.userLibrary) &&
    pathname.startsWith(paths.admin.detailProduct);
  const trueActive =
    active &&
    (isUser ||
      !isProductItemInDetailPath ||
      (productDetailType
        ? isAdminProductItemActive || isUserProductItemActive
        : false));

  React.useEffect(() => {
    setIsActiveNav && setIsActiveNav(active);
  }, [active, setIsActiveNav]);
  const IconDefault = icon ? navIconsDefault[icon] : null;
  const IconActive = icon ? navIconsActive[icon] : null;

  return (
    <li>
      <Box
        {...(href
          ? {
              component: external ? "a" : RouterLink,
              href,
              target: external ? "_blank" : undefined,
              rel: external ? "noreferrer" : undefined,
            }
          : { role: "button" })}
        sx={{
          alignItems: "center",
          borderRadius: 0,
          color: "var(--NavItem-color)",
          cursor: "pointer",
          display: "flex",
          flex: "0 0 auto",
          gap: 1,
          p: type === "child" ? "12px 43px" : "12px 24px",
          position: "relative",
          textDecoration: "none",
          whiteSpace: "nowrap",
          ...(disabled && {
            bgcolor: "var(--NavItem-disabled-background)",
            color: "var(--NavItem-disabled-color)",
            cursor: "not-allowed",
          }),
          ...(trueActive && {
            borderRight: "3px solid",
            bgcolor: "var(--NavItem-active-background)",
            color: "var(--NavItem-active-color)",
          }),
        }}
      >
        <Box
          sx={{
            alignItems: "center",
            display: "flex",
            justifyContent: "center",
            flex: "0 0 auto",
            "& .svg-inline--fa": {
              width: 18,
              height: 18,
            },
          }}
        >
          {trueActive && IconActive && !noIcon ? IconActive : null}
          {!trueActive && IconDefault && !noIcon ? IconDefault : null}
        </Box>
        <Box sx={{ flex: "1 1 auto" }}>
          <Typography
            component="span"
            sx={{
              color: "inherit",
              fontSize: "0.875rem",
              fontWeight: 500,
              lineHeight: "28px",
            }}
          >
            {title}
          </Typography>
        </Box>
      </Box>
    </li>
  );
}
