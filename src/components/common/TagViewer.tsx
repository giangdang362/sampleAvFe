import { faPlus, faCheck, faXmark } from "@/lib/fas/pro-regular-svg-icons";
import { useGetTagsListQuery } from "@/services/tags";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Stack,
  Box,
  Autocomplete,
  Chip,
  TextField,
  Tooltip,
  CircularProgress,
  TextFieldProps,
  styled,
} from "@mui/material";
import { MaybePromise } from "@reduxjs/toolkit/dist/query/tsHelpers";
import { useTranslations } from "next-intl";
import { useState } from "react";
import FaIconButton from "./FaIconButton";

const MultilineChip = styled(Chip)(({ theme }) => ({
  height: "auto",
  paddingTop: theme.spacing(0.5),
  paddingBottom: theme.spacing(0.5),
  "& .MuiChip-label": {
    display: "block",
    whiteSpace: "normal",
  },
}));

interface Tag {
  id?: string;
  name?: string;
}

interface TagViewerProps {
  tags: Tag[];
  tagType: API.TagType;
  editDisabled?: boolean;
  isEdit?: boolean;
  noSaveControl?: boolean;
  onEditModeChange?: (isEdit: boolean) => void;
  onEditChange?: (tags: Tag[]) => void;
  onSave?: (tags: Tag[]) => MaybePromise<void>;
  textFieldProps?: TextFieldProps;
}

const TagViewer: React.FC<TagViewerProps> = ({
  tags,
  tagType,
  editDisabled,
  isEdit,
  noSaveControl,
  onEditModeChange,
  onEditChange,
  onSave,
  textFieldProps,
}) => {
  const t = useTranslations("common");
  const { data: dataTags } = useGetTagsListQuery({ type: tagType });
  const [editTags, setEditTags] = useState<Tag[]>();
  const [editInputValue, setEditInputValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const nameToIdMap: Record<string, string> =
    dataTags?.data?.reduce(
      (map, item) => {
        map[item.name] = item.id;
        return map;
      },
      {} as Record<string, string>,
    ) ?? {};

  const handleExitEditMode = () => {
    setEditTags(undefined);
    setEditInputValue("");
    onEditModeChange?.(false);
  };

  return !isEdit ? (
    <Stack
      flexDirection={"row"}
      gap={1}
      alignItems={"center"}
      flexWrap={"wrap"}
    >
      {tags.map((tagItem) => {
        return (
          <MultilineChip
            key={tagItem.id}
            label={tagItem.name}
            variant="outlined"
            sx={{
              minWidth: "40px",
            }}
          />
        );
      })}

      {!editDisabled && (
        <Tooltip arrow title={t("edit")}>
          <MultilineChip
            label={
              <FontAwesomeIcon
                icon={faPlus}
                style={{ width: "13px", height: "13px" }}
              />
            }
            variant="outlined"
            onClick={() => onEditModeChange?.(true)}
          />
        </Tooltip>
      )}
    </Stack>
  ) : (
    <Box>
      <Autocomplete
        value={(onEditChange ? tags : editTags ?? tags).map(
          (tag) => tag.name ?? "",
        )}
        onChange={(_e, value: string[]) => {
          const currentValue: Tag[] = value?.map((val) => ({
            id: nameToIdMap[val],
            name: val,
          }));

          if (onEditChange) {
            onEditChange(currentValue);
          } else {
            setEditTags(currentValue);
          }
        }}
        multiple
        disabled={isSaving}
        options={dataTags?.deduplicatedTags ?? []}
        freeSolo
        renderTags={(value: readonly string[], getTagProps) =>
          value?.map((option: string, index: number) => {
            const { key, ...tagProps } = getTagProps({ index });
            return (
              <MultilineChip
                variant="outlined"
                label={option}
                key={key}
                {...tagProps}
              />
            );
          })
        }
        inputValue={editInputValue}
        onInputChange={(_, value) => setEditInputValue(value)}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            size="medium"
            label={t("tags")}
            {...textFieldProps}
            inputProps={{
              ...params.inputProps,
              maxLength: 55,
              autoFocus: true,
              ...textFieldProps?.inputProps,
            }}
            onBlur={(e) => {
              textFieldProps?.onBlur?.(e);

              if (editInputValue) {
                const newTag = {
                  id: nameToIdMap[editInputValue],
                  name: editInputValue,
                };

                if (onEditChange) {
                  onEditChange([...tags, newTag]);
                } else {
                  setEditTags((prev) => [...(prev ?? tags), newTag]);
                }
                setEditInputValue("");
              }
            }}
          />
        )}
        sx={{ mt: 1 }}
      />
      <Stack
        sx={{
          flexDirection: "row",
          justifyContent: "end",
          gap: 0.5,
          mt: 0.5,
        }}
      >
        {isSaving ? (
          <CircularProgress
            size={20}
            sx={{
              color: "var(--mui-palette-action-active)",
              mt: 0.5,
              mr: 1,
              mb: 1,
            }}
          />
        ) : (
          !noSaveControl && (
            <>
              <FaIconButton
                icon={faCheck}
                title={t("save")}
                onClick={async () => {
                  try {
                    if (editTags) {
                      setIsSaving(true);
                      await onSave?.(editTags);
                    }

                    handleExitEditMode();
                  } catch {}

                  setIsSaving(false);
                }}
              />
              <FaIconButton
                icon={faXmark}
                title={t("cancel")}
                onClick={handleExitEditMode}
              />
            </>
          )
        )}
      </Stack>
    </Box>
  );
};

export default TagViewer;
