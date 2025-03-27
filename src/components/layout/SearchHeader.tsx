"use client";

import * as React from "react";
import {
  InputAdornment,
  NoSsr,
  OutlinedInput,
  Stack,
  Button,
  Tooltip,
} from "@mui/material";
import Box from "@mui/material/Box";
import { useAppSelector } from "@/store";
import { selectIsHiddenSearch } from "@/store/features/globalSlice";
import { useTranslations } from "next-intl";
import UserPopover from "./UserPopover";
import { usePopover } from "@/hooks/popover";
import RouterLink from "next/link";
import { paths } from "@/paths";
import useDialog from "@/hooks/dialog";
import SearchDialogImageAI from "./SearchDialogImageAI";
import AvatarProfile from "./AvatarProfile";
import { useGetMyAccountQuery } from "@/services/user";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@/lib/fas/pro-regular-svg-icons";
import { faCameraViewfinder } from "@/lib/fas/pro-duotone-svg-icons";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import SuggestResultModal from "./SearchGlobalDialog";
import { useQueryParamState } from "../common/query-param-state/useQueryParamState";
import { parseAsString } from "nuqs";
import { useDebounce } from "use-debounce";
import { jsonStringifyEqualityCheck } from "@/utils/json";
import { useAvciRouter } from "@/hooks/avci-router";
import { useDispatch } from "react-redux";
import { setParamSearch } from "@/store/product";
import { usePathname } from "@/i18n";
import FaIconButton from "../common/FaIconButton";
import { useSearchProductsQuery } from "@/services/search";
import { faSidebar } from "@/lib/fas/pro-light-svg-icons";

export interface SearchHeaderProps {
  onToggleNavbar?: () => void;
}

