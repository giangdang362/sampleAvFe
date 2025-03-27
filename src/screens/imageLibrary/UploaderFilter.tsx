import FaIconButton from "@/components/common/FaIconButton";
import MessageLine from "@/components/common/MessageLine";
import { useInfiniteQueryPage } from "@/hooks/infinite-scroll/useInfiniteQueryPage";
import { useInfiniteSentry } from "@/hooks/infinite-scroll/useInfiniteSentry";
import { usePrevious } from "@/hooks/usePrevious";
import {
  faMagnifyingGlass,
  faSquare,
  faSquareCheck,
  faXmark,
} from "@/lib/fas/pro-regular-svg-icons";
import {
  useGetInfiniteUsersQuery,
  useLazyGetUsersQuery,
} from "@/services/user";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Box,
  Checkbox,
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  ListSubheader,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { RequestQueryBuilder } from "@nestjsx/crud-request";
import parse from "autosuggest-highlight/parse";
import { useTranslations } from "next-intl";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";

export interface UploaderFilterPropws {
  value: string[];
  onChange?: (newValue: string[]) => void;
}

const styleSelect = {
  "& .MuiOutlinedInput-notchedOutline": {
    borderRadius: "100px",
  },
  fontSize: "13px",
  "& fieldset": {
    borderColor: "#000",
  },
  "& svg": {
    color: "#000",
  },
};

