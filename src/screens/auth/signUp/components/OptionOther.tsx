import { Box, ButtonBase, TextField, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { Control, FieldPath, useController } from "react-hook-form";
import { Account } from "../zod";

interface OptionOtherProps {
  name: FieldPath<Account>;
  control: Control<Account>;
}

const OptionOther: React.FC<OptionOtherProps> = ({ name, control }) => {
  const {
    field: { ref: setRef, value, onChange, ...field },
    fieldState: { error },
  } = useController({
    name,
    control,
  });
  const t = useTranslations("signUp");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const prevInputValue = useRef<string>();
  const selected = value !== undefined && value !== null;

  const prevSelectedRef = useRef(selected);
  const selectedChanged = prevSelectedRef.current !== selected;
  prevSelectedRef.current = selected;

  if (selectedChanged && selected) {
    inputRef.current?.focus();
  }

  return (
    <Box>
      <ButtonBase
        sx={(style) => ({
          width: "100%",
          mb: 1,
          px: `calc(${style.spacing(3)} + ${selected ? 0 : 1}px)`,
          py: `calc(${style.spacing(2)} + ${selected ? 0 : 1}px)`,
          border: `${selected ? 2 : 1}px solid var(--mui-palette-primary-main)`,
          borderRadius: 1.5,
          justifyContent: "flex-start",
          boxShadow: selected
            ? "0px 0px 8px 3px rgba(0, 0, 0, 0.1)"
            : undefined,
          opacity: selected ? 1 : 0.5,
        })}
        onClick={() => {
          if (selected) {
            prevInputValue.current = inputRef.current?.value;
          }

          onChange({
            target: {
              value: selected ? null : prevInputValue.current ?? "",
            },
          });
        }}
      >
        <Typography fontWeight="500">{t("other")}</Typography>
      </ButtonBase>

      <TextField
        {...field}
        fullWidth
        value={value ?? ""}
        onChange={onChange}
        inputRef={(ref) => {
          setRef(ref);
          inputRef.current = ref;
        }}
        error={!!error?.message}
        helperText={error?.message}
        sx={{ display: selected ? undefined : "none" }}
      />
    </Box>
  );
};

export default OptionOther;
