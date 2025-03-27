import { Box, FormHelperText, Stack, Typography } from "@mui/material";
import { Control } from "react-hook-form";
import { Account } from "./zod";
import { useTranslations } from "next-intl";
import OptionButton from "./components/OptionButton";
import OptionOther from "./components/OptionOther";
import { useOptionList } from "./hooks/useOptionList";
import RequiredAsterisk from "@/components/common/RequiredAsterisk";

interface CompanyProps {
  control: Control<Account>;
}

const options = [
  {
    value: "option1",
    imgSrc: "/avci_signup_icons/Project-Blueprint-Home.svg",
    labelKey: "options.1",
    imgAlt: "Blueprint of a house",
  },

  {
    value: "option2",
    imgSrc: "/avci_signup_icons/Decoration-Flowers-Table.svg",
    labelKey: "options.2",
    imgAlt: "Table with flower pot on top",
  },

  {
    value: "option3",
    imgSrc: "/avci_signup_icons/Asian-Interior-Painting.svg",
    labelKey: "options.3",
    imgAlt: "Painting of an Asian interior",
  },

  {
    value: "option4",
    imgSrc: "/avci_signup_icons/Tools-Hammer-Hold.svg",
    labelKey: "options.4",
    imgAlt: "Hand holding a hammer",
  },

  {
    value: "option5",
    imgSrc: "/avci_signup_icons/Construction-House.svg",
    labelKey: "options.5",
    imgAlt: "House under construction with scaffolding",
  },

  {
    value: "option6",
    imgSrc: "/avci_signup_icons/Flower.svg",
    labelKey: "options.6",
    imgAlt: "A flower",
  },
] as const;

const CompanyExpertise = ({ control }: CompanyProps) => {
  const t = useTranslations("signUp.company_expertise");
  const { selected, onChange, error } = useOptionList({
    name: "organization.data.expertise.list",
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

      <Stack spacing={2}>
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

        <OptionOther
          control={control}
          name="organization.data.expertise.other"
        />
      </Stack>

      {!!error?.message && (
        <FormHelperText error sx={{ mt: 1 }}>
          {error.message}
        </FormHelperText>
      )}
    </Box>
  );
};

export default CompanyExpertise;