const UploaderFilter: React.FC<UploaderFilterPropws> = ({
  value,
  onChange,
}) => {
  const t = useTranslations("imageLibrary");
  const tCommon = useTranslations("common");

  const [willRemovedUsers, setWillRemovedUsers] = useState<string[]>();
  const [uploaderEverOpened, setUploaderEverOpened] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [debouncedInputValue] = useDebounce(inputValue, 700);
  const [uploaderNames, setUploaderNames] = useState<{ [key: string]: string }>(
    {},
  );
  const { page, nextPage, scrollRef } =
    useInfiniteQueryPage(debouncedInputValue);

  const query = RequestQueryBuilder.create({
    search: {
      firstName: { $cont: debouncedInputValue },
    },
  }).query();

  const {
    data,
    currentData: usersData,
    isFetching,
    isError,
  } = useGetInfiniteUsersQuery(
    {
      limit: 20,
      page,
      querySearch: query,
    },
    { skip: !uploaderEverOpened, refetchOnMountOrArgChange: 60 },
  );

  const hasNextPage = !isError && (data ? data.page < data.pageCount : true);
  const sentryRef = useInfiniteSentry({
    loading: isFetching,
    hasNextPage,
    onLoadMore: nextPage,
    disabled: isError,
  });

  const lastInputValue = usePrevious(debouncedInputValue);
  const searchValue = isFetching ? lastInputValue ?? "" : debouncedInputValue;

  const [getUsers] = useLazyGetUsersQuery();
  useEffect(() => {
    if (!value.length) return;

    const setInitialNames = async () => {
      const query = RequestQueryBuilder.create({
        search: {
          $or: value?.map((id) => ({ id: { $eq: id } })),
        },
      }).query();

      try {
        const users = await getUsers({
          limit: value.length,
          page: 1,
          querySearch: query,
        }).unwrap();

        setUploaderNames((prev) => {
          const nonExistingUsers: string[] = [];
          const userNames = value.flatMap((id) => {
            const user = users.data.find((user) => user.id === id);

            if (!user) {
              if (prev[id] === undefined) {
                nonExistingUsers.push(id);
              }

              return [];
            }

            return [[id, user.firstName ?? ""]];
          });

          if (nonExistingUsers.length) {
            setWillRemovedUsers(nonExistingUsers);
          }

          return {
            ...Object.fromEntries(userNames),
            ...prev,
          };
        });
      } catch {
        setUploaderNames((prev) => ({
          ...Object.fromEntries(value?.map((id) => [id, id])),
          ...prev,
        }));
      }
    };

    setInitialNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const valueRef = useRef(value);
  valueRef.current = value;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (willRemovedUsers?.length && onChangeRef.current) {
      onChangeRef.current(
        valueRef.current?.filter((id) => !willRemovedUsers.includes(id)),
      );
    }
  }, [willRemovedUsers]);

  return (
    <FormControl
      size="small"
      sx={{ "& .MuiInputBase-root": { width: "110px" } }}
    >
      <InputLabel
        sx={{ fontSize: "13px", color: "var(--mui-palette-primary-main)" }}
      >
        {t("uploader")}
      </InputLabel>
      <Select
        multiple
        input={<OutlinedInput label={t("uploader")} />}
        MenuProps={{
          autoFocus: false,
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "left",
          },
          transformOrigin: {
            vertical: -4,
            horizontal: "left",
          },
          slotProps: {
            paper: { ref: scrollRef as MutableRefObject<HTMLDivElement> },
          },
          sx: { "& .MuiMenu-list": { pt: 0, maxHeight: "500px" } },
        }}
        value={value}
        onChange={(e) => {
          const values =
            typeof e.target.value === "string"
              ? e.target.value.split(",")
              : e.target.value;

          const uploaders = values.flatMap((id) => {
            const user = usersData?.data.find((user) => user.id === id);
            return user ? [[id, user.firstName ?? ""]] : [];
          });

          setUploaderNames(Object.fromEntries(uploaders));
          onChange?.(uploaders?.map(([id]) => id));
        }}
        renderValue={() => {
          const selectedValue = value
            ?.map((id) => uploaderNames[id] ?? id)
            .join(", ");

          return (
            <Tooltip title={selectedValue}>
              <Typography fontSize="13px" noWrap lineHeight="inherit">
                {selectedValue}
              </Typography>
            </Tooltip>
          );
        }}
        onOpen={() => setUploaderEverOpened(true)}
        onClose={() => setInputValue("")}
        sx={styleSelect}
      >
        <ListSubheader
          sx={{ display: "flex", gap: 0.5, alignItems: "center", pt: 1 }}
        >
          <TextField
            size="small"
            type="search"
            autoFocus
            placeholder={t("search")}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    color="var(--mui-palette-primary-main)"
                  />
                </InputAdornment>
              ),
            }}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Escape") {
                e.stopPropagation();
              }
            }}
          />
          <FaIconButton
            title={tCommon("clearAll")}
            icon={faXmark}
            onClick={() => {
              setUploaderNames({});
              onChange?.([]);
            }}
          />
        </ListSubheader>

        {isError ? (
          <MessageLine my={1}>{tCommon("errorMsg")}</MessageLine>
        ) : usersData?.data.length === 0 ? (
          <MessageLine my={1}>{tCommon("empty_data")}</MessageLine>
        ) : (
          usersData?.data.map((option) => {
            const name = option.firstName ?? "";
            const matches = getIndicesOf(searchValue, name);

            const parts = parse(
              name,
              matches?.map((match) => [match, match + searchValue.length]),
            );

            return (
              <MenuItem key={option.id} value={option.id}>
                <Checkbox
                  icon={<FontAwesomeIcon icon={faSquare} />}
                  checkedIcon={<FontAwesomeIcon icon={faSquareCheck} />}
                  style={{ marginRight: 8 }}
                  checked={!!value.find((id) => id === option.id)}
                />
                {parts?.map((part, index) => (
                  <Box
                    key={index}
                    component="span"
                    sx={{
                      fontWeight: part.highlight ? "bold" : "regular",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {part.text}
                  </Box>
                ))}
              </MenuItem>
            );
          })
        )}

        {(isFetching || hasNextPage) && (
          <CircularProgress
            ref={sentryRef}
            size={20}
            sx={{ display: "block", mx: "auto", my: 2 }}
          />
        )}
      </Select>
    </FormControl>
  );
};

export default UploaderFilter;

function getIndicesOf(
  searchStr: string,
  str: string,
  caseSensitive?: boolean,
): number[] {
  var searchStrLen = searchStr.length;
  if (searchStrLen == 0) {
    return [];
  }
  var startIndex = 0,
    index,
    indices = [];
  if (!caseSensitive) {
    str = str.toLowerCase();
    searchStr = searchStr.toLowerCase();
  }
  while ((index = str.indexOf(searchStr, startIndex)) > -1) {
    indices.push(index);
    startIndex = index + searchStrLen;
  }
  return indices;
}