const SearchHeader = ({ onToggleNavbar }: SearchHeaderProps): JSX.Element => {
  const isHiddenSearch = useAppSelector(selectIsHiddenSearch);
  const router = useAvciRouter();
  const userPopover = usePopover<HTMLDivElement>();
  const { data: user } = useGetMyAccountQuery();
  const t = useTranslations("menu");
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [showSuggestResult, setShowSuggestResult] = useState<boolean>(false);
  const [isFocusedInput, setIsFocusedInput] = useState(false);
  const path = usePathname();

  useEffect(() => {
    const handleFocusInput = () => {
      setIsFocusedInput(true);
      setShowSuggestResult(true);
    };
    const handleBlurInput = (event: FocusEvent) => {
      if (
        !boxRef.current &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsFocusedInput(false);
      }
    };

    const inputElement = inputRef?.current;
    if (inputElement) {
      inputElement.addEventListener("focus", handleFocusInput);
      inputElement.addEventListener("blur", handleBlurInput);
    }

    return () => {
      if (inputElement) {
        inputElement.removeEventListener("focus", handleFocusInput);
        inputElement.removeEventListener("blur", handleBlurInput);
      }
    };
  }, []);

  const handleClickOutside = (event: MouseEvent) => {
    if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
      setShowSuggestResult(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [searchTerm, setSearchTerm] = useQueryParamState(
    "s",
    parseAsString,
    "",
  );

  const [debouncedParams] = useDebounce(
    {
      page: 1,
      limit: 16,
      s: searchTerm,
    },
    700,
    { equalityFn: jsonStringifyEqualityCheck },
  );

  const showResultDialog =
    showSuggestResult &&
    searchTerm &&
    isFocusedInput &&
    path !== paths.searchResult;

  const { data: dataProductList } = useSearchProductsQuery(debouncedParams, {
    skip: !debouncedParams.s || !showResultDialog,
  });

  const useDialogSearchImageAI = useDialog();

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setParamSearch(searchTerm));
  }, [dispatch, searchTerm]);

  const handleOnchangeInput = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setSearchTerm(event.target.value);
    dispatch(setParamSearch(event.target.value));
  };

  useEffect(() => {
    if (searchTerm && searchTerm.length > 0) {
      setShowSuggestResult(true);
    } else {
      setShowSuggestResult(false);
    }
  }, [searchTerm]);

  return (
    <Box
      sx={{
        position: "relative",
        zIndex: 1200,
      }}
    >
      {!isHiddenSearch && (
        <Box
          component="header"
          className="mui-fixed"
          sx={{
            borderBottom: "1px solid var(--mui-palette-divider)",
            backgroundColor: "#FFF",
            position: "fixed",
            top: 0,
            zIndex: 10,
            py: "10px",
            px: "24px",
            width: "100%",
          }}
        >
          <Stack
            sx={{
              flexDirection: "row",
              gap: "32px",
              justifyContent: "space-around",
            }}
          >
            <Box display="flex">
              <FaIconButton
                icon={faSidebar}
                iconSize={24}
                title={t("showSidebar")}
                wrapperProps={{
                  // sx: { display: { lg: "none" }, mr: { xs: 0, sm: 2 } },
                  // invisible to wait CR
                  sx: {
                    display: "none",
                  },
                }}
                onClick={onToggleNavbar}
              />

              <Box
                component={RouterLink}
                href={paths.home}
                sx={{
                  display: { sm: "flex", xs: "none" },
                  alignItems: "center",
                  position: "relative",
                }}
              >
                <Box
                  alt="logo"
                  component="img"
                  height={"30px"}
                  src={"/logo-header.png"}
                />
              </Box>
            </Box>

            <Box
              ref={boxRef}
              sx={{
                position: "relative",
                zIndex: 100,
                width: "100%",
              }}
              onDragOver={(e) => {
                if (e.dataTransfer.types.includes("Files")) {
                  e.preventDefault();
                  useDialogSearchImageAI.onDragOver();
                }
              }}
              onDragEnter={useDialogSearchImageAI.onDragEnter}
              onDragLeave={useDialogSearchImageAI.onDragLeave}
            >
              <OutlinedInput
                inputRef={inputRef}
                value={searchTerm}
                type="search"
                fullWidth
                placeholder={t("search_header")}
                startAdornment={
                  <InputAdornment position="start">
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </InputAdornment>
                }
                endAdornment={
                  <InputAdornment position="end">
                    <Tooltip title={t("search_image")}>
                      <Button
                        variant="contained"
                        startIcon={
                          <FontAwesomeIcon
                            icon={faCameraViewfinder}
                            style={{ width: "20px", height: "20px" }}
                          />
                        }
                        onClick={useDialogSearchImageAI?.onClickOpen}
                        sx={{
                          height: "40px",
                          pl: 2.5,
                          pr: 2,
                          borderRadius: "100px",
                          "& .svg-inline--fa .fa-secondary": {
                            opacity: 0.6,
                          },
                        }}
                      >
                        {t("aiSearch")}
                      </Button>
                    </Tooltip>
                  </InputAdornment>
                }
                sx={{
                  // maxWidth: "1440px",
                  height: "40px",
                  pl: "14px",
                  pr: 0,
                  borderRadius: "100px",
                  background: "#F1F1F1",
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                }}
                onChange={handleOnchangeInput}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && showResultDialog) {
                    router.push(`${paths.searchResult}?s=${searchTerm}`);
                  }
                }}
              />
              {showResultDialog && (
                <SuggestResultModal
                  searchTerm={searchTerm}
                  countResult={dataProductList?.total ?? 0}
                  dataResult={dataProductList?.data ?? []}
                />
              )}

              <SearchDialogImageAI
                onClose={() => {
                  useDialogSearchImageAI.onClose();
                  useDialogSearchImageAI.onDragLeave();
                }}
                open={
                  useDialogSearchImageAI?.open ||
                  useDialogSearchImageAI?.dragOver
                }
              />
            </Box>
            <Stack>
              {/** Profile avatar */}
              <NoSsr>
                <AvatarProfile user={user} userPopover={userPopover} />
              </NoSsr>
              <UserPopover
                anchorEl={userPopover.anchorRef.current}
                onClose={userPopover.handleClose}
                open={userPopover.open}
              />
            </Stack>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default SearchHeader;
