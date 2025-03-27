import { Box, FormHelperText, Typography } from "@mui/material";
import { Control } from "react-hook-form";
import { Account } from "./zod";
import { useTranslations } from "next-intl";
import OptionButton from "./components/OptionButton";
import OptionOther from "./components/OptionOther";
import { useOptionList } from "./hooks/useOptionList";
import RequiredAsterisk from "@/components/common/RequiredAsterisk";

interface PrimarilyWorkInProps {
  control: Control<Account>;
}

const options = [
  {
    value: "option1",
    imgSrc: "/avci_signup_icons/House-3.svg",
    labelKey: "options.1",
    imgAlt: "House",
  },
  {
    value: "option2",
    imgSrc: "/avci_signup_icons/Study-Desk.svg",
    labelKey: "options.2",
    imgAlt: "Table with books and lamp on top",
  },
  {
    value: "option3",
    imgSrc: "/avci_signup_icons/Reception-Hotel-Bell.svg",
    labelKey: "options.3",
    imgAlt:
      "Hotel reception desk with a service bell and a receptionist standing behind it",
  },
  {
    value: "option4",
    imgSrc: "/avci_signup_icons/Road-Sign.svg",
    labelKey: "options.4",
    imgAlt: "Road with road sign",
  },
  {
    value: "option5",
    imgSrc: "/avci_signup_icons/Products-Briefcase.svg",
    labelKey: "options.5",
    imgAlt: "Briefcase",
  },
  {
    value: "option6",
    imgSrc: "/avci_signup_icons/Water-Dam.svg",
    labelKey: "options.6",
    imgAlt: "Factory building",
  },
  {
    value: "option7",
    imgSrc: "/avci_signup_icons/Shopping-Cart-Empty.svg",
    labelKey: "options.7",
    imgAlt: "Shopping cart",
  },
  {
    value: "option8",
    imgSrc: "/avci_signup_icons/Newspaper-Read-Woman.svg",
    labelKey: "options.8",
    imgAlt: "Student reading book",
  },
] as const;

const PrimarilyWorkIn = ({ control }: PrimarilyWorkInProps) => {
  const t = useTranslations("signUp.primary_work_in");
  const { selected, onChange, error } = useOptionList({
    name: "data.primarilyWork.list",
    control,
  });

  return (
    <Box>
      <Box mb={1.5}>
        <Typography variant="h6" sx={{ fontWeight: "600", fontSize: "16px" }}>
          {t("main_title")}
          <RequiredAsterisk />
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: "400", fontSize: "14px" }}
        >
          {t("main_desc")}
        </Typography>
      </Box>

      <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
        {options.map(({ value, imgSrc, labelKey, imgAlt }) => (
          <OptionButton
            key={value}
            value={value}
            label={t(labelKey)}
            checked={selected(value)}
            onChange={onChange}
            imgSrc={imgSrc}
            imgAlt={imgAlt}
          />
        ))}
      </Box>

      <OptionOther control={control} name="data.primarilyWork.other" />

      {!!error?.message && (
        <FormHelperText error sx={{ mt: 1 }}>
          {error.message}
        </FormHelperText>
      )}
    </Box>
  );
};

export default PrimarilyWorkIn;
