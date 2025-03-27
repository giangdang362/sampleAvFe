import FaIconButton from "@/components/common/FaIconButton";
import { faCheck, faXmark } from "@/lib/fas/pro-solid-svg-icons";
import { Box, CircularProgress, ListItem, ListItemProps } from "@mui/material";
import { useTranslations } from "next-intl";
import AttributeManageInput from "./AttributeManageInput";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

export interface AttributeManageAddNewProps
  extends Omit<ListItemProps, "onChange"> {
  onConfirm?: (newValue: string) => void;
  onCancel?: () => void;
  loading?: boolean;
  padding?: boolean;
}

export interface AttributeManageAddNewRef {
  focusInput: () => void;
}

const AttributeManageAddNew = forwardRef<
  AttributeManageAddNewRef,
  AttributeManageAddNewProps
>(({ onConfirm, onCancel, loading, padding, sx, ...rest }, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState<string>();
  const [isError, setIsError] = useState(false);
  const t = useTranslations("common");

  useImperativeHandle(
    ref,
    () => ({
      focusInput: () => {
        inputRef.current?.focus();
      },
    }),
    [],
  );

  return (
    <ListItem
      disablePadding
      {...rest}
      sx={[
        {
          alignItems: "baseline",
          gap: 3,
          "& .MuiButtonBase-root.Mui-disabled": {
            opacity: 0.5,
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {padding && (
        <FaIconButton icon={<></>} disabled wrapperProps={{ sx: { p: 1 } }} />
      )}

      <AttributeManageInput
        flex={1}
        p={1}
        alwaysInput
        resetOnError={false}
        disableDisplayError={value === undefined}
        inputRef={inputRef}
        inputProps={{ disabled: loading, autoFocus: true }}
        label={t("new")}
        value={value ?? ""}
        onChange={setValue}
        onConfirm={onConfirm}
        onError={(error) => setIsError(!!error)}
      />

      <Box p={1} alignSelf={loading ? "center" : undefined}>
        {loading ? (
          <CircularProgress size={16} sx={{ display: "block", m: 1 }} />
        ) : (
          <>
            <FaIconButton
              icon={faCheck}
              title={t("save")}
              tooltipBottomOffset={0}
              disabled={isError || value === undefined}
              onClick={() => value !== undefined && onConfirm?.(value)}
            />

            <FaIconButton
              icon={faXmark}
              title={t("cancel")}
              tooltipBottomOffset={0}
              onClick={onCancel}
            />
          </>
        )}
      </Box>
    </ListItem>
  );
});
AttributeManageAddNew.displayName = "AttributeManageAddNew";

export default AttributeManageAddNew;
